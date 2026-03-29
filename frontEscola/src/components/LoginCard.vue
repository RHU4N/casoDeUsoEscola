<script setup>
defineProps({
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'update:email', 'update:password'])

const onSubmit = () => emit('submit')
</script>

<template>
  <form class="card login-card" @submit.prevent="onSubmit">
    <header>
      <p class="eyebrow">Acesso restrito</p>
      <h2>Entrar no sistema</h2>
      <p class="muted">Use suas credenciais do backend para abrir o painel.</p>
    </header>

    <label class="field">
      <span>Email institucional</span>
      <input
        :value="email"
        type="email"
        placeholder="usuario@escola.com"
        required
        @input="emit('update:email', $event.target.value)"
      />
    </label>

    <label class="field">
      <span>Senha</span>
      <input
        :value="password"
        type="password"
        placeholder="Sua senha"
        required
        @input="emit('update:password', $event.target.value)"
      />
    </label>

    <p v-if="error" class="feedback feedback-error">{{ error }}</p>
    <p v-else-if="success" class="feedback feedback-success">{{ success }}</p>

    <button class="primary-button" type="submit" :disabled="loading">
      {{ loading ? 'Entrando...' : 'Acessar painel' }}
    </button>
  </form>
</template>
