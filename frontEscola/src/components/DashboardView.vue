<script setup>
defineProps({
  user: {
    type: Object,
    default: null
  },
  statCards: {
    type: Array,
    default: () => []
  },
  profileLoading: {
    type: Boolean,
    default: false
  },
  roleLabel: {
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
  <section class="dashboard-grid">
    <article v-for="card in statCards" :key="card.label" class="card stat-card">
      <span>{{ card.label }}</span>
      <strong>{{ card.value }}</strong>
    </article>

    <article class="card profile-card">
      <header class="section-header">
        <div>
          <p class="eyebrow">Perfil</p>
          <h2>Dados do usuario autenticado</h2>
        </div>
        <span v-if="profileLoading" class="chip">Sincronizando</span>
      </header>

      <dl class="details-grid">
        <div>
          <dt>Nome</dt>
          <dd>{{ user?.name || 'Nao informado' }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{{ user?.email || 'Nao informado' }}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{{ roleLabel(user?.role) }}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{{ formatDateTime(user?.createdAt) }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>
