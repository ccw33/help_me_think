import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import '@testing-library/jest-dom/vitest'

// 全局模拟CSS接口
global.CSS = {
  supports: vi.fn().mockImplementation(() => true),
  escape: vi.fn().mockImplementation((ident) => ident),
  // 添加CSS接口的基本属性
  Hz: 0,
  Q: 0,
  cap: 0,
  ch: 0,
  cm: 0,
  deg: 0,
  dpcm: 0,
  dpi: 0,
  dppx: 0,
  em: 0,
  ex: 0,
  ic: 0,
  in: 0,
  lh: 0,
  mm: 0,
  ms: 0,
  number: 0,
  pc: 0,
  percent: 0,
  pt: 0,
  px: 0,
  rad: 0,
  rem: 0,
  rlh: 0,
  s: 0,
  turn: 0,
  vb: 0,
  vh: 0,
  vi: 0,
  vmax: 0,
  vmin: 0,
  vw: 0
} as unknown as typeof CSS

// 全局模拟WebSocket
const WebSocketMock = vi.fn().mockImplementation(() => ({
  onopen: vi.fn(),
  onmessage: vi.fn(),
  onclose: vi.fn(),
  send: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
})) as unknown as typeof WebSocket

global.WebSocket = WebSocketMock

// 模拟axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))


// 设置全局DOM环境
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom')
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
  })
  global.window = dom.window
  global.document = dom.window.document
  global.navigator = dom.window.navigator

  // 模拟indexedDB
  global.indexedDB = {
    open: vi.fn((name: string, version?: number) => {
      const request = {
        onerror: vi.fn(),
        onsuccess: vi.fn(),
        onupgradeneeded: vi.fn(),
        onblocked: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        error: null,
        readyState: 'done',
        result: {
          createObjectStore: vi.fn(),
          transaction: vi.fn(() => ({
            objectStore: vi.fn(() => ({
              put: vi.fn(),
              get: vi.fn(),
              getAll: vi.fn(),
              delete: vi.fn()
            }))
          })),
          close: vi.fn()
        },
        source: null,
        transaction: null
      } as unknown as IDBOpenDBRequest
      return request
    }),
    cmp: vi.fn(),
    databases: vi.fn(() => Promise.resolve([])),
    deleteDatabase: vi.fn()
  } as unknown as IDBFactory

  // 模拟canvas
  const { createCanvas } = require('canvas')
  global.HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === '2d') {
      const canvas = createCanvas(300, 300)
      return canvas.getContext('2d')
    }
    return null
  }

  // 模拟CSS接口
  global.CSS = {
    supports: vi.fn().mockImplementation(() => true),
    escape: vi.fn().mockImplementation((ident) => ident),
    // 添加CSS接口的基本属性
    Hz: 0,
    Q: 0,
    cap: 0,
    ch: 0,
    cm: 0,
    deg: 0,
    dpcm: 0,
    dpi: 0,
    dppx: 0,
    em: 0,
    ex: 0,
    ic: 0,
    in: 0,
    lh: 0,
    mm: 0,
    ms: 0,
    number: 0,
    pc: 0,
    percent: 0,
    pt: 0,
    px: 0,
    rad: 0,
    rem: 0,
    rlh: 0,
    s: 0,
    turn: 0,
    vb: 0,
    vh: 0,
    vi: 0,
    vmax: 0,
    vmin: 0,
    vw: 0
  } as unknown as typeof CSS
}

// 配置Vue Test Utils
config.global = {
  ...config.global,
  mocks: {
    $t: (msg: string) => msg
  },
  stubs: {
    // 解决WebSocket相关错误
    WebSocket: true
  }
}
