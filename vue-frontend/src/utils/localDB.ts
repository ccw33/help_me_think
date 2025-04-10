import { ref } from 'vue'

interface ChatMessage {
  id: string
  content: string
  timestamp: number
  sender: 'user' | 'assistant'
}

interface MindMap {
  id: string
  title: string
  nodes: Array<{
    id: string
    content: string
    x: number
    y: number
    connections: string[]
  }>
  lastModified: number
}

const DB_NAME = 'ThinkAssistantDB'
const DB_VERSION = 1
const CHAT_STORE = 'chatMessages'
const MINDMAP_STORE = 'mindMaps'

let db: IDBDatabase | null = null

export function initDB(): Promise<IDBDatabase> {
  if (db) {
    return Promise.resolve(db)
  }

  // 在测试环境下使用模拟的indexedDB
  if (import.meta.env.MODE === 'test') {
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(() => Promise.resolve()),
          get: vi.fn(() => Promise.resolve()),
          getAll: vi.fn(() => Promise.resolve([]))
        }))
      }))
    }
    return Promise.resolve(mockDB as unknown as IDBDatabase)
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error)
      reject((event.target as IDBRequest).error)
    }

    request.onsuccess = (event) => {
      db = (event.target as IDBRequest).result
      resolve(db!)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result
      
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        db.createObjectStore(CHAT_STORE, { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains(MINDMAP_STORE)) {
        db.createObjectStore(MINDMAP_STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function saveChatMessage(message: ChatMessage) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(CHAT_STORE, 'readwrite')
    const store = transaction.objectStore(CHAT_STORE)
    const request = store.put(message)

    request.onsuccess = () => resolve(request.result)
    request.onerror = (event) => {
      console.error('Save chat message error:', (event.target as IDBRequest).error)
      reject((event.target as IDBRequest).error)
    }
  })
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(CHAT_STORE, 'readonly')
    const store = transaction.objectStore(CHAT_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = (event) => {
      console.error('Get chat messages error:', (event.target as IDBRequest).error)
      reject((event.target as IDBRequest).error)
    }
  })
}

export async function saveMindMap(mindMap: MindMap) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(MINDMAP_STORE, 'readwrite')
    const store = transaction.objectStore(MINDMAP_STORE)
    const request = store.put(mindMap)

    request.onsuccess = () => resolve(request.result)
    request.onerror = (event) => {
      console.error('Save mind map error:', (event.target as IDBRequest).error)
      reject((event.target as IDBRequest).error)
    }
  })
}

export async function getMindMap(id: string): Promise<MindMap | undefined> {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(MINDMAP_STORE, 'readonly')
    const store = transaction.objectStore(MINDMAP_STORE)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = (event) => {
      console.error('Get mind map error:', (event.target as IDBRequest).error)
      reject((event.target as IDBRequest).error)
    }
  })
}
