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
  }
})
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
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
