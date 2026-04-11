<script setup>
defineProps({
  canManageUsers: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  editingUserId: {
    type: String,
    default: ''
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
  },
  showUserEditModal: {
    type: Boolean,
    default: false
  },
  userDeleteLoading: {
    type: Boolean,
    default: false
  },
  userDeleteError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'edit-user', 'cancel-edit', 'close-user-modal', 'delete-user'])

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
        <h2>{{ editingUserId ? 'Editar usuario' : 'Cadastrar novo usuario' }}</h2>
      </div>
      <span class="chip">Somente admin</span>
    </header>

    <p v-if="!canManageUsers" class="feedback feedback-error">
      Seu perfil nao possui permissao para cadastrar usuarios.
    </p>

    <form v-else-if="!editingUserId" class="register-form" @submit.prevent="emit('submit')">
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
          required
          minlength="8"
          placeholder="Minimo 8 caracteres"
        />
        <small class="field-hint">
          Use ao menos 1 letra maiuscula, 1 numero e 1 simbolo.
        </small>
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

    <!-- Modal Edicao de Usuario -->
    <div v-if="showUserEditModal" class="modal-overlay" @click.self="emit('close-user-modal')">
      <div class="modal-content">
        <button class="modal-close" @click="emit('close-user-modal')">X</button>
        <h3>Editar Usuario</h3>
        <form @submit.prevent="emit('submit')">
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
            <small class="field-hint">
              Deixe em branco para manter a senha atual.
            </small>
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

          <p v-if="error" class="feedback feedback-error">{{ error }}</p>
          <p v-else-if="success" class="feedback feedback-success">{{ success }}</p>

          <div class="modal-actions">
            <button class="secondary-button" type="button" @click="emit('close-user-modal')">
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Atualizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="canManageUsers" class="card" style="margin-top: 1rem;">
      <header class="section-header">
        <div>
          <p class="eyebrow">Usuarios</p>
          <h2>Editar cadastro existente</h2>
        </div>
        <span class="chip">{{ users.length }} usuario(s)</span>
      </header>

      <div class="table-wrap">
        <table class="grades-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="userItem in users" :key="userItem.id">
              <td>{{ userItem.name }}</td>
              <td>{{ userItem.email }}</td>
              <td>{{ userItem.role }}</td>
              <td>
                <button class="secondary-button" type="button" @click="emit('edit-user', userItem)">
                  Editar
                </button>
                <button class="secondary-button danger" type="button" @click="emit('delete-user', userItem.id)" :disabled="userDeleteLoading">
                  {{ userDeleteLoading ? 'Deletando...' : 'Deletar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
