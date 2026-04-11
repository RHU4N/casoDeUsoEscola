<script setup>
import { computed, onMounted } from 'vue'
import DashboardView from './components/DashboardView.vue'
import GradesView from './components/GradesView.vue'
import LoginCard from './components/LoginCard.vue'
import SchoolHero from './components/SchoolHero.vue'
import UploadCenterView from './components/UploadCenterView.vue'
import UserRegistrationView from './components/UserRegistrationView.vue'
import WorkspaceSidebar from './components/WorkspaceSidebar.vue'
import { useSchoolDashboard } from './composables/useSchoolDashboard'

const {
  loginForm,
  registerForm,
  currentView,
  user,
  authError,
  authSuccess,
  gradesError,
  registerError,
  registerSuccess,
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
  users,
  students,
  gradeForm,
  editingUserId,
  editingGradeId,
  userEditError,
  userEditSuccess,
  gradeEditError,
  gradeEditSuccess,
  gradeCreateError,
  gradeCreateSuccess,
  statCards,
  uploadHistory,
  roleLabel,
  formatDateTime,
  formatGradeValue,
  handleLogin,
  submitUserForm,
  startEditUser,
  resetUserForm,
  deleteUser,
  createGrade,
  submitGradeForm,
  startEditGrade,
  resetGradeForm,
  deleteGrade,
  showUserEditModal,
  closeUserEditModal,
  showGradeEditModal,
  closeGradeEditModal,
  userDeleteLoading,
  userDeleteError,
  gradeDeleteLoading,
  gradeDeleteError,
  uploadDocument,
  refreshCurrentView,
  setView,
  logout,
  bootstrap
} = useSchoolDashboard()

const viewTitle = computed(() => {
  if (currentView.value === 'grades') {
    return 'Boletim da Turma'
  }

  if (currentView.value === 'uploads') {
    return 'Central de Uploads'
  }

  if (currentView.value === 'users') {
    return 'Cadastro de Usuarios'
  }

  return 'Painel Academico'
})

const viewDescription = computed(() => {
  if (currentView.value === 'grades') {
    if (user.value?.role === 'student') {
      return 'Voce visualiza somente as notas liberadas para seu usuario.'
    }

    if (user.value?.role === 'teacher') {
      return 'Visao de lancamentos para acompanhamento pedagogico.'
    }

    return 'Visao completa para gestao academica e administrativa.'
  }

  if (currentView.value === 'uploads') {
    return 'Envie documentos e acompanhe historico recente de arquivos enviados.'
  }

  if (currentView.value === 'users') {
    return 'Area administrativa para criacao de novas contas no sistema escolar.'
  }

  return 'Resumo do seu perfil e indicadores principais do ambiente escolar.'
})

onMounted(async () => {
  await bootstrap()
})
</script>

<template>
  <div class="school-app">
    <section v-if="!isAuthenticated" class="auth-grid">
      <SchoolHero />
      <LoginCard
        :email="loginForm.email"
        :password="loginForm.password"
        :loading="authLoading"
        :error="authError"
        :success="authSuccess"
        @submit="handleLogin"
        @update:email="loginForm.email = $event"
        @update:password="loginForm.password = $event"
      />
    </section>

    <section v-else class="workspace-grid">
      <WorkspaceSidebar
        :user="user"
        :current-view="currentView"
        :can-manage-users="canManageUsers"
        :role-label="roleLabel"
        @change-view="setView"
        @logout="logout"
      />

      <main class="card workspace-main">
        <header class="workspace-header">
          <div>
            <p class="eyebrow">{{ viewTitle }}</p>
            <h1>{{ viewTitle }}</h1>
            <p class="lead">{{ viewDescription }}</p>
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

        <DashboardView
          v-if="currentView === 'dashboard'"
          :user="user"
          :stat-cards="statCards"
          :profile-loading="profileLoading"
          :role-label="roleLabel"
          :format-date-time="formatDateTime"
        />

        <GradesView
          v-else-if="currentView === 'grades'"
          :role="user?.role"
          :role-label="roleLabel"
          :editing-grade-id="editingGradeId"
          :students="students"
          :grade-form="gradeForm"
          :grade-create-loading="gradeCreateLoading"
          :grade-edit-loading="gradeEditLoading"
          :grade-create-error="gradeCreateError"
          :grade-create-success="gradeCreateSuccess"
          :grade-edit-error="gradeEditError"
          :grade-edit-success="gradeEditSuccess"
          :grades="visibleGrades"
          :loading="gradesLoading"
          :error="gradesError"
          :format-grade-value="formatGradeValue"
          :format-date-time="formatDateTime"
          :show-grade-edit-modal="showGradeEditModal"
          :grade-delete-loading="gradeDeleteLoading"
          :grade-delete-error="gradeDeleteError"
          @submit-grade="submitGradeForm"
          @edit-grade="startEditGrade"
          @cancel-grade-edit="resetGradeForm"
          @close-grade-modal="closeGradeEditModal"
          @delete-grade="deleteGrade"
        />

        <UploadCenterView
          v-else-if="currentView === 'uploads'"
          :loading="uploadLoading"
          :progress="uploadProgress"
          :error="uploadError"
          :success="uploadSuccess"
          :history="uploadHistory"
          :format-date-time="formatDateTime"
          @upload="uploadDocument"
        />

        <UserRegistrationView
          v-else
          :can-manage-users="canManageUsers"
          :users="users"
          :editing-user-id="editingUserId"
          :form="registerForm"
          :loading="registerLoading || userEditLoading"
          :error="registerError || userEditError"
          :success="registerSuccess || userEditSuccess"
          :show-user-edit-modal="showUserEditModal"
          :user-delete-loading="userDeleteLoading"
          :user-delete-error="userDeleteError"
          @submit="submitUserForm"
          @edit-user="startEditUser"
          @cancel-edit="resetUserForm"
          @close-user-modal="closeUserEditModal"
          @delete-user="deleteUser"
        />
      </main>
    </section>
  </div>
</template>
