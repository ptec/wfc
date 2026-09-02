import { ChevronsLeft, ChevronsRight, Hash, Plus, ScanBarcode } from "lucide-react"
import { useContext, useState } from "react";
import { AppContext } from "../../App";

export default function CreateBox() {
  const { boxes, defaultInitialCount } = useContext(AppContext);
  
  const [newBoxId    , setNewBoxId    ] = useState("");
  //@ts-ignore
  const [creatingBox , setCreatingBox ] = useState(false);
  const [initialCount, setInitialCount] = useState(defaultInitialCount);

  function getBoxWithId(id: string) {
    return boxes.find(box => box.id === id.trim().toUpperCase());
  }

  function hasBoxWithId(id: string) {
    return getBoxWithId(id) !== undefined;
  }
  
  return (
    <form className="flex flex-col rounded-lg border shadow-lg p-4 m-4 gap-1 w-sm">
       <span className="text-2xl font-semibold">Create a Box</span>

        <span className="italic">Add a new box to the inventory</span>

        <label className="input self-center w-xs">
          <ScanBarcode/>
          <input required type="text" className="grow" placeholder="Scan or enter a barcode" value={newBoxId} onChange={(e) => setNewBoxId(e.target.value)} />
        </label>

        <div className="join w-xs self-center">
          <button className="join-item btn" type="button" onClick={() => {
            setInitialCount(1)
          }}><ChevronsLeft/></button>
          <label className="input join-item">
            <Hash/>
            <input required type="number" className="grow text-center" value={initialCount} min={1} max={60} onChange={(e) => {
              setInitialCount(parseInt(e.target.value))
            }}/>
          </label>
          <button className="join-item btn" type="button" onClick={() => {
            setInitialCount(defaultInitialCount)
          }}><ChevronsRight/></button>
        </div>

        <button type="submit" className="btn btn-primary self-center w-xs" disabled={creatingBox || !newBoxId.trim() || hasBoxWithId(newBoxId)}>
          <Plus/> Add
          { creatingBox && (
            <span className="loading loading-spinner loading-sm"></span>
          )}
        </button>
    </form>
  )
}