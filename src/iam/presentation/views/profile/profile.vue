<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useIamStore } from '../../../application/iam.store.js'

const { t, locale } = useI18n()
const router = useRouter()
const iamStore = useIamStore()
const activeTab = ref('profile')
const saved = ref(false)

const notifPrefs = reactive({ email: true, inApp: true })
const notifSaved = ref(false)

function saveNotifPrefs() {
  notifSaved.value = true
  setTimeout(() => { notifSaved.value = false }, 2500)
}

function setLanguage(lang) {
  locale.value = lang
}

function logout() {
  iamStore.logout?.()
  router.push({ name: 'login' })
}

const form = reactive({
  email:       iamStore.currentUser?.email || '',
  username:    iamStore.currentUser?.username || '',
  password:    '',
  phoneNumber: iamStore.currentUser?.phoneNumber || '',
  location:    iamStore.currentUser?.location || ''
})

const initials = computed(() => (form.username || 'U').slice(0, 2).toUpperCase())

async function handleSave() {
  const ok = await iamStore.updateProfile({
    email: form.email,
    username: form.username,
    phoneNumber: form.phoneNumber,
    location: form.location
  })
  if (ok) {
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
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
        <div class="profile-avatar-big">
          {{ initials }}
        </div>
      </div>

      <div class="profile-form-col">
        <div v-if="saved" class="gc-alert gc-alert-success" style="margin-bottom:1rem">
          {{ $t('profile.updateSuccess') }}
        </div>

        <form v-if="activeTab === 'profile'" @submit.prevent="handleSave">
          <div class="form-field">
            <label>{{ $t('profile.email') }}</label>
            <input v-model="form.email" type="email" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>{{ $t('profile.username') }}</label>
            <input v-model="form.username" type="text" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>{{ $t('profile.password') }}</label>
            <input v-model="form.password" type="password" class="gc-input-dark" placeholder="••••••••" />
          </div>
          <div class="form-field">
            <label>{{ $t('profile.phoneNumber') }}</label>
            <input v-model="form.phoneNumber" type="tel" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>{{ $t('profile.location') }}</label>
            <input v-model="form.location" type="text" class="gc-input-dark" />
          </div>
          <button type="submit" class="gc-btn gc-btn-gold" style="margin-top:1rem" :disabled="iamStore.loading">
            <i v-if="iamStore.loading" class="pi pi-spinner pi-spin" />
            {{ $t('profile.saveChanges') }}
          </button>
        </form>

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

        <div v-else-if="activeTab === 'settings'" class="pref-section">
          <p class="pref-title">{{ $t('profile.settings') }}</p>

          <div class="pref-card">
            <p class="pref-label" style="margin-bottom:0.75rem">{{ $t('profile.settingsLanguage') }}</p>
            <div class="lang-btns">
              <button
                class="lang-btn"
                :class="{ active: locale === 'en' }"
                @click="setLanguage('en')"
              >🇺🇸 {{ $t('profile.settingsLangEn') }}</button>
              <button
                class="lang-btn"
                :class="{ active: locale === 'es' }"
                @click="setLanguage('es')"
              >🇵🇪 {{ $t('profile.settingsLangEs') }}</button>
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

.profile-tabs {
  display: flex;
  gap: 0.5rem;
}

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

.form-field {
  margin-bottom: 1.25rem;
}

.form-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}

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
</style>
