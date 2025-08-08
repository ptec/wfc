import { Check, Eraser, Hash, Package, Plus, RotateCcw, ScanBarcode, Table, Tag, Ticket, TicketCheck, Trash, Triangle, TriangleAlert, UserRound, X } from "lucide-react"
import { useEffect, useState } from "react";
import ghdb from "../../ghdb"
import { useInventory, type Item, type Status } from "../stores/useInventory";

const resource = "https://api.github.com/repos/ptec/wfc-db/contents/db.json"

function getField(form: FormData, id: string, alt: string = "") {
  return form.get(id)?.toString() ?? alt
}

function Status({ item }: { item: Item }) {
  switch(item.status) {
    case "missing"    : return <div className="font-semibold w-32 text-sm rounded-full border text-error bg-error/15 border-error flex justify-center">missing    </div>
    case "checked-in" : {
      if(item.currentCount <= 0)
        return <div className="font-semibold w-32 text-sm rounded-full border text-primary bg-primary/15 border-primary flex justify-center">completed</div>

      if(item.currentCount < item.initialCount)
        return <div className="font-semibold w-32 text-sm rounded-full border text-warning bg-warning/15 border-warning flex justify-center">incomplete</div>

      if(item.currentCount === item.initialCount)
        return <div className="font-semibold w-32 text-sm rounded-full border text-success bg-success/15 border-success flex justify-center">checked-in</div>
    }
    case "checked-out": return <div className="font-semibold w-32 text-sm rounded-full border text-warning bg-warning/15 border-warning flex justify-center">checked-out</div>
  }
}

function Time({ iso }: { iso: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const timestamp = new Date(iso);
  const diff = Math.round((now.getTime() - timestamp.getTime()) / 1000); // seconds

  const format = () => {
    if (diff < 1) return "less than a second ago";
    if (diff < 60) return "less than a minute ago";
    if (diff < 120) return "a minute ago";
    if (diff < 3600) return `${Math.round(diff / 60)} minutes ago`;
    if (diff < 7200) return "an hour ago";
    if (diff < 86400) return `${Math.round(diff / 3600)} hours ago`;
    if (diff < 172800) return "a day ago";
    return `${Math.round(diff / 86400)} days ago`;
  };

  return <span title={timestamp.toLocaleString()}>{format()}</span>;
}

export default function App() {
  const [db   , setDb   ] = useState<ghdb      | null>(null)
  const [data , setData ] = useState<ghdb.Data | null>(null)
  const [token, setToken] = useState(localStorage.getItem("ghdb:token") ?? "");

  const items      = useInventory((state) => state.items     )
  const pushRemote = useInventory((state) => state.pushRemote)
  const pullRemote = useInventory((state) => state.pullRemote)
  const createItem = useInventory((state) => state.createItem)
  const deleteItem = useInventory((state) => state.deleteItem)
  const updateItem = useInventory((state) => state.updateItem)

  const [ checkInQuery , setCheckInQuery  ] = useState("")
  const [ checkOutQuery, setCheckOutQuery ] = useState("")
  const [ missingQuery , setMissingQuery  ] = useState("")
  const [ deleteQuery  , setDeleteQuery   ] = useState("")

  const [initialCount, setInitialCount] = useState(60)
  const [currentCount, setCurrentCount] = useState( 0)
  const [borrowedBy  , setBorrowedBy  ] = useState<string | null>(null)

  const checkInOptions = Object.entries(items).filter(([id, item]) => (
    (
      id              .toLowerCase().includes(checkInQuery.toLowerCase()) || 
      item.borrowedBy?.toLowerCase().includes(checkInQuery.toLowerCase())
    ) && item.status === "checked-out" && item.currentCount > 0
  ))
  const checkOutOptions = Object.entries(items).filter(([id, item]) => (
    (
      id              .toLowerCase().includes(checkOutQuery.toLowerCase())
    ) && item.status === "checked-in"  && item.currentCount > 0
  ))
  const missingOptions  = Object.entries(items).filter(([id, item]) => (
    (
      id              .toLowerCase().includes(missingQuery.toLowerCase()) || 
      item.borrowedBy?.toLowerCase().includes(missingQuery.toLowerCase())
    ) && item.status !== "missing"  && item.currentCount > 0
  ))
  const deleteOptions   = Object.entries(items).filter(([id, item]) => (
    (
      id              .toLowerCase().includes(deleteQuery.toLowerCase()) || 
      item.borrowedBy?.toLowerCase().includes(deleteQuery.toLowerCase())
    )
  ))

  const boxesSold       = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "checked-in" && item.currentCount === 0)
      return n + 1
    return n
  }, 0)

  const boxesCheckedIn  = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "checked-in" && item.currentCount > 0)
      return n + 1
    return n
  }, 0)

  const boxesCheckedOut = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "checked-out")
      return n + 1
    return n
  }, 0)

  const boxesMissing = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "missing")
      return n + 1
    return n
  }, 0)

  const barsSold       = Object.entries(items).reduce((n, [id, item]) => {
    return n + item.initialCount - item.currentCount
  }, 0)


  const barsCheckedIn  = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "checked-in" && item.currentCount > 0)
      return n + item.currentCount
    return n
  }, 0)
  
  const barsCheckedOut = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "checked-out" && item.currentCount > 0)
      return n + item.currentCount
    return n
  }, 0)
  
  const barsMissing    = Object.entries(items).reduce((n, [id, item]) => {
    if (item.status === "missing" && item.currentCount > 0)
      return n + item.currentCount
    return n
  }, 0)

  const totalBoxes = Object.entries(items).reduce((n, [id, item]) => {
    return n + 1
  }, 0)

  const totalBars  = Object.entries(items).reduce((n, [id, item]) => {
    return n + item.initialCount
  }, 0)

  const dashboard = Object.entries(items).filter(([id, item]) => (
    item.status === "checked-out" || (
      item.status === "checked-in" && 
      item.currentCount >                 0 && 
      item.currentCount < item.initialCount
    )
  ))

  function tryCreateItem(id: string, count: number) {
    try {
      createItem(id, {
        status: "checked-in",
        borrowedBy: null,
        initialCount: count,
        currentCount: count,
        lastModified: new Date().toISOString()
      })
      pushRemote(db!).then(() => alert(`Item '${id}' created`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  function tryDeleteItem(id: string) {
    try {
      deleteItem(id )
      pushRemote(db!).then(() => alert(`Item '${id}' deleted`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  function tryUpdateItemCount(id: string, currentCount: number) {
    try {
      updateItem(id, (item) => ({...item, currentCount }))
      pushRemote(db!).then(() => alert(`Item '${id}' updated`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  function tryCheckOutItem(id: string, borrowedBy: string) {
    try {      
      updateItem(id, (item) => {
        if (item.status === "checked-out") throw new Error(`Item '${id}' is checked out`)
        if (item.status === "missing"    ) throw new Error(`Item '${id}' is missing`)
        if (item.currentCount <= 0       ) throw new Error(`Item '${id}' is empty`)

        if(!!Object.values(items).find((item) => item.borrowedBy === borrowedBy))
          throw new Error(`Person '${borrowedBy}' has already checked out an item`)

        return {...item, status: "checked-out", borrowedBy }
      })
      pushRemote(db!).then(() => alert(`Item '${id}' checked out to '${borrowedBy}'`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  function tryCheckInItem(id: string, currentCount: number) {
    try {
      updateItem(id, (item) => {
        if (currentCount > item.currentCount) throw new Error(`Cannot check in more than '${item.currentCount}'`)
        if (item.status === "checked-in") throw new Error(`Item '${id}' is checked in`)
        if (item.status === "missing"   ) throw new Error(`Item '${id}' is missing`)
        return {...item, status: "checked-in" , currentCount, borrowedBy: null }
      })
      pushRemote(db!).then(() => alert(`Item '${id}' checked in with '${currentCount}'`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  function tryMarkMissingItem(id: string) {
    try {
      updateItem(id, (item) => ({...item, status: "missing" }))
      pushRemote(db!).then(() => alert(`Item '${id}' marked missing`))
    } catch (error: any) {
      alert(error.message)
    }
  }

  useEffect(() => {
    if (db) pullRemote(db)
  }, [db])

  return <div className="w-dvw h-dvh flex flex-col items-center gap-2 overflow-y-auto">
    { !db && (
      <div className="flex flex-col grow justify-center gap-1">
        <input className="input" value={token} onChange={(e) => {
          setToken(e.target.value);
        }}/>
        <button className="btn btn-secondary" onClick={() => {
          localStorage.setItem("ghdb:token", token)
          const db   =   ghdb({ token , resource })
          setDb(db);
        }}>Login</button>
      </div>
    )}
    { !!db && !!items && (
      <div className="tabs tabs-box grow w-full justify-center p-4">
        <input type="radio" name="tabs" className="tab" aria-label="Dashboard" defaultChecked/>
        <div className="tab-content p-6">
          <div className="flex flex-col w-full items-center gap-2">
            <div className="flex justify-center w-4xl gap-4 flex-wrap">

              <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
                <span className="w-full text-2xl font-bold p-1 rounded-lg border border-primary bg-primary/15 text-primary flex justify-center">
                  Completed
                </span>
                <div className="w-full flex items-center justify-between text-primary">
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{boxesSold}</p>
                    <p className="text-sm">Boxes</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{barsSold}</p>
                    <p className="text-sm">Bars</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{Math.round(barsSold / totalBars * 100)}%</p>
                    <p className="text-sm">of Total Inventory</p>
                  </div>
                </div>
                <progress className="progress progress-primary" value={barsSold} max={totalBars}/>
              </div>

              <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
                <span className="w-full text-2xl font-bold p-1 rounded-lg border border-success bg-success/15 text-success flex justify-center">
                  Available
                </span>
                <div className="w-full flex items-center justify-between text-success">
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{boxesCheckedIn}</p>
                    <p className="text-sm">Boxes</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{barsCheckedIn}</p>
                    <p className="text-sm">Bars</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{Math.round(barsCheckedIn / totalBars * 100)}%</p>
                    <p className="text-sm">of Total Inventory</p>
                  </div>
                </div>
                <progress className="progress progress-success" value={barsCheckedIn} max={totalBars}/>
              </div>

              <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
                <span className="w-full text-2xl font-bold p-1 rounded-lg border border-warning bg-warning/15 text-warning flex justify-center">
                  Checked Out
                </span>
                <div className="w-full flex items-center justify-between text-warning">
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{boxesCheckedOut}</p>
                    <p className="text-sm">Boxes</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{barsCheckedOut}</p>
                    <p className="text-sm">Bars</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{Math.round(barsCheckedOut / totalBars * 100)}%</p>
                    <p className="text-sm">of Total Inventory</p>
                  </div>
                </div>
                <progress className="progress progress-warning" value={barsCheckedOut} max={totalBars}/>
              </div>

              <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
                <span className="w-full text-2xl font-bold p-1 rounded-lg border border-error bg-error/15 text-error flex justify-center">
                  Missing
                </span>
                <div className="w-full flex items-center justify-between text-error">
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{boxesMissing}</p>
                    <p className="text-sm">Boxes</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{barsMissing}</p>
                    <p className="text-sm">Bars</p>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <p className="text-4xl font-bold">{Math.round(barsMissing / totalBars * 100)}%</p>
                    <p className="text-sm">of Total Inventory</p>
                  </div>
                </div>
                <progress className="progress progress-error" value={barsMissing} max={totalBars}/>
              </div>
            </div>

            <div className="divider w-4xl self-center"></div>

            <div className="flex flex-wrap w-5xl self-center justify-center items-center gap-2">
              { dashboard.map(([id, item]) => {
                return (
                  <div key={id} className="w-80 h-40 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-4">
                    <span className="flex justify-between items-center"><pre className="font-bold text-lg">{id}</pre><Status item={item}/></span>
                    {item.borrowedBy && <div className="flex gap-1">
                      <span>Checked out by</span> 
                      <span className="font-semibold">{item.borrowedBy}</span>
                    </div>}
                    <div className="grow"></div>
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        <span className="font-semibold">{item.currentCount}</span>
                        <span>of</span>
                        <span>{item.initialCount}</span>
                        <span>bars</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span>{Math.round(item.currentCount / item.initialCount * 100)}% remaining</span>
                      </div>
                    </div>
                    
                    <progress className="progress" value={item.currentCount} max={item.initialCount}/>

                    <span className="text-sm">
                      <Time iso={item.lastModified}/>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Check Out"/>
        <div className="tab-content p-6">
          <div className="flex flex-col w-full items-center gap-2">
            <form className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6" onSubmit={(e) => {
              e.preventDefault()

              const form  = new FormData(e.currentTarget)

              const id         = getField(form, "id"        )
              const borrowedBy = getField(form, "borrowedBy")

              tryCheckOutItem(id, borrowedBy)
              e.currentTarget.reset()
              setCheckOutQuery("")
            }}>
              <span className="text-2xl font-semibold">Check Out Item</span>

              <span className="italic">Check out an item to a student</span>

              <div className="dropdown self-center">
                <div className="join w-xs">
                  <div tabIndex={0} role="button" className="grow">
                    <label className="join-item input">
                      <ScanBarcode/>
                      <input required name="id" type="text" className="grow" placeholder="Scan or enter a barcode" value={checkOutQuery} onChange={(e) => {
                        setCheckOutQuery(e.target.value)
                      }}/>
                    </label>
                  </div>

                  <button className="join-item btn" onClick={() => {
                    setCheckOutQuery("")
                  }}><Eraser/></button>
                </div>

                <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
                  { checkOutOptions.map(([id, item]) => {
                    return <li key={id}><a onClick={() => {
                      setCheckOutQuery(id)
                    }}><pre>{id}</pre> <span className="badge badge-secondary">{item.currentCount}</span></a></li>
                  })}
                  { checkOutOptions.length === 0 && <li><a>No results</a></li> }
                </ul>
              </div>

              <div className="join w-xs self-center">
                <label className="input join-item">
                  <UserRound/>
                  <input required name="borrowedBy" type="text" className="grow" placeholder="Scan or enter a barcode" value={borrowedBy ?? ""} onChange={(e) => {
                    setBorrowedBy(e.target.value)
                  }}/>
                </label>

                <button className="join-item btn" type="button" onClick={() => {
                  setBorrowedBy(null)
                }}><Eraser/></button>
              </div>

              <label className="self-center w-xs flex gap-1 items-center rounded-lg p-2 border border-dashed border-secondary bg-secondary/15 text-secondary">
                <input required type="checkbox" className="checkbox checkbox-secondary"/>
                <span className="italic text-center">This student has received written permission to check out this item</span>
              </label>

              { !!items[checkOutQuery] && !!borrowedBy && !!Object.values(items).find(item => item.borrowedBy === borrowedBy) && (
                <label className="w-xs self-center flex gap-1 items-center rounded-lg p-2 border border-dashed border-warning bg-warning/15 text-warning">
                  <input required type="checkbox" className="checkbox checkbox-warning"/>
                  <span className="italic text-center">This student has at least one item already checked out to them</span>
                </label>
              )}

              <button className="btn btn-secondary self-center w-xs"><Tag/> Check Out</button>
            </form>
          </div>
        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Check In" />
        <div className="tab-content p-6">
          <div className="flex flex-col w-full items-center gap-2">
            <form className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6" onSubmit={(e) => {
              e.preventDefault()

              const form  = new FormData(e.currentTarget)

              const id    =         (getField(form, "id"   ))
              const count = parseInt(getField(form, "count"))

              tryCheckInItem(id, count)
              e.currentTarget.reset()
              setCheckInQuery("")
              setCurrentCount(0)
            }}>
              <span className="text-2xl font-semibold">Check In Item</span>

              <span className="italic">Return an item to the inventory</span>

              <div className="dropdown self-center">
                <div className="join w-xs">
                  <div tabIndex={0} role="button" className="grow">
                    <label className="input join-item">
                      <ScanBarcode/>
                      <input required name="id" type="text" className="grow" placeholder="Scan or enter a barcode" value={checkInQuery} onChange={(e) => {
                        setCheckInQuery(e.target.value)
                      }}/>
                    </label>
                  </div>

                  <button className="join-item btn" onClick={() => {
                    setCheckInQuery("")
                  }}><Eraser/></button>
                </div>

                <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
                  { checkInOptions.map(([id, item]) => {
                    return <li key={id}><a onClick={() => {
                      setCheckInQuery(id)
                      setCurrentCount(item.currentCount)
                    }}><pre>{id}</pre> <span className="font-semibold">{item.borrowedBy}</span> </a></li>
                  })}
                  { checkInOptions.length === 0 && <li><a>No results</a></li> }
                </ul>
              </div>

              <div className="join w-xs self-center">
                <label className="input join-item">
                  <Hash/>
                  <input required name="count" type="number" className="grow text-center" value={currentCount} min={0} max={60} onChange={(e) => {
                    setCurrentCount(parseInt(e.target.value))
                  }}/>
                </label>
                <button className="join-item btn" type="button" onClick={() => {
                  setCurrentCount(0)
                }}><RotateCcw/></button>
              </div>

              <label className="self-center w-xs flex gap-1 items-center rounded-lg p-2 border border-dashed border-secondary bg-secondary/15 text-secondary">
                <input required type="checkbox" className="checkbox checkbox-secondary"/>
                <span className="italic text-center">This student has surrendered the appropriate funds {!!items[checkInQuery] && <b>(${items[checkInQuery].currentCount - currentCount})</b>} to return this item</span>
              </label>

              <button className="btn btn-secondary self-center w-xs"><Check/> Check In</button>
            </form>
          </div>
        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Inventory" />
        <div className="tab-content p-6">
          <div className="w-full flex flex-col items-center">
            <table className="table w-3xl">
              <thead>
                <tr>
                  <th className="text-center">Id           </th>
                  <th className="text-center">Status       </th>
                  <th className="text-center">Borrowed By  </th>
                  <th className="text-center">Initial Count</th>
                  <th className="text-center">Current Count</th>
                  <th className="text-center">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                { Object.entries(items).map(([id, item]) => {
                  return <tr key={id}>
                    <td className="text-center"><pre>{id}</pre></td>
                    <td><Status item={item}/></td>
                    <td className="text-center">{item.borrowedBy || "-"}</td>
                    <td className="text-center">{item.initialCount     }</td>
                    <td className="text-center">{item.currentCount     }</td>
                    <td className="text-center"><Time iso={item.lastModified}/></td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        </div>

        <input type="radio" name="tabs" className="tab" aria-label="Manage" />
        <div className="tab-content p-6 overflow-y-auto">
          <div className="flex flex-col w-full items-center gap-2">
            <form className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6" onSubmit={(e) => {
              e.preventDefault()

              const form  = new FormData(e.currentTarget)

              const id    =         (getField(form, "id"   ))
              const count = parseInt(getField(form, "count"))

              tryCreateItem(id, count)
              e.currentTarget.reset( )
            }}>
              <span className="text-2xl font-semibold">New Item</span>

              <span className="italic">Add a new item to the inventory</span>

              <label className="input self-center w-xs">
                <ScanBarcode/>
                <input required name="id" type="text" className="grow" placeholder="Scan or enter a barcode"/>
              </label>

              <label className="input self-center w-xs">
                <Hash/>
                <input required name="count" type="number" className="grow text-center" value={initialCount} min={1} max={60} onChange={(e) => {
                  setInitialCount(parseInt(e.target.value))
                }}/>
              </label>

              <button className="btn btn-secondary self-center w-xs"><Plus/> Add</button>
            </form>

            <div className="divider self-center w-lg"></div>

            <form className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6" onSubmit={(e) => {
              e.preventDefault()

              if (!items[missingQuery]) return
              const dialog = document.getElementById("confirm_missing") as HTMLDialogElement
              dialog.showModal()
            }}>
              <span className="text-2xl font-semibold">Missing Item</span>

              <span className="italic">Flag an item as missing</span>

              <div className="dropdown self-center">
                <div className="join w-xs">
                  <div tabIndex={0} role="button" className="grow">
                    <label className="input join-item">
                      <ScanBarcode/>
                      <input name="id" type="text" className="grow" placeholder="Scan or enter a barcode" value={missingQuery} onChange={(e) => {
                        setMissingQuery(e.target.value)
                      }}/>
                    </label>
                  </div>
                  <button className="join-item btn" type="button" onClick={() => {
                    setMissingQuery("")
                  }}><Eraser/></button>
                </div>

                <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
                  { missingOptions.map(([id, item]) => {
                    return <li key={id}><a onClick={() => {
                      setMissingQuery(id)
                    }}><Status item={item}/> <pre>{id}</pre> <div className="badge badge-secondary">{item.currentCount}</div></a></li>
                  })}
                  { missingOptions.length === 0 && <li><a>No results</a></li> }
                </ul>
              </div>

              <button className="btn btn-warning self-center w-xs" type="submit"><TriangleAlert/>Flag</button>
            </form>

            <div className="divider self-center w-lg"></div>

            <form className="w-lg flex flex-col gap-2 bg-base-100 rounded-lg shadow-sm p-6" onSubmit={(e) => {
              e.preventDefault()
              if (!items[deleteQuery]) return
              const dialog = document.getElementById("confirm_delete") as HTMLDialogElement
              dialog.showModal()
            }}>
              <span className="text-2xl font-semibold">Delete Item</span>

              <span className="italic">Delete an item from the inventory</span>

              <div className="dropdown self-center">
                <div className="join w-xs">
                  <div tabIndex={0} role="button" className="grow">
                    <label className="input join-item">
                      <ScanBarcode/>
                      <input name="id" type="text" className="grow" placeholder="Scan or enter a barcode" value={deleteQuery} onChange={(e) => {
                        setDeleteQuery(e.target.value)
                      }}/>
                    </label>
                  </div>

                  <button className="join-item btn" type="button" onClick={() => {
                    setDeleteQuery("")
                  }}><Eraser/></button>
                </div>

                <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
                  { deleteOptions.map(([id, item]) => {
                    return <li key={id}><a onClick={() => {
                      setDeleteQuery(id)
                    }}><Status item={item}/> <pre>{id}</pre> <div className="badge badge-secondary">{item.currentCount}</div></a></li>
                  })}
                  { deleteOptions.length === 0 && <li><a>No results</a></li> }
                </ul>
              </div>

              <button className="btn btn-error self-center w-xs" type="submit"><Trash/>Delete</button>
            </form>
          </div>
        </div>

      </div>
    )}

    <dialog id="confirm_missing" className="modal">
      <div className="modal-box">
        <span className="flex gap-2 font-bold text-lg items-center border border-warning bg-warning/15 text-warning p-2 rounded-lg"><TriangleAlert/> Confirm Missing</span>
        <div className="flex flex-col gap-1 pt-4">
          <p>Are you sure you want to <b>flag</b> the following item as missing?</p>
          { !!items[missingQuery] && 
            <div className="w-full flex flex-col gap-1 overflow-x-auto bg-base-200 rounded-lg border border-dashed">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">Id           </th>
                    <th className="text-center">Status       </th>
                    <th className="text-center">Borrowed By  </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center"><pre>{missingQuery}</pre></td>
                    <td className="flex justify-center"><Status item={items[missingQuery]}/></td>
                    <td className="text-center">{items[missingQuery].borrowedBy || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-center">Initial Count</th>
                    <th className="text-center">Current Count</th>
                    <th className="text-center">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center">{items[missingQuery].initialCount}</td>
                    <td className="text-center">{items[missingQuery].currentCount}</td>
                    <td className="text-center"><Time iso={items[missingQuery].lastModified}/></td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          <p className="italic text-center">This action cannot be undone.</p>
        </div>
        <div className="modal-action">
          <form method="dialog" className="flex gap-1">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn" onClick={() => {
              setMissingQuery("")
            }}>Cancel</button>
            <button className="btn btn-warning" onClick={() => {
              tryMarkMissingItem(missingQuery)
              setMissingQuery("")
            }}>Confirm</button>
          </form>
        </div>
      </div>
    </dialog>

    <dialog id="confirm_delete" className="modal">
      <div className="modal-box">
        <span className="flex gap-2 font-bold text-lg items-center border border-error bg-error/15 text-error p-2 rounded-lg"><TriangleAlert/> Confirm Delete</span>
        <div className="flex flex-col gap-1 pt-4">
          <p>Are you sure you want to <b>delete</b> the following item?</p>
          { !!items[deleteQuery] && 
            <div className="w-full flex flex-col gap-1 overflow-x-auto bg-base-200 rounded-lg border border-dashed">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">Id           </th>
                    <th className="text-center">Status       </th>
                    <th className="text-center">Borrowed By  </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center"><pre>{deleteQuery}</pre></td>
                    <td className="flex justify-center"><Status item={items[deleteQuery]}/></td>
                    <td className="text-center">{items[deleteQuery].borrowedBy || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-center">Initial Count</th>
                    <th className="text-center">Current Count</th>
                    <th className="text-center">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center">{items[deleteQuery].initialCount}</td>
                    <td className="text-center">{items[deleteQuery].currentCount}</td>
                    <td className="text-center"><Time iso={items[deleteQuery].lastModified}/></td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          <p className="italic text-center">This action cannot be undone.</p>
        </div>
        <div className="modal-action">
          <form method="dialog" className="flex gap-1">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn" onClick={() => {
              setDeleteQuery("")
            }}>Cancel</button>
            <button className="btn btn-error" onClick={() => {
              tryDeleteItem(deleteQuery)
              setDeleteQuery("")
            }}>Confirm</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
}