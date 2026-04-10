import { useState, useEffect, useRef } from "react"
import Header from "./components/Header.tsx"
import ThreeView from "./components/ThreeView.tsx"
import type { ThreeViewHandle } from "./components/ThreeView.tsx"
import ConsoleView from "./components/ConsoleView.tsx"
import * as service from "./services/coordinate.service.ts"
import type coord from "./services/coordinate.service.ts"

import "./App.css"

const App: React.FC = () => {
  const threeRef = useRef<ThreeViewHandle>(null)
  const [dataView, setDataView] = useState<coord[]>([])
  const [scale, setScale] = useState<number | null>(null)

  // poll getScale until we get a value
  useEffect(() => {
    if (scale !== null) return

    const pollScale = setInterval(() => {
      const s = service.getScale()
      if (s) {
        setScale(s)
        threeRef.current?.setScale(s)
        clearInterval(pollScale)
      }
    }, 1000)

    return () => clearInterval(pollScale)
  }, [scale])

  // once scale is known, start polling coordinates
  useEffect(() => {
    if (scale === null) return

    const updatePosition = async () => {
      try {
        const currentCoord = await service.getLatestPosition()
        setDataView(prevData => [...prevData, currentCoord])

        if (threeRef.current) {
          threeRef.current.updateTargetPosition(currentCoord.x, currentCoord.y, currentCoord.z)
        }
      } catch (error) {
        console.error("Error updating coordinates:", error)
      }
    }

    const intervalId = setInterval(updatePosition, 1000)
    return () => clearInterval(intervalId)
  }, [scale])

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