import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import Label from './pages/Label'
import SampleDetail from './pages/SampleDetail'
import { useRoute } from './router'

// The charts library is large, so the History page (the only one with charts) loads
// on first visit instead of with the dashboard. Faster first load on slow mobile data.
const History = lazy(() => import('./pages/History'))

export default function App() {
  const { t } = useTranslation()
  const { page, param } = useRoute()

  let content
  if (page === 'history') content = <History />
  else if (page === 'sample') content = <SampleDetail sampleId={param} />
  else if (page === 'label') content = <Label key={param} sampleId={param} />
  else if (page === 'devices') content = <Devices />
  else content = <Dashboard />

  return (
    <Layout page={page}>
      <Suspense fallback={<p className="p-4 text-sm text-muted">{t('common.loading')}</p>}>
        {content}
      </Suspense>
    </Layout>
  )
}
