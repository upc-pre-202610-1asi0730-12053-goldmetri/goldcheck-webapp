<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import { useSubscriptionsStore } from '../../../../subscriptions-billing/application/subscriptions.store.js'
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const router   = useRouter()
const { t }    = useI18n()
const iamStore = useIamStore()
const subStore = useSubscriptionsStore()

const isAnnual  = ref(false)
const segment   = computed(() => iamStore.currentUser?.segment)
const isConsumer = computed(() => segment.value === 'consumer')

// ── Consumer plans ──────────────────────────────────────────────
const consumerPlans = computed(() => [
  {
    id: 'FREE',
    name: t('subscriptions.consumerFreeName'),
    desc: t('subscriptions.consumerFreeDesc'),
    price: '$0',
    priceNote: t('subscriptions.consumerFreeForever'),
    features: [
      t('subscriptions.consumerFeat1'),
      t('subscriptions.consumerFeat2'),
      t('subscriptions.consumerFeat3'),
    ],
    free: true,
    popular: false,
  },
  {
    id: 'PRO',
    name: t('subscriptions.consumerProName'),
    desc: t('subscriptions.consumerProDesc'),
    price: isAnnual.value ? '$7' : '$9',
    priceSuffix: t('subscriptions.planPeriodMonthly'),
    priceNote: isAnnual.value ? t('subscriptions.planPeriodAnnual') : '',
    features: [
      t('subscriptions.consumerProFeat1'),
      t('subscriptions.consumerProFeat2'),
      t('subscriptions.consumerProFeat3'),
      t('subscriptions.consumerProFeat4'),
      t('subscriptions.consumerProFeat5'),
    ],
    free: false,
    popular: true,
  }
])

// ── B2B plans (mining / jewelry) ────────────────────────────────
const b2bPlans = computed(() => [
  {
    id: 'BRONZE', name: 'Bronze', icon: 'pi-shield',
    price: t('subscriptions.planFree'), priceSuffix: '',
    features: [
      t('subscriptions.bronzeBatches'),
      t('subscriptions.compDashboard'),
      t('subscriptions.compEmail'),
    ],
    free: true, popular: false,
  },
  {
    id: 'GOLD', name: 'Gold', icon: 'pi-star',
    price: 'S/ 199', priceSuffix: t('subscriptions.planPeriodMonthly'),
    features: [
      t('subscriptions.goldBatches'),
      t('subscriptions.compAnalytics'),
      t('subscriptions.compIoT'),
      t('subscriptions.compPriority'),
    ],
    free: false, popular: true,
  },
  {
    id: 'PLATINUM', name: 'Platinum', icon: 'pi-crown',
    price: 'S/ 499', priceSuffix: t('subscriptions.planPeriodMonthly'),
    features: [
      t('subscriptions.platinumBatches'),
      t('subscriptions.featureApiAccess'),
      t('subscriptions.compMulti'),
      t('subscriptions.featureSla'),
      t('subscriptions.compManager'),
    ],
    free: false, popular: false,
  }
])

const plans = computed(() => isConsumer.value ? consumerPlans.value : b2bPlans.value)

// ── Payment modal ────────────────────────────────────────────────
const payModal   = reactive({ show: false, plan: null, success: false })
const cardForm   = reactive({ number: '', holder: '', expiry: '', cvv: '' })
const cardErrors = reactive({ number: '', holder: '', expiry: '', cvv: '' })

const cardDisplay = computed(() => {
  const d = cardForm.number.replace(/\s/g, '')
  return d.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim()
})

function formatCardNumber() {
  cardForm.number = cardForm.number.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const raw = cardForm.expiry.replace(/\D/g, '').slice(0, 4)
  cardForm.expiry = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw
}

function validateCard() {
  const num = cardForm.number.replace(/\s/g, '')
  cardErrors.number = num.length !== 16           ? t('subscriptions.errCardNumber') : ''
  cardErrors.holder = !cardForm.holder.trim()     ? t('subscriptions.errHolder')     : ''
  cardErrors.expiry = !/^\d{2}\/\d{2}$/.test(cardForm.expiry) ? t('subscriptions.errExpiry') : ''
  cardErrors.cvv    = cardForm.cvv.length !== 3   ? t('subscriptions.errCvv')        : ''
  return !cardErrors.number && !cardErrors.holder && !cardErrors.expiry && !cardErrors.cvv
}

function openPayment(plan) {
  payModal.plan    = plan
  payModal.show    = true
  payModal.success = false
  Object.assign(cardForm,   { number: '', holder: '', expiry: '', cvv: '' })
  Object.assign(cardErrors, { number: '', holder: '', expiry: '', cvv: '' })
  subStore.errors = []
}

function closeModal() {
  payModal.show    = false
  payModal.success = false
}

async function confirmPay() {
  if (!validateCard()) return
  const ok = await subStore.upgradePlan(payModal.plan.id)
  if (ok) payModal.success = true
}

// ── Navigation ───────────────────────────────────────────────────
function toDashboard() {
  const seg = iamStore.currentUser?.segment
  if (seg === 'mining')       router.push({ name: 'fleet-dashboard' })
  else if (seg === 'jewelry') router.push({ name: 'jewelry-dashboard' })
  else                        router.push({ name: 'consumer-collection' })
}

function selectPlan(plan) {
  if (plan.free) {
    toDashboard()
  } else {
    openPayment(plan)
  }
}
</script>

<template>
  <div class="ps-page">
    <div class="ps-lang-row">
      <LanguageSwitcher />
    </div>

    <h1 class="ps-title">{{ $t('subscriptions.onboardingTitle') }}</h1>
    <p class="ps-subtitle">{{ $t('subscriptions.onboardingSubtitle') }}</p>

    <!-- Monthly / Annual toggle (consumer only) -->
    <div v-if="isConsumer" class="billing-toggle">
      <span :class="{ 'toggle-active': !isAnnual }">{{ $t('subscriptions.planBillingMonthly') }}</span>
      <button
        class="toggle-switch"
        :class="{ 'toggle-switch--on': isAnnual }"
        role="switch"
        :aria-checked="isAnnual"
        :aria-label="$t('nav.toggleLanguage')"
        @click="isAnnual = !isAnnual"
      >
        <span class="toggle-thumb" />
      </button>
      <span :class="{ 'toggle-active': isAnnual }">{{ $t('subscriptions.planBillingAnnual') }}</span>
      <span class="discount-badge">{{ $t('subscriptions.planDiscount') }}</span>
    </div>

    <!-- Plan cards -->
    <div :class="isConsumer ? 'plans-grid plans-grid--2' : 'plans-grid plans-grid--3'">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ 'plan-card--popular': plan.popular }"
      >
        <div v-if="plan.popular" class="plan-badge">{{ $t('subscriptions.popular') }}</div>

        <!-- B2B icon -->
        <div v-if="!isConsumer" class="plan-icon"><i :class="'pi ' + plan.icon" /></div>

        <div class="plan-name">{{ plan.name }}</div>
        <p v-if="plan.desc" class="plan-desc">{{ plan.desc }}</p>

        <div class="plan-price-block">
          <div class="plan-price">
            <span class="price-currency">$</span>
            <span class="price-amount">{{ plan.price.replace('$','') }}</span>
            <span v-if="plan.priceSuffix" class="price-suffix">{{ plan.priceSuffix }}</span>
          </div>
          <p v-if="plan.priceNote" class="price-note">{{ plan.priceNote }}</p>
        </div>

        <div class="plan-divider" />

        <ul class="plan-features">
          <li v-for="f in plan.features" :key="f">
            <i class="pi pi-check" /> {{ f }}
          </li>
        </ul>

        <button
          class="plan-btn"
          :class="plan.free ? 'plan-btn--outline' : 'plan-btn--gold'"
          @click="selectPlan(plan)"
        >
          {{ plan.free ? $t('subscriptions.startFree') : $t('subscriptions.choosePlan') }}
        </button>
      </div>
    </div>

    <!-- Payment modal -->
    <div v-if="payModal.show" class="ps-overlay" @click.self="closeModal">
      <div class="ps-modal">
        <div class="ps-modal-header">
          <div>
            <p class="ps-modal-title">
              <i class="pi pi-credit-card" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
              {{ $t('subscriptions.paymentTitle') }}
            </p>
            <p class="ps-modal-subtitle">{{ payModal.plan?.name }} — {{ payModal.plan?.price }}{{ payModal.plan?.priceSuffix }}</p>
          </div>
          <button class="ps-modal-close" @click="closeModal">✕</button>
        </div>

        <!-- Success -->
        <div v-if="payModal.success" class="pay-success">
          <i class="pi pi-check-circle" style="font-size:3rem;color:#4ade80;margin-bottom:1rem" />
          <p class="success-title">{{ $t('subscriptions.paySuccess') }}</p>
          <p class="success-sub">{{ $t('subscriptions.paySuccessDesc', { plan: payModal.plan?.name }) }}</p>
          <button class="plan-btn plan-btn--gold" style="margin-top:1.5rem;width:100%" @click="toDashboard">
            {{ $t('common.continue') }}
          </button>
        </div>

        <!-- Card form -->
        <div v-else>
          <div class="card-visual">
            <div class="card-visual-top">
              <div class="card-chip" />
              <i class="pi pi-wifi card-wifi" />
            </div>
            <div class="card-number-display">{{ cardDisplay }}</div>
            <div class="card-visual-bottom">
              <div>
                <p class="card-meta-label">{{ $t('subscriptions.cardHolder') }}</p>
                <p class="card-meta-value">{{ cardForm.holder || $t('subscriptions.cardHolderPh') }}</p>
              </div>
              <div style="text-align:right">
                <p class="card-meta-label">{{ $t('subscriptions.cardExpiry') }}</p>
                <p class="card-meta-value">{{ cardForm.expiry || 'MM/AA' }}</p>
              </div>
            </div>
          </div>

          <div class="pay-fields">
            <div class="pay-field">
              <label>{{ $t('subscriptions.cardNumber') }}</label>
              <input v-model="cardForm.number" class="gc-input-dark" :placeholder="$t('subscriptions.cardNumberPh')" maxlength="19" inputmode="numeric" @input="formatCardNumber" />
              <span v-if="cardErrors.number" class="field-err">{{ cardErrors.number }}</span>
            </div>
            <div class="pay-field">
              <label>{{ $t('subscriptions.cardHolder') }}</label>
              <input v-model="cardForm.holder" class="gc-input-dark" :placeholder="$t('subscriptions.cardHolderPh')" @input="cardForm.holder = cardForm.holder.toUpperCase()" />
              <span v-if="cardErrors.holder" class="field-err">{{ cardErrors.holder }}</span>
            </div>
            <div class="pay-row">
              <div class="pay-field">
                <label>{{ $t('subscriptions.cardExpiry') }}</label>
                <input v-model="cardForm.expiry" class="gc-input-dark" placeholder="MM/AA" maxlength="5" inputmode="numeric" @input="formatExpiry" />
                <span v-if="cardErrors.expiry" class="field-err">{{ cardErrors.expiry }}</span>
              </div>
              <div class="pay-field">
                <label>CVV</label>
                <input v-model="cardForm.cvv" class="gc-input-dark" placeholder="•••" maxlength="3" type="password" inputmode="numeric" />
                <span v-if="cardErrors.cvv" class="field-err">{{ cardErrors.cvv }}</span>
              </div>
            </div>
            <div v-if="subStore.errors.length" class="gc-alert gc-alert-danger">
              {{ $t('subscriptions.upgradeError') }}
            </div>
          </div>

          <div class="ps-modal-footer">
            <button class="plan-btn plan-btn--outline" @click="closeModal">{{ $t('common.cancel') }}</button>
            <button class="plan-btn plan-btn--gold" :disabled="subStore.loading" @click="confirmPay">
              <i v-if="subStore.loading" class="pi pi-spin pi-spinner" />
              <i v-else class="pi pi-lock" />
              {{ $t('subscriptions.confirmPay') }} {{ payModal.plan?.price }}{{ payModal.plan?.priceSuffix }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ps-page {
  min-height: 100vh;
  background: var(--gc-dark);
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ps-lang-row {
  width: 100%;
  max-width: 860px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.ps-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--gc-text-primary);
  margin-bottom: 0.4rem;
  text-align: center;
}

.ps-subtitle {
  font-size: 0.875rem;
  color: var(--gc-text-muted);
  margin-bottom: 1.75rem;
  text-align: center;
  max-width: 520px;
}

/* ── Billing toggle ── */
.billing-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--gc-text-muted);
}

.toggle-active { color: var(--gc-text-primary); }

.toggle-switch {
  width: 42px;
  height: 24px;
  border-radius: 12px;
  background: var(--gc-border);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.25s;
  padding: 0;
}

.toggle-switch--on { background: var(--gc-gold-mid); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s;
}

.toggle-switch--on .toggle-thumb { transform: translateX(18px); }

.discount-badge {
  background: var(--gc-gold-mid);
  color: #1a1a1a;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

/* ── Plan grid ── */
.plans-grid {
  display: grid;
  gap: 1.25rem;
  width: 100%;
}

.plans-grid--2 { max-width: 760px; grid-template-columns: repeat(2, 1fr); }
.plans-grid--3 { max-width: 860px; grid-template-columns: repeat(3, 1fr); }

.plan-card {
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 14px;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color 0.2s;
}

.plan-card--popular {
  border-color: var(--gc-gold-mid);
  background: rgba(178,148,78,0.07);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.9rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--gc-gold-mid);
  color: #1a1a1a;
  white-space: nowrap;
}

.plan-icon { font-size: 1.8rem; color: var(--gc-gold-mid); margin-bottom: 0.5rem; }

.plan-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gc-text-primary);
  margin-bottom: 0.25rem;
}

.plan-desc {
  font-size: 0.82rem;
  color: var(--gc-text-muted);
  margin-bottom: 1rem;
}

.plan-price-block { margin-bottom: 0.25rem; }

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 0.1rem;
  color: var(--gc-text-primary);
}

.price-currency { font-size: 1.1rem; font-weight: 700; color: var(--gc-text-primary); }
.price-amount   { font-size: 2.5rem; font-weight: 900; color: var(--gc-text-primary); line-height: 1; }
.price-suffix   { font-size: 0.85rem; color: var(--gc-text-muted); margin-left: 0.2rem; }

.price-note {
  font-size: 0.75rem;
  color: var(--gc-text-muted);
  margin-top: 0.15rem;
}

.plan-divider {
  height: 1px;
  background: var(--gc-border);
  margin: 1rem 0;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--gc-text-secondary);
  padding: 0.3rem 0;
}

.plan-features .pi-check { color: var(--gc-gold-mid); font-size: 0.75rem; }

/* ── Buttons ── */
.plan-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.plan-btn--outline {
  background: transparent;
  border: 1px solid var(--gc-border);
  color: var(--gc-text-secondary);
}

.plan-btn--outline:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }

.plan-btn--gold {
  background: var(--gc-gold-mid);
  color: #1a1a1a;
}

.plan-btn--gold:hover   { opacity: 0.88; }
.plan-btn--gold:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal ── */
.ps-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.ps-modal {
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 16px;
  padding: 1.75rem;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
}

.ps-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.ps-modal-title    { font-size: 1rem; font-weight: 700; color: var(--gc-text-primary); }
.ps-modal-subtitle { font-size: 0.82rem; color: var(--gc-text-muted); margin-top: 0.2rem; }

.ps-modal-close {
  background: none;
  border: none;
  color: var(--gc-text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}

.ps-modal-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.ps-modal-footer .plan-btn { flex: 1; }

/* ── Card visual ── */
.card-visual {
  background: linear-gradient(135deg, #2a2d2f 0%, var(--gc-gold-dark) 100%);
  border-radius: 12px;
  padding: 1.25rem 1.5rem 1rem;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
}

.card-visual::before {
  content: '';
  position: absolute; top: -30px; right: -30px;
  width: 130px; height: 130px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}

.card-visual-top    { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.card-chip          { width: 36px; height: 28px; border-radius: 5px; background: linear-gradient(135deg, #e8c96a, #b4944e); }
.card-wifi          { font-size: 1.2rem; color: rgba(255,255,255,0.5); transform: rotate(90deg); }
.card-number-display { font-family: 'Courier New', monospace; font-size: 1.05rem; letter-spacing: 0.15em; color: #fff; margin-bottom: 1.25rem; }
.card-visual-bottom { display: flex; justify-content: space-between; }
.card-meta-label    { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); margin-bottom: 0.15rem; }
.card-meta-value    { font-size: 0.82rem; font-weight: 700; color: #fff; letter-spacing: 0.05em; }

/* ── Pay form ── */
.pay-fields { display: flex; flex-direction: column; gap: 0.9rem; }
.pay-field  { display: flex; flex-direction: column; gap: 0.3rem; }
.pay-field label { font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.pay-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field-err { font-size: 0.73rem; color: var(--gc-danger); }

/* ── Success ── */
.pay-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 0; }
.success-title { font-size: 1.1rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.3rem; }
.success-sub   { font-size: 0.85rem; color: var(--gc-text-muted); }

@media (max-width: 600px) {
  .plans-grid--2,
  .plans-grid--3 { grid-template-columns: 1fr; }
}
</style>
