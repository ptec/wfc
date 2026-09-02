import { Check, Receipt as ReceiptIcon, Search, Trash, TriangleAlert } from "lucide-react";
import { useContext, useEffect, useState, useRef } from "react";
import { POST } from "../../api/gas";
import type { Box } from "../../api/types";
import { AppContext } from "../../App";
import BoxStatus from "../components/BoxStatus";
import LastModified from "../components/LastModified";
import { useReactToPrint } from "react-to-print";
import { Receipt } from "./Receipt";

export default function Boxes() {

  const { accessToken, boxes, setBoxes } = useContext(AppContext);

  const [filter        , setFilter        ] = useState("");
  const [filteredBoxes , setFilteredBoxes ] = useState(boxes);
  const [completedBoxes, setCompletedBoxes] = useState(false);

  const [updatingBox, setUpdatingBox] = useState("");
  const [receiptBox , setReceiptBox ] = useState<Box | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  function getBoxWithId(id: string) {
    return boxes.find(box => box.id === id.trim().toUpperCase());
  }

  function hasBoxWithId(id: string) {
    return getBoxWithId(id) !== undefined;
  }

  function deleteBox(deleteId: string, transactionId: string) {
    if (updatingBox)
      return;

    setUpdatingBox(deleteId);

    POST({
      action: "deleteBox",
      accessToken,
      id: deleteId,
      transactionId,
    })
    .then(box => {
      // update boxes
      setBoxes(boxes => {
        const newBoxes = [...boxes];
        const i = newBoxes.findIndex(({id}) => id === box.id);
        if (i !== -1) newBoxes.splice(i, 1);
        return newBoxes;
      })
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingBox(""))
  }

  function updateBox(updateId: string, status: Box["status"], currentCount: number, borrowedBy: string, returnedBy: string, transactionId: string) {
    if (updatingBox)
      return;

    setUpdatingBox(updateId);

    POST({
      action: "updateBox",
      accessToken,
      id: updateId,
      status,
      currentCount,
      borrowedBy,
      returnedBy,
      transactionId,
    })
    .then(box => {
      // update boxes
      setBoxes(boxes => {
        const newBoxes = [...boxes];
        const i = newBoxes.findIndex(({id}) => id === box.id);
        if (i !== -1) newBoxes[i] = box;
        return newBoxes;
      })
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingBox(""))
  }

  function missingBox(boxId: string, transactionId: string) {
    const box = getBoxWithId(boxId);

    if (!box)
      return alert(`Box with id '${boxId}' does not exist.`);

    return updateBox(boxId, "missing", box.currentCount, box.borrowedBy, box.returnedBy, transactionId);
  }

  function printReceipt(box: Box) {
    setReceiptBox(box);
  }

  const __printReceipt__ = useReactToPrint({
    contentRef   : receiptRef,
    documentTitle: "Receipt",
    onAfterPrint() {
      setReceiptBox(null);
    }
  })

  useEffect(() => {
    if (receiptBox)
      __printReceipt__();
  }, [receiptBox])

  useEffect(() => {
    setFilteredBoxes(boxes
      .filter(b => !completedBoxes || b.currentCount === 0)
      .filter(b => (
        b.id        .trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
        b.status    .trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
        b.borrowedBy.trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
        b.returnedBy.trim().toLowerCase().includes(filter.trim().toLowerCase())
      )))
  }, [filter, boxes, completedBoxes])

  return (
    <div className="flex flex-col p-4 m-4 rounded-lg border shadow-lg">
      <span className="font-bold text-xl">Boxes</span>
      <table>
        <thead>
          <tr>
            <td colSpan={8}>
              <div className="flex justify-center items-center p-2 gap-2">
                <label className="input">
                  <Search size={14} />
                  <input type="search" className="grow" placeholder="Filter Boxes" value={filter} onChange={e => setFilter(e.target.value)} />
                </label>

                <label className="cursor-pointer mx-4 self-center flex gap-1 items-center rounded-lg p-2 border border-dashed border-success bg-success/15 text-success">
                  <input type="checkbox" className="checkbox checkbox-success" checked={completedBoxes} onChange={e => setCompletedBoxes(e.target.checked)} />
                  <span>Show completed boxes only</span>
                </label>
              </div>
            </td>
          </tr>
          <tr>
            <th className="text-center">Box Id       </th>
            <th className="text-center">Status       </th>
            <th className="text-center">Initial Count</th>
            <th className="text-center">Current Count</th>
            <th className="text-center">Borrowed By  </th>
            <th className="text-center">Returned By  </th>
            <th className="text-center">Last Modified</th>
            <th className="text-center">Controls     </th>
          </tr>
        </thead>
        <tbody>
          {filteredBoxes.map(box => (
            <tr key={box.id} className="hover:bg-base-300">
              <td className="text-center font-mono">{box.id}</td>
              <td>
                <div className="flex justify-center items-center">
                  <BoxStatus box={box}/>
                </div>
              </td>
              <td className="text-center">{box.initialCount}</td>
              <td className="text-center">{box.currentCount}</td>
              <td className="text-center">{box.borrowedBy || "-"}</td>
              <td className="text-center">{box.returnedBy || "-"}</td>
              <td>
                <div className="flex justify-center items-center">
                  <LastModified date={box.lastModified} />
                </div>
              </td>
              <td>
                <div className="flex justify-center">

                  <div className="tooltip">
                    <div className="tooltip-content">
                      {!(!box.returnedBy || box.currentCount === box.initialCount) && <span>Print receipt</span>}
                      { (!box.returnedBy || box.currentCount === box.initialCount) && <span>Receipt is unavailable</span>}
                    </div>
                    <div className="flex justify-center">
                      <button className="btn btn-success btn-ghost btn-circle btn-sm m-1" disabled={!box.returnedBy || box.currentCount === box.initialCount} onClick={() => printReceipt(box)}>
                        <ReceiptIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="tooltip">
                    <div className="tooltip-content">
                      {box.status !== "missing" && box.currentCount !== 0 && <span>Flag as Missing</span>}
                      {box.status !== "missing" && box.currentCount === 0 && <span>Box is completed</span>}
                      {box.status === "missing" && <span>Box is already missing</span>}
                    </div>
                    <div className="flex justify-center">
                      <button className="btn btn-warning btn-ghost btn-circle btn-sm m-1" disabled={!!updatingBox || box.status === "missing" || box.currentCount === 0} onClick={() => missingBox(box.id, box.transactionId)}>
                        {box.currentCount === 0 && <Check size={14}/>}
                        {box.currentCount !== 0 && <TriangleAlert size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="tooltip">
                    <div className="tooltip-content">
                      <span>Delete Box</span>
                    </div>
                    <div className="flex justify-center">
                      <button className="btn btn-error btn-ghost btn-circle btn-sm m-1" disabled={!!updatingBox}>
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  { box.id === updatingBox && <span className="loading loading-spinner loading-sm"></span> }
                  { box.id !== updatingBox && <span className="loading loading-spinner loading-sm invisible"></span> }
                </div>
              </td>
            </tr>
          ))}

          { filteredBoxes.length === 0 && boxes.length !== 0 && (
            <tr>
              <td colSpan={8}>
                <div className="flex justify-center items-center">
                  <span className="italic">No boxes matching the search criteria were found.</span>
                </div>
              </td>
            </tr>
          )}

          { filteredBoxes.length === 0 && boxes.length === 0 && (
            <tr>
              <td colSpan={8}>
                <div className="flex justify-center items-center">
                  <span className="italic">There are no boxes yet, try creating a new box to get started!</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'none' }}>
        <div style={{ display: 'block' }}>
          {!!receiptBox && <Receipt ref={receiptRef} box={receiptBox} />}
        </div>
      </div>
    </div>
  )
}