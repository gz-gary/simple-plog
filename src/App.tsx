import { useState, useCallback } from 'react'
import Timeline from './components/Timeline'
import PlogExpanded from './components/PlogExpanded'
import { mockPlogs } from './data/mock'

export default function App() {
  const plogs = mockPlogs
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const expandedPlog = expandedId
    ? plogs.find((p) => p.id === expandedId) ?? null
    : null

  const handleExpand = useCallback((id: string) => {
    setExpandedId(id)
  }, [])

  const handleClose = useCallback(() => {
    setExpandedId(null)
  }, [])

  return (
    <>
      {/* Header */}
      <header className="px-6 pt-20 pb-4 text-left lg:text-center lg:pt-28 lg:pb-6">
        <h1 className="font-display text-4xl font-medium italic tracking-wide text-ink lg:text-5xl">
          plog
        </h1>
        <p className="mt-2 font-display text-base tracking-[0.3em] text-muted">
          南京
        </p>
      </header>

      {/* Timeline */}
      <main>
        <Timeline plogs={plogs} onExpand={handleExpand} />
      </main>

      {/* Footer */}
      <footer className="px-6 pb-16 text-center">
        <p className="font-display text-xs tracking-[0.4em] text-muted/50">
          — 记录看见的光 —
        </p>
      </footer>

      {/* Expanded overlay */}
      {expandedPlog && (
        <PlogExpanded
          plog={expandedPlog}
          onClose={handleClose}
        />
      )}
    </>
  )
}
