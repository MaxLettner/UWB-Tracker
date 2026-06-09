import { useState, useEffect, useRef } from "react"
import Header from "./components/Header.tsx"
import ThreeView from "./components/ThreeView.tsx"
import type { ThreeViewHandle } from "./components/ThreeView.tsx"
import ConsoleView from "./components/ConsoleView.tsx"
import * as coordinateService from "./services/coordinate.service.ts"
import * as calibrationService from "./services/calibration.service.ts"
import type ICoord from "./services/coordinate.service.ts"

import "./App.css"

const App: React.FC = () => {
  const threeRef = useRef<ThreeViewHandle>(null)
  const [log, setLog] = useState<(ICoord[] | string)[]>([])

  const updateConsole = async () => {
    try {
      const currentCoords = await coordinateService.getCurrentCoords()
      appendLog(currentCoords)
    } catch(error) {
      console.error("Error updating coordinates in console:", error)
    }
  }

  const updateVisual = (currentCoords: ICoord[]) => {
    try {
      if (threeRef.current) {
        threeRef.current.updateTargetPosition(currentCoords)
      }
    } catch(error) {
      console.error("Error updating coordinates visually:", error)
    }
  }

  const runCalibration = async () => {
    const steps = [
      calibrationService.calibrateBackground,
      calibrationService.calibrateMin,
      calibrationService.calibrateMax,
    ]

    for (const step of steps) {
      const status = await step()
      appendLog(status.message)
      if (!status.ready) return
    }

    appendLog("All calibrations complete. Streaming...")
  }

  useEffect(() => {
  coordinateService.setOnMessageReceived(updateVisual)
  const intervalRef = { id: 0 }

  runCalibration().then(() => {
    intervalRef.id = setInterval(updateConsole, 1000)
  })

  return () => clearInterval(intervalRef.id)
}, [])

  const appendLog = (entry: ICoord[] | string) => setLog(prev => [...prev, entry])

  return (
    <div className="app">
      <Header />
      <div className="main">
        <ThreeView ref={threeRef} />
        <ConsoleView data={log} />
      </div>
    </div>
  )
}

export default App
