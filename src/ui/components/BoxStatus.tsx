import type { Box } from "../../api/types"

export default function BoxStatus({ box }: { box: Box }) {
  switch(box.status) {
    case "missing"    : return <div className="font-semibold w-32 text-sm rounded-full border text-error bg-error/15 border-error flex justify-center">missing    </div>
    case "checked-in" : {
      if(box.currentCount <= 0)
        return <div className="font-semibold w-32 text-sm rounded-full border text-success bg-success/15 border-success flex justify-center">completed</div>

      if(box.currentCount < box.initialCount)
        return <div className="font-semibold w-32 text-sm rounded-full border text-warning bg-warning/15 border-warning flex justify-center">incomplete</div>

      if(box.currentCount === box.initialCount)
        return <div className="font-semibold w-32 text-sm rounded-full border text-primary bg-primary/15 border-primary flex justify-center">checked-in</div>
    } break;
    case "checked-out": return <div className="font-semibold w-32 text-sm rounded-full border text-info bg-info/15 border-info flex justify-center">checked-out</div>
  }
}