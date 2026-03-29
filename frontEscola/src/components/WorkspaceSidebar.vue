<script setup>
defineProps({
  user: {
    type: Object,
    default: null
  },
  currentView: {
    type: String,
    default: 'dashboard'
  },
  canManageUsers: {
    type: Boolean,
    default: false
  },
  roleLabel: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['change-view', 'logout'])
</script>

<template>
  <aside class="card sidebar">
    <p class="eyebrow">Sessao ativa</p>
    <h2>{{ user?.name }}</h2>
    <p class="muted">{{ roleLabel(user?.role) }} · {{ user?.email }}</p>

    <div class="chip-list">
      <span class="chip">ID {{ user?.id }}</span>
      <span class="chip">JWT ativo</span>
    </div>

    <nav class="nav-stack">
      <button
        class="nav-button"
        :class="{ 'nav-button-active': currentView === 'dashboard' }"
        type="button"
        @click="emit('change-view', 'dashboard')"
      >
        Dashboard
      </button>
      <button
        class="nav-button"
        :class="{ 'nav-button-active': currentView === 'grades' }"
        type="button"
        @click="emit('change-view', 'grades')"
      >
        Notas
      </button>
      <button
        class="nav-button"
        :class="{ 'nav-button-active': currentView === 'uploads' }"
        type="button"
        @click="emit('change-view', 'uploads')"
      >
        Uploads
      </button>
      <button
        v-if="canManageUsers"
        class="nav-button"
        :class="{ 'nav-button-active': currentView === 'users' }"
        type="button"
        @click="emit('change-view', 'users')"
      >
        Cadastrar usuario
      </button>
    </nav>

    <button class="secondary-button" type="button" @click="emit('logout')">
      Encerrar sessao
    </button>
  </aside>
</template>
