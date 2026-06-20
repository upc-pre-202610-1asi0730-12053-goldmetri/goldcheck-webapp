<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../../iam/application/iam.store.js'
import { useSubscriptionsStore } from '../../../application/subscriptions.store.js'

const { t }       = useI18n()
const iamStore    = useIamStore()
const store       = useSubscriptionsStore()

const currentPlan = computed(() => iamStore.currentUser?.plan || 'BRONZE')

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

const compareRows = computed(() => [
  { label: t('subscriptions.compLotes'),     BRONZE: t('subscriptions.bronzeBatches'),  GOLD: t('subscriptions.goldBatches'), PLATINUM: t('subscriptions.compUnlimited') },
  { label: t('subscriptions.compDashboard'), BRONZE: true,     GOLD: true,     PLATINUM: true  },
  { label: t('subscriptions.compAnalytics'), BRONZE: false,    GOLD: true,     PLATINUM: true  },
  { label: t('subscriptions.compIoT'),       BRONZE: false,    GOLD: true,     PLATINUM: true  },
  { label: t('subscriptions.compEmail'),     BRONZE: true,     GOLD: true,     PLATINUM: true  },
  { label: t('subscriptions.compPriority'),  BRONZE: false,    GOLD: true,     PLATINUM: true  },
  { label: 'API Access',                     BRONZE: false,    GOLD: false,    PLATINUM: true  },
  { label: t('subscriptions.compMulti'),     BRONZE: false,    GOLD: false,    PLATINUM: true  },
  { label: 'SLA 99.9%',                      BRONZE: false,    GOLD: false,    PLATINUM: true  },
  { label: t('subscriptions.compManager'),   BRONZE: false,    GOLD: false,    PLATINUM: true  },
])

// Payment modal state
const payModal    = reactive({ show: false, plan: null, success: false })
const form        = reactive({ number: '', holder: '', expiry: '', cvv: '' })
const errors      = reactive({ number: '', holder: '', expiry: '', cvv: '' })
const saveCard    = ref(false)
const usingSaved  = ref(false)

const savedCard = ref((() => {
  try { return JSON.parse(localStorage.getItem('gc_saved_card') || 'null') } catch { return null }
})())

const cardNumberDisplay = computed(() => {
  const digits = form.number.replace(/\s/g, '')
  const padded = digits.padEnd(16, '•')
  return padded.replace(/(.{4})/g, '$1 ').trim()
})

function openPayment(plan) {
  payModal.plan    = plan
  payModal.show    = true
  payModal.success = false
  usingSaved.value = !!savedCard.value
  saveCard.value   = false
  Object.assign(form,   { number: '', holder: '', expiry: '', cvv: '' })
  Object.assign(errors, { number: '', holder: '', expiry: '', cvv: '' })
  store.$patch({ errors: [] })
}

function closeModal() {
  payModal.show    = false
  payModal.success = false
}

function removeSavedCard() {
  localStorage.removeItem('gc_saved_card')
  savedCard.value  = null
  usingSaved.value = false
}

function formatCardNumber() {
  form.number = form.number.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const raw = form.expiry.replace(/\D/g, '').slice(0, 4)
  form.expiry = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw
}

function validate() {
  const num = form.number.replace(/\s/g, '')
  errors.number = num.length !== 16 ? t('subscriptions.errCardNumber') : ''
  errors.holder = !form.holder.trim() ? t('subscriptions.errHolder') : ''
  errors.cvv    = form.cvv.length !== 3 ? t('subscriptions.errCvv') : ''

  if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
    errors.expiry = t('subscriptions.errExpiry')
  } else {
    const [mm, yy] = form.expiry.split('/').map(Number)
    const now = new Date()
    const expYear  = 2000 + yy
    const expMonth = mm
    const curYear  = now.getFullYear()
    const curMonth = now.getMonth() + 1
    if (expYear < curYear || (expYear === curYear && expMonth < curMonth)) {
      errors.expiry = t('subscriptions.errExpiryPast')
    } else {
      errors.expiry = ''
    }
  }

  return !errors.number && !errors.holder && !errors.expiry && !errors.cvv
}

async function confirmUpgrade() {
  if (usingSaved.value) {
    const ok = await store.upgradePlan(payModal.plan.id)
    if (ok) payModal.success = true
    return
  }
  if (!validate()) return
  const ok = await store.upgradePlan(payModal.plan.id)
  if (ok) {
    if (saveCard.value) {
      const last4 = form.number.replace(/\s/g, '').slice(-4)
      const token = { last4, holder: form.holder, expiry: form.expiry, token: `mock-tok-${Date.now()}` }
      localStorage.setItem('gc_saved_card', JSON.stringify(token))
      savedCard.value = token
    }
    payModal.success = true
  }
}
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('subscriptions.plansTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('subscriptions.plansSubtitle') }}</p>
      </div>
    </div>

    <!-- Plan cards -->
    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{
          'plan-card--active':  plan.id === currentPlan,
          'plan-card--popular': plan.id === 'GOLD'
        }"
      >
        <div v-if="plan.id === currentPlan" class="plan-badge plan-badge--current">
          {{ $t('subscriptions.currentPlan') }}
        </div>
        <div v-else-if="plan.id === 'GOLD'" class="plan-badge plan-badge--popular">
          {{ $t('subscriptions.popular') }}
        </div>

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

        <button
          class="gc-btn"
          :class="plan.id === currentPlan ? 'gc-btn-outline' : 'gc-btn-gold'"
          :disabled="plan.id === currentPlan || store.loading"
          style="width:100%;margin-top:auto"
          @click="plan.id !== currentPlan && openPayment(plan)"
        >
          {{ plan.id === currentPlan ? $t('subscriptions.active') : $t('subscriptions.upgrade') }}
        </button>
      </div>
    </div>

    <!-- Comparison table -->
    <div class="gc-card compare-card">
      <p class="compare-title">
        <i class="pi pi-table" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('subscriptions.compareTitle') }}
      </p>
      <div class="compare-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="feat-col">{{ $t('subscriptions.feature') }}</th>
              <th
                v-for="p in plans"
                :key="p.id"
                :class="{ 'col-highlight': p.id === currentPlan }"
              >
                <span class="th-name">{{ p.name }}</span>
                <span class="th-price">{{ p.basePrice }}<span v-if="p.period" style="font-size:0.7rem;font-weight:400">{{ p.period }}</span></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in compareRows" :key="row.label">
              <td class="feat-label">{{ row.label }}</td>
              <td
                v-for="p in plans"
                :key="p.id"
                class="compare-cell"
                :class="{ 'col-highlight': p.id === currentPlan }"
              >
                <i v-if="row[p.id] === true"  class="pi pi-check cell-yes" />
                <i v-else-if="row[p.id] === false" class="pi pi-times cell-no" />
                <span v-else class="cell-val">{{ row[p.id] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment modal -->
    <div v-if="payModal.show" class="gc-modal-overlay" @click.self="closeModal">
      <div class="gc-modal pay-modal">
        <div class="gc-modal-header">
          <div>
            <p class="gc-modal-title">
              <i class="pi pi-credit-card" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
              {{ $t('subscriptions.paymentTitle') }}
            </p>
            <p class="gc-modal-subtitle">
              {{ payModal.plan?.name }} — {{ payModal.plan?.basePrice }}{{ payModal.plan?.period }}
            </p>
          </div>
          <button class="gc-modal-close" @click="closeModal">✕</button>
        </div>

        <!-- Success state -->
        <div v-if="payModal.success" class="pay-success">
          <i class="pi pi-check-circle" style="font-size:3rem;color:#4ade80;margin-bottom:1rem" />
          <p class="success-title">{{ $t('subscriptions.upgradeSuccess') }}</p>
          <p class="success-sub">{{ $t('subscriptions.upgradeSuccessDesc', { plan: payModal.plan?.name }) }}</p>
          <button class="gc-btn gc-btn-gold" style="margin-top:1.5rem" @click="closeModal">
            {{ $t('common.save') }}
          </button>
        </div>

        <!-- Form -->
        <div v-else>
          <!-- Visual card -->
          <div class="card-visual">
            <div class="card-visual-top">
              <div class="card-chip" />
              <i class="pi pi-wifi card-wifi" />
            </div>
            <div class="card-number-display">{{ cardNumberDisplay }}</div>
            <div class="card-visual-bottom">
              <div>
                <p class="card-meta-label">{{ $t('subscriptions.cardHolder') }}</p>
                <p class="card-meta-value">{{ form.holder || $t('subscriptions.cardHolderPh') }}</p>
              </div>
              <div style="text-align:right">
                <p class="card-meta-label">{{ $t('subscriptions.cardExpiry') }}</p>
                <p class="card-meta-value">{{ form.expiry || 'MM/AA' }}</p>
              </div>
            </div>
          </div>

          <!-- Saved card panel -->
          <div v-if="savedCard && usingSaved" class="saved-card-panel">
            <div class="saved-card-info">
              <i class="pi pi-credit-card saved-card-icon" />
              <div>
                <p class="saved-card-label">{{ $t('subscriptions.savedCard') }}</p>
                <p class="saved-card-mask">•••• •••• •••• {{ savedCard.last4 }} · {{ savedCard.expiry }}</p>
                <p class="saved-card-holder">{{ savedCard.holder }}</p>
              </div>
            </div>
            <div class="saved-card-actions">
              <button class="link-btn" @click="usingSaved = false">{{ $t('subscriptions.useNewCard') }}</button>
              <button class="link-btn link-btn--danger" @click="removeSavedCard">{{ $t('subscriptions.removeCard') }}</button>
            </div>
          </div>

          <!-- New card form -->
          <div v-else>
            <div class="pay-fields">
              <div class="pay-field">
                <label>{{ $t('subscriptions.cardNumber') }}</label>
                <input
                  v-model="form.number"
                  class="gc-input-dark"
                  :placeholder="$t('subscriptions.cardNumberPh')"
                  maxlength="19"
                  inputmode="numeric"
                  @input="formatCardNumber"
                />
                <span v-if="errors.number" class="field-err">{{ errors.number }}</span>
              </div>

              <div class="pay-field">
                <label>{{ $t('subscriptions.cardHolder') }}</label>
                <input
                  v-model="form.holder"
                  class="gc-input-dark"
                  :placeholder="$t('subscriptions.cardHolderPh')"
                  @input="form.holder = form.holder.toUpperCase()"
                />
                <span v-if="errors.holder" class="field-err">{{ errors.holder }}</span>
              </div>

              <div class="pay-row">
                <div class="pay-field">
                  <label>{{ $t('subscriptions.cardExpiry') }}</label>
                  <input
                    v-model="form.expiry"
                    class="gc-input-dark"
                    placeholder="MM/AA"
                    maxlength="5"
                    inputmode="numeric"
                    @input="formatExpiry"
                  />
                  <span v-if="errors.expiry" class="field-err">{{ errors.expiry }}</span>
                </div>
                <div class="pay-field">
                  <label>CVV</label>
                  <input
                    v-model="form.cvv"
                    class="gc-input-dark"
                    placeholder="•••"
                    maxlength="3"
                    type="password"
                    inputmode="numeric"
                  />
                  <span v-if="errors.cvv" class="field-err">{{ errors.cvv }}</span>
                </div>
              </div>

              <label class="save-card-row">
                <input type="checkbox" v-model="saveCard" />
                <span>{{ $t('subscriptions.saveCard') }}</span>
              </label>

              <div v-if="store.errors.length" class="gc-alert gc-alert-danger">
                {{ $t('subscriptions.upgradeError') }}
              </div>
            </div>
          </div>

          <div class="gc-modal-footer">
            <button class="gc-btn gc-btn-outline" @click="closeModal">{{ $t('common.cancel') }}</button>
            <button class="gc-btn gc-btn-gold" :disabled="store.loading" @click="confirmUpgrade">
              <i v-if="store.loading" class="pi pi-spin pi-spinner" />
              <i v-else class="pi pi-lock" />
              {{ usingSaved ? $t('subscriptions.useSavedCard') : $t('subscriptions.confirmPay') + ' ' + payModal.plan?.basePrice }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Plan cards ---------- */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 960px;
}

.plan-card {
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 14px;
  padding: 2rem 1.5rem;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; position: relative;
  transition: border-color 0.2s, transform 0.2s;
}

.plan-card:hover:not(.plan-card--active) { border-color: rgba(178,148,78,0.4); transform: translateY(-2px); }

.plan-card--active  { border-color: var(--gc-gold-mid); background: rgba(178,148,78,0.06); }
.plan-card--popular { border-color: rgba(178,148,78,0.5); }

.plan-badge {
  position: absolute; top: -11px;
  font-size: 0.68rem; font-weight: 700;
  padding: 0.2rem 0.8rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
}
.plan-badge--current { background: var(--gc-gold-mid); color: #1a1a1a; }
.plan-badge--popular  { background: #4ade80;            color: #052e16; }

.plan-icon   { font-size: 2.2rem; color: var(--gc-gold-mid); margin-bottom: 0.75rem; }
.plan-name   { font-size: 1.15rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.3rem; }
.plan-price  { font-size: 1.6rem; font-weight: 800; color: var(--gc-gold-mid); margin-bottom: 0.15rem; }
.plan-period { font-size: 0.85rem; font-weight: 400; color: var(--gc-text-muted); }

.plan-features {
  list-style: none; padding: 0; margin: 1rem 0 1.5rem;
  font-size: 0.82rem; color: var(--gc-text-secondary);
  text-align: left; width: 100%; flex: 1;
}
.plan-features li { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; }
.plan-features .pi-check { color: #4ade80; font-size: 0.72rem; }

/* ---------- Comparison table ---------- */
.compare-card  { margin-top: 2rem; overflow: hidden; }
.compare-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1.25rem; }
.compare-wrap  { overflow-x: auto; }

.compare-table {
  width: 100%; border-collapse: collapse; min-width: 480px;
}

.compare-table th {
  padding: 0.75rem 1rem; font-size: 0.78rem;
  background: var(--gc-dark-2); border-bottom: 1px solid var(--gc-border);
  text-align: center;
}

.compare-table th.feat-col { text-align: left; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.th-name  { display: block; font-size: 0.9rem; font-weight: 700; color: var(--gc-text-primary); }
.th-price { display: block; font-size: 0.85rem; font-weight: 700; color: var(--gc-gold-mid); margin-top: 0.1rem; }

.compare-table td { padding: 0.65rem 1rem; border-bottom: 1px solid var(--gc-border); font-size: 0.85rem; }
.compare-table tbody tr:last-child td { border-bottom: none; }
.compare-table tbody tr:hover { background: rgba(255,255,255,0.025); }

.feat-col   { width: 38%; }
.feat-label { color: var(--gc-text-secondary); }
.compare-cell { text-align: center; }

.col-highlight { background: rgba(178,148,78,0.04); }

.cell-yes { color: #4ade80; font-size: 0.9rem; }
.cell-no  { color: var(--gc-border); font-size: 0.85rem; color: rgba(255,255,255,0.15); }
.cell-val { font-size: 0.82rem; color: var(--gc-text-primary); font-weight: 600; }

/* ---------- Payment modal ---------- */
.pay-modal { max-width: 480px; }

.saved-card-panel {
  background: rgba(178,148,78,0.07);
  border: 1px solid var(--gc-gold-mid);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.saved-card-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.saved-card-icon { font-size: 1.5rem; color: var(--gc-gold-mid); margin-top: 0.1rem; }

.saved-card-label  { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gc-gold-mid); font-weight: 700; margin-bottom: 0.2rem; }
.saved-card-mask   { font-size: 0.9rem; font-weight: 600; color: var(--gc-text-primary); letter-spacing: 0.05em; }
.saved-card-holder { font-size: 0.78rem; color: var(--gc-text-muted); margin-top: 0.1rem; }

.saved-card-actions { display: flex; gap: 1rem; }

.link-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  color: var(--gc-text-muted);
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-btn:hover { color: var(--gc-text-primary); }
.link-btn--danger:hover { color: var(--gc-danger); }

.save-card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--gc-text-muted);
  cursor: pointer;
  margin-top: 0.25rem;
}

.save-card-row input[type="checkbox"] { accent-color: var(--gc-gold-mid); width: 15px; height: 15px; cursor: pointer; }

.pay-success {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 1.5rem 0;
}
.success-title { font-size: 1.1rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.3rem; }
.success-sub   { font-size: 0.85rem; color: var(--gc-text-muted); }

/* Visual card */
.card-visual {
  background: linear-gradient(135deg, #2a2d2f 0%, var(--gc-gold-dark) 100%);
  border-radius: 12px;
  padding: 1.25rem 1.5rem 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}
.card-visual::before {
  content: '';
  position: absolute; top: -30px; right: -30px;
  width: 130px; height: 130px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}
.card-visual-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.card-chip {
  width: 36px; height: 28px; border-radius: 5px;
  background: linear-gradient(135deg, #e8c96a, #b4944e);
}
.card-wifi { font-size: 1.2rem; color: rgba(255,255,255,0.5); transform: rotate(90deg); }
.card-number-display {
  font-family: 'Courier New', monospace; font-size: 1.05rem;
  letter-spacing: 0.15em; color: #fff; margin-bottom: 1.25rem;
}
.card-visual-bottom { display: flex; justify-content: space-between; }
.card-meta-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); margin-bottom: 0.15rem; }
.card-meta-value { font-size: 0.82rem; font-weight: 700; color: #fff; letter-spacing: 0.05em; }

/* Form fields */
.pay-fields { display: flex; flex-direction: column; gap: 0.9rem; }
.pay-field  { display: flex; flex-direction: column; gap: 0.3rem; }
.pay-field label { font-size: 0.78rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.pay-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field-err { font-size: 0.73rem; color: var(--gc-danger); margin-top: 0.1rem; }

@media (max-width: 768px) {
  .plans-grid { grid-template-columns: 1fr; }
}
</style>
