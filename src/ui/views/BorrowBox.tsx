import { Eraser, ScanBarcode, Tag, UserRound } from "lucide-react";
import type { Box, Participant } from "../../api/types"
import { useContext, useEffect, useState } from "react";
import { POST } from "../../api/gas";
import { AppContext } from "../../App";
import ParticipantStatus from "../components/ParticipantStatus";

export default function BorrowBox() {
  const { accessToken, boxes, setBoxes, participants, setParticipants } = useContext(AppContext);

  const [boxQuery        , setBoxQuery        ] = useState("");
  const [participantQuery, setParticipantQuery] = useState("");

  const [boxOptions        , setBoxOptions        ] = useState<Box[]>([]);
  const [participantOptions, setParticipantOptions] = useState<Participant[]>([]);

  const [updatingBox, setUpdatingBox] = useState(false);

  function getBoxWithId(id: string) {
    return boxes.find(box => box.id === id.trim().toUpperCase());
  }

  function hasBoxWithId(id: string) {
    return getBoxWithId(id) !== undefined;
  }

  function getParticipantWithId(id: string) {
    return participants.find(participant => participant.id === id.trim().toLowerCase());
  }

  function hasParticipantWithId(id: string) {
    return getParticipantWithId(id) !== undefined;
  }

  async function borrowBox(borrowId: string, participantId: string) {
    if (updatingBox)
      return;

    const box = getBoxWithId(borrowId);

    if (!box)
      return alert(`Box with id '${borrowId}' does not exist.`);

    if (box.borrowedBy)
      return alert(`Box with id '${borrowId}' is already checked out to '${box.borrowedBy}'.`);
    
    if (!participantId.trim())
      return alert(`Participant id cannot be empty.`);    
    
    setUpdatingBox(true);

    const participant = getParticipantWithId(participantId)

    if (!participant) {
      await POST({
        action: "createParticipant",
        accessToken,
        id: participantId,
        status: "approved",
      })
      .then(participant => {
        setParticipants(participants => [...participants, participant])
      })
      .catch(e => alert(e.message))
    }

    return POST({
      action: "borrowBox",
      accessToken,
      id           : box.id           ,
      borrowedBy   : participantId    ,
      currentCount : box.currentCount ,
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

      alert(`Box with id '${box.id}' has been checked out to '${box.borrowedBy}'.`)
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingBox(false))
  }

  useEffect(() => {
    setBoxOptions(boxes.filter(box => (
      box.currentCount > 0 &&
      box.status === "checked-in" && 
      box.id.trim().toLowerCase().includes(boxQuery.trim().toLowerCase())
    )))
  }, [boxes, boxQuery])

  useEffect(() => {
    setParticipantOptions(participants.filter(participant => (
      participant.id.trim().toLowerCase().includes(participantQuery.trim().toLowerCase())
    )))
  }, [participants, participantQuery])

  return (
    <form autoComplete="off" className="flex flex-col p-4 m-4 rounded-lg border shadow-lg gap-1 w-sm" onSubmit={(e) => {
      e.preventDefault()
      borrowBox(boxQuery, participantQuery)
      setBoxQuery("")
      setParticipantQuery("")
    }}>
      <span className="text-2xl font-semibold">Borrow a Box</span>
      <span className="italic">Check out a box to a participant</span>
      <div className="dropdown self-center">
        <div className="join w-xs">
          <div tabIndex={0} role="button" className="grow">
            <label className="join-item input">
              <ScanBarcode/>
              <input type="text" className="grow" placeholder="Scan or enter a barcode" value={boxQuery} onChange={(e) => {
                setBoxQuery(e.target.value)
              }}/>
            </label>
          </div>
          <button className="join-item btn" type="button" onClick={() => {
            setBoxQuery("")
          }}><Eraser/></button>
        </div>
        <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
          { boxOptions.map(box => {
            return <li key={box.id}><a onClick={() => {
              setBoxQuery(box.id)
            }}><pre>{box.id}</pre> <span className="badge badge-primary">{box.currentCount}</span></a></li>
          })}
          { boxOptions.length === 0 && <li><a>No results</a></li> }
        </ul>
      </div>
      <div className="dropdown self-center">
        <div className="join w-xs">
          <div tabIndex={0} role="button" className="grow">
            <label className="join-item input">
              <UserRound/>
              <input type="text" className="grow" placeholder="Scan or enter a barcode" value={participantQuery} onChange={(e) => {
                setParticipantQuery(e.target.value)
              }}/>
            </label>
          </div>
          <button className="join-item btn" type="button" onClick={() => {
            setParticipantQuery("")
          }}><Eraser/></button>
        </div>
        <ul tabIndex={0} className="dropdown-content menu flex-nowrap bg-base-100 rounded-box z-1 w-full p-2 shadow-sm max-h-48 overflow-y-auto">
          { participantOptions.map(participant => {
            return <li key={participant.id}><a onClick={() => {
              setParticipantQuery(participant.id)
            }}><ParticipantStatus participant={participant}/> <pre>{participant.id}</pre></a></li>
          })}
          { participantOptions.length === 0 && <li><a>No results</a></li> }
        </ul>
      </div>

      {!!participantQuery.trim() && !hasParticipantWithId(participantQuery) && (
        <div>
          <label className="cursor-pointer self-center mx-4 flex gap-1 items-center rounded-lg p-2 border border-dashed border-primary bg-primary/15 text-primary">
            <input required type="checkbox" className="checkbox checkbox-primary"/>
            <span className="italic text-center">Participant <b>{participantQuery.trim().toLowerCase()}</b> does not exist. This id will be automatically registered and approved at checkout.</span>
          </label>
        </div>
      )}

      {!!participantQuery.trim() && hasParticipantWithId(participantQuery) && participants.find(p => p.id.trim().toLowerCase() === participantQuery.trim().toLowerCase())?.status === "approved" && (
        <div>
          <label className="cursor-pointer self-center mx-4 flex gap-1 items-center rounded-lg p-2 border border-dashed border-success bg-success/15 text-success">
            {/* <input required type="checkbox" className="checkbox checkbox-secondary"/> */}
            <span className="italic text-center">This participant has permission to borrow a box.</span>
          </label>
        </div>
      )}

      {!!participantQuery.trim() && hasParticipantWithId(participantQuery) && participants.find(p => p.id.trim().toLowerCase() === participantQuery.trim().toLowerCase())?.status !== "approved" && (
        <div>
          <label className="cursor-pointer self-center mx-4 flex gap-1 items-center rounded-lg p-2 border border-dashed border-error bg-error/15 text-error">
            {/* <input required type="checkbox" className="checkbox checkbox-secondary"/> */}
            <span className="italic text-center">This participant does not have permission to borrow a box.</span>
          </label>
        </div>
      )}

      { hasBoxWithId(boxQuery) && hasParticipantWithId(participantQuery) && !!boxes.find(box => box.borrowedBy === participantQuery.trim().toLowerCase()) && (
        <label className="cursor-pointer mx-4 self-center flex gap-1 items-center rounded-lg p-2 border border-dashed border-warning bg-warning/15 text-warning">
          <input required type="checkbox" className="checkbox checkbox-warning"/>
          <span className="italic text-center">This participant has at least one item already checked out to them.</span>
        </label>
      )}

      <button type="submit" className="btn btn-primary self-center w-xs"
        disabled={updatingBox || !boxQuery.trim() || !participantQuery.trim() || !hasBoxWithId(boxQuery) || (
          !!participantQuery.trim() && hasParticipantWithId(participantQuery) && getParticipantWithId(participantQuery)?.status !== "approved"
      )}>
        <Tag/> Check Out
        {updatingBox && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>
    </form>
  )
}