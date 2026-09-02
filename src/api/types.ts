export type Box = {
  id           : string,
  status       : "checked-in" | "checked-out" | "missing",
  initialCount : number,
  currentCount : number,
  borrowedBy   : string,
  returnedBy   : string,
  lastModified : string,
  transactionId: string
}

export type Participant = {
  id           : string,
  status       : "approved" | "revoked" | "denied",
  lastModified : string,
  transactionId: string
}

export type Transaction = {
  id           : string,
  who          : string,
  when         : string,
  action       : string,
  arguments    : string
}