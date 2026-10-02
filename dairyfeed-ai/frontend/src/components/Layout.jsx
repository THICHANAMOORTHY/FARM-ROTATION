import { useTranslation } from 'react-i18next'

import { setLanguage } from '../i18n'
import { href } from '../router'

const PAGES = ['dashboard', 'history', 'devices', 'label']

export default function Layout({ page, children }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <a href={href('dashboard')} className="min-w-0">
            <span className="block text-lg font-semibold text-ink">{t('app.title')}</span>
            <span className="block truncate text-xs text-muted">{t('app.tagline')}</span>
          </a>
          {/* Language toggle: EN / தமிழ், remembered in localStorage */}
          <div
            className="flex shrink-0 rounded-lg border border-line p-0.5"
            role="group"
            aria-label="Language"
          >
            {[
              ['en', 'EN'],
              ['ta', 'தமிழ்'],
            ].map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={i18n.language === code}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  i18n.language === code ? 'bg-ink font-semibold text-page' : 'text-ink-2'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <nav className="mx-auto max-w-5xl overflow-x-auto px-4">
          <ul className="flex gap-1">
            {PAGES.map((name) => {
              const active = page === name || (name === 'history' && page === 'sample')
              return (
                <li key={name}>
                  <a
                    href={href(name)}
                    aria-current={active ? 'page' : undefined}
                    className={`block border-b-2 px-3 py-2 text-sm whitespace-nowrap ${
                      active
                        ? 'border-accent font-semibold text-ink'
                        : 'border-transparent text-ink-2'
                    }`}
                  >
                    {t(`nav.${name}`)}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>

      {/* Standing note: this is a screening tool, not a lab test (CLAUDE.md section 9) */}
      <footer className="border-t border-line bg-surface">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs leading-relaxed text-ink-2">
          {t('footer.note')}
        </p>
      </footer>
    </div>
  )
}
