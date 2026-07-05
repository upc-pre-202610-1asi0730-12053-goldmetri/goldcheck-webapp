<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useConsumerStore } from '../../../application/consumer.store.js'
import { useI18n } from 'vue-i18n'
import { useStatusLabel } from '../../../../shared/application/status-label.js'

const { t }       = useI18n()
const { statusLabel } = useStatusLabel()
const store       = useConsumerStore()
const code        = ref('')
const result      = ref(null)
const searched    = ref(false)
const mode        = ref('manual')
const cameraState = ref('idle') // idle | requesting | scanning | denied | detected

// US34 – real traceability "life sheet" composed server-side from the other BCs.
const sheet        = ref(null)
const sheetLoading = ref(false)

let scanner = null

async function verify() {
  if (!code.value.trim()) return
  result.value   = null
  searched.value = false
  sheet.value    = null
  const found = await store.verifyPiece(code.value.trim())
  result.value   = found
  searched.value = true
}

// US34 – Scenario 1: load origin mine, mineral type, purity and seller status.
async function loadSheet() {
  const qr = result.value?.qrCode || code.value.trim()
  if (!qr) return
  sheetLoading.value = true
  sheet.value        = null
  try {
    sheet.value = await store.fetchTraceabilitySheet(qr)
  } finally {
    sheetLoading.value = false
  }
}

function switchMode(m) {
  if (mode.value === 'camera' && cameraState.value === 'scanning') stopCamera()
  mode.value = m
  result.value   = null
  searched.value = false
  sheet.value    = null
}

// US37 – shareable traceability link + WhatsApp deep link.
const copied = ref(false)
const shareUrl = computed(() => {
  const qr = result.value?.qrCode || code.value.trim()
  return `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(qr)}`
})
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    copied.value = false
  }
}
function shareWhatsApp() {
  const text = `${t('consumer.shareText')} ${shareUrl.value}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}

// US36 – report a suspicious QR code.
const showReport   = ref(false)
const reportReason = ref('')
const reportState  = ref('idle') // idle | sent | error | limited
const reporting    = ref(false)
function toggleReport() {
  showReport.value = !showReport.value
  reportState.value = 'idle'
}
async function submitReport() {
  if (reportReason.value.trim().length < 5) { reportState.value = 'error'; return }
  reporting.value = true
  const qr  = result.value?.qrCode || code.value.trim()
  const res = await store.reportIrregularity(qr, reportReason.value.trim())
  reporting.value = false
  if (res.ok) { reportState.value = 'sent'; reportReason.value = '' }
  else reportState.value = res.rateLimited ? 'limited' : 'error'
}

async function startCamera() {
  cameraState.value = 'requesting'
  result.value   = null
  searched.value = false

  try {
    // Check/request camera permission first
    await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  } catch {
    cameraState.value = 'denied'
    return
  }

  cameraState.value = 'scanning'

  // Small delay to let the DOM render the #qr-reader div
  await new Promise(r => setTimeout(r, 150))

  try {
    scanner = new Html5Qrcode('qr-reader')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
      async (decodedText) => {
        code.value = decodedText
        cameraState.value = 'detected'
        await stopCamera()
        await verify()
      },
      () => {} // ignore per-frame errors
    )
  } catch {
    cameraState.value = 'denied'
  }
}

async function stopCamera() {
  if (scanner) {
    try { await scanner.stop() } catch {}
    try { scanner.clear() } catch {}
    scanner = null
  }
  if (cameraState.value === 'scanning') cameraState.value = 'idle'
}

onUnmounted(() => stopCamera())
</script>

<template>
  <div class="gc-page">
    <div class="gc-page-header">
      <div>
        <h1 class="gc-page-title">{{ $t('consumer.verifyTitle') }}</h1>
        <p class="gc-page-subtitle">{{ $t('consumer.verifySubtitle') }}</p>
      </div>
    </div>

    <div class="gc-card verify-card">

      <!-- Mode toggle -->
      <div class="mode-tabs">
        <button :class="['mode-tab', { active: mode === 'manual' }]" @click="switchMode('manual')">
          <i class="pi pi-keyboard" /> {{ $t('consumer.modeManual') }}
        </button>
        <button :class="['mode-tab', { active: mode === 'camera' }]" @click="switchMode('camera')">
          <i class="pi pi-camera" /> {{ $t('consumer.modeCamera') }}
        </button>
      </div>

      <!-- Manual input -->
      <div v-if="mode === 'manual'" class="input-section">
        <i class="pi pi-qrcode" style="font-size:3rem;color:var(--gc-gold-mid);margin-bottom:1.5rem" />
        <div style="width:100%;max-width:360px">
          <input
            v-model="code"
            class="gc-input-dark"
            style="width:100%;margin-bottom:0.75rem"
            :placeholder="$t('consumer.codePlaceholder')"
            @keyup.enter="verify"
          />
          <button class="gc-btn gc-btn-gold" style="width:100%" :disabled="store.loading" @click="verify">
            <i v-if="store.loading" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-search" />
            {{ $t('consumer.verifyBtn') }}
          </button>
        </div>
      </div>

      <!-- Camera scanner -->
      <div v-if="mode === 'camera'" class="camera-section">
        <div v-if="cameraState === 'idle'" class="camera-idle">
          <i class="pi pi-camera" style="font-size:3rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
          <p style="color:var(--gc-text-secondary);margin-bottom:0.5rem;font-weight:600">{{ $t('consumer.scanQr') }}</p>
          <p style="color:var(--gc-text-muted);font-size:0.85rem;margin-bottom:1.5rem;max-width:300px;text-align:center">
            {{ $t('consumer.cameraHint') }}
          </p>
          <button class="gc-btn gc-btn-gold" @click="startCamera">
            <i class="pi pi-camera" /> {{ $t('consumer.activateCamera') }}
          </button>
        </div>

        <div v-if="cameraState === 'requesting'" class="camera-idle">
          <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--gc-gold-mid);margin-bottom:1rem" />
          <p style="color:var(--gc-text-muted)">{{ $t('consumer.requestingCamera') }}</p>
        </div>

        <div v-if="cameraState === 'denied'" class="camera-idle">
          <i class="pi pi-ban" style="font-size:2.5rem;color:var(--gc-danger);margin-bottom:1rem" />
          <p style="color:var(--gc-danger);font-weight:600;margin-bottom:0.5rem">{{ $t('consumer.cameraDenied') }}</p>
          <p style="color:var(--gc-text-muted);font-size:0.85rem;margin-bottom:1.25rem;max-width:300px;text-align:center">
            {{ $t('consumer.cameraEnableHint') }}
          </p>
          <button class="gc-btn gc-btn-outline" @click="cameraState = 'idle'">{{ $t('consumer.retry') }}</button>
        </div>

        <div v-if="cameraState === 'scanning'" class="scanner-wrap">
          <p style="color:var(--gc-text-muted);font-size:0.82rem;margin-bottom:0.75rem;text-align:center">
            {{ $t('consumer.pointCamera') }}
          </p>
          <div class="scanner-frame">
            <div id="qr-reader" />
            <div class="scanner-overlay">
              <div class="scanner-corner tl" />
              <div class="scanner-corner tr" />
              <div class="scanner-corner bl" />
              <div class="scanner-corner br" />
              <div class="scanner-line" />
            </div>
          </div>
          <button class="gc-btn gc-btn-outline" style="margin-top:1rem" @click="stopCamera">
            <i class="pi pi-times" /> {{ $t('common.cancel') }}
          </button>
        </div>

        <div v-if="cameraState === 'detected'" class="camera-idle">
          <i class="pi pi-check-circle" style="font-size:2.5rem;color:#4ade80;margin-bottom:0.75rem" />
          <p style="color:#4ade80;font-weight:700;margin-bottom:0.25rem">{{ $t('consumer.codeDetected') }}</p>
          <p style="font-family:monospace;color:var(--gc-gold-mid);font-size:1rem;margin-bottom:1.25rem">{{ code }}</p>
          <button class="gc-btn gc-btn-outline" @click="startCamera">{{ $t('consumer.scanAnother') }}</button>
        </div>
      </div>

      <!-- Not found -->
      <div v-if="searched && !result" style="margin-top:2rem;text-align:center">
        <i class="pi pi-times-circle" style="font-size:2rem;color:var(--gc-danger);margin-bottom:0.5rem" />
        <p style="color:var(--gc-danger);font-weight:600">{{ $t('consumer.codeNotFound') }}</p>
        <p style="color:var(--gc-text-muted);font-size:0.85rem">{{ $t('consumer.codeNotFoundHint') }}</p>
      </div>

      <!-- Result -->
      <div v-if="result" class="result-box">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem">
          <i class="pi pi-check-circle" style="font-size:1.8rem;color:#4ade80" />
          <div>
            <p style="font-weight:700;color:var(--gc-text-primary)">{{ $t('consumer.pieceVerified') }}</p>
            <p style="font-size:0.8rem;color:var(--gc-text-muted)">{{ $t('consumer.traceabilityConfirmed') }}</p>
          </div>
        </div>
        <div class="qr-box">
          <div class="qr-visual"><i class="pi pi-qrcode" style="font-size:3rem;color:var(--gc-gold-mid)" /></div>
          <p class="qr-label">{{ result.qrCode || code }}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;width:100%">
          <div class="trace-row"><span>QR Code</span><strong style="font-family:monospace;color:var(--gc-gold-mid)">{{ result.qrCode }}</strong></div>
          <div class="trace-row"><span>{{ $t('consumer.fieldStatus') }}</span><span class="gc-status gc-status-done">{{ statusLabel(result.status) }}</span></div>
          <div class="trace-row"><span>{{ $t('consumer.scans') }}</span><strong>{{ result.scanCount }}</strong></div>
          <div v-if="result.certificateId" class="trace-row">
            <span>{{ $t('jewelry.certId') }}</span>
            <strong style="color:var(--gc-gold-mid);font-family:monospace">{{ result.certificateId }}</strong>
          </div>
        </div>

        <button
          class="origin-btn"
          :disabled="sheetLoading"
          @click="loadSheet"
          style="margin-top:1.25rem;width:100%"
        >
          <i v-if="sheetLoading" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-sitemap" />
          {{ $t('trace.viewMineralOrigin') }}
        </button>

        <!-- US37 – share the traceability link -->
        <div class="share-bar">
          <span class="share-label">{{ $t('consumer.shareTitle') }}</span>
          <div class="share-actions">
            <button class="share-btn" @click="copyLink">
              <i :class="copied ? 'pi pi-check' : 'pi pi-copy'" />
              {{ copied ? $t('consumer.shareCopied') : $t('consumer.shareCopy') }}
            </button>
            <button class="share-btn wa" @click="shareWhatsApp">
              <i class="pi pi-whatsapp" /> WhatsApp
            </button>
          </div>
        </div>

        <!-- US36 – report a suspicious QR -->
        <button class="report-link" @click="toggleReport">
          <i class="pi pi-flag" /> {{ $t('consumer.reportSuspicious') }}
        </button>

        <div v-if="showReport" class="report-box">
          <template v-if="reportState !== 'sent'">
            <label class="report-label">{{ $t('consumer.reportReasonLabel') }}</label>
            <textarea
              v-model="reportReason"
              class="report-input"
              rows="3"
              :placeholder="$t('consumer.reportReasonPh')"
            />
            <p v-if="reportState === 'error'" class="report-msg error">{{ $t('consumer.reportError') }}</p>
            <p v-if="reportState === 'limited'" class="report-msg error">{{ $t('consumer.reportRateLimited') }}</p>
            <button class="gc-btn gc-btn-gold" style="width:100%" :disabled="reporting" @click="submitReport">
              <i v-if="reporting" class="pi pi-spin pi-spinner" />
              <i v-else class="pi pi-send" />
              {{ $t('consumer.reportSubmit') }}
            </button>
          </template>
          <div v-else class="report-success">
            <i class="pi pi-check-circle" />
            <p>{{ $t('consumer.reportSent') }}</p>
          </div>
        </div>
      </div>

      <!-- US34 – Scenario 2: loading skeletons prioritising text over the map -->
      <div v-if="sheetLoading" class="sheet-box">
        <p class="trace-origin-title">
          <i class="pi pi-sitemap" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('trace.traceTitle') }}
        </p>
        <div class="sk sk-row" v-for="n in 4" :key="'sk'+n" />
        <div class="sk sk-map" />
      </div>

      <!-- US34 – Scenario 1: real life sheet (origin mine, mineral type, purity) -->
      <div v-else-if="sheet" class="sheet-box">
        <p class="trace-origin-title">
          <i class="pi pi-sitemap" style="color:var(--gc-gold-mid);margin-right:0.4rem" />
          {{ $t('trace.traceTitle') }}
        </p>

        <!-- Recycled (client) gold has no mining origin -->
        <div v-if="sheet.isRecycled" class="recycled-note">
          <i class="pi pi-sync" /> {{ $t('trace.recycledOrigin') }}
        </div>

        <!-- Text data first (higher priority under poor connectivity) -->
        <div class="trace-row"><span>{{ $t('trace.originMine') }}</span>
          <strong>{{ sheet.originMine || '—' }}</strong>
        </div>
        <div class="trace-row"><span>{{ $t('trace.mineralType') }}</span>
          <strong>{{ sheet.mineralType || '—' }}</strong>
        </div>
        <div class="trace-row"><span>{{ $t('trace.purity') }}</span>
          <strong v-if="sheet.verifiedKarats">{{ sheet.verifiedKarats }}k</strong>
          <span v-else class="muted">{{ $t('trace.purityPending') }}</span>
        </div>
        <div class="trace-row" style="border:none"><span>{{ $t('trace.originBatch') }}</span>
          <strong style="font-family:monospace;color:var(--gc-gold-mid)">{{ sheet.originBatchId || '—' }}</strong>
        </div>

        <!-- Map (lower priority; only when there is a real origin mine) -->
        <div v-if="sheet.originMine" class="mini-map">
          <div class="map-grid" />
          <div class="map-pin"><i class="pi pi-map-marker" /></div>
          <div class="map-label"><i class="pi pi-map-marker" /> {{ sheet.originMine }}</div>
        </div>

        <!-- US35 – commercial section: seller name + authorized-partner badge -->
        <div class="commercial">
          <p class="commercial-title">{{ $t('trace.commercialTitle') }}</p>
          <div class="trace-row"><span>{{ $t('trace.seller') }}</span>
            <strong>{{ sheet.jewelerName || '—' }}</strong>
          </div>
          <!-- US35 Scenario 1: badge only when the membership is active -->
          <div v-if="sheet.jewelerAuthorized" class="partner-badge ok">
            <i class="pi pi-verified" /> {{ $t('trace.authorizedPartner') }}
          </div>
          <!-- US35 Scenario 2: expired/suspended membership → no badge -->
          <div v-else class="partner-badge warn">
            <i class="pi pi-exclamation-triangle" /> {{ $t('trace.unverifiedPartner') }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.verify-card { display:flex; flex-direction:column; align-items:center; padding:2rem; }

.mode-tabs { display:flex; gap:0.5rem; background:var(--gc-bg); border:1px solid var(--gc-border); border-radius:10px; padding:0.3rem; margin-bottom:2rem; }
.mode-tab {
  flex:1; padding:0.5rem 1.25rem; border:none; border-radius:8px; cursor:pointer;
  font-size:0.85rem; font-weight:500; color:var(--gc-text-muted);
  background:transparent; transition:all 0.2s; display:flex; align-items:center; gap:0.4rem; justify-content:center;
}
.mode-tab.active { background:var(--gc-surface); color:var(--gc-gold-mid); box-shadow:0 1px 4px rgba(0,0,0,0.3); }
.mode-tab i { font-size:0.85rem; }

.input-section { display:flex; flex-direction:column; align-items:center; width:100%; }

.camera-section { width:100%; max-width:420px; }
.camera-idle { display:flex; flex-direction:column; align-items:center; padding:2rem 1rem; text-align:center; }

.scanner-wrap { display:flex; flex-direction:column; align-items:center; }
.scanner-frame { position:relative; width:300px; height:300px; border-radius:12px; overflow:hidden; background:#000; }

#qr-reader { width:300px !important; height:300px !important; }
/* Hide html5-qrcode default UI */
:deep(#qr-reader__header_message),
:deep(#qr-reader__status_span),
:deep(#qr-reader__dashboard),
:deep(#qr-reader video) { width:300px !important; height:300px !important; object-fit:cover; }
:deep(#qr-reader__scan_region) { border:none !important; }
:deep(img[alt="Info icon"]) { display:none; }

.scanner-overlay { position:absolute; inset:0; pointer-events:none; }
.scanner-corner { position:absolute; width:24px; height:24px; border-color:var(--gc-gold-mid); border-style:solid; }
.scanner-corner.tl { top:20px; left:20px; border-width:3px 0 0 3px; border-radius:4px 0 0 0; }
.scanner-corner.tr { top:20px; right:20px; border-width:3px 3px 0 0; border-radius:0 4px 0 0; }
.scanner-corner.bl { bottom:20px; left:20px; border-width:0 0 3px 3px; border-radius:0 0 0 4px; }
.scanner-corner.br { bottom:20px; right:20px; border-width:0 3px 3px 0; border-radius:0 0 4px 0; }
.scanner-line {
  position:absolute; left:20px; right:20px; height:2px;
  background:linear-gradient(90deg, transparent, var(--gc-gold-mid), transparent);
  top:50%; animation:scan 2s linear infinite;
}
@keyframes scan { 0%,100% { top:20px } 50% { top:calc(100% - 20px) } }

.result-box { width:100%; max-width:420px; margin-top:2rem; background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.2); border-radius:12px; padding:1.5rem; }
.qr-box { display:flex; flex-direction:column; align-items:center; padding:1rem; background:rgba(178,148,78,0.06); border-radius:10px; border:1px solid rgba(178,148,78,0.2); }
.qr-visual { padding:0.75rem; background:white; border-radius:6px; margin-bottom:0.5rem; }
.qr-label { font-family:monospace; font-size:0.95rem; font-weight:700; color:var(--gc-gold-mid); }
.trace-row { display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:0.3rem 0; border-bottom:1px solid rgba(255,255,255,0.06); }
.trace-row span:first-child { color:var(--gc-text-muted); }
.gc-status      { font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:20px; font-weight:500; }
.gc-status-done { background:rgba(74,222,128,0.15); color:#4ade80; }

.origin-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.65rem 1.25rem; border-radius: var(--gc-radius);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  background: transparent; border: 1.5px solid rgba(178,148,78,0.4);
  color: var(--gc-gold-mid); transition: border-color 0.2s, background 0.2s;
}
.origin-btn:hover { border-color: var(--gc-gold-mid); background: rgba(178,148,78,0.08); }
.origin-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.trace-origin-box {
  width: 100%; max-width: 420px; margin-top: 1rem;
  background: var(--gc-dark-card); border: 1px solid var(--gc-border);
  border-radius: 12px; padding: 1.5rem;
}

.trace-origin-title { font-size: 0.9rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.25rem; }

.origin-timeline { display: flex; flex-direction: column; margin-top: 0; }

.origin-item { display: flex; gap: 0.85rem; }

.origin-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }

.origin-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.78rem; flex-shrink: 0;
}

.origin-line { width: 2px; flex: 1; background: var(--gc-border); min-height: 16px; margin: 3px 0; }

.origin-content { padding-bottom: 1.25rem; flex: 1; }

.origin-ev-title { font-size: 0.85rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.25rem; }

.origin-meta {
  font-size: 0.75rem; color: var(--gc-text-secondary);
  display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.1rem;
}
.origin-meta i { font-size: 0.68rem; color: var(--gc-text-muted); }

.origin-tx { font-size: 0.68rem; font-family: monospace; color: var(--gc-gold-mid); margin-top: 0.2rem; }

/* US34 – life sheet */
.sheet-box {
  width: 100%; max-width: 420px; margin-top: 1rem;
  background: var(--gc-dark-card); border: 1px solid var(--gc-border);
  border-radius: 12px; padding: 1.5rem;
}
.muted { color: var(--gc-text-muted); font-size: 0.8rem; }
.recycled-note {
  display: inline-flex; align-items: center; gap: 0.4rem; margin: 0.25rem 0 0.75rem;
  font-size: 0.75rem; font-weight: 700; color: #2dd4bf;
  background: rgba(45,212,191,.12); padding: 0.25rem 0.6rem; border-radius: 20px;
}

/* US34 Scenario 2 – skeletons (text rows first, map last) */
.sk { border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.05) 63%); background-size: 400% 100%; animation: shimmer 1.3s ease-in-out infinite; }
.sk-row { height: 18px; margin: 0.6rem 0; }
.sk-row:nth-child(2) { width: 90%; } .sk-row:nth-child(3) { width: 75%; } .sk-row:nth-child(4) { width: 85%; }
.sk-map { height: 120px; margin-top: 1rem; }
@keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }

/* US34 – location-based mini map (no coordinates available, marker by mine name) */
.mini-map {
  position: relative; height: 130px; margin-top: 1rem; border-radius: 10px; overflow: hidden;
  background: radial-gradient(circle at 50% 40%, rgba(178,148,78,0.18), rgba(26,26,46,0.9));
  border: 1px solid var(--gc-border);
}
.map-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 26px 26px; }
.map-pin { position: absolute; top: 34%; left: 50%; transform: translate(-50%, -50%); color: var(--gc-gold-mid); font-size: 1.6rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); animation: pin-drop 0.4s ease; }
@keyframes pin-drop { 0% { transform: translate(-50%, -140%); opacity: 0 } 100% { transform: translate(-50%, -50%); opacity: 1 } }
.map-label { position: absolute; bottom: 8px; left: 8px; right: 8px; display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 600; color: var(--gc-text-primary); background: rgba(0,0,0,0.45); padding: 0.3rem 0.5rem; border-radius: 6px; }
.map-label i { color: var(--gc-gold-mid); }

/* US35 – commercial section */
.commercial { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--gc-border); }
.commercial-title { font-size: 0.8rem; font-weight: 700; color: var(--gc-text-primary); margin-bottom: 0.5rem; }
.partner-badge { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.75rem; font-size: 0.78rem; font-weight: 700; padding: 0.35rem 0.7rem; border-radius: 20px; }
.partner-badge.ok { color: #4ade80; background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.35); }
.partner-badge.warn { color: #eab308; background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.3); }

/* US37 – share bar */
.share-bar { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); }
.share-label { display: block; font-size: 0.75rem; color: var(--gc-text-muted); margin-bottom: 0.5rem; }
.share-actions { display: flex; gap: 0.5rem; }
.share-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  background: transparent; border: 1px solid var(--gc-border); color: var(--gc-text-secondary);
}
.share-btn:hover { border-color: var(--gc-gold-mid); color: var(--gc-text-primary); }
.share-btn.wa { color: #25d366; border-color: rgba(37,211,102,0.4); }
.share-btn.wa:hover { border-color: #25d366; background: rgba(37,211,102,0.08); }

/* US36 – report */
.report-link {
  display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1rem;
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 0.8rem; color: var(--gc-text-muted);
}
.report-link:hover { color: var(--gc-danger); }
.report-box { margin-top: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--gc-border); border-radius: 10px; padding: 1rem; }
.report-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gc-text-muted); margin-bottom: 0.4rem; }
.report-input { width: 100%; box-sizing: border-box; padding: 0.6rem; background: var(--gc-dark-2); border: 1px solid var(--gc-border); border-radius: 8px; color: var(--gc-text-primary); font-size: 0.85rem; font-family: inherit; resize: vertical; margin-bottom: 0.6rem; }
.report-input:focus { outline: none; border-color: var(--gc-gold-mid); }
.report-msg { font-size: 0.78rem; margin: 0 0 0.6rem; }
.report-msg.error { color: var(--gc-danger); }
.report-success { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0.5rem; color: #4ade80; }
.report-success i { font-size: 1.6rem; }
.report-success p { font-size: 0.85rem; font-weight: 600; margin: 0; }
</style>
