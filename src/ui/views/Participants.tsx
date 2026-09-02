import { Ban, Search, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { POST } from "../../api/gas";
import type { Participant } from "../../api/types";
import { AppContext } from "../../App";
import LastModified from "../components/LastModified";
import ParticipantStatus from "../components/ParticipantStatus";

function isApproved(participant: Participant) {
  return participant.status.trim().toLowerCase() === "approved";
}

export default function Participants() {

  const { accessToken, participants, setParticipants, fetchingParticipants } = useContext(AppContext);


  const [filter              , setFilter              ] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const [updatingParticipant , setUpdatingParticipant ] = useState("");


  useEffect(() => {
    setFilteredParticipants(() => participants.filter(p => (
      p.id    .trim().toLowerCase().includes(filter.trim().toLowerCase()) ||
      p.status.trim().toLowerCase().includes(filter.trim().toLowerCase())
    )))
  }, [filter, participants])


  async function updateParticipant(updateId: string, status: Participant["status"], transactionId: string) {
    if (updatingParticipant)
      return;

    setUpdatingParticipant(updateId);

    POST({
      action: "updateParticipant",
      accessToken,
      id: updateId,
      status,
      transactionId,
    })
    .then(participant => {
      // update participants
      setParticipants(participants => {
        const newParticipants = [...participants];
        const i = newParticipants.findIndex(({id}) => id === participant.id);
        if (i !== -1) newParticipants[i] = participant;
        return newParticipants;
      })
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingParticipant(""))
  }

  async function revokeParticipant(revokeId: string, transactionId: string) {
    return updateParticipant(revokeId, "revoked", transactionId);
  }

  async function deleteParticipant(deleteId: string, transactionId: string) {
    if (updatingParticipant)
      return;

    setUpdatingParticipant(deleteId);

    POST({
      action: "deleteParticipant",
      accessToken,
      id: deleteId,
      transactionId,
    })
    .then(participant => {
      // update participants
      setParticipants(participants => {
        const newParticipants = [...participants];
        const i = newParticipants.findIndex(({id}) => id === participant.id);
        if (i !== -1) newParticipants.splice(i, 1);
        return newParticipants;
      })
    })
    .catch(e => alert(e.message))
    .finally(() => setUpdatingParticipant(""))
  }

  return (
    <div className="flex flex-col p-4 m-4 rounded-lg border shadow-lg">
      <span className="font-bold text-xl">Participants</span>
      <table>
        <thead>
          <tr>
            <td colSpan={4}>
              <div className="flex justify-center items-center p-2">
                <label className="input">
                  <Search size={14} />
                  <input type="search" className="grow" placeholder="Filter Participants" value={filter} onChange={e => setFilter(e.target.value)} />
                </label>
              </div>
            </td>
          </tr>
          <tr>
            <th className="text-center">Participant Id</th>
            <th className="text-center">Status        </th>
            <th className="text-center">Last Modified </th>
            <th className="text-center">Controls      </th>
          </tr>
        </thead>
        <tbody>
          {filteredParticipants.map(participant => (
            <tr key={participant.id} className="hover:bg-base-300">
              <td className="text-center">
                <div className="flex justify-center items-center">
                  <span>{participant.id}</span>
                </div>
              </td>
              <td>
                <div className="flex justify-center">
                  <ParticipantStatus  participant={participant}/>                  
                </div>
              </td>
              <td>
                <div className="flex justify-center"><LastModified date={participant.lastModified}/></div>
              </td>

              <td>
                <div className="flex justify-center items-center gap-1">
                  <div className="tooltip">
                    <div className="tooltip-content">
                      { isApproved(participant) && (
                        <span>Revoke permission</span>
                      )}

                      {!isApproved(participant) && (
                        <span>Permission is {participant.status}</span>
                      )}
                    </div>
                    <button className="btn btn-warning btn-ghost btn-circle btn-sm m-1" disabled={!!updatingParticipant || !isApproved(participant)} onClick={() => revokeParticipant(participant.id, participant.transactionId)}>
                      <Ban size={14} />
                    </button>
                  </div>
                  <div className="tooltip">
                    <div className="tooltip-content">
                      <span>Delete Participant</span>
                    </div>
                    <button className="btn btn-error btn-ghost btn-circle m-1" disabled={!!updatingParticipant} onClick={() => deleteParticipant(participant.id, participant.transactionId)}>
                      <Trash size={14} />
                    </button>
                  </div>
                  { participant.id === updatingParticipant && <span className="loading loading-spinner loading-sm"></span> }
                  { participant.id !== updatingParticipant && <span className="loading loading-spinner loading-sm invisible"></span> }
                </div>
              </td>
            </tr>
          ))}

        </tbody>
      </table>

      { filteredParticipants.length === 0 && !fetchingParticipants && (
        <div className="flex justify-center items-center">
          <span className="italic">There are no participants yet, try creating a new participant to get started!</span>
        </div>
      )}

      { filteredParticipants.length === 0 && fetchingParticipants && (
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      )}
    </div>
  )
}