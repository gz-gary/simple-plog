import type { Plog } from '../types'
import PlogCard from './PlogCard'

interface Props {
  plogs: Plog[]
  onExpand: (plogId: string) => void
}

/**
 * Vertical timeline.
 *
 * Plog cards alternate left/right of a center line.
 * On narrow screens all cards move to the right side.
 */
export default function Timeline({ plogs, onExpand }: Props) {
  if (plogs.length === 0) {
    return (
      <div className="flex min-h-svh items-center justify-center py-20">
        <p className="font-display text-lg italic text-muted">还没有记录。</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16">
      {/* Center line (hidden on mobile) */}
      <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-px bg-line md:block" />

      <div className="flex flex-col gap-16 md:gap-24">
        {plogs.map((plog, i) => (
          <TimelineRow
            key={plog.id}
            plog={plog}
            side={i % 2 === 0 ? 'left' : 'right'}
            onExpand={onExpand}
          />
        ))}
      </div>

      {/* End marker */}
      <div className="mt-16 flex justify-center">
        <div className="h-2 w-2 rounded-full bg-accent/40" />
      </div>
    </div>
  )
}

function TimelineRow({
  plog,
  side,
  onExpand,
}: {
  plog: Plog
  side: 'left' | 'right'
  onExpand: (plogId: string) => void
}) {
  return (
    <div
      className={`flex flex-col items-center md:flex-row md:items-center ${
        side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Card */}
      <div className="w-full flex-1 md:w-[calc(50%-2rem)] md:flex-none">
        <PlogCard plog={plog} onExpand={onExpand} />
      </div>

      {/* Timeline dot — above card on mobile, centered on desktop */}
      <div className="order-first mb-3 flex shrink-0 justify-center md:order-none md:mx-8 md:mb-0">
        <div className="h-3 w-3 rounded-full border-[3px] border-accent bg-page ring-4 ring-page" />
      </div>

      {/* Spacer (empty side on desktop) */}
      <div className="hidden flex-1 md:block md:w-[calc(50%-2rem)] md:flex-none" />
    </div>
  )
}
