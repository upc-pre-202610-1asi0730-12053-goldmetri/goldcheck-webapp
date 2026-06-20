<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const iamStore = useIamStore()

const email     = ref('')
const submitted = ref(false)
const sent      = ref(false)
const emailErr  = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubmit() {
  submitted.value = true
  emailErr.value  = ''

  if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) {
    emailErr.value = t('auth.emailInvalid')
    return
  }

  sent.value = true
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-lang-row">
        <LanguageSwitcher />
      </div>

      <div v-if="sent" class="success-block">
        <i class="pi pi-envelope" style="font-size:2rem;color:var(--gc-gold-mid);display:block;margin-bottom:0.75rem" />
        <h2>{{ $t('auth.resetEmailSentTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetEmailSentDesc') }}</p>
        <RouterLink to="/auth/login" class="gc-btn-link" style="margin-top:1.5rem;display:inline-block">
          ← {{ $t('auth.backToLogin') }}
        </RouterLink>
      </div>

      <template v-else>
        <h1>{{ $t('auth.forgotPasswordTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.forgotPasswordDesc') }}</p>

        <form @submit.prevent="handleSubmit" novalidate>
          <pv-float-label variant="on" class="auth-field">
            <pv-input-text
              id="fp-email"
              v-model="email"
              type="email"
              autocomplete="email"
              :invalid="!!emailErr"
              fluid
            />
            <label for="fp-email">{{ $t('auth.email') }}</label>
          </pv-float-label>
          <span v-if="emailErr" class="gc-error-msg">{{ emailErr }}</span>

          <pv-button
            type="submit"
            :label="$t('auth.sendResetLink')"
            icon="pi pi-send"
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

.auth-field { width: 100%; margin-top: 0.5rem; }

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

.gc-btn-link {
  color: var(--gc-gold-mid);
  font-size: 0.82rem;
  text-decoration: none;
}
.gc-btn-link:hover { text-decoration: underline; }
</style>
