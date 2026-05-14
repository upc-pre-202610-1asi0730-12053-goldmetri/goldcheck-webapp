<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('subscriptions.plansTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('subscriptions.plansSubtitle') }}</p>
      </div>
    </div>

    <div class="plans-grid">
      <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ 'plan-card--active': plan.id === currentPlan }">
        <div class="plan-badge" v-if="plan.id === currentPlan">{{ $t('subscriptions.currentPlan') }}</div>
        <div class="plan-icon"><i :class="'pi ' + plan.icon" /></div>
        <div class="plan-name">{{ plan.name }}</div>
        <div class="plan-price">{{ plan.price }}</div>
        <ul class="plan-features">
          <li v-for="f in plan.features" :key="f"><i class="pi pi-check" /> {{ f }}</li>
        </ul>
        <button
          class="gc-btn"
          :class="plan.id === currentPlan ? 'gc-btn-outline' : 'gc-btn-gold'"
          :disabled="plan.id === currentPlan"
        >
          {{ plan.id === currentPlan ? $t('subscriptions.active') : $t('subscriptions.upgrade') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useIamStore } from '../../../../iam/application/iam.store.js'

const iamStore = useIamStore()
const currentPlan = computed(() => iamStore.currentUser?.plan || 'BRONZE')

const plans = [
  {
    id: 'BRONZE', name: 'Bronze', price: 'Gratis', icon: 'pi-shield',
    features: ['5 lotes/mes', 'Dashboard básico', 'Soporte por email']
  },
  {
    id: 'GOLD', name: 'Gold', price: 'S/ 199/mes', icon: 'pi-star',
    features: ['50 lotes/mes', 'Analytics avanzado', 'IoT en tiempo real', 'Soporte prioritario']
  },
  {
    id: 'PLATINUM', name: 'Platinum', price: 'S/ 499/mes', icon: 'pi-crown',
    features: ['Lotes ilimitados', 'API access', 'Multi-empresa', 'SLA 99.9%', 'Gerente dedicado']
  }
]
</script>

<style scoped>
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
}

.plan-card {
  background: var(--gc-surface);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; position: relative;
  transition: border-color 0.2s;
}
.plan-card--active {
  border-color: var(--gc-gold-mid);
  background: rgba(178,148,78,0.05);
}

.plan-badge {
  position: absolute; top: -10px;
  background: var(--gc-gold-mid); color: #1a1a1a;
  font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.75rem;
  border-radius: 20px; text-transform: uppercase;
}

.plan-icon { font-size: 2rem; color: var(--gc-gold-mid); margin-bottom: 0.75rem; }
.plan-name { font-size: 1.1rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.4rem; }
.plan-price { font-size: 1.4rem; font-weight: 800; color: var(--gc-gold-mid); margin-bottom: 1.25rem; }

.plan-features {
  list-style: none; padding: 0; margin: 0 0 1.5rem;
  font-size: 0.82rem; color: var(--gc-text-secondary);
  text-align: left; width: 100%;
}
.plan-features li { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; }
.plan-features .pi-check { color: #4ade80; font-size: 0.75rem; }

@media (max-width: 768px) { .plans-grid { grid-template-columns: 1fr; } }
</style>
