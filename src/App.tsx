import { createContext, useEffect, useState } from "react";
import { GET } from "./api/gas";
import type { Box, Participant } from "./api/types";
import Page from "./ui/components/Page";
import BorrowBox from "./ui/views/BorrowBox";
import Boxes from "./ui/views/Boxes";
import CreateParticipant from "./ui/views/CreateParticipant";
import Login from "./ui/views/Login";
import Participants from "./ui/views/Participants";
import ReturnBox from "./ui/views/ReturnBox";

export const AppContext = createContext( {
  accessToken : ""                 , setAccessToken   : (() => {}) as React.Dispatch<React.SetStateAction<string>>,
  participants: [] as Participant[], setParticipants  : (() => {}) as React.Dispatch<React.SetStateAction<Participant[]>>,
  boxes       : [] as Box[]        , setBoxes         : (() => {}) as React.Dispatch<React.SetStateAction<Box        []>>,
  fetchingParticipants: false, setFetchingParticipants: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  fetchingBoxes       : false, setFetchingBoxes       : (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  fetchingDefaults    : false, setFetchingDefaults    : (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  defaultPricePerBar  : 0, setDefaultPricePerBar    : (() => {}) as React.Dispatch<React.SetStateAction<number>>,
  defaultInitialCount : 0, setDefaultInitialCount   : (() => {}) as React.Dispatch<React.SetStateAction<number>>,
})

export default function App() {
  const [accessToken , setAccessToken ] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [boxes       , setBoxes       ] = useState<Box        []>([]);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const [fetchingBoxes       , setFetchingBoxes       ] = useState(false);
  const [fetchingDefaults    , setFetchingDefaults    ] = useState(false);
  const [defaultPricePerBar  , setDefaultPricePerBar  ] = useState(0);
  const [defaultInitialCount , setDefaultInitialCount ] = useState(0);

  async function getDefaults() {
    if (fetchingDefaults)
      return;

    setFetchingDefaults(true);

    return GET({
      action: "getDefaults",
      accessToken,
    })
    .catch(e => alert(e.message))
    .finally(() => setFetchingDefaults(false))
  }

  async function getParticipants() {
    if (fetchingParticipants) 
      return;

    setFetchingParticipants(true);

    return GET({
      action: "getParticipants",
      accessToken,
    })
    .catch(e => alert(e.stack))
    .finally(() => setFetchingParticipants(false))
  }

  async function getBoxes() {
    if (fetchingBoxes) 
      return;

    setFetchingBoxes(true);

    return GET({
      action: "getBoxes",
      accessToken,
    })
    .catch(e => alert(e.message))
    .finally(() => setFetchingBoxes(false))
  }

  useEffect(() => {
    if (!accessToken)
      return;

    getParticipants().then(setParticipants)
    getBoxes       ().then(setBoxes       )
    getDefaults    ().then(({initialCount, pricePerBar}) => {
      setDefaultInitialCount(initialCount)
      setDefaultPricePerBar (pricePerBar )
    })
  }, [accessToken])

  return (
    <AppContext.Provider value={{
      accessToken         , setAccessToken         ,
      participants        , setParticipants        ,
      boxes               , setBoxes               ,
      fetchingParticipants, setFetchingParticipants,
      fetchingBoxes       , setFetchingBoxes       ,
      fetchingDefaults    , setFetchingDefaults    ,
      defaultPricePerBar  , setDefaultPricePerBar  ,
      defaultInitialCount , setDefaultInitialCount ,
    }}>
      { !accessToken && <Login /> }

      { !!accessToken && (fetchingBoxes || fetchingParticipants || fetchingDefaults) && (
        <Page className="justify-center items-center">
            <span className="loading loading-spinner loading-xl"></span>
        </Page>
      )}

      { !!accessToken && !fetchingBoxes && !fetchingParticipants && !fetchingDefaults && (
        <div className="tabs tabs-box flex w-full">
          <input type="radio" name="wfc" className="tab" aria-label="Dashboard" defaultChecked />
          <div className="tab-content">

          </div>

          <input type="radio" name="wfc" className="tab" aria-label="Check Out" />
          <div className="tab-content">
            <div className="flex justify-center items-center">
              <BorrowBox />
            </div>
          </div>

          <input type="radio" name="wfc" className="tab" aria-label="Check In" />
          <div className="tab-content">
            <div className="flex justify-center items-center">
              <ReturnBox />
            </div>
          </div>

          <input type="radio" name="wfc" className="tab" aria-label="Inventory" />
          <div className="tab-content">
            <div className="flex flex-col self-start">
              {/* <CreateBox /> */}
              <Boxes />
            </div>
          </div>

          <input type="radio" name="wfc" className="tab" aria-label="Participants" />
          <div className="tab-content">
            <div className="flex flex-col">
              <CreateParticipant />
              <Participants />
            </div>
          </div>
        </div>
      )}

    </AppContext.Provider>
  )
}