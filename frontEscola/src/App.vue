<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_STORAGE_KEY = 'escola.jwt'
const USER_STORAGE_KEY = 'escola.user'

const loginForm = reactive({
  email: '',
  password: ''
})

const currentView = ref('dashboard')
const authToken = ref(localStorage.getItem(TOKEN_STORAGE_KEY) || '')
const user = ref(readStoredUser())
const grades = ref([])
const authError = ref('')
const authSuccess = ref('')
const gradesError = ref('')
const authLoading = ref(false)
const profileLoading = ref(false)
const gradesLoading = ref(false)

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

function persistSession(token, nextUser) {
  authToken.value = token
  user.value = nextUser
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
}

function clearSession() {
  authToken.value = ''
  user.value = null
  grades.value = []
  currentView.value = 'dashboard'
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

function roleLabel(role) {
  return {
    student: 'Aluno',
    teacher: 'Professor',
    admin: 'Administrador'
  }[role] || 'Usuario'
}

function formatDateTime(value) {
  if (!value) {
    return 'Nao informado'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

function formatGradeValue(value) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '--'
  }

  return numericValue.toFixed(2)
}

async function request(path, options = {}, requiresAuth = false) {
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

async function fetchProfile() {
  if (!user.value?.id || !authToken.value) {
    return
  }

  profileLoading.value = true

  try {
    const profile = await request(`/usuarios/${user.value.id}`, {}, true)
    user.value = profile
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
  } finally {
    profileLoading.value = false
  }
}

function filterVisibleGrades(allGrades) {
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

async function fetchGrades() {
  if (!user.value || !authToken.value) {
    grades.value = []
    return
  }

  gradesLoading.value = true
  gradesError.value = ''

  try {
    const endpoint = user.value.role === 'student' ? '/grades/my' : '/grades'
    const response = await request(endpoint, {}, true)
    grades.value = filterVisibleGrades(Array.isArray(response) ? response : [])
  } catch (error) {
    gradesError.value = error.message
  } finally {
    gradesLoading.value = false
  }
}

async function handleLogin() {
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

    await fetchProfile()
    await fetchGrades()
  } catch (error) {
    authError.value = error.message
  } finally {
    authLoading.value = false
  }
}

async function refreshCurrentView() {
  authError.value = ''

  await fetchProfile()

  if (currentView.value === 'grades') {
    await fetchGrades()
  }
}

function logout() {
  clearSession()
  authSuccess.value = ''
  gradesError.value = ''
}

const isAuthenticated = computed(() => Boolean(authToken.value && user.value))

const visibleGrades = computed(() => filterVisibleGrades(grades.value))

const averageGrade = computed(() => {
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

const viewTitle = computed(() => {
  return currentView.value === 'grades' ? 'Notas permitidas' : 'Dashboard'
})

const viewDescription = computed(() => {
  if (currentView.value === 'grades') {
    if (user.value?.role === 'student') {
      return 'Lista somente as notas vinculadas ao seu usuario.'
    }

    if (user.value?.role === 'teacher') {
      return 'Exibe apenas as notas lancadas por voce.'
    }

    return 'Visao completa das notas disponiveis para administracao.'
  }

  return 'Dados carregados a partir do usuario autenticado e do perfil protegido da API.'
})

const statCards = computed(() => {
  return [
    {
      label: 'Perfil',
      value: roleLabel(user.value?.role)
    },
    {
      label: 'Notas visiveis',
      value: String(visibleGrades.value.length)
    },
    {
      label: 'Media atual',
      value: averageGrade.value || '--'
    },
    {
      label: 'Ultimo registro',
      value: latestGradeDate.value
    }
  ]
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    return
  }

  await fetchProfile()
  await fetchGrades()
})
</script>

<template>
  <div class="app-shell">
    <section v-if="!isAuthenticated" class="auth-layout">
      <div class="brand-panel">
        <p class="eyebrow">Sistema escolar</p>
        <h1>Frontend Vue para autenticacao, perfil e notas.</h1>
        <p class="lead">
          Use seu login para chamar <strong>/auth/login</strong>, armazenar o JWT no navegador e acessar
          apenas os dados permitidos pelo seu perfil.
        </p>

        <div class="brand-grid">
          <article class="info-card">
            <span>1</span>
            <h2>Login</h2>
            <p>Autenticacao com email e senha, persistindo token e usuario no localStorage.</p>
          </article>

          <article class="info-card">
            <span>2</span>
            <h2>Dashboard</h2>
            <p>Resumo do perfil retornado pelo backend, com dados protegidos por JWT.</p>
          </article>

          <article class="info-card">
            <span>3</span>
            <h2>Notas</h2>
            <p>Visualizacao filtrada para mostrar apenas o que cada papel pode consultar na interface.</p>
          </article>
        </div>
      </div>

      <form class="panel login-panel" @submit.prevent="handleLogin">
        <div>
          <p class="eyebrow">Acesso</p>
          <h2>Entrar</h2>
          <p class="muted">Informe as credenciais cadastradas no backend.</p>
        </div>

        <label class="field">
          <span>Email</span>
          <input v-model.trim="loginForm.email" type="email" placeholder="usuario@escola.com" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input v-model="loginForm.password" type="password" placeholder="Sua senha" required />
        </label>

        <p v-if="authError" class="feedback feedback--error">{{ authError }}</p>
        <p v-else-if="authSuccess" class="feedback feedback--success">{{ authSuccess }}</p>

        <button class="primary-button" type="submit" :disabled="authLoading">
          {{ authLoading ? 'Entrando...' : 'Acessar painel' }}
        </button>

        <p class="helper-text">O token JWT fica salvo em localStorage e sera reutilizado ao recarregar a pagina.</p>
      </form>
    </section>

    <section v-else class="workspace-layout">
      <aside class="panel sidebar">
        <div class="sidebar__header">
          <p class="eyebrow">Sessao autenticada</p>
          <h2>{{ user?.name }}</h2>
          <p class="muted">{{ roleLabel(user?.role) }} · {{ user?.email }}</p>
        </div>

        <div class="profile-chip-list">
          <span class="profile-chip">JWT ativo</span>
          <span class="profile-chip">ID {{ user?.id }}</span>
        </div>

        <nav class="nav-stack">
          <button
            class="nav-button"
            :class="{ 'nav-button--active': currentView === 'dashboard' }"
            type="button"
            @click="currentView = 'dashboard'"
          >
            Dashboard
          </button>
          <button
            class="nav-button"
            :class="{ 'nav-button--active': currentView === 'grades' }"
            type="button"
            @click="currentView = 'grades'; fetchGrades()"
          >
            Notas
          </button>
        </nav>

        <button class="secondary-button secondary-button--full" type="button" @click="logout">
          Sair
        </button>
      </aside>

      <main class="panel workspace-panel">
        <header class="workspace-header">
          <div>
            <p class="eyebrow">{{ viewTitle }}</p>
            <h1>{{ viewTitle }}</h1>
            <p class="lead lead--compact">{{ viewDescription }}</p>
          </div>

          <button
            class="secondary-button"
            type="button"
            :disabled="profileLoading || gradesLoading"
            @click="refreshCurrentView"
          >
            {{ profileLoading || gradesLoading ? 'Atualizando...' : 'Atualizar dados' }}
          </button>
        </header>

        <section v-if="currentView === 'dashboard'" class="dashboard-grid">
          <article v-for="card in statCards" :key="card.label" class="panel stat-card stat-card--inner">
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </article>

          <article class="panel details-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Usuario</p>
                <h2>Dados do perfil</h2>
              </div>
              <span v-if="profileLoading" class="pill">Sincronizando</span>
            </div>

            <dl class="details-grid">
              <div>
                <dt>Nome</dt>
                <dd>{{ user?.name }}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{{ user?.email }}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{{ roleLabel(user?.role) }}</dd>
              </div>
              <div>
                <dt>CPF</dt>
                <dd>{{ user?.cpf }}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{{ user?.phone }}</dd>
              </div>
              <div>
                <dt>Endereco</dt>
                <dd>{{ user?.address }}</dd>
              </div>
              <div>
                <dt>Senha atualizada em</dt>
                <dd>{{ formatDateTime(user?.passwordUpdatedAt) }}</dd>
              </div>
              <div>
                <dt>Criado em</dt>
                <dd>{{ formatDateTime(user?.createdAt) }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section v-else class="notes-layout">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Consulta</p>
              <h2>Notas visiveis para {{ roleLabel(user?.role).toLowerCase() }}</h2>
            </div>
            <span class="pill">{{ visibleGrades.length }} registro(s)</span>
          </div>

          <p v-if="gradesError" class="feedback feedback--error">{{ gradesError }}</p>
          <p v-else-if="gradesLoading" class="feedback">Carregando notas...</p>
          <p v-else-if="!visibleGrades.length" class="feedback">Nenhuma nota disponivel para este usuario.</p>

          <div v-else class="table-wrap">
            <table class="grades-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Nota</th>
                  <th>Aluno</th>
                  <th>Professor</th>
                  <th>Lancamento</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="grade in visibleGrades" :key="grade.id">
                  <td>{{ grade.subject }}</td>
                  <td>
                    <span class="grade-badge">{{ formatGradeValue(grade.grade) }}</span>
                  </td>
                  <td>{{ grade.student?.name || `ID ${grade.studentId}` }}</td>
                  <td>{{ grade.teacher?.name || `ID ${grade.teacherId}` }}</td>
                  <td>{{ formatDateTime(grade.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </section>
  </div>
</template>
