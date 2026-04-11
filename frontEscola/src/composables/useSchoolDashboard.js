import { computed, reactive, ref } from 'vue'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_STORAGE_KEY = 'escola.jwt'
const USER_STORAGE_KEY = 'escola.user'
const UPLOAD_HISTORY_KEY_PREFIX = 'escola.uploads.'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function useSchoolDashboard() {
  const loginForm = reactive({
    email: '',
    password: ''
  })

  const currentView = ref('dashboard')
  const authToken = ref(localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const user = ref(readStoredUser())
  const grades = ref([])
  const students = ref([])
  const users = ref([])
  const authError = ref('')
  const authSuccess = ref('')
  const gradesError = ref('')
  const gradeCreateError = ref('')
  const gradeCreateSuccess = ref('')
  const gradeEditError = ref('')
  const gradeEditSuccess = ref('')
  const authLoading = ref(false)
  const gradesLoading = ref(false)
  const gradeCreateLoading = ref(false)
  const gradeEditLoading = ref(false)
  const profileLoading = ref(false)
  const registerLoading = ref(false)
  const registerError = ref('')
  const registerSuccess = ref('')
  const userEditError = ref('')
  const userEditSuccess = ref('')
  const userEditLoading = ref(false)
  const uploadLoading = ref(false)
  const uploadError = ref('')
  const uploadSuccess = ref('')
  const uploadProgress = ref(0)
  const uploadHistory = ref([])
  const editingUserId = ref('')
  const editingGradeId = ref('')
  const showUserEditModal = ref(false)
  const showGradeEditModal = ref(false)
  const userDeleteLoading = ref(false)
  const userDeleteError = ref('')
  const gradeDeleteLoading = ref(false)
  const gradeDeleteError = ref('')

  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    role: 'student',
    cpf: '',
    address: '',
    phone: ''
  })

  const gradeForm = reactive({
    studentId: '',
    subject: '',
    grade: ''
  })

  const userFormMode = computed(() => (editingUserId.value ? 'edit' : 'create'))
  const gradeFormMode = computed(() => (editingGradeId.value ? 'edit' : 'create'))

  const isAuthenticated = computed(() => Boolean(authToken.value && user.value))
  const canManageUsers = computed(() => user.value?.role === 'admin')

  const uploadHistoryKey = computed(() => {
    if (!user.value?.id) {
      return null
    }

    return `${UPLOAD_HISTORY_KEY_PREFIX}${user.value.id}`
  })

  const roleLabel = (role) => {
    return {
      student: 'Aluno',
      teacher: 'Professor',
      admin: 'Administrador'
    }[role] || 'Usuario'
  }

  const formatDateTime = (value) => {
    if (!value) {
      return 'Nao informado'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value))
  }

  const formatGradeValue = (value) => {
    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) {
      return '--'
    }

    return numericValue.toFixed(2)
  }

  const persistSession = (token, nextUser) => {
    authToken.value = token
    user.value = nextUser
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
  }

  const loadUploadHistory = () => {
    if (!uploadHistoryKey.value) {
      uploadHistory.value = []
      return
    }

    const raw = localStorage.getItem(uploadHistoryKey.value)

    if (!raw) {
      uploadHistory.value = []
      return
    }

    try {
      const parsed = JSON.parse(raw)
      uploadHistory.value = Array.isArray(parsed) ? parsed : []
    } catch {
      uploadHistory.value = []
      localStorage.removeItem(uploadHistoryKey.value)
    }
  }

  const saveUploadHistory = (history) => {
    uploadHistory.value = history

    if (uploadHistoryKey.value) {
      localStorage.setItem(uploadHistoryKey.value, JSON.stringify(history))
    }
  }

  const clearSession = () => {
    authToken.value = ''
    user.value = null
    grades.value = []
    currentView.value = 'dashboard'
    uploadHistory.value = []
    uploadProgress.value = 0
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const request = async (path, options = {}, requiresAuth = false) => {
    const headers = {
      ...(options.headers || {})
    }

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    if (requiresAuth && authToken.value) {
      headers.Authorization = `Bearer ${authToken.value}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    })

    const rawBody = await response.text()
    let payload = null

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody)
      } catch {
        payload = { message: rawBody }
      }
    }

    if (!response.ok) {
      if (response.status === 401 && requiresAuth) {
        clearSession()
        authError.value = 'Sua sessao expirou. Faca login novamente.'
      }

      throw new Error(payload?.message || 'Nao foi possivel concluir a solicitacao.')
    }

    return payload
  }

  const filterVisibleGrades = (allGrades) => {
    if (!user.value) {
      return []
    }

    if (user.value.role === 'student') {
      return allGrades.filter((grade) => Number(grade.studentId) === Number(user.value.id))
    }

    if (user.value.role === 'teacher') {
      return allGrades.filter((grade) => Number(grade.teacherId) === Number(user.value.id))
    }

    return allGrades
  }

  const visibleGrades = computed(() => filterVisibleGrades(grades.value))

  const averageGrade = computed(() => {
    if (user.value?.role !== 'student') {
      return null
    }

    if (!visibleGrades.value.length) {
      return null
    }

    const total = visibleGrades.value.reduce((sum, grade) => sum + Number(grade.grade || 0), 0)
    return formatGradeValue(total / visibleGrades.value.length)
  })

  const latestGradeDate = computed(() => {
    if (!visibleGrades.value.length) {
      return 'Sem registros'
    }

    return formatDateTime(visibleGrades.value[0].createdAt)
  })

  const statCards = computed(() => {
    const cards = [
      {
        label: 'Perfil',
        value: roleLabel(user.value?.role)
      },
      {
        label: 'Notas visiveis',
        value: String(visibleGrades.value.length)
      },
      {
        label: 'Ultimo registro',
        value: latestGradeDate.value
      }
    ]

    if (user.value?.role === 'student') {
      cards.splice(2, 0, {
        label: 'Media atual',
        value: averageGrade.value || '--'
      })
    }

    return cards
  })

  const fetchGrades = async () => {
    if (!user.value || !authToken.value) {
      grades.value = []
      return
    }

    gradesLoading.value = true
    gradesError.value = ''

    try {
      const endpoint = user.value.role === 'student' ? '/grades/my' : '/grades'
      const response = await request(endpoint, {}, true)
      grades.value = Array.isArray(response) ? response : []
    } catch (error) {
      gradesError.value = error.message
    } finally {
      gradesLoading.value = false
    }
  }

  const fetchStudents = async () => {
    if (!user.value || !authToken.value || !['teacher', 'admin'].includes(user.value.role)) {
      students.value = []
      return
    }

    try {
      const response = await request('/usuarios/alunos', {}, true)
      students.value = Array.isArray(response) ? response : []
    } catch {
      students.value = []
    }
  }

  const fetchUsers = async () => {
    if (!user.value || !authToken.value || user.value.role !== 'admin') {
      users.value = []
      return
    }

    try {
      const response = await request('/usuarios', {}, true)
      users.value = Array.isArray(response) ? response : []
    } catch {
      users.value = []
    }
  }

  const fetchMyProfile = async () => {
    if (!authToken.value) {
      return
    }

    profileLoading.value = true

    try {
      const profile = await request('/usuarios/me', {}, true)
      user.value = profile
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
    } finally {
      profileLoading.value = false
    }
  }

  const resetRegisterForm = () => {
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.role = 'student'
    registerForm.cpf = ''
    registerForm.address = ''
    registerForm.phone = ''
  }

  const validateRegisterForm = () => {
    const name = registerForm.name.trim()
    const email = registerForm.email.trim()
    const password = registerForm.password
    const role = registerForm.role
    const cpfDigits = onlyDigits(registerForm.cpf)
    const phoneDigits = onlyDigits(registerForm.phone)
    const address = registerForm.address.trim()

    if (name.length < 3) {
      return 'Nome deve ter ao menos 3 caracteres.'
    }

    if (!EMAIL_REGEX.test(email)) {
      return 'Informe um email valido.'
    }

    if (!editingUserId.value && !STRONG_PASSWORD_REGEX.test(password)) {
      return 'Senha fraca: minimo 8 caracteres, com maiuscula, numero e simbolo.'
    }

    if (editingUserId.value && password && !STRONG_PASSWORD_REGEX.test(password)) {
      return 'Senha fraca: minimo 8 caracteres, com maiuscula, numero e simbolo.'
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return 'Perfil invalido para cadastro.'
    }

    if (cpfDigits.length !== 11) {
      return 'CPF deve conter 11 digitos.'
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return 'Telefone deve conter 10 ou 11 digitos.'
    }

    if (address.length < 8) {
      return 'Endereco deve ter ao menos 8 caracteres.'
    }

    return null
  }

  const createUser = async () => {
    if (!canManageUsers.value) {
      registerError.value = 'Somente administradores podem cadastrar usuarios.'
      registerSuccess.value = ''
      return
    }

    registerLoading.value = true
    registerError.value = ''
    registerSuccess.value = ''

    try {
      const validationError = validateRegisterForm()
      if (validationError) {
        throw new Error(validationError)
      }

      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        role: registerForm.role,
        cpf: onlyDigits(registerForm.cpf),
        address: registerForm.address.trim(),
        phone: onlyDigits(registerForm.phone)
      }

      await request('/usuarios', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, true)

      registerSuccess.value = 'Usuario cadastrado com sucesso.'
      resetRegisterForm()
    } catch (error) {
      registerError.value = error.message
    } finally {
      registerLoading.value = false
    }
  }

  const resetUserForm = () => {
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.role = 'student'
    registerForm.cpf = ''
    registerForm.address = ''
    registerForm.phone = ''
    editingUserId.value = ''
    registerError.value = ''
    registerSuccess.value = ''
    userEditError.value = ''
    userEditSuccess.value = ''
  }

  const startEditUser = (selectedUser) => {
    editingUserId.value = String(selectedUser.id)
    registerForm.name = selectedUser.name || ''
    registerForm.email = selectedUser.email || ''
    registerForm.password = ''
    registerForm.role = selectedUser.role || 'student'
    registerForm.cpf = selectedUser.cpf || ''
    registerForm.address = selectedUser.address || ''
    registerForm.phone = selectedUser.phone || ''
    registerError.value = ''
    registerSuccess.value = ''
    userEditError.value = ''
    userEditSuccess.value = ''
    showUserEditModal.value = true
  }

  const closeUserEditModal = () => {
    showUserEditModal.value = false
    resetUserForm()
  }

  const submitUserForm = async () => {
    if (editingUserId.value) {
      userEditLoading.value = true
      userEditError.value = ''
      userEditSuccess.value = ''

      try {
        const validationError = validateRegisterForm()
        if (validationError) {
          throw new Error(validationError)
        }

        const payload = {
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          role: registerForm.role,
          cpf: onlyDigits(registerForm.cpf),
          address: registerForm.address.trim(),
          phone: onlyDigits(registerForm.phone)
        }

        if (registerForm.password) {
          payload.password = registerForm.password
        }

        await request(`/usuarios/${editingUserId.value}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }, true)

        userEditSuccess.value = 'Usuario atualizado com sucesso.'
        resetUserForm()
        await fetchUsers()
      } catch (error) {
        userEditError.value = error.message
      } finally {
        userEditLoading.value = false
      }

      return
    }

    await createUser()
    await fetchUsers()
  }

  const validateGradeForm = () => {
    const studentId = String(gradeForm.studentId || '').trim()
    const subject = String(gradeForm.subject || '').trim()
    const numericGrade = Number(gradeForm.grade)

    if (!studentId) {
      return 'Selecione um aluno.'
    }

    if (subject.length < 2) {
      return 'Informe a disciplina.'
    }

    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      return 'A nota deve ficar entre 0 e 10.'
    }

    return null
  }

  const createGrade = async () => {
    if (!user.value || user.value.role !== 'teacher') {
      gradeCreateError.value = 'Somente professores podem lançar notas.'
      gradeCreateSuccess.value = ''
      return
    }

    gradeCreateLoading.value = true
    gradeCreateError.value = ''
    gradeCreateSuccess.value = ''

    try {
      const validationError = validateGradeForm()
      if (validationError) {
        throw new Error(validationError)
      }

      await request('/grades', {
        method: 'POST',
        body: JSON.stringify({
          studentId: Number(gradeForm.studentId),
          subject: String(gradeForm.subject).trim(),
          grade: Number(gradeForm.grade)
        })
      }, true)

      gradeCreateSuccess.value = 'Nota cadastrada com sucesso.'
      resetGradeForm()
      await fetchGrades()
      await fetchStudents()
    } catch (error) {
      gradeCreateError.value = error.message
    } finally {
      gradeCreateLoading.value = false
    }
  }

  const startEditGrade = (selectedGrade) => {
    editingGradeId.value = String(selectedGrade.id)
    gradeForm.studentId = String(selectedGrade.studentId || '')
    gradeForm.subject = selectedGrade.subject || ''
    gradeForm.grade = String(selectedGrade.grade ?? '')
    gradeCreateError.value = ''
    gradeCreateSuccess.value = ''
    gradeEditError.value = ''
    gradeEditSuccess.value = ''
    showGradeEditModal.value = true
  }

  const closeGradeEditModal = () => {
    showGradeEditModal.value = false
    resetGradeForm()
  }

  const resetGradeForm = () => {
    gradeForm.studentId = ''
    gradeForm.subject = ''
    gradeForm.grade = ''
    editingGradeId.value = ''
    gradeCreateError.value = ''
    gradeCreateSuccess.value = ''
    gradeEditError.value = ''
    gradeEditSuccess.value = ''
  }

  const deleteUser = async (userId) => {
    if (!userId) {
      userDeleteError.value = 'Usuario invalido.'
      return
    }

    userDeleteLoading.value = true
    userDeleteError.value = ''

    try {
      await request(`/usuarios/${userId}`, {
        method: 'DELETE'
      }, true)

      resetUserForm()
      await fetchUsers()
      userEditSuccess.value = 'Usuario excluido com sucesso.'
    } catch (error) {
      userDeleteError.value = error.message
    } finally {
      userDeleteLoading.value = false
    }
  }

  const deleteGrade = async (gradeId) => {
    if (!gradeId) {
      gradeDeleteError.value = 'Nota invalida.'
      return
    }

    gradeDeleteLoading.value = true
    gradeDeleteError.value = ''

    try {
      await request(`/grades/${gradeId}`, {
        method: 'DELETE'
      }, true)

      resetGradeForm()
      await fetchGrades()
      await fetchStudents()
      gradeEditSuccess.value = 'Nota excluida com sucesso.'
    } catch (error) {
      gradeDeleteError.value = error.message
    } finally {
      gradeDeleteLoading.value = false
    }
  }

  const submitGradeForm = async () => {
    if (editingGradeId.value) {
      gradeEditLoading.value = true
      gradeEditError.value = ''
      gradeEditSuccess.value = ''

      try {
        const validationError = validateGradeForm()
        if (validationError) {
          throw new Error(validationError)
        }

        await request(`/grades/${editingGradeId.value}`, {
          method: 'PUT',
          body: JSON.stringify({
            studentId: Number(gradeForm.studentId),
            subject: String(gradeForm.subject).trim(),
            grade: Number(gradeForm.grade)
          })
        }, true)

        gradeEditSuccess.value = 'Nota atualizada com sucesso.'
        resetGradeForm()
        await fetchGrades()
        await fetchStudents()
      } catch (error) {
        gradeEditError.value = error.message
      } finally {
        gradeEditLoading.value = false
      }

      return
    }

    await createGrade()
  }

  const uploadDocument = async (file) => {
    if (!file) {
      uploadError.value = 'Selecione um arquivo para enviar.'
      uploadSuccess.value = ''
      return
    }

    uploadLoading.value = true
    uploadError.value = ''
    uploadSuccess.value = ''
    uploadProgress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)

      const responsePayload = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${API_BASE_URL}/uploads`)

        if (authToken.value) {
          xhr.setRequestHeader('Authorization', `Bearer ${authToken.value}`)
        }

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return
          }

          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }

        xhr.onload = () => {
          let payload = null

          if (xhr.responseText) {
            try {
              payload = JSON.parse(xhr.responseText)
            } catch {
              payload = { message: xhr.responseText }
            }
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(payload)
            return
          }

          if (xhr.status === 401) {
            clearSession()
            authError.value = 'Sua sessao expirou. Faca login novamente.'
          }

          reject(new Error(payload?.message || 'Falha ao enviar arquivo.'))
        }

        xhr.onerror = () => {
          reject(new Error('Erro de rede ao enviar arquivo.'))
        }

        xhr.send(formData)
      })

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        uploadedAt: new Date().toISOString(),
        originalName: responsePayload?.file?.originalName || file.name,
        fileName: responsePayload?.file?.fileName || file.name,
        mimeType: responsePayload?.file?.mimeType || file.type,
        size: responsePayload?.file?.size || file.size,
        path: responsePayload?.file?.path || ''
      }

      saveUploadHistory([entry, ...uploadHistory.value].slice(0, 20))
      uploadSuccess.value = responsePayload?.message || 'Arquivo enviado com sucesso.'
      uploadProgress.value = 100
    } catch (error) {
      uploadError.value = error.message
    } finally {
      uploadLoading.value = false
    }
  }

  const handleLogin = async () => {
    authLoading.value = true
    authError.value = ''
    authSuccess.value = ''

    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      })

      persistSession(response.token, response.usuario)
      authSuccess.value = 'Login realizado com sucesso.'
      currentView.value = 'dashboard'
      loginForm.password = ''

      await fetchMyProfile()
      await fetchGrades()
      await fetchStudents()
      await fetchUsers()
      loadUploadHistory()
    } catch (error) {
      authError.value = error.message
    } finally {
      authLoading.value = false
    }
  }

  const refreshCurrentView = async () => {
    authError.value = ''

    await fetchMyProfile()

    if (currentView.value === 'grades') {
      await fetchGrades()
      await fetchStudents()
    }

    if (currentView.value === 'users') {
      await fetchUsers()
    }
  }

  const setView = async (view) => {
    currentView.value = view

    if (view === 'grades') {
      await fetchGrades()
      await fetchStudents()
    }

    if (view === 'users') {
      await fetchUsers()
    }

    if (view === 'uploads') {
      loadUploadHistory()
    }
  }

  const logout = () => {
    clearSession()
    authSuccess.value = ''
    gradesError.value = ''
  }

  const bootstrap = async () => {
    if (!isAuthenticated.value) {
      return
    }

    await fetchMyProfile()
    await fetchGrades()
    await fetchStudents()
    await fetchUsers()
    loadUploadHistory()
  }

  return {
    loginForm,
    registerForm,
    gradeForm,
    currentView,
    user,
    users,
    students,
    editingUserId,
    editingGradeId,
    showUserEditModal,
    showGradeEditModal,
    userFormMode,
    gradeFormMode,
    authError,
    authSuccess,
    gradesError,
    gradeCreateError,
    gradeCreateSuccess,
    gradeEditError,
    gradeEditSuccess,
    registerError,
    registerSuccess,
    userEditError,
    userEditSuccess,
    userDeleteLoading,
    userDeleteError,
    gradeDeleteLoading,
    gradeDeleteError,
    uploadError,
    uploadSuccess,
    authLoading,
    gradesLoading,
    gradeCreateLoading,
    gradeEditLoading,
    profileLoading,
    registerLoading,
    userEditLoading,
    uploadLoading,
    uploadProgress,
    isAuthenticated,
    canManageUsers,
    visibleGrades,
    statCards,
    uploadHistory,
    roleLabel,
    formatDateTime,
    formatGradeValue,
    handleLogin,
    createUser,
    submitUserForm,
    startEditUser,
    resetUserForm,
    deleteUser,
    closeUserEditModal,
    createGrade,
    submitGradeForm,
    startEditGrade,
    resetGradeForm,
    deleteGrade,
    closeGradeEditModal,
    uploadDocument,
    refreshCurrentView,
    setView,
    logout,
    bootstrap
  }
}
