<script setup>
import { ref, computed, watch } from 'vue'
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

// Inventory validation state
const inventoryStatus = ref(null) // null | 'checking' | 'found' | 'not-found'
let debounceTimer = null

watch(() => form.value.traceabilityCode, (val) => {
  clearTimeout(debounceTimer)
  inventoryStatus.value = null
  if (!CODE_PATTERN.test(val.trim())) return
  inventoryStatus.value = 'checking'
  debounceTimer = setTimeout(async () => {
    const item = await consumerStore.lookupInventoryItem(val.trim().toUpperCase())
    inventoryStatus.value = item ? 'found' : 'not-found'
  }, 500)
})

const codeInvalid       = computed(() => submitted.value && !CODE_PATTERN.test(form.value.traceabilityCode.trim()))
const codeNotInInventory = computed(() => submitted.value && inventoryStatus.value === 'not-found')
const nameInvalid       = computed(() => submitted.value && form.value.name.trim().length < 3)

async function handleLink() {
  submitted.value = true
  if (codeInvalid.value || nameInvalid.value) return
  if (inventoryStatus.value === 'checking') return
  if (inventoryStatus.value !== 'found') return

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
        <pv-input-icon
          :class="inventoryStatus === 'checking' ? 'pi pi-spin pi-spinner'
                : inventoryStatus === 'found'    ? 'pi pi-check-circle icon-found'
                : inventoryStatus === 'not-found'? 'pi pi-times-circle icon-notfound'
                : 'pi pi-qrcode'"
        />
        <pv-input-text
          id="trace-code"
          v-model="form.traceabilityCode"
          :placeholder="$t('consumer.codePlaceholder')"
          :invalid="codeInvalid || codeNotInInventory"
          fluid
        />
      </pv-icon-field>
      <span v-if="codeInvalid" class="gc-error-msg">{{ $t('consumer.codeInvalid') }}</span>
      <span v-else-if="codeNotInInventory" class="gc-error-msg">{{ $t('consumer.codeNotInInventory') }}</span>
      <span v-else-if="inventoryStatus === 'checking'" class="status-msg status-checking">
        <i class="pi pi-spin pi-spinner" /> {{ $t('consumer.codeChecking') }}
      </span>
      <span v-else-if="inventoryStatus === 'found'" class="status-msg status-found">
        <i class="pi pi-check-circle" /> {{ $t('consumer.codeFoundInInventory') }}
      </span>
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
        :loading="consumerStore.loading || inventoryStatus === 'checking'"
        :disabled="inventoryStatus === 'not-found' || inventoryStatus === 'checking'"
        @click="handleLink"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.form-field { margin-bottom: 1rem; }
.form-field label { display: block; font-size: 0.82rem; color: var(--gc-text-secondary); margin-bottom: 0.4rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.status-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  margin-top: 0.3rem;
}

.status-checking { color: var(--gc-text-muted); }
.status-found    { color: #4ade80; }

.icon-found    { color: #4ade80 !important; }
.icon-notfound { color: var(--gc-danger) !important; }
</style>
