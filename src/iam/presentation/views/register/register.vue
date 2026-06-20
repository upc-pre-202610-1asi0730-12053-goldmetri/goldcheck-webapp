<script setup>
import { reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, maxLength, helpers } from '@vuelidate/validators'

const phonePattern = helpers.withMessage(
  () => '',
  helpers.regex(/^\d{7,15}$/)
)
import LanguageSwitcher from '../../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()

const segmentOptions = computed(() => [
  { label: t('auth.consumer'), value: 'consumer' },
  { label: t('auth.jewelry'),  value: 'jewelry'  },
  { label: t('auth.mining'),   value: 'mining'   }
])

const router   = useRouter()
const iamStore = useIamStore()

const form = reactive({
  email: '', username: '', password: '', phoneNumber: '', segment: ''
})

const rules = {
  email:       { required, email },
  username:    { required },
  password:    { required },
  segment:     { required },
  phoneNumber: { phonePattern }
}

function onlyDigits(e) {
  if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
  }
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

  router.push({ name: 'plan-selection' })
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
        <h1>{{ $t('auth.createAccount') }}</h1>

        <div v-if="iamStore.errors.length" class="gc-alert gc-alert-danger">
          {{ $t('auth.registerError') }}
        </div>

        <pv-button
          :label="$t('auth.continueGoogle')"
          severity="secondary"
          outlined
          class="w-full"
          type="button"
        >
          <template #icon>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" style="margin-right:0.5rem" />
          </template>
        </pv-button>

        <div class="gc-divider">{{ $t('auth.or') }}</div>

        <form @submit.prevent="handleRegister" novalidate>
          <div class="gc-field">
            <pv-float-label>
              <pv-input-text
                id="reg-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                :invalid="v$.email.$error"
                :aria-invalid="v$.email.$error"
                aria-describedby="reg-email-error"
                fluid
              />
              <label for="reg-email">{{ $t('auth.email') }}</label>
            </pv-float-label>
            <span v-if="v$.email.$error" id="reg-email-error" class="gc-error-msg" role="alert">{{ $t('auth.emailInvalid') }}</span>
          </div>

          <div class="gc-field">
            <pv-float-label>
              <pv-input-text
                id="reg-username"
                v-model="form.username"
                autocomplete="username"
                :invalid="v$.username.$error"
                :aria-invalid="v$.username.$error"
                aria-describedby="reg-username-error"
                fluid
              />
              <label for="reg-username">{{ $t('auth.username') }}</label>
            </pv-float-label>
            <span v-if="v$.username.$error" id="reg-username-error" class="gc-error-msg" role="alert">{{ $t('auth.fieldRequired') }}</span>
          </div>

          <div class="gc-field">
            <pv-float-label>
              <pv-password
                id="reg-password"
                v-model="form.password"
                toggle-mask
                autocomplete="new-password"
                :invalid="v$.password.$error"
                :aria-invalid="v$.password.$error"
                aria-describedby="reg-password-error"
                fluid
              />
              <label for="reg-password">{{ $t('auth.password') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="reg-password-error" class="gc-error-msg" role="alert">{{ $t('auth.passwordRequired') }}</span>
          </div>

          <div class="gc-field">
            <pv-float-label>
              <pv-input-text
                id="reg-phone"
                v-model="form.phoneNumber"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                :invalid="v$.phoneNumber.$error"
                :aria-invalid="v$.phoneNumber.$error"
                aria-describedby="reg-phone-error"
                @keydown="onlyDigits"
                fluid
              />
              <label for="reg-phone">{{ $t('auth.phoneNumber') }}</label>
            </pv-float-label>
            <span v-if="v$.phoneNumber.$error" id="reg-phone-error" class="gc-error-msg" role="alert">
              {{ $t('auth.phoneInvalid') }}
            </span>
          </div>

          <!-- Segmento: US06 (Minerías) / US07 (Joyerías) -->
          <div class="gc-field">
            <p style="font-size:0.82rem;font-weight:600;color:#666;margin-bottom:0.4rem">{{ $t('auth.segment') }}</p>
            <pv-select-button
              v-model="form.segment"
              :options="segmentOptions"
              option-label="label"
              option-value="value"
              :invalid="v$.segment.$error"
              aria-label="Segment"
            />
            <span v-if="v$.segment.$error" class="gc-error-msg">{{ $t('auth.segmentRequired') }}</span>
          </div>

          <p style="font-size:0.8rem;color:var(--gc-text-muted);margin-bottom:0.75rem">
            {{ $t('auth.alreadyHaveAccount') }}
            <RouterLink to="/auth/login" class="text-link">{{ $t('auth.login') }}</RouterLink>
          </p>

          <pv-button
            type="submit"
            :label="$t('auth.signUp')"
            :loading="iamStore.loading"
            class="w-full"
          />
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

<style scoped>
.auth-lang-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.brand-logo { max-width: 260px; margin-bottom: 1rem; }
.brand-text-block { text-align: center; }
.brand-name { font-size: 1.6rem; font-weight: 900; color: var(--gc-gold-mid); letter-spacing: 0.12em; }
.brand-sub  { font-size: 1rem; color: var(--gc-text-secondary); letter-spacing: 0.08em; }
.brand-tagline { font-size: 0.7rem; color: var(--gc-text-muted); letter-spacing: 0.15em; margin-top: 0.25rem; }
.text-link { color: var(--gc-dark-3); font-weight: 600; text-decoration: none; }
.text-link:hover { text-decoration: underline; }
</style>
