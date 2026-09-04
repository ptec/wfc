import { useContext } from "react";
import { AppContext } from "../../App";





export default function Dashboard() {
  const { boxes } = useContext(AppContext);

  const numberOfBoxesCompleted  = boxes.filter(box => box.status === "checked-in"  && box.currentCount === 0).length;
  const numberOfBoxesCheckedIn  = boxes.filter(box => box.status === "checked-in"  && box.currentCount >   0).length;
  const numberOfBoxesCheckedOut = boxes.filter(box => box.status === "checked-out").length;
  const numberOfBoxesMissing    = boxes.filter(box => box.status === "missing"    ).length;

  const numberOfBarsCompleted = boxes.reduce((sum, box) => {
    return sum + box.initialCount - box.currentCount
  }, 0)
  const numberOfBarsCheckedIn = boxes.reduce((sum, box) => {
    if (box.status === "checked-in" && box.currentCount > 0)
      return sum + box.currentCount
    return sum
  }, 0)
  const numberOfBarsCheckedOut = boxes.reduce((sum, box) => {
    if (box.status === "checked-out")
      return sum + box.currentCount
    return sum
  }, 0)
  const numberOfBarsMissing = boxes.reduce((sum, box) => {
    if (box.status === "missing")
      return sum + box.currentCount
    return sum
  }, 0)

  // @ts-ignore
  const numberOfBoxes = boxes.length;
  const numberOfBars  = boxes.reduce((sum, box) => {
    return sum + box.initialCount
  }, 0)

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 gap-4 w-fit">
        <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
          <span className="w-full text-2xl font-bold p-1 rounded-lg border border-success bg-success/15 text-success flex justify-center">
            Completed
          </span>
          <div className="w-full flex items-center justify-between text-success">
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBoxesCompleted}</p>
              <p className="text-sm">Boxes</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBarsCompleted}</p>
              <p className="text-sm">Bars</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{Math.round(numberOfBarsCompleted / numberOfBars * 100)}%</p>
              <p className="text-sm">of Total Inventory</p>
            </div>
          </div>
          <progress className="progress progress-success" value={numberOfBarsCompleted} max={numberOfBars}/>
        </div>
        <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
          <span className="w-full text-2xl font-bold p-1 rounded-lg border border-primary bg-primary/15 text-primary flex justify-center">
            Available
          </span>
          <div className="w-full flex items-center justify-between text-primary">
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBoxesCheckedIn}</p>
              <p className="text-sm">Boxes</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBarsCheckedIn}</p>
              <p className="text-sm">Bars</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{Math.round(numberOfBarsCheckedIn / numberOfBars * 100)}%</p>
              <p className="text-sm">of Total Inventory</p>
            </div>
          </div>
          <progress className="progress progress-primary" value={numberOfBarsCheckedIn} max={numberOfBars}/>
        </div>
        <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
          <span className="w-full text-2xl font-bold p-1 rounded-lg border border-info bg-info/15 text-info flex justify-center">
            Checked Out
          </span>
          <div className="w-full flex items-center justify-between text-info">
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBoxesCheckedOut}</p>
              <p className="text-sm">Boxes</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBarsCheckedOut}</p>
              <p className="text-sm">Bars</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{Math.round(numberOfBarsCheckedOut / numberOfBars * 100)}%</p>
              <p className="text-sm">of Total Inventory</p>
            </div>
          </div>
          <progress className="progress progress-info" value={numberOfBarsCheckedOut} max={numberOfBars}/>
        </div>
        <div className="w-100 h-50 bg-base-100 rounded-lg shadow-sm flex flex-col gap-1 p-8 items-center">
          <span className="w-full text-2xl font-bold p-1 rounded-lg border border-error bg-error/15 text-error flex justify-center">
            Missing
          </span>
          <div className="w-full flex items-center justify-between text-error">
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBoxesMissing}</p>
              <p className="text-sm">Boxes</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{numberOfBarsMissing}</p>
              <p className="text-sm">Bars</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-4xl font-bold">{Math.round(numberOfBarsMissing / numberOfBars * 100)}%</p>
              <p className="text-sm">of Total Inventory</p>
            </div>
          </div>
          <progress className="progress progress-error" value={numberOfBarsMissing} max={numberOfBars}/>
        </div>
      </div>
    </div>
  )
}