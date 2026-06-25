/**
 * 拍摄位置 — 两级分级定义
 *
 * - city: 城市名（必有）
 * - place: 具体地点名（可选）
 */
export interface Location {
  city: string
  place?: string
}
