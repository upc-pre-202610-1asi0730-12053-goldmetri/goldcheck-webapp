<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useIamStore } from '../../../application/iam.store.js'

const { t, locale } = useI18n()
const router   = useRouter()
const route    = useRoute()
const iamStore = useIamStore()
const activeTab = ref('profile')

onMounted(() => {
  const tab = route.query.tab
  if (tab === 'notifications' || tab === 'settings') activeTab.value = tab
})

// ── Notifications tab ──────────────────────────────────────────────────────
const notifPrefs = reactive({ email: true, inApp: true })
const notifSaved = ref(false)
function saveNotifPrefs() {
  notifSaved.value = true
  setTimeout(() => { notifSaved.value = false }, 2500)
}

// ── Settings tab ───────────────────────────────────────────────────────────
function setLanguage(lang) { locale.value = lang }
function logout() {
  iamStore.logout?.()
  router.push({ name: 'login' })
}

// ── Profile tab ────────────────────────────────────────────────────────────
const LOCATIONS = [
  'Áncash, Perú',
  'Apurímac, Perú',
  'Arequipa, Perú',
  'Cajamarca, Perú',
  'Cusco, Perú',
  'Huancavelica, Perú',
  'Junín, Perú',
  'La Libertad, Perú',
  'Lima, Perú',
  'Madre de Dios, Perú',
  'Moquegua, Perú',
  'Pasco, Perú',
  'Puno, Perú',
  'Tacna, Perú',
]

const originalEmail = iamStore.currentUser?.email || ''

const form = reactive({
  email:           iamStore.currentUser?.email       || '',
  username:        iamStore.currentUser?.username    || '',
  phoneNumber:     iamStore.currentUser?.phoneNumber || '',
  location:        iamStore.currentUser?.location    || '',
  newPassword:     '',
  confirmPassword: ''
})

const fieldErrors = reactive({
  email: '', username: '', phone: '', newPassword: '', confirmPassword: ''
})

const saved      = ref(false)
const saveError  = ref(false)

// ── Save-confirmation modal ────────────────────────────────────────────────
const showSaveConfirm = ref(false)

// ── Confirm-current-password modal (shown when email changes) ──────────────
const showConfirmModal = ref(false)
const currentPwdInput  = ref('')
const currentPwdError  = ref('')

const initials = computed(() => (form.username || 'U').slice(0, 2).toUpperCase())
const emailChanged = computed(() => form.email.trim() !== originalEmail)

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE  = /^\d{7,15}$/

function validate() {
  fieldErrors.email          = ''
  fieldErrors.username       = ''
  fieldErrors.phone          = ''
  fieldErrors.newPassword    = ''
  fieldErrors.confirmPassword = ''

  let ok = true
  if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
    fieldErrors.email = t('profile.errEmailInvalid'); ok = false
  }
  if (!form.username.trim() || form.username.trim().length < 3) {
    fieldErrors.username = t('profile.errUsernameMin'); ok = false
  }
  if (form.phoneNumber && !PHONE_RE.test(form.phoneNumber)) {
    fieldErrors.phone = t('profile.errPhoneInvalid'); ok = false
  }
  if (form.newPassword && form.newPassword.length < 6) {
    fieldErrors.newPassword = t('profile.errPasswordMin'); ok = false
  }
  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    fieldErrors.confirmPassword = t('profile.errPasswordMismatch'); ok = false
  }
  return ok
}

async function handleSave() {
  if (!validate()) return
  showSaveConfirm.value = true
}

async function proceedAfterConfirm() {
  showSaveConfirm.value = false
  if (emailChanged.value) {
    currentPwdInput.value = ''
    currentPwdError.value = ''
    showConfirmModal.value = true
    return
  }
  await persistUpdate()
}

async function handleConfirmAndSave() {
  currentPwdError.value = ''
  if (!currentPwdInput.value) {
    currentPwdError.value = t('profile.errCurrentPwdRequired')
    return
  }
  if (currentPwdInput.value !== iamStore.currentUser?.password) {
    currentPwdError.value = t('profile.errCurrentPwdWrong')
    return
  }
  showConfirmModal.value = false
  await persistUpdate()
}

async function persistUpdate() {
  saveError.value = false
  const payload = {
    email:       form.email.trim(),
    username:    form.username.trim(),
    phoneNumber: form.phoneNumber,
    location:    form.location
  }
  if (form.newPassword) payload.password = form.newPassword

  const ok = await iamStore.updateProfile(payload)
  if (ok) {
    saved.value = true
    form.newPassword = ''
    form.confirmPassword = ''
    setTimeout(() => { saved.value = false }, 3000)
  } else {
    saveError.value = true
  }
}
</script>

<template>
  <div class="dashboard-page">
    <div class="profile-header">
      <div>
        <h1>{{ $t('profile.hello') }} <span class="text-gold">{{ iamStore.currentUser?.username }}</span></h1>
      </div>
      <div class="profile-tabs">
        <button class="profile-tab" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
          <i class="pi pi-user" /> {{ $t('profile.myProfile') }}
        </button>
        <button class="profile-tab" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
          <i class="pi pi-bell" /> {{ $t('profile.notifications') }}
        </button>
        <button class="profile-tab" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
          <i class="pi pi-cog" /> {{ $t('profile.settings') }}
        </button>
      </div>
    </div>

    <div class="profile-body">
      <div class="profile-avatar-col">
        <div class="profile-avatar-big">{{ initials }}</div>
      </div>

      <div class="profile-form-col">
        <div v-if="saved" class="gc-alert gc-alert-success" style="margin-bottom:1rem">
          <i class="pi pi-check-circle" /> {{ $t('profile.updateSuccess') }}
        </div>
        <div v-if="saveError" class="gc-alert gc-alert-danger" style="margin-bottom:1rem">
          <i class="pi pi-times-circle" /> {{ $t('profile.updateError') }}
        </div>

        <!-- ── Profile form ── -->
        <form v-if="activeTab === 'profile'" @submit.prevent="handleSave">

          <p class="section-label">{{ $t('profile.sectionBasic') }}</p>

          <div class="form-field">
            <label>{{ $t('profile.email') }}</label>
            <input v-model="form.email" type="email" class="gc-input-dark" :class="{ 'input-error': fieldErrors.email }" />
            <span v-if="fieldErrors.email" class="field-err">{{ fieldErrors.email }}</span>
            <span v-else-if="emailChanged" class="field-hint">
              <i class="pi pi-info-circle" /> {{ $t('profile.emailChangedHint') }}
            </span>
          </div>

          <div class="form-field">
            <label>{{ $t('profile.username') }}</label>
            <input v-model="form.username" type="text" class="gc-input-dark" :class="{ 'input-error': fieldErrors.username }" />
            <span v-if="fieldErrors.username" class="field-err">{{ fieldErrors.username }}</span>
          </div>

          <div class="form-field">
            <label>{{ $t('profile.phoneNumber') }}</label>
            <input v-model="form.phoneNumber" type="tel" class="gc-input-dark" :class="{ 'input-error': fieldErrors.phone }" />
            <span v-if="fieldErrors.phone" class="field-err">{{ fieldErrors.phone }}</span>
          </div>

          <div class="form-field">
            <label>{{ $t('profile.location') }}</label>
            <select v-model="form.location" class="gc-input-dark gc-select-field">
              <option value="">{{ $t('profile.locationPlaceholder') }}</option>
              <option v-for="loc in LOCATIONS" :key="loc" :value="loc">{{ loc }}</option>
            </select>
          </div>

          <p class="section-label" style="margin-top:1.5rem">{{ $t('profile.sectionPassword') }}</p>

          <div class="form-field">
            <label>{{ $t('profile.newPassword') }}</label>
            <input v-model="form.newPassword" type="password" class="gc-input-dark" :class="{ 'input-error': fieldErrors.newPassword }" :placeholder="$t('profile.passwordOptionalPh')" />
            <span v-if="fieldErrors.newPassword" class="field-err">{{ fieldErrors.newPassword }}</span>
          </div>

          <div class="form-field" v-if="form.newPassword">
            <label>{{ $t('profile.confirmPassword') }}</label>
            <input v-model="form.confirmPassword" type="password" class="gc-input-dark" :class="{ 'input-error': fieldErrors.confirmPassword }" :placeholder="$t('profile.confirmPasswordPh')" />
            <span v-if="fieldErrors.confirmPassword" class="field-err">{{ fieldErrors.confirmPassword }}</span>
          </div>

          <button type="submit" class="gc-btn gc-btn-gold" style="margin-top:1.25rem" :disabled="iamStore.loading">
            <i v-if="iamStore.loading" class="pi pi-spinner pi-spin" />
            {{ $t('profile.saveChanges') }}
          </button>
        </form>

        <!-- ── Notifications tab ── -->
        <div v-else-if="activeTab === 'notifications'" class="pref-section">
          <p class="pref-title">{{ $t('profile.notifications') }}</p>
          <div class="pref-card">
            <div class="pref-row">
              <div>
                <p class="pref-label">{{ $t('profile.notifEmailLabel') }}</p>
                <p class="pref-desc">{{ $t('profile.notifEmailDesc') }}</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifPrefs.email" />
                <span class="toggle-slider" />
              </label>
            </div>
            <div class="pref-row" style="border-top:1px solid var(--gc-border);margin-top:1rem;padding-top:1rem">
              <div>
                <p class="pref-label">{{ $t('profile.notifAppLabel') }}</p>
                <p class="pref-desc">{{ $t('profile.notifAppDesc') }}</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifPrefs.inApp" />
                <span class="toggle-slider" />
              </label>
            </div>
          </div>
          <div v-if="notifSaved" class="gc-alert gc-alert-success" style="margin-top:1rem">
            <i class="pi pi-check-circle" /> {{ $t('profile.notifSaved') }}
          </div>
          <button class="gc-btn gc-btn-gold" style="margin-top:1rem" @click="saveNotifPrefs">
            {{ $t('profile.saveChanges') }}
          </button>
        </div>

        <!-- ── Settings tab ── -->
        <div v-else-if="activeTab === 'settings'" class="pref-section">
          <p class="pref-title">{{ $t('profile.settings') }}</p>
          <div class="pref-card">
            <p class="pref-label" style="margin-bottom:0.75rem">{{ $t('profile.settingsLanguage') }}</p>
            <div class="lang-btns">
              <button class="lang-btn" :class="{ active: locale === 'en' }" @click="setLanguage('en')">🇺🇸 {{ $t('profile.settingsLangEn') }}</button>
              <button class="lang-btn" :class="{ active: locale === 'es' }" @click="setLanguage('es')">🇵🇪 {{ $t('profile.settingsLangEs') }}</button>
            </div>
          </div>
          <div class="pref-card danger-card" style="margin-top:1.5rem">
            <p class="pref-label" style="color:var(--gc-danger);margin-bottom:0.75rem">{{ $t('profile.settingsDanger') }}</p>
            <button class="gc-btn gc-btn-danger" @click="logout">
              <i class="pi pi-sign-out" /> {{ $t('profile.settingsLogout') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Save confirmation modal ── -->
    <div v-if="showSaveConfirm" class="gc-modal-overlay" @click.self="showSaveConfirm = false">
      <div class="gc-modal" style="max-width:400px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-save" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('profile.confirmSaveTitle') }}
          </p>
          <button class="gc-modal-close" @click="showSaveConfirm = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <p style="font-size:0.85rem;color:var(--gc-text-secondary)">
            {{ $t('profile.confirmSaveDesc') }}
          </p>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showSaveConfirm = false">{{ $t('common.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" @click="proceedAfterConfirm">
            {{ $t('profile.confirmSaveBtn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Confirm current password modal ── -->
    <div v-if="showConfirmModal" class="gc-modal-overlay" @click.self="showConfirmModal = false">
      <div class="gc-modal" style="max-width:420px">
        <div class="gc-modal-header">
          <p class="gc-modal-title">
            <i class="pi pi-shield" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
            {{ $t('profile.confirmEmailChangeTitle') }}
          </p>
          <button class="gc-modal-close" @click="showConfirmModal = false">✕</button>
        </div>
        <div style="padding:1rem 0">
          <p style="font-size:0.85rem;color:var(--gc-text-secondary);margin-bottom:1rem">
            {{ $t('profile.confirmEmailChangeDesc') }}
          </p>
          <label class="form-field-label">{{ $t('profile.currentPassword') }}</label>
          <input
            v-model="currentPwdInput"
            type="password"
            class="gc-input-dark"
            :class="{ 'input-error': currentPwdError }"
            :placeholder="$t('profile.currentPasswordPh')"
            @keyup.enter="handleConfirmAndSave"
          />
          <span v-if="currentPwdError" class="field-err">{{ currentPwdError }}</span>
        </div>
        <div class="gc-modal-footer">
          <button class="gc-btn gc-btn-outline" @click="showConfirmModal = false">{{ $t('common.cancel') }}</button>
          <button class="gc-btn gc-btn-gold" :disabled="iamStore.loading" @click="handleConfirmAndSave">
            <i v-if="iamStore.loading" class="pi pi-spin pi-spinner" />
            {{ $t('profile.confirmAndSave') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-tabs { display: flex; gap: 0.5rem; }

.profile-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  color: var(--gc-text-secondary);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}
.profile-tab:hover, .profile-tab.active {
  border-color: var(--gc-gold-mid);
  color: var(--gc-text-primary);
}

.profile-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 3rem;
  align-items: start;
}

.profile-avatar-big {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: var(--gc-dark-card);
  border: 2px solid var(--gc-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gc-gold-mid);
}

.profile-form-col { max-width: 560px; }

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--gc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.9rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--gc-border);
}

.form-field {
  margin-bottom: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-field label, .form-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.1rem;
}

.gc-input-dark {
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: var(--gc-dark-2);
  border: 1px solid var(--gc-border);
  border-radius: 8px;
  color: var(--gc-text-primary);
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.gc-input-dark:focus { outline: none; border-color: var(--gc-gold-mid); }
.gc-select-field { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.8rem center; padding-right: 2.2rem; cursor: pointer; }
.gc-select-field option { background: var(--gc-dark-2); color: var(--gc-text-primary); }
.input-error { border-color: var(--gc-danger) !important; }

.field-err  { font-size: 0.76rem; color: var(--gc-danger); }
.field-hint { font-size: 0.76rem; color: var(--gc-gold-mid); display: flex; align-items: center; gap: 0.3rem; }

/* Notification / Settings tabs */
.pref-section { padding-top: 0.5rem; }
.pref-title { font-size: 0.95rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 1.25rem; }

.pref-card {
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}
.danger-card { border-color: rgba(239,68,68,0.3); }

.pref-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.pref-label { font-size: 0.85rem; font-weight: 600; color: var(--gc-text-primary); margin-bottom: 0.15rem; }
.pref-desc  { font-size: 0.78rem; color: var(--gc-text-muted); }

/* Toggle switch */
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; inset: 0; border-radius: 24px;
  background: var(--gc-border); cursor: pointer; transition: background 0.2s;
}
.toggle-slider::before {
  content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%;
  left: 3px; top: 3px; background: #fff; transition: transform 0.2s;
}
.toggle input:checked + .toggle-slider { background: var(--gc-gold-mid); }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

/* Language buttons */
.lang-btns { display: flex; gap: 0.75rem; }
.lang-btn {
  padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.85rem; cursor: pointer;
  background: var(--gc-dark-2); border: 1px solid var(--gc-border);
  color: var(--gc-text-secondary); transition: all 0.2s;
}
.lang-btn:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }
.lang-btn.active { border-color: var(--gc-gold-mid); color: var(--gc-gold-mid); font-weight: 700; }

/* Danger button */
.gc-btn-danger {
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444; padding: 0.5rem 1.25rem; border-radius: 8px; cursor: pointer;
  font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;
}
.gc-btn-danger:hover { background: rgba(239,68,68,0.22); }

.gc-alert-success {
  background: rgba(74,222,128,0.1); color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25); padding: 0.6rem 0.9rem;
  border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;
}
.gc-alert-danger {
  background: rgba(239,68,68,0.1); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.25); padding: 0.6rem 0.9rem;
  border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;
}
</style>
