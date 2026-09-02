import React, { useContext } from "react";
import type { Box } from "../../api/types";
import BoxStatus from "../components/BoxStatus";
import { AppContext } from "../../App";

export const Receipt = React.forwardRef<HTMLDivElement, { box: Box }>(({ box }, ref) => {

  const { defaultPricePerBar } = useContext(AppContext);

  return (
    <div ref={ref} className="flex flex-col justify-center items-center">
      <div className="w-[120mm] flex flex-col border border-black border-dashed p-2 gap-2 font-mono">
        
        <div className="flex flex-row items-center border border-black p-2">
          <span className="w-full text-center font-semibold">PTEC - World's Finest Chocolate Fundraiser</span>
        </div>

        <div className="flex flex-row justify-between items-center">
          <span>Box {box.id}</span>
          <BoxStatus box={box}/>
        </div>
          
        <table>
          <tbody>
            <tr>
              <td>Returned By</td>
              <td>{box.returnedBy || box.borrowedBy}</td>
            </tr>
            <tr>
              <td>Returned On</td>
              <td>{new Date(box.lastModified).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Initial Balance</td>
              <td><input type="text" defaultValue={`$${(box.initialCount * defaultPricePerBar).toFixed(2)}`}/></td>
            </tr>
            <tr>
              <td>Paid</td>
              <td><input type="text" defaultValue={`$${((box.initialCount - box.currentCount) * defaultPricePerBar).toFixed(2)}`}/></td>
            </tr>
            <tr>
              <td>Current Balance</td>
              <td><input type="text" defaultValue={`$${(box.currentCount * defaultPricePerBar).toFixed(2)}`}/></td>
            </tr>

            <tr>
              <td colSpan={2}>
                <span className="italic mt-2 flex justify-center">Thank you for your participation!</span>
              </td>
            </tr>

          </tbody>
        </table>
        
      </div>    
    </div>
  )
})