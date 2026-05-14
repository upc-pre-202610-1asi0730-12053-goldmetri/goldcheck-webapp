<template>
  <div class="auth-layout">
    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <h1>{{ $t('auth.createAccount') }}</h1>

        <div v-if="iamStore.errors.length" class="gc-alert gc-alert-danger">
          {{ $t('auth.registerError') }}
        </div>

        <button class="gc-btn-google" type="button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          {{ $t('auth.continueGoogle') }}
        </button>

        <div class="gc-divider">{{ $t('auth.or') }}</div>

        <form @submit.prevent="handleRegister">
          <div class="gc-field">
            <input
              v-model="form.email"
              type="email"
              :placeholder="$t('auth.email')"
              class="gc-input"
              :class="{ error: v$.email.$error }"
            />
            <span v-if="v$.email.$error" class="gc-error-msg">{{ $t('auth.emailInvalid') }}</span>
          </div>

          <div class="gc-field">
            <input
              v-model="form.username"
              type="text"
              :placeholder="$t('auth.username')"
              class="gc-input"
              :class="{ error: v$.username.$error }"
            />
            <span v-if="v$.username.$error" class="gc-error-msg">{{ $t('auth.fieldRequired') }}</span>
          </div>

          <div class="gc-field">
            <input
              v-model="form.password"
              type="password"
              :placeholder="$t('auth.password')"
              class="gc-input"
              :class="{ error: v$.password.$error }"
            />
            <span v-if="v$.password.$error" class="gc-error-msg">{{ $t('auth.passwordRequired') }}</span>
          </div>

          <div class="gc-field">
            <input
              v-model="form.phoneNumber"
              type="tel"
              :placeholder="$t('auth.phoneNumber')"
              class="gc-input"
            />
          </div>

          <!-- Segmento: US06 (Minerías) / US07 (Joyerías) -->
          <div class="gc-field">
            <p style="font-size:0.82rem;font-weight:600;color:#666;margin-bottom:0.4rem">{{ $t('auth.segment') }}</p>
            <div class="gc-segment-group">
              <label class="gc-segment-option">
                <input type="radio" v-model="form.segment" value="consumer" />
                {{ $t('auth.consumer') }}
              </label>
              <label class="gc-segment-option">
                <input type="radio" v-model="form.segment" value="jewelry" />
                {{ $t('auth.jewelry') }}
              </label>
              <label class="gc-segment-option">
                <input type="radio" v-model="form.segment" value="mining" />
                {{ $t('auth.mining') }}
              </label>
            </div>
            <span v-if="v$.segment.$error" class="gc-error-msg">{{ $t('auth.segmentRequired') }}</span>
          </div>

          <p style="font-size:0.8rem;color:var(--gc-text-muted);margin-bottom:0.75rem">
            {{ $t('auth.alreadyHaveAccount') }}
            <RouterLink to="/auth/login" class="text-link">{{ $t('auth.login') }}</RouterLink>
          </p>

          <button type="submit" class="gc-btn gc-btn-primary" :disabled="iamStore.loading">
            <i v-if="iamStore.loading" class="pi pi-spinner pi-spin" />
            {{ $t('auth.signUp') }}
          </button>
        </form>
      </div>
    </div>

    <!-- Brand panel -->
    <div class="auth-brand-panel">
      <div class="brand-logo-text">⬡</div>
      <div class="brand-text-block">
        <p class="brand-name">GOLDMETRICS</p>
        <p class="brand-sub">— GoldCheck —</p>
        <p class="brand-tagline">INTEGRATED MINING SOLUTIONS</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useIamStore } from '../../../application/iam.store.js'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

const router   = useRouter()
const iamStore = useIamStore()

const form = reactive({
  email: '', username: '', password: '', phoneNumber: '', segment: ''
})

const rules = {
  email:    { required, email },
  username: { required },
  password: { required },
  segment:  { required }
}

const v$ = useVuelidate(rules, form)

async function handleRegister() {
  await v$.value.$validate()
  if (v$.value.$error) return

  const ok = await iamStore.register({
    email:       form.email,
    username:    form.username,
    password:    form.password,
    phoneNumber: form.phoneNumber,
    segment:     form.segment,
    plan:        'BRONZE'
  })

  if (!ok) return

  const seg = iamStore.currentUser?.segment
  if (seg === 'mining')   router.push({ name: 'fleet-dashboard' })
  else if (seg === 'jewelry') router.push({ name: 'jewelry-dashboard' })
  else router.push({ name: 'consumer-collection' })
}
</script>

<style scoped>
.brand-logo { max-width: 260px; margin-bottom: 1rem; }
.brand-text-block { text-align: center; }
.brand-name { font-size: 1.6rem; font-weight: 900; color: var(--gc-gold-mid); letter-spacing: 0.12em; }
.brand-sub  { font-size: 1rem; color: var(--gc-text-secondary); letter-spacing: 0.08em; }
.brand-tagline { font-size: 0.7rem; color: var(--gc-text-muted); letter-spacing: 0.15em; margin-top: 0.25rem; }
.text-link { color: var(--gc-dark-3); font-weight: 600; text-decoration: none; }
.text-link:hover { text-decoration: underline; }
</style>
