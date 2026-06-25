import type { Plog } from '../types'
import { getDisplayCities, getDisplayDate } from '../types'
import { LocationPin } from './icons'

interface Props {
  plog: Plog
  onExpand: (plogId: string) => void
}

/**
 * Collapsed plog card on the timeline.
 * Shows a photo stack (up to 3 thumbnails with a card-stack effect),
 * city list, and display date.
 */
export default function PlogCard({ plog, onExpand }: Props) {
  const photos = plog.photos
  const stackPhotos = photos.slice(0, 3)
  const cities = getDisplayCities(plog)
  const date = getDisplayDate(plog)

  // Rotation and offset for each layer in the stack
  const stackLayers = [
    { rotate: '-rotate-6', offset: '-translate-x-2', z: 'z-0' },
    { rotate: 'rotate-3', offset: 'translate-x-1', z: 'z-10' },
    { rotate: 'rotate-0', offset: '', z: 'z-20' },
  ]

  // For fewer than 3 photos, adjust which layers we use
  function layerIndex(i: number, total: number) {
    if (total === 1) return 2 // top layer only, no rotation
    if (total === 2) return i === 0 ? 1 : 2 // middle + top
    return i // all three
  }

  return (
    <button
      type="button"
      onClick={() => onExpand(plog.id)}
      className="group block w-full cursor-pointer text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:opacity-90"
    >
      {/* Photo stack */}
      <div className="relative mx-auto mb-4 h-36 w-36">
        {stackPhotos.map((photo, i) => {
          const layer = stackLayers[layerIndex(i, stackPhotos.length)]
          return (
            <div
              key={photo.id}
              className={`absolute inset-0 ${layer.z} ${layer.rotate} ${layer.offset} rounded-sm border border-line/40 bg-surface p-1 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:translate-y-[-2px]`}
            >
              <img
                src={photo.urls.thumbnail}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-[2px] object-cover"
              />
            </div>
          )
        })}
      </div>

      {/* Meta */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {/* Date */}
        <time
          dateTime={date}
          className="font-display text-xl font-medium italic tracking-wide text-ink"
        >
          {date}
        </time>

        {/* Cities */}
        <div className="flex items-center gap-1 text-muted">
          <LocationPin className="h-3.5 w-3.5" />
          <span className="font-display text-sm tracking-wider">
            {cities.join(' · ')}
          </span>
        </div>
      </div>
    </button>
  )
}
