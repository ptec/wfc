import { create } from "zustand";
import { immer  } from "zustand/middleware/immer";
import ghdb from "../../ghdb";

export type Status = 
  | "missing"
  | "checked-in" 
  | "checked-out"

export interface Item  {
  status: Status
  initialCount: number
  currentCount: number
  borrowedBy  : string | null
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
  updateItem(id: string, apply: (item: Item) => Item): void
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
      set((state) => state.items[id] = item)
    },

    deleteItem: function (id: string) {
      set((state) => delete state.items[id])
    },

    updateItem: function (id: string, apply: (item: Item) => Item) {
      set((state) => state.items[id] = apply(state.items[id]))
    }
  }))
)