import type { Plog } from '../types'

/**
 * picsum.photos uses `?random=N` as a deterministic seed:
 * same seed → same image at any requested size.
 */
const T = (seed: number) => `https://picsum.photos/200/200?random=${seed}`
const M = (seed: number) => `https://picsum.photos/800/600?random=${seed}`
const O = (seed: number) => `https://picsum.photos/1920/1080?random=${seed}`

function photoUrls(seed: number) {
  return {
    thumbnail: T(seed),
    medium: M(seed),
    original: O(seed),
  }
}

export const mockPlogs: Plog[] = [
  {
    id: 'plog-1',
    photos: [
      {
        id: 'p1',
        urls: photoUrls(1),
        takenAt: '2026-06-14T08:23:00+08:00',
        location: { city: '南京', place: '夫子庙' },
        caption: '夫子庙的清晨，游人还未至。石板路被昨夜的雨洗过，映着初升的日光。',
      },
      {
        id: 'p2',
        urls: photoUrls(2),
        takenAt: '2026-06-14T14:15:00+08:00',
        location: { city: '南京', place: '秦淮河' },
        caption: '午后秦淮河边，茶馆窗外的河水缓缓流淌，时间好像也慢了下来。',
      },
    ],
  },
  {
    id: 'plog-2',
    photos: [
      {
        id: 'p3',
        urls: photoUrls(3),
        takenAt: '2026-06-18T07:30:00+08:00',
        location: { city: '南京', place: '中山陵' },
        caption: '登上中山陵的台阶回望，整座城市笼罩在晨雾之中，像一幅未干的水墨。',
      },
      {
        id: 'p4',
        urls: photoUrls(4),
        takenAt: '2026-06-18T09:15:00+08:00',
        location: { city: '南京', place: '中山陵' },
        caption: '陵园里的梧桐树高大而沉默，叶子在风中沙沙作响。',
      },
      {
        id: 'p5',
        urls: photoUrls(5),
        takenAt: '2026-06-18T11:00:00+08:00',
        location: { city: '南京', place: '中山陵' },
        caption: '山脚下的小贩在卖雨花石，五彩斑斓地浸在水盆里。',
      },
    ],
  },
  {
    id: 'plog-3',
    photos: [
      {
        id: 'p6',
        urls: photoUrls(6),
        takenAt: '2026-06-20T17:30:00+08:00',
        location: { city: '南京', place: '玄武湖' },
        caption: '玄武湖的落日。整个湖面被染成金色，远处是紫峰的剪影。',
      },
    ],
  },
  {
    id: 'plog-4',
    photos: [
      {
        id: 'p7',
        urls: photoUrls(7),
        takenAt: '2026-06-22T10:00:00+08:00',
        location: { city: '南京', place: '老门东' },
        caption: '老门东的巷子——青砖灰瓦间藏着许多有趣的小店，每走几步就想停下来看看。',
      },
      {
        id: 'p8',
        urls: photoUrls(8),
        takenAt: '2026-06-22T12:30:00+08:00',
        location: { city: '南京', place: '老门东' },
        caption: '一碗地道的鸭血粉丝汤，热气腾腾，是南京人最熟悉的comfort food。',
      },
      {
        id: 'p9',
        urls: photoUrls(9),
        takenAt: '2026-06-22T15:00:00+08:00',
        location: { city: '南京', place: '老门东' },
        caption: '城墙根下遇到的流浪猫，慵懒地晒着午后的太阳，对路人毫不理会。',
      },
    ],
  },
  {
    id: 'plog-5',
    photos: [
      {
        id: 'p10',
        urls: photoUrls(10),
        takenAt: '2026-06-24T05:30:00+08:00',
        location: { city: '南京', place: '紫金山' },
        caption: '紫金山的日出。凌晨四点出发，在观景台等了一个小时，云海上终于亮起金光。',
      },
      {
        id: 'p11',
        urls: photoUrls(1),
        takenAt: '2026-06-24T08:00:00+08:00',
        location: { city: '南京', place: '紫金山' },
        caption: '下山时穿过竹林，清晨的露水还挂在竹叶上，空气里是泥土和青草的味道。',
      },
    ],
  },
]
