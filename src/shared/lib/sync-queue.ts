import { MMKV } from "react-native-mmkv"
import NetInfo from "@react-native-community/netinfo"

interface SyncItem {
  id:        string
  type:      "session" | "exercise_log" | "profile"
  payload:   unknown
  createdAt: number
  attempts:  number
}

// @ts-ignore
const store = new MMKV({ id: "sync-queue" });

export const syncQueue = {
  add(item: Omit<SyncItem, "id" | "attempts">) {
    const key = `sync:${Date.now()}:${Math.random()}`
    const entry: SyncItem = { ...item, id: key, attempts: 0 }
    store.set(key, JSON.stringify(entry))
  },
  
  async flush(processItem: (item: SyncItem) => Promise<void>) {
    const net = await NetInfo.fetch()
    if (!net.isConnected) return

    const keys = store.getAllKeys().filter((k: string) => k.startsWith("sync:"));
    
    for (const key of keys) {
      const raw = store.getString(key)
      if (!raw) continue
      
      const item: SyncItem = JSON.parse(raw)
      
      try {
        await processItem(item)
        store.delete(key)             // remove após sucesso
      } catch (error) {
        item.attempts++
        if (item.attempts >= 3) {
          store.delete(key)           // descarta após 3 falhas
          console.error("sync_item_discarded", item, error)
        } else {
          store.set(key, JSON.stringify(item))  // tenta novamente
        }
      }
    }
  },
}
