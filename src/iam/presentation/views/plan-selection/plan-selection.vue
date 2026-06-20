<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import { useSubscriptionsStore } from '../../../../subscriptions-billing/application/subscriptions.store.js'
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const router     = useRouter()
const { t }      = useI18n()
const iamStore   = useIamStore()
const subStore   = useSubscriptionsStore()

const selected = ref(null)

const plans = computed(() => [
  {
    id: 'BRONZE', name: 'Bronze', basePrice: t('subscriptions.planFree'), period: '', icon: 'pi-shield',
    features: [
      t('subscriptions.bronzeBatches'),
      t('subscriptions.compDashboard'),
      t('subscriptions.compEmail'),
    ]
  },
  {
    id: 'GOLD', name: 'Gold', basePrice: 'S/ 199', period: t('subscriptions.planPeriodMonthly'), icon: 'pi-star',
    popular: true,
    features: [
      t('subscriptions.goldBatches'),
      t('subscriptions.compAnalytics'),
      t('subscriptions.compIoT'),
      t('subscriptions.compPriority'),
    ]
  },
  {
    id: 'PLATINUM', name: 'Platinum', basePrice: 'S/ 499', period: t('subscriptions.planPeriodMonthly'), icon: 'pi-crown',
    features: [
      t('subscriptions.platinumBatches'),
      t('subscriptions.featureApiAccess'),
      t('subscriptions.compMulti'),
      t('subscriptions.featureSla'),
      t('subscriptions.compManager'),
    ]
  }
])

async function confirm() {
  if (!selected.value) return

  if (selected.value !== 'BRONZE') {
    await subStore.upgradePlan(selected.value)
  }

  const seg = iamStore.currentUser?.segment
  if (seg === 'mining')        router.push({ name: 'fleet-dashboard' })
  else if (seg === 'jewelry')  router.push({ name: 'jewelry-dashboard' })
  else                         router.push({ name: 'consumer-collection' })
}
</script>

<template>
  <div class="auth-layout plan-layout">
    <div class="plan-panel">
      <div class="plan-inner">
        <div class="plan-lang-row">
          <LanguageSwitcher />
        </div>

        <h1 class="plan-title">{{ $t('subscriptions.onboardingTitle') }}</h1>
        <p class="plan-subtitle">{{ $t('subscriptions.onboardingSubtitle') }}</p>

        <div class="plans-grid">
          <button
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{
              'plan-card--selected': selected === plan.id,
              'plan-card--popular':  plan.popular
            }"
            type="button"
            @click="selected = plan.id"
          >
            <div v-if="plan.popular" class="plan-badge">{{ $t('subscriptions.popular') }}</div>

            <div class="plan-icon"><i :class="'pi ' + plan.icon" /></div>
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-price">
              {{ plan.basePrice }}
              <span v-if="plan.period" class="plan-period">{{ plan.period }}</span>
            </div>

            <ul class="plan-features">
              <li v-for="f in plan.features" :key="f">
                <i class="pi pi-check" /> {{ f }}
              </li>
            </ul>

            <div class="plan-select-indicator">
              <i v-if="selected === plan.id" class="pi pi-check-circle" />
              <i v-else class="pi pi-circle" />
            </div>
          </button>
        </div>

        <pv-button
          :label="$t('subscriptions.selectPlan')"
          :disabled="!selected || subStore.loading"
          :loading="subStore.loading"
          class="w-full confirm-btn"
          @click="confirm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: var(--gc-dark);
  padding: 2rem 1rem;
}

.plan-panel {
  width: 100%;
  max-width: 860px;
}

.plan-inner {
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 2rem 2.5rem;
}

.plan-lang-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.plan-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gc-text-primary);
  margin-bottom: 0.4rem;
}

.plan-subtitle {
  font-size: 0.875rem;
  color: var(--gc-text-muted);
  margin-bottom: 2rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.plan-card {
  background: var(--gc-dark-2);
  border: 2px solid var(--gc-border);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, transform 0.15s;
  color: inherit;
  font-family: inherit;
}

.plan-card:hover { border-color: rgba(178,148,78,0.4); transform: translateY(-2px); }

.plan-card--selected { border-color: var(--gc-gold-mid); background: rgba(178,148,78,0.07); }
.plan-card--popular  { border-color: rgba(178,148,78,0.45); }

.plan-badge {
  position: absolute;
  top: -11px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #4ade80;
  color: #052e16;
}

.plan-icon   { font-size: 1.8rem; color: var(--gc-gold-mid); margin-bottom: 0.5rem; }
.plan-name   { font-size: 1rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.2rem; }
.plan-price  { font-size: 1.35rem; font-weight: 800; color: var(--gc-gold-mid); }
.plan-period { font-size: 0.78rem; font-weight: 400; color: var(--gc-text-muted); }

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 1rem;
  font-size: 0.78rem;
  color: var(--gc-text-secondary);
  text-align: left;
  width: 100%;
  flex: 1;
}

.plan-features li { display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0; }
.plan-features .pi-check { color: #4ade80; font-size: 0.68rem; }

.plan-select-indicator {
  font-size: 1.2rem;
  color: var(--gc-border);
  margin-top: auto;
}

.plan-card--selected .plan-select-indicator { color: var(--gc-gold-mid); }

.confirm-btn { margin-top: 0.5rem; }

@media (max-width: 640px) {
  .plans-grid { grid-template-columns: 1fr; }
  .plan-inner { padding: 1.5rem 1rem; }
}
</style>
