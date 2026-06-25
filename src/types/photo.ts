import type { Location } from './location'

/**
 * 三个品质的图片 URL 集合
 */
export interface PhotoUrlSet {
  /** 最低品质缩略图 */
  thumbnail: string
  /** 中等品质缩略图 */
  medium: string
  /** 原图 */
  original: string
}

/**
 * 单张照片
 *
 * - takenAt: ISO 8601 格式，精确到秒（如 "2026-06-14T14:23:00+08:00"）
 * - location: 拍摄位置（城市 + 可选地点）
 * - caption: 纯文本配文
 */
export interface Photo {
  id: string
  urls: PhotoUrlSet
  takenAt: string
  location: Location
  caption: string
}
