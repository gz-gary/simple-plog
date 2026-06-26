import type { Plog } from '../types'
import PlogCard from './PlogCard'

interface Props {
  plogs: Plog[]
  onExpand: (plogId: string) => void
}

/**
 * Vertical timeline.
 *
 * Plog cards alternate left/right of a center line on desktop.
 * On mobile, all cards are on the right with a left-side timeline line.
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
      {/* Center line (≥1024px) */}
      <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-px bg-line lg:block" />

      {/* Left timeline line (<1024px) — runs through all dots */}
      <div className="absolute left-[30px] top-0 bottom-0 w-px bg-line lg:hidden" />

      <div className="flex flex-col gap-16 lg:gap-24">
        {plogs.map((plog, i) => (
          <TimelineRow
            key={plog.id}
            plog={plog}
            side={i % 2 === 0 ? 'left' : 'right'}
            onExpand={onExpand}
          />
        ))}
      </div>

      {/* End marker (≥1024px only — on narrow screens the line ending is signal enough) */}
      <div className="mt-16 hidden justify-center lg:flex">
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
      className={`flex flex-row-reverse items-start gap-4 lg:items-center lg:gap-0 ${
        side === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'
      }`}
    >
      {/* Card */}
      <div className="flex-1 min-w-0 lg:w-[calc(50%-2rem)] lg:flex-none">
        <PlogCard plog={plog} onExpand={onExpand} />
      </div>

      {/* Timeline dot — on the line: left narrow, center wide. z-10 keeps it above the line */}
      <div className="relative z-10 flex shrink-0 justify-center lg:mx-8">
        <div className="h-3 w-3 rounded-full border-[3px] border-accent bg-page ring-4 ring-page" />
      </div>

      {/* Spacer (empty side on wide screens) */}
      <div className="hidden flex-1 lg:block lg:w-[calc(50%-2rem)] lg:flex-none" />
    </div>
  )
}
