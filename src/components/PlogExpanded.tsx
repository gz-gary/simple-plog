import { useState, useRef, useEffect, useCallback } from 'react'
import type { Plog, Photo } from '../types'
import { ChevronLeft, ChevronRight, Info, Maximize, Minimize, X, Loader, LocationPin } from './icons'

interface Props {
  plog: Plog
  initialIndex?: number
  onClose: () => void
}

type NavDirection = 'prev' | 'next'

/**
 * Expanded plog overlay — lightbox style.
 *
 * Displays one photo at a time in a centered frame with:
 * - prev/next navigation through the plog's photos
 * - info bar (caption + location), toggleable (default visible)
 * - fullscreen toggle — fills screen with the current photo
 * - error → red exclamation flash + back to toggle-off
 */
export default function PlogExpanded({ plog, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [infoVisible, setInfoVisible] = useState(true)
  const [viewState, setViewState] = useState<'medium' | 'loading' | 'original'>('medium')
  const [progress, setProgress] = useState(0)

  // Error flash: visible state + key to restart CSS animation on repeat errors
  const [mediumReady, setMediumReady] = useState(false)

  const [errorVisible, setErrorVisible] = useState(false)
  const [errorKey, setErrorKey] = useState(0)

  // Cache: photoId → object URL (or original URL on fallback)
  const originalsRef = useRef<Map<string, string>>(new Map())
  const abortRef = useRef<AbortController | null>(null)

  // Touch swipe state
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Fullscreen
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const justExitedFullscreen = useRef(false)
  const [fullscreenSupported] = useState(() => document.fullscreenEnabled ?? false)

  const photo = plog.photos[currentIndex]
  if (!photo) return null

  const total = plog.photos.length

  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Reset state + abort in-flight fetch when photo changes
  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setViewState('medium')
    setProgress(0)
    setErrorVisible(false)
    setMediumReady(false)
  }, [photo.id])

  // Cleanup on unmount: abort fetch + revoke blob URLs
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
      for (const url of originalsRef.current.values()) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }, [])

  // Track fullscreen state
  useEffect(() => {
    function handleFSChange() {
      const isFS = document.fullscreenElement === containerRef.current
      if (!isFS) {
        justExitedFullscreen.current = true
      }
      setIsFullscreen(isFS)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  // Keyboard nav
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          // When exiting fullscreen via Escape, the browser may fire keydown
          // after fullscreenchange — swallow one Escape to avoid closing
          // the overlay when the user only meant to exit fullscreen.
          if (justExitedFullscreen.current) {
            justExitedFullscreen.current = false
            return
          }
          onClose()
          break
        case 'ArrowLeft':
          navigate('prev')
          break
        case 'ArrowRight':
          navigate('next')
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, total])

  const navigate = useCallback(
    (dir: NavDirection) => {
      setCurrentIndex((prev) => {
        if (dir === 'prev') return prev > 0 ? prev - 1 : total - 1
        return prev < total - 1 ? prev + 1 : 0
      })
    },
    [total],
  )

  // Touch swipe navigation (disabled in fullscreen)
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (isFullscreen) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only swipe if horizontal movement is dominant and exceeds threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      navigate(dx > 0 ? 'prev' : 'next')
    }
  }

  // --- original-loading kept for future use (currently short-circuited) ---

  /** Cancel an in-progress load — aborts fetch + resets state */
  function cancelLoading() {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setViewState('medium')
    setProgress(0)
  }

  function handleOriginalClick() {
    if (viewState === 'loading') {
      cancelLoading()
      return
    }
    loadOriginal()
  }

  async function loadOriginal() {
    if (viewState === 'original') {
      setViewState('medium')
      return
    }

    // Cache hit → instant
    const cached = originalsRef.current.get(photo.id)
    if (cached) {
      setViewState('original')
      return
    }

    // Real download
    setViewState('loading')
    setProgress(0)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(photo.urls.original, { signal: controller.signal })
      if (!response.ok || !response.body) throw new Error('Fetch failed')

      const contentLength = Number(response.headers.get('Content-Length') || '0')
      const reader = response.body.getReader()
      const chunks: BlobPart[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (contentLength > 0) {
          setProgress(Math.round((received / contentLength) * 100))
        }
      }

      const blob = new Blob(chunks)
      const objectUrl = URL.createObjectURL(blob)
      originalsRef.current.set(photo.id, objectUrl)
      setViewState('original')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return

      // Fetch error → flash + back to medium
      setViewState('medium')
      setProgress(0)
      setErrorVisible(true)
      setErrorKey((k) => k + 1)
      setTimeout(() => setErrorVisible(false), 2200)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }

  // Suppress noUnusedLocals — declarations kept for future re-enable
  void Minimize
  void progress
  void errorVisible
  void errorKey
  void handleOriginalClick

  // Image source: blob URL > cached URL > medium
  const imgSrc =
    viewState === 'original'
      ? (originalsRef.current.get(photo.id) || photo.urls.medium)
      : photo.urls.medium

  // --- fullscreen toggle ---

  function handleFullscreenToggle() {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`查看照片 ${currentIndex + 1} / ${total}`}
    >
      {/* Backdrop — fixed to viewport */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />

      {/* Close button (overlay mode) */}
      {!isFullscreen && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-20 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Photo counter (overlay mode) */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 z-20 font-display text-sm tracking-wider text-white/50">
          {currentIndex + 1} / {total}
        </div>
      )}

      {/* Scrollable content area — when the frame + info exceed viewport (e.g.
          short viewport + browser chrome), the user can scroll to see everything. */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          <div className="flex flex-col items-center my-auto">
            {/* Frame */}
            <div
              ref={containerRef}
              className={`relative z-10 animate-frame-in touch-pan-y ${
                isFullscreen
                  ? 'h-screen w-screen bg-black'
                  : 'flex flex-col items-center w-full max-h-[85vh] max-w-[92vw] lg:max-h-[80vh] lg:max-w-[80vw]'
              }`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Close button (fullscreen mode) — top-right, subtle, 44px touch target */}
              <button
                type="button"
                onClick={() => document.exitFullscreen()}
                className={`absolute top-4 right-4 z-20 rounded-full bg-white/5 p-3 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isFullscreen ? 'opacity-100' : 'pointer-events-none'
                }`}
                aria-label="退出全屏"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image — fullscreen: absolute fills entire container; overlay: flex-centered */}
              <div
                className={`${
                  isFullscreen
                    ? 'absolute inset-0 flex items-center justify-center'
                    : 'flex w-full min-h-0 flex-col items-center justify-center'
                }`}
              >
                <div
                  className={`relative overflow-hidden transition-all duration-500 ${
                    isFullscreen ? 'h-full w-full' : 'w-full'
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={photo.caption || '照片'}
                    onLoad={() => setMediumReady(true)}
                    className={`object-contain transition-opacity duration-300 ${
                      isFullscreen
                        ? 'h-full w-full'
                        : 'w-full max-h-[70vh] lg:max-h-[60vh]'
                    } ${mediumReady ? 'opacity-100' : 'opacity-0'}`}
                    style={{ aspectRatio: mediumReady ? 'auto' : '4 / 3' }}
                  />

                  {/* Spinner — no dark frame, just floats centered (shifted down
                      to account for controls bar below, so it looks visually centered) */}
                  {!mediumReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="h-7 w-7 animate-spin text-white/30 translate-y-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Controls bar (overlay mode) */}
              {!isFullscreen && (
                <div className="mt-5 flex items-center gap-1 text-white/60">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => navigate('prev')}
                    disabled={total <= 1}
                    className="rounded-full p-3 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="上一张"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Info toggle */}
                  <button
                    type="button"
                    onClick={() => setInfoVisible((v) => !v)}
                    className={`rounded-full p-3 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      infoVisible ? 'text-accent hover:text-accent' : 'hover:text-white'
                    }`}
                    aria-label={infoVisible ? '隐藏信息栏' : '显示信息栏'}
                  >
                    <Info className="h-5 w-5" />
                  </button>

                  {/* Fullscreen toggle (hidden when API unsupported, e.g. iOS Safari) */}
                  {fullscreenSupported && (
                    <button
                      type="button"
                      onClick={handleFullscreenToggle}
                      className="rounded-full p-3 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="全屏显示"
                    >
                      <Maximize className="h-5 w-5" />
                    </button>
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => navigate('next')}
                    disabled={total <= 1}
                    className="rounded-full p-3 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="下一张"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Info bar (overlay mode) */}
            {!isFullscreen && infoVisible && (
              <div className="z-10 mt-4 w-full max-w-lg px-6 animate-info-slide-in">
                <InfoPanel photo={photo} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Format an ISO 8601 timestamp to minute precision.
 * Preserves the original local time from the string (no timezone conversion).
 *
 * "2026-06-14T08:23:00+08:00" → "2026-06-14 08:23"
 */
function formatPhotoTime(isoString: string): string {
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (!match) return isoString
  return `${match[1]} ${match[2]}`
}

function InfoPanel({ photo }: { photo: Photo }) {
  const locationParts = [photo.location.city, photo.location.place].filter(Boolean)

  return (
    <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-black/40 px-5 py-3 backdrop-blur">
      {photo.caption && (
        <p className="text-sm leading-relaxed text-white/85">
          {photo.caption}
        </p>
      )}
      <p className="mt-1.5 flex items-center justify-between font-display text-xs tracking-widest text-white/45">
        <span className="inline-flex items-center gap-1">
          <LocationPin className="h-3 w-3 shrink-0" />
          <span>{locationParts.join(' · ')}</span>
        </span>
        <time dateTime={photo.takenAt}>{formatPhotoTime(photo.takenAt)}</time>
      </p>
    </div>
  )
}
