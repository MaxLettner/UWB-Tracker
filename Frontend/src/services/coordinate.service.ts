export default interface ICoord {
  x: number
  y: number
  z: number
  timestamp: string
}

let onMessageReceived: ((currentCoords: ICoord[]) => void) | null = null
let currentCoords: ICoord[] = []

const socket = new WebSocket('ws://localhost:8000/api/stream/coordinates')

socket.addEventListener('message', (event) => {
  console.log(event.data)
  //currentCoords = JSON.parse(event.data)
  currentCoords = [{ x: 0.5, y: 0.5, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }, { x: 0.3, y: 0.3, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }]

  if(onMessageReceived != null) {
    onMessageReceived(currentCoords)
  }

  //console.log(currentCoords)
})

export const getCurrentCoords = (): ICoord[] => {
  return currentCoords;
  if (Math.random() < 0.5) return []
  return [{ x: 0.5, y: 0.5, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }, { x: 0.3, y: 0.3, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }]
}

export const setOnMessageReceived = (messageHandler: (currentCoords: ICoord[]) => void) => {
  onMessageReceived = messageHandler
}