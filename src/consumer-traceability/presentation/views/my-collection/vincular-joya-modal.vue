<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useIamStore } from '../../../../iam/application/iam.store.js'

const { t } = useI18n()
const emit = defineEmits(['close', 'linked'])
const consumerStore = useConsumerStore()
const iamStore = useIamStore()
const submitted = ref(false)

const CODE_PATTERN = /^QR-[A-Z]{2}-\d{4,6}$/i

const typeOptions = computed(() => [
  { value: 'Anillo',   label: t('jewelry.typeRing') },
  { value: 'Collar',   label: t('jewelry.typeNecklace') },
  { value: 'Pulsera',  label: t('jewelry.typeBracelet') },
  { value: 'Arete',    label: t('jewelry.typeEarring') },
  { value: 'Colgante', label: t('jewelry.typePendant') },
])

const form = ref({ traceabilityCode: '', name: '', type: '', purity: '' })

const codeInvalid  = computed(() => submitted.value && !CODE_PATTERN.test(form.value.traceabilityCode.trim()))
const nameInvalid  = computed(() => submitted.value && form.value.name.trim().length < 3)

async function handleLink() {
  submitted.value = true
  if (codeInvalid.value || nameInvalid.value) return
  const piece = await consumerStore.linkPiece({
    ...form.value,
    traceabilityCode: form.value.traceabilityCode.trim().toUpperCase(),
    name: form.value.name.trim(),
    ownerId: iamStore.currentUser?.id || null
  })
  if (piece) emit('linked', piece)
}
</script>

<template>
  <pv-dialog
    :visible="true"
    @update:visible="v => !v && $emit('close')"
    :modal="true"
    :closable="true"
    :style="{ width: '460px' }"
  >
    <template #header>
      <span>
        <i class="pi pi-link" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('consumer.linkJewelry') }}
        <small style="display:block;font-size:0.78rem;color:var(--gc-text-muted);font-weight:400">
          {{ $t('consumer.linkSubtitle') }}
        </small>
      </span>
    </template>

    <div class="form-field">
      <label for="trace-code">{{ $t('consumer.traceabilityCode') }}</label>
      <pv-icon-field>
        <pv-input-icon class="pi pi-qrcode" />
        <pv-input-text
          id="trace-code"
          v-model="form.traceabilityCode"
          :placeholder="$t('consumer.codePlaceholder')"
          :invalid="codeInvalid"
          fluid
        />
      </pv-icon-field>
      <span v-if="codeInvalid" class="gc-error-msg">{{ $t('consumer.codeInvalid') }}</span>
    </div>

    <div class="form-field">
      <label for="purchase-name">{{ $t('consumer.purchaseName') }}</label>
      <pv-input-text
        id="purchase-name"
        v-model="form.name"
        :placeholder="$t('consumer.purchaseNamePh')"
        :invalid="nameInvalid"
        fluid
      />
      <span v-if="nameInvalid" class="gc-error-msg">{{ $t('consumer.nameMinLength') }}</span>
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="piece-type">{{ $t('consumer.pieceType') }}</label>
        <pv-select
          id="piece-type"
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('consumer.selectType')"
          fluid
        />
      </div>
      <div class="form-field">
        <label for="piece-purity">{{ $t('consumer.purity') }}</label>
        <pv-input-text id="piece-purity" v-model="form.purity" placeholder="Ej: 18K" fluid />
      </div>
    </div>

    <div v-if="consumerStore.errors.length" class="gc-alert gc-alert-danger" style="margin-top:0.5rem">
      {{ $t('consumer.linkError') }}
    </div>

    <template #footer>
      <pv-button :label="$t('mineral.cancel')" severity="secondary" outlined @click="$emit('close')" />
      <pv-button
        :label="$t('consumer.linkBtn')"
        icon="pi pi-link"
        :loading="consumerStore.loading"
        @click="handleLink"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.form-field { margin-bottom: 1rem; }
.form-field label { display: block; font-size: 0.82rem; color: var(--gc-text-secondary); margin-bottom: 0.4rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
