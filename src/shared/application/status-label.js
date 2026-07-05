import { useI18n } from 'vue-i18n'

/**
 * Translates a backend status enum value (English) into a localized label.
 * Keys live under the `status.*` i18n namespace; any legacy Spanish value or an
 * unmapped value falls back to itself so nothing renders blank.
 */
export function useStatusLabel() {
  const { t } = useI18n()
  function statusLabel(raw) {
    if (!raw) return '—'
    const key = `status.${raw}`
    const translated = t(key)
    return translated === key ? raw : translated
  }
  return { statusLabel }
}
