<script setup>
import { reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useIamStore } from '../../../application/iam.store.js'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const router   = useRouter()
const iamStore = useIamStore()

const form = reactive({ username: '', password: '', remember: false })

const rules = {
  username: { required },
  password: { required }
}

const v$ = useVuelidate(rules, form)

async function handleLogin() {
  await v$.value.$validate()
  if (v$.value.$error) return

  const ok = await iamStore.login(form.username, form.password)
  if (!ok) return

  const role = iamStore.currentUser?.role
  if (role === 'mining')        router.push({ name: 'fleet-dashboard' })
  else if (role === 'jewelry')  router.push({ name: 'jewelry-dashboard' })
  else                          router.push({ name: 'consumer-collection' })
}
</script>

<template>
  <div class="auth-layout">
    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="auth-lang-row">
          <LanguageSwitcher />
        </div>
        <h1>LOG IN</h1>

        <div v-if="iamStore.errors.length" class="gc-alert gc-alert-danger">
          {{ $t('auth.invalidCredentials') }}
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="gc-field">
            <pv-float-label>
              <pv-input-text
                id="login-username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                :invalid="v$.username.$error"
                :aria-invalid="v$.username.$error"
                aria-describedby="login-username-error"
                fluid
              />
              <label for="login-username">{{ $t('auth.username') }}</label>
            </pv-float-label>
            <span v-if="v$.username.$error" id="login-username-error" class="gc-error-msg" role="alert">
              {{ $t('auth.fieldRequired') }}
            </span>
          </div>

          <div class="gc-field">
            <pv-float-label>
              <pv-password
                id="login-password"
                v-model="form.password"
                :feedback="false"
                toggle-mask
                autocomplete="current-password"
                :invalid="v$.password.$error"
                :aria-invalid="v$.password.$error"
                aria-describedby="login-password-error"
                fluid
              />
              <label for="login-password">{{ $t('auth.password') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="login-password-error" class="gc-error-msg" role="alert">{{ $t('auth.passwordRequired') }}</span>
          </div>

          <div class="login-row">
            <RouterLink to="/auth/forgot" class="forgot-link">{{ $t('auth.forgotPassword') }}</RouterLink>
            <div class="flex align-items-center gap-2">
              <pv-checkbox v-model="form.remember" input-id="remember-me" :binary="true" />
              <label for="remember-me" style="color: var(--gc-text-muted); font-size: 0.82rem; cursor: pointer">
                {{ $t('auth.rememberMe') }}
              </label>
            </div>
          </div>

          <pv-button
            type="submit"
            :label="$t('auth.login')"
            :loading="iamStore.loading"
            class="w-full"
            style="margin-top:1.5rem"
          />
        </form>

        <p class="register-link">
          {{ $t('auth.noAccount') }}
          <RouterLink to="/auth/register" class="text-link">{{ $t('auth.registerLink') }}</RouterLink>
        </p>
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

<style scoped>
.auth-lang-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}

.forgot-link {
  color: var(--gc-text-muted);
  text-decoration: none;
  font-size: 0.8rem;
}

.forgot-link:hover { color: var(--gc-dark-3); }

.brand-logo {
  max-width: 260px;
  margin-bottom: 1rem;
}

.brand-text-block { text-align: center; }

.brand-name {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--gc-gold-mid);
  letter-spacing: 0.12em;
}

.brand-sub {
  font-size: 1rem;
  color: var(--gc-text-secondary);
  letter-spacing: 0.08em;
}

.brand-tagline {
  font-size: 0.7rem;
  color: var(--gc-text-muted);
  letter-spacing: 0.15em;
  margin-top: 0.25rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.82rem;
  color: var(--gc-text-muted);
}

.text-link {
  color: var(--gc-dark-3);
  font-weight: 600;
  text-decoration: none;
}

.text-link:hover { text-decoration: underline; }
</style>
