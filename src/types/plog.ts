import type { Photo } from './photo'

/**
 * 照片集（plog）—— 时间线上的一个事件。
 *
 * plog 本身不直接持有「位置」和「时间」字段，
 * 而是通过内部所有 photo 的属性派生得到：
 *
 * - 外显位置 → 所有 photo 的 city 名的去重集合
 * - 外显时间 → 所有 photo 中最早的 takenAt（仅取到日期）
 */
export interface Plog {
  id: string
  photos: Photo[]
}

// ---- 派生属性辅助函数 ----

/**
 * 获取 plog 外显的城市名集合（去重）
 */
export function getDisplayCities(plog: Plog): string[] {
  return [...new Set(plog.photos.map((p) => p.location.city))].sort()
}

/**
 * 获取 plog 外显的日期（最早拍摄时间，仅 YYYY-MM-DD）
 *
 * 若无照片则返回空字符串。
 */
export function getDisplayDate(plog: Plog): string {
  if (plog.photos.length === 0) return ''
  const dates = plog.photos.map((p) => p.takenAt)
  dates.sort()
  const earliest = dates[0]
  return earliest.split('T')[0]
}
