<template>
  <div class="legal-page">
    <div class="legal-card">
      <RouterLink to="/auth/login" class="back-link">
        <i class="pi pi-arrow-left" aria-hidden="true" /> GoldCheck
      </RouterLink>
      <h1>{{ $t('footer.terms') }}</h1>
      <p class="legal-updated">Last updated: January 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using GoldCheck (GoldMetrics), you accept and agree to be bound by the terms and provisions of this agreement.</p>
      </section>
      <section>
        <h2>2. Use of Service</h2>
        <p>GoldCheck provides traceability, certification, and fleet management tools for the mining and jewelry sectors. Use of the platform is subject to registration and the applicable subscription plan.</p>
      </section>
      <section>
        <h2>3. Data and Privacy</h2>
        <p>All data processed through GoldCheck is handled in accordance with our Privacy Policy. Users are responsible for the accuracy of the data they enter into the system.</p>
      </section>
      <section>
        <h2>4. Intellectual Property</h2>
        <p>All content, trademarks, and technology within GoldCheck are the exclusive property of GoldMetrics and are protected by applicable laws.</p>
      </section>
      <section>
        <h2>5. Limitation of Liability</h2>
        <p>GoldMetrics shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the service.</p>
      </section>
      <section>
        <h2>6. Contact</h2>
        <p>For questions regarding these terms, contact us at <a href="mailto:legal@goldmetrics.com">legal@goldmetrics.com</a>.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--gc-dark-3);
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;
}
.legal-card {
  max-width: 760px;
  width: 100%;
  background: var(--gc-dark-card);
  border: 1px solid var(--gc-border);
  border-radius: 12px;
  padding: 2.5rem;
  color: var(--gc-text-secondary);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gc-gold-mid);
  text-decoration: none;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.back-link:hover { text-decoration: underline; }
h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gc-text-primary);
  margin-bottom: 0.25rem;
}
.legal-updated {
  font-size: 0.78rem;
  color: var(--gc-text-muted);
  margin-bottom: 2rem;
}
h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gc-text-primary);
  margin: 1.5rem 0 0.5rem;
}
p { font-size: 0.875rem; line-height: 1.7; }
a { color: var(--gc-gold-mid); }
section { border-bottom: 1px solid var(--gc-border); padding-bottom: 1rem; }
section:last-child { border-bottom: none; }
</style>
