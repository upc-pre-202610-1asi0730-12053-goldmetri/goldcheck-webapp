<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const route    = useRoute()
const router   = useRouter()
const iamStore = useIamStore()

const token = computed(() => route.query.token || '')

const password        = ref('')
const confirmPassword = ref('')
const submitted       = ref(false)
const done            = ref(false)
const formError       = ref('')

function validate() {
  formError.value = ''
  if (!token.value) {
    formError.value = t('auth.resetMissingToken')
    return false
  }
  if (password.value.length < 6) {
    formError.value = t('auth.errPasswordMin')
    return false
  }
  if (password.value !== confirmPassword.value) {
    formError.value = t('auth.errPasswordMismatch')
    return false
  }
  return true
}

async function handleSubmit() {
  submitted.value = true
  if (!validate()) return

  const ok = await iamStore.resetPassword(token.value, password.value)
  if (ok) {
    done.value = true
  } else {
    const code = iamStore.errors[0]
    formError.value = code === 'invalidResetToken'
      ? t('auth.resetTokenInvalid')
      : t('auth.resetError')
  }
}

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-lang-row">
        <LanguageSwitcher />
      </div>

      <div v-if="done" class="success-block">
        <i class="pi pi-check-circle" style="font-size:2rem;color:#4ade80;display:block;margin-bottom:0.75rem" />
        <h2>{{ $t('auth.resetDoneTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetDoneDesc') }}</p>
        <pv-button
          :label="$t('auth.goToLogin')"
          icon="pi pi-sign-in"
          fluid
          style="margin-top:1.25rem"
          @click="goToLogin"
        />
      </div>

      <template v-else>
        <h1>{{ $t('auth.resetTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.resetSubtitle') }}</p>

        <form @submit.prevent="handleSubmit" novalidate>
          <pv-float-label variant="on" class="auth-field">
            <pv-password
              id="rp-password"
              v-model="password"
              :feedback="false"
              toggle-mask
              autocomplete="new-password"
              :invalid="submitted && !!formError"
              fluid
            />
            <label for="rp-password">{{ $t('auth.newPassword') }}</label>
          </pv-float-label>

          <pv-float-label variant="on" class="auth-field">
            <pv-password
              id="rp-confirm"
              v-model="confirmPassword"
              :feedback="false"
              toggle-mask
              autocomplete="new-password"
              :invalid="submitted && !!formError"
              fluid
            />
            <label for="rp-confirm">{{ $t('auth.confirmPassword') }}</label>
          </pv-float-label>

          <span v-if="formError" class="gc-error-msg">{{ formError }}</span>

          <pv-button
            type="submit"
            :label="$t('auth.resetSubmit')"
            icon="pi pi-lock"
            :loading="iamStore.loading"
            fluid
            style="margin-top:1.25rem"
          />
        </form>

        <RouterLink to="/auth/login" class="back-link">
          ← {{ $t('auth.backToLogin') }}
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gc-dark-3);
  padding: 1rem;
}

.auth-card {
  background: var(--gc-dark);
  border: 1px solid var(--gc-border);
  border-radius: 14px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
}

.auth-lang-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin-bottom: 0.4rem;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: var(--gc-text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.auth-field { width: 100%; margin-top: 0.75rem; }

.back-link {
  display: block;
  margin-top: 1.25rem;
  font-size: 0.82rem;
  color: var(--gc-text-muted);
  text-decoration: none;
  text-align: center;
  transition: color 0.2s;
}
.back-link:hover { color: var(--gc-gold-mid); }

.success-block { text-align: center; padding: 1rem 0; }
.success-block h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
</style>
