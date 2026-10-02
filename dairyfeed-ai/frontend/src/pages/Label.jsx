import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { apiPost } from '../api'
import Card from '../components/Card'
import LoadState from '../components/LoadState'
import ResultSummary from '../components/ResultSummary'
import { useApi } from '../useApi'

const TOKEN_KEY = 'dairyfeed.adminToken'

// The admin token is kept in sessionStorage: it is forgotten when the tab closes.
function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function saveToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // not saved; the user types it again next time
  }
}

const inputClass = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink'

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink-2">
      {label}
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  )
}

export default function Label({ sampleId }) {
  const { t } = useTranslation()
  const [token, setToken] = useState(readToken)
  const [idInput, setIdInput] = useState(sampleId)
  const [loadedId, setLoadedId] = useState(sampleId)
  const [form, setForm] = useState({
    quality: '',
    mould: '',
    spoilage: '',
    labelled_by: '',
    reference: '',
  })
  const [result, setResult] = useState({ saving: false, message: '', ok: false })

  const sample = useApi(loadedId ? `/api/silage/${encodeURIComponent(loadedId)}` : null)

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setResult({ saving: true, message: '', ok: false })
    try {
      await apiPost(
        `/api/silage/${encodeURIComponent(loadedId)}/label`,
        {
          quality: form.quality,
          mould: form.mould || null,
          spoilage: form.spoilage || null,
          labelled_by: form.labelled_by.trim(),
          reference: form.reference.trim(),
        },
        { 'X-Admin-Token': token },
      )
      setResult({ saving: false, message: t('label.saved'), ok: true })
      sample.reload()
    } catch (error) {
      setResult({ saving: false, message: error.message, ok: false })
    }
  }

  const s = sample.data
  const canSave =
    token && s && form.quality && form.labelled_by.trim() && form.reference.trim() && !result.saving

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink">{t('label.title')}</h1>
      <p className="max-w-2xl text-sm text-ink-2">{t('label.intro')}</p>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Field label={t('label.token')} hint={t('label.tokenHint')}>
              <input
                type="password"
                autoComplete="off"
                className={inputClass}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value)
                  saveToken(e.target.value)
                }}
              />
            </Field>
            <Field label={t('label.sampleId')}>
              <input
                className={`${inputClass} font-mono`}
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onBlur={() => setLoadedId(idInput.trim())}
                placeholder="DF01-20261002T103015-0007"
              />
            </Field>

            <fieldset>
              <legend className="mb-1 text-sm text-ink-2">{t('label.quality')}</legend>
              <div className="flex flex-wrap gap-2">
                {['Good', 'Moderate', 'Poor'].map((q) => (
                  <label
                    key={q}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                      form.quality === q
                        ? 'border-accent bg-surface-2 font-semibold text-ink'
                        : 'border-line text-ink-2'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quality"
                      value={q}
                      checked={form.quality === q}
                      onChange={() => set('quality', q)}
                      className="sr-only"
                    />
                    {t(`quality.${q}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('label.mould')}>
                <select
                  className={inputClass}
                  value={form.mould}
                  onChange={(e) => set('mould', e.target.value)}
                >
                  <option value="">{t('label.notAssessed')}</option>
                  <option value="Low">{t('risk.Low')}</option>
                  <option value="High">{t('risk.High')}</option>
                </select>
              </Field>
              <Field label={t('label.spoilage')}>
                <select
                  className={inputClass}
                  value={form.spoilage}
                  onChange={(e) => set('spoilage', e.target.value)}
                >
                  <option value="">{t('label.notAssessed')}</option>
                  <option value="Low">{t('risk.Low')}</option>
                  <option value="Medium">{t('risk.Medium')}</option>
                  <option value="High">{t('risk.High')}</option>
                </select>
              </Field>
            </div>
            <Field label={t('label.labelledBy')}>
              <input
                className={inputClass}
                value={form.labelled_by}
                onChange={(e) => set('labelled_by', e.target.value)}
              />
            </Field>
            <Field label={t('label.reference')}>
              <input
                className={inputClass}
                value={form.reference}
                placeholder={t('label.referencePlaceholder')}
                onChange={(e) => set('reference', e.target.value)}
              />
            </Field>

            <button
              type="submit"
              disabled={!canSave}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {t('label.save')}
            </button>
            {result.message && (
              <p role="status" className={`text-sm ${result.ok ? 'text-ink' : 'text-bad'}`}>
                {result.ok ? '✓ ' : ''}
                {result.message}
              </p>
            )}
          </form>
        </Card>

        <Card>
          {!loadedId ? (
            <p className="text-sm text-muted">{t('label.sampleId')}…</p>
          ) : (
            <LoadState
              loading={sample.loading}
              error={sample.error?.status === 404 ? new Error(t('detail.notFound')) : sample.error}
            >
              {s && (
                <div className="space-y-3">
                  {s.flags.simulated && (
                    <p className="rounded-md bg-sim-bg px-3 py-2 text-sm text-sim-text">
                      {t('label.simulatedWarning')}
                    </p>
                  )}
                  <ResultSummary sample={s} />
                </div>
              )}
            </LoadState>
          )}
        </Card>
      </div>
    </div>
  )
}
