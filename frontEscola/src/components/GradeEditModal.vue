<script setup>
defineProps({
  grade: {
    type: Object,
    default: null
  },
  students: {
    type: Array,
    default: () => []
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

const handleDelete = () => {
  if (confirm('Tem certeza que deseja excluir esta nota? Esta acao nao pode ser desfeita.')) {
    emit('delete')
  }
}
</script>

<template>
  <div v-if="grade" class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Editar Nota</h2>
        <button class="modal-close" type="button" @click="emit('cancel')">×</button>
      </header>

      <form class="modal-body" @submit.prevent="emit('submit')">
        <label class="field">
          <span>Aluno</span>
          <select v-model="form.studentId" class="field-select" required>
            <option value="" disabled>Selecione um aluno</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.email }})
            </option>
          </select>
        </label>

        <label class="field">
          <span>Disciplina</span>
          <input v-model.trim="form.subject" required placeholder="Ex: Matematica" />
        </label>

        <label class="field">
          <span>Nota</span>
          <input v-model="form.grade" type="number" min="0" max="10" step="0.01" required placeholder="0 a 10" />
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
