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
          <p style="font-size:0.78rem;color:var(--gc-text-muted);margin-bottom:1rem">
            Ej: <span style="color:var(--gc-gold-mid);font-family:monospace">QR-GJ-10021</span>
          </p>
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
            <i class="pi pi-times" /> Cancelar
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
          <p class="qr-label">{{ result.traceabilityCode || code }}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;width:100%">
          <div class="trace-row"><span>{{ $t('consumer.fieldName') }}</span><strong>{{ result.name }}</strong></div>
          <div class="trace-row"><span>{{ $t('consumer.fieldType') }}</span><strong>{{ result.type }}</strong></div>
          <div class="trace-row"><span>{{ $t('consumer.fieldPurity') }}</span><strong>{{ result.purity }}</strong></div>
          <div class="trace-row"><span>{{ $t('consumer.fieldWeight') }}</span><strong>{{ result.weight }}g</strong></div>
          <div class="trace-row" v-if="result.batchRef || result.materialOrigin">
            <span>{{ $t('consumer.originBatch') }}</span>
            <strong style="color:var(--gc-gold-mid)">{{ result.batchRef || result.materialOrigin }}</strong>
          </div>
          <div class="trace-row">
            <span>{{ $t('consumer.fieldStatus') }}</span>
            <span class="gc-status gc-status-done">{{ result.status || $t('consumer.certifiedDefault') }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useConsumerStore } from '../../../application/consumer.store.js'

const store       = useConsumerStore()
const code        = ref('')
const result      = ref(null)
const searched    = ref(false)
const mode        = ref('manual')
const cameraState = ref('idle') // idle | requesting | scanning | denied | detected

let scanner = null

async function verify() {
  if (!code.value.trim()) return
  result.value   = null
  searched.value = false
  const found = await store.verifyPiece(code.value.trim())
  result.value   = found
  searched.value = true
}

function switchMode(m) {
  if (mode.value === 'camera' && cameraState.value === 'scanning') stopCamera()
  mode.value = m
  result.value   = null
  searched.value = false
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
</style>
