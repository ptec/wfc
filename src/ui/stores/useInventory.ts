import { create } from "zustand";
import { immer  } from "zustand/middleware/immer";
import ghdb from "../../ghdb";

export type Status = 
  | "missing"
  | "checked-in" 
  | "checked-out"

export interface Item  {
  status: Status
  borrowedBy  : string | null
  returnedBy  : string | null
  initialCount: number
  currentCount: number
  lastModified: string
}

export interface Items extends Record<string, Item> {
  [id: string]: Item
}

export interface Inventory {
  items: Items

  pushRemote(db: ghdb): Promise<void>
  pullRemote(db: ghdb): Promise<void>
  createItem(id: string, item : Item): void
  deleteItem(id: string             ): void
  updateItem(id: string, update: (item: Item) => Item): void
}

export const useInventory = create<Inventory>()(
  immer((set, get) => ({
    items: {  },

    pushRemote: async function(db: ghdb) {
      const items = get().items;
      await ghdb.write(db, (items as any) as ghdb.Data)
    },

    pullRemote: async function(db: ghdb) {
      const items = await (ghdb.read(db) as any) as Items;
      set({ items })
    },    

    createItem: function (id: string, item: Item) {
      if (get().items[id]) throw new Error(`Item with id '${id}' already exists`)
      const lastModified = new Date().toISOString()
      set((state) => {
        state.items[id]              = item
        state.items[id].lastModified = lastModified
      })
    },

    deleteItem: function (id: string) {
      if (!get().items[id]) throw new Error(`Item with id '${id}' does not exist`)
      set((state) => {
        delete state.items[id]
      })
    },

    updateItem: function (id: string, update: (item: Item) => Item) {
      if (!get().items[id]) throw new Error(`Item with id '${id}' does not exist`)
      const lastModified = new Date().toISOString()
      set((state) => {
        const item = update(state.items[id])
        state.items[id]              = item
        state.items[id].lastModified = lastModified
      })
    }
  }))
)