<template>
  <div class="dashboard-page">
    <div class="profile-header">
      <div>
        <h1>Hello, <span class="text-gold">{{ iamStore.currentUser?.username }}</span></h1>
      </div>
      <div class="profile-tabs">
        <button class="profile-tab" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
          <i class="pi pi-user" /> My Profile
        </button>
        <button class="profile-tab" @click="activeTab = 'notifications'">
          <i class="pi pi-bell" /> Notifications
        </button>
        <button class="profile-tab" @click="activeTab = 'settings'">
          <i class="pi pi-cog" /> Setting
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
          Perfil actualizado correctamente.
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-field">
            <label>Email</label>
            <input v-model="form.email" type="email" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>Username</label>
            <input v-model="form.username" type="text" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>Password</label>
            <input v-model="form.password" type="password" class="gc-input-dark" placeholder="••••••••" />
          </div>
          <div class="form-field">
            <label>Add phone number</label>
            <input v-model="form.phoneNumber" type="tel" class="gc-input-dark" />
          </div>
          <div class="form-field">
            <label>Location</label>
            <input v-model="form.location" type="text" class="gc-input-dark" />
          </div>
          <button type="submit" class="gc-btn gc-btn-gold" style="margin-top:1rem" :disabled="iamStore.loading">
            <i v-if="iamStore.loading" class="pi pi-spinner pi-spin" />
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useIamStore } from '../../../application/iam.store.js'

const iamStore = useIamStore()
const activeTab = ref('profile')
const saved = ref(false)

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
</style>
