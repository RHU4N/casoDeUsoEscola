<script setup>
defineProps({
  user: {
    type: Object,
    default: null
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

const emit = defineEmits(['submit', 'cancel', 'delete'])

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

const handleDelete = () => {
  if (confirm('Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita.')) {
    emit('delete')
  }
}
</script>

<template>
  <div v-if="user" class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Editar Usuario</h2>
        <button class="modal-close" type="button" @click="emit('cancel')">×</button>
      </header>

      <form class="modal-body" @submit.prevent="emit('submit')">
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
          <input
            v-model="form.password"
            type="password"
            minlength="8"
            placeholder="Deixe em branco para manter a senha atual"
          />
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

        <label class="field">
          <span>Endereco</span>
          <input v-model.trim="form.address" required placeholder="Rua, numero, bairro" />
        </label>

        <p v-if="error" class="feedback feedback-error">{{ error }}</p>
        <p v-else-if="success" class="feedback feedback-success">{{ success }}</p>
      </form>

      <footer class="modal-footer">
        <button class="secondary-button" type="button" @click="handleDelete">
          Excluir
        </button>
        <div class="button-group">
          <button class="secondary-button" type="button" @click="emit('cancel')">
            Cancelar
          </button>
          <button class="primary-button" type="button" :disabled="loading" @click="emit('submit')">
            {{ loading ? 'Salvando...' : 'Atualizar' }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.field span {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.field input,
.field select {
  padding: 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 1rem;
}

.field-hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.feedback {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.feedback-error {
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.feedback-success {
  background: #efe;
  color: #0a0;
  border: 1px solid #cfc;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.primary-button {
  background: #ffc107;
  color: #000;
  font-weight: 500;
}

.primary-button:hover:not(:disabled) {
  background: #ffb300;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: #e0e0e0;
  color: #333;
}

.secondary-button:hover {
  background: #d0d0d0;
}
</style>
