import { useState, useEffect, useRef } from "react"
import Header from "./components/Header.tsx"
import ThreeView from "./components/ThreeView.tsx"
import type { ThreeViewHandle } from "./components/ThreeView.tsx"
import ConsoleView from "./components/ConsoleView.tsx"
import * as coordinateService from "./services/coordinate.service.ts"
//import * as calibrationService from "./services/calibration.service.ts"
import type ICoord from "./services/coordinate.service.ts"

import "./App.css"

const App: React.FC = () => {
  const threeRef = useRef<ThreeViewHandle>(null)
  const [log, setLog] = useState<(ICoord[] | string)[]>([])

  //updating the console is run on an intervall
  const updateConsole = async () => {
    try {
      const currentCoords = await coordinateService.getCurrentCoords()
      appendLog(currentCoords)
    } catch (error) {
      console.error("Error updating coordinates in console:", error)
    }
  }

  //updating the cube is run by eventlistener on websocket
  const updateVisual = (currentCoords: ICoord[]) => {
    try {
      if (threeRef.current) {
        threeRef.current.updateTargetPosition(currentCoords)
      }
    } catch (error) {
      console.error("Error updating coordinates visually:", error)
    }
  }

  //default calibration is run once at start
  // const runDefaultCalibration = async () => {
  //   appendLog((await calibrationService.calibrateMin(0.5)).message)
  //   appendLog((await calibrationService.calibrateMax(5)).message)
  // }

  useEffect(() => {
    //giving the function to the service so it can execute it with eventlistener
    coordinateService.setOnMessageReceived(updateVisual)
    //setting intervalId in a ref so its not reset upon rerender
    const intervalRef = { id: 0 }

    // runDefaultCalibration().then(() => {
    //   //after calibration is finished start the intervall to update the console
    //   intervalRef.id = setInterval(updateConsole, 1000)
    // })

    intervalRef.id = setInterval(updateConsole, 1000)

    return () => clearInterval(intervalRef.id)
  }, [])

  //.slice trims the list to the last 50 entries
  const appendLog = (entry: ICoord[] | string) => setLog(prev => [...prev, entry].slice(-50))

  return (
    <div className="app">
      <Header appendLog={appendLog} />
      <div className="main">
        <ThreeView ref={threeRef} />
        <ConsoleView data={log} />
      </div>
    </div>
  )
}

export default App
