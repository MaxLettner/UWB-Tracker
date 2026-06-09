export default interface ICoord {
  x: number
  y: number
  z: number
  timestamp: string
}

let currentCoords: ICoord[] = []
let onMessageReceived: ((currentCoords: ICoord[]) => void) | null = null
const socket = new WebSocket('ws://localhost:8000/api/stream/coordinates')

socket.addEventListener('message', (event) => {
  currentCoords = JSON.parse(event.data)
  //currentCoords = [{ x: 0.5, y: 0.5, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }, { x: 0.3, y: 0.3, z: Math.random(), timestamp: '2026-02-20T17:56:56.939303+00:00' }]
  //just for testing

  console.log(currentCoords)

  if(onMessageReceived != null) {
    onMessageReceived(currentCoords)
  }
})

export const getCurrentCoords = (): ICoord[] => {
  return currentCoords;
}

export const setOnMessageReceived = (messageHandler: (currentCoords: ICoord[]) => void) => {
  onMessageReceived = messageHandler
}