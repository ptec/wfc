import { Eraser, ScanBarcode, TriangleAlert } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import type { Box } from "../../api/types";
import { AppContext } from "../../App";
import BoxStatus from "../components/BoxStatus";




export default function MissingBox() {
  const { boxes } = useContext(AppContext);

  const [boxQuery  , setBoxQuery  ] = useState("");
  const [boxOptions, setBoxOptions] = useState<Box[]>([]);

  useEffect(() => {
    setBoxOptions(boxes.filter(box => (
      box.currentCount > 0 &&
      box.status !== "missing" && 
      box.id.trim().toLowerCase().includes(boxQuery.trim().toLowerCase())
    )))
  }, [boxes, boxQuery])

  function getBoxWithId(id: string) {
    return boxes.find(box => box.id === id.trim().toUpperCase());
  }

  function hasBoxWithId(id: string) {
    return getBoxWithId(id) !== undefined;
  }
  
  return (
    <form className="flex flex-col rounded-lg border shadow-lg p-4 m-4 gap-1 w-sm">
      <span className="text-2xl font-semibold">Flag as Missing</span>

      <span className="italic">Remove a box from circulation and track shrinkage</span>

      <div className="dropdown self-center">
        <div className="join w-xs">
          <div tabIndex={0} role="button" className="grow">
            <label className="input join-item">
              <ScanBarcode/>
              <input name="id" type="text" className="grow" placeholder="Scan or enter a barcode" value={boxQuery} onChange={(e) => {
                setBoxQuery(e.target.value)
              }}/>
            </label>
          </div>
          <button className="join-item btn" type="button" onClick={() => {
            setBoxQuery("")
          }}><Eraser/></button>
        </div>

        <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
          { boxOptions.map((box) => {
            return <li key={box.id}><a onClick={() => {
              setBoxQuery(box.id)
            }}><BoxStatus box={box}/> <pre>{box.id}</pre> <div className="badge badge-secondary">{box.currentCount}</div></a></li>
          })}
          { boxOptions.length === 0 && <li><a>No results</a></li> }
        </ul>
      </div>

      <button className="btn btn-warning self-center w-xs" type="submit" disabled={!hasBoxWithId(boxQuery)}>
        <TriangleAlert/>Flag
      </button>
    </form>
  )
}