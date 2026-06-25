import { useState, useRef, useEffect, useCallback } from 'react'
import type { Plog, Photo } from '../types'
import { ChevronLeft, ChevronRight, Info, Maximize, X, Loader } from './icons'

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
 * - "view original" — downloads with percentage progress,
 *   button itself shows spinner + %, cancellable during loading
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

  // Keyboard nav
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
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

  // Touch swipe navigation
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only swipe if horizontal movement is dominant and exceeds threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      navigate(dx > 0 ? 'prev' : 'next')
    }
  }

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

  // Image source: blob URL > cached URL > medium
  const imgSrc =
    viewState === 'original'
      ? (originalsRef.current.get(photo.id) || photo.urls.medium)
      : photo.urls.medium

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-label={`查看照片 ${currentIndex + 1} / ${total}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 rounded-full bg-white/10 p-3 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="关闭"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Photo counter */}
      <div className="absolute top-6 left-6 z-10 font-display text-sm tracking-wider text-white/50">
        {currentIndex + 1} / {total}
      </div>

      {/* Frame */}
      <div
        className="relative z-10 flex max-h-[85vh] max-w-[92vw] flex-col items-center animate-frame-in touch-pan-y md:max-h-[80vh] md:max-w-[80vw]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Frame with warm layered shadow */}
        <div className="frame-shadow rounded-sm">
          <div
            className={`relative overflow-hidden rounded-sm bg-neutral-900 shadow-2xl shadow-black/50 transition-all duration-500 ${
              viewState === 'loading' ? 'blur-md' : ''
            }`}
          >
            <img
              src={imgSrc}
              alt={photo.caption || '照片'}
              onLoad={() => setMediumReady(true)}
              className={`max-h-[70vh] max-w-[90vw] object-contain transition-opacity duration-300 md:max-h-[60vh] md:max-w-[75vw] ${
                mediumReady ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Loading placeholder while image not ready */}
            {!mediumReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Controls bar */}
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

          {/* View original — cancellable during loading */}
          <button
            type="button"
            onClick={handleOriginalClick}
            className={`rounded-full p-3 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              viewState === 'original'
                ? 'text-accent hover:text-accent'
                : viewState === 'loading'
                  ? 'text-accent'
                  : 'hover:text-white'
            }`}
            aria-label={
              errorVisible
                ? '加载失败'
                : viewState === 'loading'
                  ? '取消加载原图'
                  : viewState === 'original'
                    ? '显示中等尺寸'
                    : '查看原图'
            }
          >
            {errorVisible ? (
              <span
                key={errorKey}
                className="animate-error-flash text-lg font-bold text-red-400"
                aria-live="assertive"
              >
                !
              </span>
            ) : viewState === 'loading' ? (
              <span className="flex items-center gap-1">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-xs tabular-nums">{progress}%</span>
              </span>
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>

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
      </div>

      {/* Info bar */}
      {infoVisible && (
        <div className="z-10 mt-4 w-full max-w-lg px-6 animate-info-slide-in">
          <InfoPanel photo={photo} />
        </div>
      )}
    </div>
  )
}

function InfoPanel({ photo }: { photo: Photo }) {
  return (
    <div className="mx-auto max-w-md rounded-sm border border-white/10 bg-black/40 px-5 py-3 backdrop-blur">
      {photo.caption && (
        <p className="text-sm leading-relaxed text-white/85">
          {photo.caption}
        </p>
      )}
      <p className="mt-1.5 font-display text-xs tracking-widest text-white/45">
        {photo.location.city}
        {photo.location.place && ` · ${photo.location.place}`}
      </p>
    </div>
  )
}
