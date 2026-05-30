<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="legal-page">
    <div class="legal-card">
      <RouterLink to="/auth/login" class="back-link">
        <i class="pi pi-arrow-left" aria-hidden="true" /> GoldCheck
      </RouterLink>
      <h1>{{ $t('footer.privacy') }}</h1>
      <p class="legal-updated">Last updated: January 2026</p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly, such as account registration data (name, email, segment), operational data (batch records, vehicle information, jewelry pieces), and usage data generated during platform interaction.</p>
      </section>
      <section>
        <h2>2. How We Use Your Information</h2>
        <p>Your data is used to provide and improve the GoldCheck service, ensure traceability of mineral batches and jewelry pieces, generate certifications, and comply with legal obligations.</p>
      </section>
      <section>
        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with trusted partners solely for the purpose of operating the platform (e.g., IoT scale providers, blockchain services).</p>
      </section>
      <section>
        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures, including encryption and access controls, to protect your data. Critical traceability records are sealed on blockchain for immutability.</p>
      </section>
      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:privacy@goldmetrics.com">privacy@goldmetrics.com</a>.</p>
      </section>
      <section>
        <h2>6. Cookies</h2>
        <p>GoldCheck uses session cookies strictly necessary for authentication. No tracking or advertising cookies are used.</p>
      </section>
    </div>
  </div>
</template>

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
