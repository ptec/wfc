import { Check, ChevronsLeft, ChevronsRight, Eraser, Hash, ScanBarcode } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { POST } from "../../api/gas";
import type { Box } from "../../api/types";

export default function ReturnBox() {
  const {accessToken, boxes, setBoxes, defaultPricePerBar } = useContext(AppContext);
  
  const [boxQuery    , setBoxQuery    ] = useState("");
  const [boxOptions  , setBoxOptions  ] = useState<Box[]>([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [updatingBox , setUpdatingBox ] = useState(false);

  function getBoxWithId(id: string) {
    return boxes.find(box => box.id === id.trim().toUpperCase());
  }

  function hasBoxWithId(id: string) {
    return getBoxWithId(id) !== undefined;
  }

  async function returnBox(returnId: string, currentCount: number) {
    if (updatingBox)
      return;

    const box = getBoxWithId(returnId);

    if (!box)
      return alert(`Box with id '${returnId}' does not exist.`);
    
    setUpdatingBox(true);

    return POST({
      action: "returnBox",
      accessToken,
      id           : box.id           ,
      returnedBy   : box.borrowedBy   ,
      currentCount                    ,
      transactionId: box.transactionId,
    })
    .then(box => {
      // update boxes
      setBoxes(boxes => {
        const newBoxes = [...boxes];
        const i = newBoxes.findIndex(({id}) => id === box.id);
        if (i !== -1) newBoxes[i] = box;
        return newBoxes;
      })

      alert(`Box with id '${box.id}' has been returned by '${box.returnedBy}' with ${box.currentCount} bars remaining.`)
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingBox(false))
  }

  useEffect(() => {
    setBoxOptions(boxes.filter(box => (
      box.currentCount > 0 &&
      box.status === "checked-out" && (
        box.id        .includes(boxQuery.trim().toUpperCase()) ||
        box.borrowedBy.includes(boxQuery.trim().toLowerCase())
      )
    )))
  }, [boxes, boxQuery])
  
  return (
    <form className="flex flex-col rounded-lg border shadow-lg p-4 m-4 gap-1 w-sm" onSubmit={(e) => {
      e.preventDefault()
      returnBox(boxQuery, currentCount)
      setBoxQuery("")
      setCurrentCount(0)
    }}>
      <span className="text-2xl font-semibold">Return a Box</span>

      <span className="italic">Check in a box from a participant</span>

      <div className="dropdown self-center">
        <div className="join w-xs">
          <div tabIndex={0} role="button" className="grow">
            <label className="input join-item">
              <ScanBarcode/>
              <input type="text" className="grow" placeholder="Scan or enter a barcode" value={boxQuery} onChange={(e) => {
                setBoxQuery(e.target.value)
              }}/>
            </label>
          </div>

          <button type="button" className="join-item btn" onClick={() => {
            setBoxQuery("")
          }}><Eraser/></button>
        </div>

        <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
          { boxOptions.map((box) => {
            return <li key={box.id}><a onClick={() => {
              setBoxQuery(box.id)
              setCurrentCount( 0)
            }}><pre>{box.id}</pre> <span className="font-semibold">{box.borrowedBy}</span> </a></li>
          })}
          { boxOptions.length === 0 && <li><a>No results</a></li> }
        </ul>
      </div>

      <div className="join w-xs self-center">
        <button className="join-item btn" type="button" onClick={() => {
          setCurrentCount(0)
        }}><ChevronsLeft/></button>

        <label className="input join-item">
          <Hash/>
          <input required type="number" className="grow text-center" value={currentCount} min={0} max={60} onChange={(e) => {
            setCurrentCount(parseInt(e.target.value))
          }}/>
        </label>

        <button className="join-item btn" type="button" onClick={() => {
          if (hasBoxWithId(boxQuery))
            setCurrentCount(getBoxWithId(boxQuery)!.currentCount)
          else
            setCurrentCount(0)
        }}><ChevronsRight/></button>
      </div>

      <label className="cursor-pointer self-center w-xs flex gap-1 items-center rounded-lg p-2 border border-dashed border-primary bg-primary/15 text-primary">
        <input required type="checkbox" className="checkbox checkbox-primary"/>
        <span className="italic text-center">This participant has surrendered the exact funds {hasBoxWithId(boxQuery) && <b>(${defaultPricePerBar * (getBoxWithId(boxQuery)!.currentCount - currentCount)})</b>} to return this box</span>
      </label>

      <div className="flex flex-row gap-2 self-center w-xs">
        <button type="submit" className="btn btn-primary grow" disabled={!hasBoxWithId(boxQuery)}>
          <Check/> Check In
          {updatingBox && (
            <span className="loading loading-spinner loading-sm"></span>
          )}
        </button>
      </div>
    </form>
  )
}