<script setup>
defineProps({
  role: {
    type: String,
    default: ''
  },
  roleLabel: {
    type: Function,
    required: true
  },
  students: {
    type: Array,
    default: () => []
  },
  gradeForm: {
    type: Object,
    required: true
  },
  gradeCreateLoading: {
    type: Boolean,
    default: false
  },
  gradeEditLoading: {
    type: Boolean,
    default: false
  },
  gradeCreateError: {
    type: String,
    default: ''
  },
  gradeCreateSuccess: {
    type: String,
    default: ''
  },
  gradeEditError: {
    type: String,
    default: ''
  },
  gradeEditSuccess: {
    type: String,
    default: ''
  },
  editingGradeId: {
    type: String,
    default: ''
  },
  grades: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  formatGradeValue: {
    type: Function,
    required: true
  },
  formatDateTime: {
    type: Function,
    required: true
  },
  showGradeEditModal: {
    type: Boolean,
    default: false
  },
  gradeDeleteLoading: {
    type: Boolean,
    default: false
  },
  gradeDeleteError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit-grade', 'edit-grade', 'cancel-grade-edit', 'close-grade-modal', 'delete-grade'])
</script>

<template>
  <section class="grades-layout">
    <header class="section-header">
      <div>
        <p class="eyebrow">Boletim</p>
        <h2>Notas visiveis para {{ roleLabel(role).toLowerCase() }}</h2>
      </div>
      <span class="chip">{{ grades.length }} registro(s)</span>
    </header>

    <form v-if="role === 'teacher' && !editingGradeId" class="register-form grade-form" @submit.prevent="emit('submit-grade')">
      <label class="field">
        <span>Aluno</span>
        <select v-model="gradeForm.studentId" class="field-select" required>
          <option value="" disabled>Selecione um aluno</option>
          <option v-for="student in students" :key="student.id" :value="student.id">
            {{ student.name }} ({{ student.email }})
          </option>
        </select>
      </label>

      <label class="field">
        <span>Disciplina</span>
        <input v-model.trim="gradeForm.subject" required placeholder="Ex: Matematica" />
      </label>

      <label class="field">
        <span>Nota</span>
        <input v-model="gradeForm.grade" type="number" min="0" max="10" step="0.01" required placeholder="0 a 10" />
      </label>

      <p v-if="gradeCreateError" class="feedback feedback-error register-form-full">{{ gradeCreateError }}</p>
      <p v-else-if="gradeCreateSuccess" class="feedback feedback-success register-form-full">{{ gradeCreateSuccess }}</p>

      <button class="primary-button register-form-full" type="submit" :disabled="gradeCreateLoading">
        {{ gradeCreateLoading ? 'Salvando...' : 'Adicionar nota' }}
      </button>
    </form>

    <!-- Modal Edicao de Nota -->
    <div v-if="showGradeEditModal" class="modal-overlay" @click.self="emit('close-grade-modal')">
      <div class="modal-content">
        <button class="modal-close" @click="emit('close-grade-modal')">X</button>
        <h3>Editar Nota</h3>
        <form @submit.prevent="emit('submit-grade')">
          <label class="field">
            <span>Aluno</span>
            <select v-model="gradeForm.studentId" class="field-select" required>
              <option value="" disabled>Selecione um aluno</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }} ({{ student.email }})
              </option>
            </select>
          </label>

          <label class="field">
            <span>Disciplina</span>
            <input v-model.trim="gradeForm.subject" required placeholder="Ex: Matematica" />
          </label>

          <label class="field">
            <span>Nota</span>
            <input v-model="gradeForm.grade" type="number" min="0" max="10" step="0.01" required placeholder="0 a 10" />
          </label>

          <p v-if="gradeEditError" class="feedback feedback-error">{{ gradeEditError }}</p>
          <p v-else-if="gradeEditSuccess" class="feedback feedback-success">{{ gradeEditSuccess }}</p>

          <div class="modal-actions">
            <button class="secondary-button" type="button" @click="emit('close-grade-modal')">
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="gradeEditLoading">
              {{ gradeEditLoading ? 'Salvando...' : 'Atualizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <p v-if="error" class="feedback feedback-error">{{ error }}</p>
    <p v-else-if="loading" class="feedback">Carregando notas...</p>
    <p v-else-if="!grades.length" class="feedback">Nenhuma nota disponivel para este usuario.</p>

    <div v-else class="table-wrap">
      <table class="grades-table">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th>Nota</th>
            <th>Aluno</th>
            <th>Professor</th>
            <th>Lancamento</th>
            <th v-if="role === 'teacher'">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in grades" :key="grade.id">
            <td>{{ grade.subject }}</td>
            <td>
              <span class="grade-badge">{{ formatGradeValue(grade.grade) }}</span>
            </td>
            <td>{{ grade.student?.name || `ID ${grade.studentId}` }}</td>
            <td>{{ grade.teacher?.name || `ID ${grade.teacherId}` }}</td>
            <td>{{ formatDateTime(grade.createdAt) }}</td>
            <td v-if="role === 'teacher'">
              <button class="secondary-button" type="button" @click="emit('edit-grade', grade)">
                Editar
              </button>
              <button class="secondary-button danger" type="button" @click="emit('delete-grade', grade.id)" :disabled="gradeDeleteLoading">
                {{ gradeDeleteLoading ? 'Deletando...' : 'Deletar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
