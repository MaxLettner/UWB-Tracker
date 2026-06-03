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
  const [dataView, setDataView] = useState<(ICoord[] | string)[]>([])

  const updatePosition = async () => {
    try {
      const currentCoords = await service.getLatestPositions()
      setDataView(prevData => [...prevData, currentCoords])

      if (threeRef.current) {
        threeRef.current.updateTargetPosition(currentCoords)
      }
    } catch(error) {
      console.error("Error updating coordinates:", error)
    }
  }

  useEffect(() => {
    const intervalId = setInterval(updatePosition, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="app">
      <Header />
      <div className="main">
        <ThreeView ref={threeRef} />
        <ConsoleView data={dataView} />
      </div>
    </div>
  )
}

export default App