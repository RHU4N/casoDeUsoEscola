<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  },
  history: {
    type: Array,
    default: () => []
  },
  formatDateTime: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['upload'])

const onFileChange = (event) => {
  selectedFile.value = event.target.files?.[0] || null
}

const submitUpload = () => {
  emit('upload', selectedFile.value)
}

const formatSize = (size) => {
  const bytes = Number(size || 0)
  if (!bytes) {
    return '0 KB'
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${(bytes / 1024).toFixed(2)} KB`
}
</script>

<template>
  <section class="upload-layout">
    <header class="section-header">
      <div>
        <p class="eyebrow">Documentos</p>
        <h2>Upload de arquivos escolares</h2>
      </div>
      <span class="chip">Historico local</span>
    </header>

    <div class="upload-box">
      <label class="field">
        <span>Arquivo (PDF, JPG ou PNG)</span>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onFileChange" />
      </label>

      <div v-if="loading" class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>
        <span>{{ progress }}%</span>
      </div>

      <p v-if="error" class="feedback feedback-error">{{ error }}</p>
      <p v-else-if="success" class="feedback feedback-success">{{ success }}</p>

      <button class="primary-button" type="button" :disabled="loading || !selectedFile" @click="submitUpload">
        {{ loading ? 'Enviando...' : 'Enviar arquivo' }}
      </button>
    </div>

    <div class="history-table-wrap">
      <table class="grades-table">
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Tipo</th>
            <th>Tamanho</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!history.length">
            <td colspan="4">Nenhum upload registrado localmente.</td>
          </tr>
          <tr v-for="item in history" :key="item.id">
            <td>{{ item.originalName }}</td>
            <td>{{ item.mimeType || 'Nao informado' }}</td>
            <td>{{ formatSize(item.size) }}</td>
            <td>{{ formatDateTime(item.uploadedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
