<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { jewelryApi } from '../../../infrastructure/jewelry-api.js'

const { t }  = useI18n()
const route  = useRoute()

const batchCode  = ref('')
const batch      = ref(null)
const searched   = ref(false)
const loading    = ref(false)
const showTrace  = ref(false)

async function lookupBatch() {
  if (!batchCode.value.trim()) return
  loading.value   = true
  batch.value     = null
  searched.value  = false
  showTrace.value = false
  try {
    const res  = await jewelryApi.getBatchByCode(batchCode.value.trim())
    const list = res.data || []
    batch.value = list[0] || null
  } catch {
    batch.value = null
  } finally {
    loading.value  = false
    searched.value = true
  }
}

const traceEvents = computed(() => {
  if (!batch.value) return []
  const b    = batch.value
  const base = new Date(b.createdAt)
  const seed = b.batchCode.replace(/\D/g, '').slice(-4).padStart(4, '0')

  const events = [
    {
      icon: 'pi-map-marker', color: '#3b82f6',
      title: t('trace.eventExtraction'),
      actor: b.depositName,
      date:  base,
      tx:    `0x${seed}A1B2`
    },
    {
      icon: 'pi-truck', color: '#f59e0b',
      title: t('trace.eventTransport'),
      actor: b.vehicleName || 'Transport Vehicle',
      date:  new Date(base.getTime() + 2 * 3600000),
      tx:    `0x${seed}C3D4`
    },
    {
      icon: 'pi-map', color: '#eab308',
      title: t('trace.eventLocation'),
      actor: 'GPS Auto — Ruta Sur',
      date:  new Date(base.getTime() + 8 * 3600000),
      tx:    `0x${seed}E5F6`
    }
  ]

  if (b.status === 'Completado' || b.finalWeight) {
    events.push({
      icon: 'pi-building', color: '#4ade80',
      title: t('trace.eventReceived'),
      actor: 'Joyería Elite S.A.C.',
      date:  new Date(base.getTime() + 24 * 3600000),
      tx:    `0x${seed}G7H8`
    })
  }

  return events
})

function statusBadge(s) {
  const map = { 'Completado': 'gc-badge-success', 'En Tránsito': 'gc-badge-gold', 'Cargando': 'gc-badge-warning', 'Alerta': 'gc-badge-danger' }
  return map[s] || 'gc-badge-neutral'
}

function statusLabel(s) {
  const map = {
    'Completado':  t('trace.statusCertified'),
    'En Tránsito': t('trace.statusInTransit'),
    'Cargando':    t('trace.statusLoading'),
    'Alerta':      t('trace.statusAlert')
  }
  return map[s] || s
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  if (route.query.batch) {
    batchCode.value = String(route.query.batch)
    lookupBatch()
  }
})
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('trace.pageTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('trace.pageSubtitle') }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="gc-card search-card">
      <div class="search-row">
        <input
          v-model="batchCode"
          class="gc-input-dark"
          style="flex:1"
          placeholder="E.g.: 6"
          @keyup.enter="lookupBatch"
        />
        <button class="gc-btn gc-btn-gold" :disabled="loading || !batchCode.trim()" @click="lookupBatch">
          <i v-if="loading" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-check" />
          {{ $t('trace.lookupBtn') }}
        </button>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="searched && !batch" class="gc-alert gc-alert-danger" style="margin-top:1rem">
      <i class="pi pi-times-circle" style="margin-right:0.5rem" />
      {{ $t('trace.notFound') }} — {{ $t('trace.notFoundHint') }}
    </div>

    <!-- Certified stock banner -->
    <div v-if="batch && batch.status === 'Completado'" class="gc-alert gc-alert-success" style="margin-top:1rem">
      <div style="display:flex;align-items:flex-start;gap:0.6rem">
        <i class="pi pi-check-circle" style="font-size:1.2rem;margin-top:0.1rem;flex-shrink:0" />
        <div>
          <p style="font-weight:700;margin-bottom:0.15rem">{{ $t('trace.certifiedBanner') }}</p>
          <p style="font-size:0.82rem;opacity:0.85">{{ $t('trace.certifiedBannerDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Reception Details -->
    <div v-if="batch" class="gc-card" style="margin-top:1rem">
      <p class="gc-section-title">{{ $t('trace.receptionDetails') }}</p>

      <div class="detail-row">
        <span>{{ $t('trace.lotId') }}</span>
        <strong style="font-family:monospace;color:var(--gc-gold-mid)">{{ batch.batchCode }}</strong>
      </div>
      <div class="detail-row">
        <span>{{ $t('trace.status') }}</span>
        <span class="gc-badge" :class="statusBadge(batch.status)">{{ statusLabel(batch.status) }}</span>
      </div>
      <div class="detail-row">
        <span>{{ $t('trace.source') }}</span>
        <strong>{{ batch.status === 'Completado' ? $t('trace.opalTrace') : batch.depositName }}</strong>
      </div>
      <div class="detail-row">
        <span>{{ $t('trace.mineralType') }}</span>
        <strong>{{ batch.mineralType }}</strong>
      </div>
      <div class="detail-row">
        <span>{{ $t('trace.initialWeight') }}</span>
        <strong>{{ batch.initialWeight }} t</strong>
      </div>
      <div v-if="batch.finalWeight" class="detail-row">
        <span>{{ $t('trace.finalWeight') }}</span>
        <strong>{{ batch.finalWeight }} t</strong>
      </div>
      <div class="detail-row">
        <span>{{ $t('trace.blocked') }}</span>
        <span class="gc-badge gc-badge-success">{{ $t('trace.no') }}</span>
      </div>
      <div class="detail-row" style="border-bottom:none">
        <span>{{ $t('trace.receptionDate') }}</span>
        <strong>{{ formatDate(batch.createdAt) }}</strong>
      </div>

      <button class="gc-btn gc-btn-outline trace-toggle-btn" @click="showTrace = !showTrace">
        <i :class="showTrace ? 'pi pi-eye-slash' : 'pi pi-sitemap'" />
        {{ showTrace ? $t('trace.hideTrace') : $t('trace.viewTrace') }}
      </button>
    </div>

    <!-- Traceability Timeline -->
    <div v-if="batch && showTrace" class="gc-card" style="margin-top:1rem">
      <p class="gc-section-title">
        <i class="pi pi-sitemap" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
        {{ $t('trace.traceTitle') }}
      </p>
      <p style="font-size:0.8rem;color:var(--gc-text-muted);margin-bottom:1.75rem">
        {{ $t('trace.traceSubtitle') }}
      </p>

      <div class="timeline">
        <div v-for="(ev, idx) in traceEvents" :key="idx" class="timeline-item">
          <div class="timeline-left">
            <div class="timeline-dot" :style="{ background: ev.color }">
              <i :class="'pi ' + ev.icon" />
            </div>
            <div v-if="idx < traceEvents.length - 1" class="timeline-line" />
          </div>
          <div class="timeline-content">
            <p class="timeline-title">{{ ev.title }}</p>
            <p class="timeline-meta">
              <i class="pi pi-user" />
              {{ $t('trace.actor') }}: <strong>{{ ev.actor }}</strong>
            </p>
            <p class="timeline-meta">
              <i class="pi pi-calendar" />
              {{ formatDate(ev.date) }}
            </p>
            <p class="timeline-tx">TX: {{ ev.tx }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-card { padding: 1.25rem; }
.search-row  { display: flex; gap: 0.75rem; align-items: center; max-width: 640px; }

.gc-section-title { font-size: 0.9rem; font-weight: 600; color: var(--gc-text-primary); margin-bottom: 1rem; }

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--gc-border);
}
.detail-row span:first-child { color: var(--gc-text-muted); }

.trace-toggle-btn { margin-top: 1.25rem; border-color: rgba(255,255,255,0.2); }

.timeline { display: flex; flex-direction: column; }

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--gc-border);
  min-height: 20px;
  margin: 4px 0;
}

.timeline-content {
  padding-bottom: 1.5rem;
  flex: 1;
}

.timeline-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin-bottom: 0.3rem;
}

.timeline-meta {
  font-size: 0.8rem;
  color: var(--gc-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.timeline-meta i { font-size: 0.72rem; color: var(--gc-text-muted); }

.timeline-tx {
  font-size: 0.72rem;
  font-family: monospace;
  color: var(--gc-gold-mid);
  margin-top: 0.25rem;
}
</style>
