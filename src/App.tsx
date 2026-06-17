import { useState, useEffect, useRef } from "react"
import Header from "./components/Header.tsx"
import ThreeView from "./components/ThreeView.tsx"
import type { ThreeViewHandle } from "./components/ThreeView.tsx"
import ConsoleView from "./components/ConsoleView.tsx"
import * as coordinateService from "./services/coordinate.service.ts"
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

  useEffect(() => {
    //giving the function to the service so it can execute it with eventlistener
    coordinateService.setOnMessageReceived(updateVisual)

    const intervalId = setInterval(updateConsole, 1000)

    return () => clearInterval(intervalId)
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
