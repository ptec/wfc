import type { Participant } from "../../api/types"

export default function ParticipantStatus({ participant }: { participant: Participant }) {
  const status = participant.status.trim().toLowerCase();
  switch(status) {
    case "denied"  : return <div className="self-center font-semibold w-32 text-sm rounded-full border text-warning bg-warning/15 border-warning flex justify-center">denied  </div>
    case "revoked" : return <div className="self-center font-semibold w-32 text-sm rounded-full border text-error bg-error/15 border-error flex justify-center"      >revoked </div>
    case "approved": return <div className="self-center font-semibold w-32 text-sm rounded-full border text-success bg-success/15 border-success flex justify-center">approved</div>
  }
}