import { useState, useEffect, useRef } from "react"
import Header from "./components/Header.tsx"
import ThreeView from "./components/ThreeView.tsx"
import type { ThreeViewHandle } from "./components/ThreeView.tsx"
import ConsoleView from "./components/ConsoleView.tsx"
import * as service from "./services/coordinate.service.ts"
import type ICoord from "./services/coordinate.service.ts"

import "./App.css"

const App: React.FC = () => {
  const threeRef = useRef<ThreeViewHandle>(null)
  const [log, setLog] = useState<(ICoord[] | string)[]>([])

  const updateConsole = async () => {
    try {
      const currentCoords = await service.getCurrentCoords()
      setLog(prevData => [...prevData, currentCoords])
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

  useEffect(() => {
    service.setOnMessageReceived(updateVisual)
    const intervalId = setInterval(updateConsole, 1000)
    return () => clearInterval(intervalId)
  }, [])

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
