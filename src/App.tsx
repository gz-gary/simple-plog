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
      {/* Header — mobile: text left-aligned to card edge; desktop: centered */}
      <header className="mx-auto max-w-3xl px-6 pt-20 pb-4 lg:pt-28 lg:pb-6">
        <div className="pl-[28px] lg:pl-0 lg:text-center">
          <h1 className="font-display text-4xl font-medium italic tracking-wide text-ink lg:text-5xl">
            plog
          </h1>
          <p className="mt-2 font-display text-base tracking-[0.3em] text-muted">
            南京
          </p>
        </div>
      </header>

      {/* Timeline */}
      <main>
        <Timeline plogs={plogs} onExpand={handleExpand} />
      </main>

      {/* Footer — mobile: center relative to card area; desktop: centered in container */}
      <footer className="mx-auto max-w-3xl px-6 pb-16">
        <p className="translate-x-[14px] text-center font-display text-xs tracking-[0.4em] text-muted/50 lg:translate-x-0">
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
