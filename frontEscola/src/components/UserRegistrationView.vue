<script setup>
defineProps({
  canManageUsers: {
    type: Boolean,
    default: false
  },
  form: {
    type: Object,
    required: true
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

const emit = defineEmits(['submit'])

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

const formatCpf = (value) => {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

const formatPhone = (value) => {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const onCpfInput = (event, form) => {
  form.cpf = formatCpf(event.target.value)
}

const onPhoneInput = (event, form) => {
  form.phone = formatPhone(event.target.value)
}
</script>

<template>
  <section class="register-layout">
    <header class="section-header">
      <div>
        <p class="eyebrow">Gestao</p>
        <h2>Cadastrar novo usuario</h2>
      </div>
      <span class="chip">Somente admin</span>
    </header>

    <p v-if="!canManageUsers" class="feedback feedback-error">
      Seu perfil nao possui permissao para cadastrar usuarios.
    </p>

    <form v-else class="register-form" @submit.prevent="emit('submit')">
      <label class="field">
        <span>Nome</span>
        <input v-model.trim="form.name" required placeholder="Nome completo" />
      </label>

      <label class="field">
        <span>Email</span>
        <input v-model.trim="form.email" type="email" required placeholder="email@escola.com" />
      </label>

      <label class="field">
        <span>Senha</span>
        <input v-model="form.password" type="password" minlength="8" required placeholder="Minimo 8 caracteres" />
        <small class="field-hint">Use ao menos 1 letra maiuscula, 1 numero e 1 simbolo.</small>
      </label>

      <label class="field">
        <span>Perfil</span>
        <select v-model="form.role" class="field-select" required>
          <option value="student">Aluno</option>
          <option value="teacher">Professor</option>
          <option value="admin">Administrador</option>
        </select>
      </label>

      <label class="field">
        <span>CPF</span>
        <input
          :value="form.cpf"
          required
          placeholder="000.000.000-00"
          maxlength="14"
          @input="onCpfInput($event, form)"
        />
      </label>

      <label class="field">
        <span>Telefone</span>
        <input
          :value="form.phone"
          required
          placeholder="(00) 90000-0000"
          maxlength="15"
          @input="onPhoneInput($event, form)"
        />
      </label>

      <label class="field register-form-full">
        <span>Endereco</span>
        <input v-model.trim="form.address" required placeholder="Rua, numero, bairro" />
      </label>

      <p v-if="error" class="feedback feedback-error register-form-full">{{ error }}</p>
      <p v-else-if="success" class="feedback feedback-success register-form-full">{{ success }}</p>

      <button class="primary-button register-form-full" type="submit" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Cadastrar usuario' }}
      </button>
    </form>
  </section>
</template>
