import { useEffect, useState } from "react";
import type { Item, Items } from "../stores/useInventory";
import React from "react";
import { Status } from "./App";


function Receipt({ id, item }: { id: string, item: Item }) {
  return <div className="flex flex-col justify-center items-center">
    <div className="w-[120mm] flex flex-col border border-black border-dashed p-2 gap-2 font-mono">
      
      <div className="flex flex-row items-center border border-black p-2">
        <span className="w-full text-center font-semibold">PTEC - World's Finest Chocolate Fundraiser</span>
      </div>

      <div className="flex flex-row justify-between items-center">
        <span>Box {id}</span>
        <Status item={item}/>
      </div>
        
      <table>
        <tbody>
          <tr>
            <td>Returned By</td>
            <td>{item.returnedBy || item.borrowedBy}</td>
          </tr>
          <tr>
            <td>Returned On</td>
            <td>{new Date(item.lastModified).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Initial Balance</td>
            <td><input type="text" defaultValue={`$${item.initialCount.toFixed(2)}`}/></td>
          </tr>
          <tr>
            <td>Paid</td>
            <td><input type="text" defaultValue={`$${(item.initialCount - item.currentCount).toFixed(2)}`}/></td>
          </tr>
          <tr>
            <td>Current Balance</td>
            <td><input type="text" defaultValue={`$${item.currentCount.toFixed(2)}`}/></td>
          </tr>

        </tbody>
      </table>
      
    </div>    
  </div>
}

export default function Receipts() {
  const [items, setItems] = useState<Items>({ })

  console.log(items)

  useEffect(() => {
    const receipts = window.localStorage.getItem("receipts")
    window.localStorage.removeItem("receipts")
    setItems(JSON.parse(receipts ?? "{}"))
  }, [ ])

  return <div className="flex flex-col gap-2">
    { Object.entries(items).map(([id, item]) => {
      return <React.Fragment key={id}>
        <Receipt id={id} item={item}/>
        <div className="break-after-page"></div>
      </React.Fragment>
    })}
  </div>
}