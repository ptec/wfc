import { Hash, ScanBarcode } from "lucide-react"
import { useState } from "react";
import ghdb from "../../ghdb"

const resource = "https://api.github.com/repos/ptec/wfc-db/contents/db.json"

type Status = 
  | "missing"
  | "checked-in" 
  | "checked-out"

interface Item {
  status: Status
  initialCount: number
  currentCount: number
  borrowedBy  : string | null
}

interface Inventory {
  [key: string]: Item
}

export default function App() {
  const [db   , setDb   ] = useState<ghdb      | null>(null)
  const [data , setData ] = useState<Inventory | null>(null)
  const [token, setToken] = useState(localStorage.getItem("ghdb:token") ?? "");

  const missing    = Object.entries(data ?? {}).filter(([_, item]) => item.status === "missing"    )
  const checkedIn  = Object.entries(data ?? {}).filter(([_, item]) => item.status === "checked-in" )
  const checkedOut = Object.entries(data ?? {}).filter(([_, item]) => item.status === "checked-out")

  return <div className="w-dvw h-dvh flex flex-col justify-center items-center gap-2">
    { !db && (
      <div className="flex flex-col gap-1">
        <input className="input" value={token} onChange={(e) => {
          setToken(e.target.value);
        }}/>
        <button className="btn btn-secondary" onClick={() => {
          localStorage.setItem("ghdb:token", token)
          const db   =   ghdb({ token , resource })          
          ghdb.read(db).then(data => setData((data as any) as Inventory))
          setDb(db);
        }}>Login</button>
      </div>
    )}
    { !!db && !!data && (
      <div className="tabs tabs-box grow w-full justify-center p-4">
        <input type="radio" name="tabs" className="tab" aria-label="Dashboard" defaultChecked/>
        <div className="tab-content p-6">

        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Check Out"/>
        <div className="tab-content p-6">

        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Check In" />
        <div className="tab-content p-6">

        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Inventory" />
        <div className="tab-content p-6">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Box Id       </th>
                <th>Status       </th>
                <th>Borrowed By  </th>
                <th>Initial Count</th>
                <th>Current Count</th>
              </tr>
            </thead>
            <tbody>
              { Object.entries(data).map(([id, item]) => {
                return <tr key={id}>
                  <td>{id               }</td>
                  <td>{item.status      }</td>
                  <td>{item.borrowedBy  }</td>
                  <td>{item.initialCount}</td>
                  <td>{item.currentCount}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Manage" />
        <div className="tab-content p-6">
          <div className="flex flex-col w-full items-center gap-2">
            <div className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6">
              <span className="text-2xl font-semibold">Register a Box</span>

              <span>Add a new box to the inventory</span>

              <label className="input self-center w-xs">
                <ScanBarcode/>
                <input type="text" className="grow" placeholder="Scan or enter a barcode"/>
              </label>

              <label className="input self-center w-xs">
                <Hash/>
                <input type="number" className="grow text-center" defaultValue={60} min={1} max={60}/>
              </label>

              <button className="btn btn-secondary self-center w-xs">Register</button>
            </div>

            <div className="divider self-center w-lg"></div>

            <div className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6">
              <span className="text-2xl font-semibold">Mark a Box as Missing</span>

              <div>
              </div>


            </div>

            <div className="divider self-center w-lg"></div>

            <div className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6">
              <span className="text-2xl font-semibold">Delete a Box</span>
            </div>
          </div>
        </div>

      </div>
    )}
  </div>
}