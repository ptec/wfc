import { useContext, useState } from "react";
import type { Participant } from "../../api/types";
import { POST } from "../../api/gas";
import { CircleAlert } from "lucide-react";
import { AppContext } from "../../App";

export default function CreateParticipant() {
  const { accessToken, participants, setParticipants } = useContext(AppContext);
  
  const [creatingParticipant , setCreatingParticipant ] = useState(false);

  const [newParticipantId    , setNewParticipantId    ] = useState("");
  const [newParticipantStatus, setNewParticipantStatus] = useState("approved");

  function isAvailableParticipantId() {
    const id = newParticipantId.trim().toLowerCase();
    return (
      id.length > 0 &&
      participants.findIndex(p => p.id === id) === -1
    );
  }

  async function createParticipant(id: string, status: Participant["status"]) {
    if (creatingParticipant)
      return;

    setCreatingParticipant(true);

    POST({
      action: "createParticipant",
      accessToken,
      id,
      status,
    })
    .then(participant => {
      // update participants
      setParticipants(participants => {
        return [...participants, participant]
      });
    })
    .catch(e => alert(e.stack))
    .finally(() => setCreatingParticipant(false))
  }

  return (
    <div className="flex flex-col rounded-lg border shadow-lg p-4 m-4 gap-1 w-sm">
      <span className="font-semibold text-2xl">New Participant</span>
      <span className="italic">Register a new participant</span>

      <label className="label">
        <span className="label-text">Unique Id</span>
      </label>
      <input className="input" type="text" value={newParticipantId} onChange={e => setNewParticipantId(e.target.value)} />
      
      <label className="label">
        <span className="label-text">Permission</span>
      </label>
      <select className="select" value={newParticipantStatus} onChange={e => setNewParticipantStatus(e.target.value)}>
        <option value="approved"><span className="badge badge-success">Approved</span></option>
        <option value="denied"><span className="badge badge-warning">Denied</span></option>
      </select>

      <button className="btn btn-primary mt-4" disabled={creatingParticipant || !isAvailableParticipantId()} onClick={() => createParticipant(newParticipantId, newParticipantStatus as any)}>
        Register Participant

        { creatingParticipant && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>

      { !!newParticipantId.trim() && !isAvailableParticipantId() && (
        <div className="badge badge-soft badge-error self-center">
          <CircleAlert size={14}/> <span className="whitespace-nowrap text-nowrap truncate max-w-3xs">Participant Id '{newParticipantId.trim().toLowerCase()}' is unavailable.</span>
        </div>
      )}
    </div>
  )
}