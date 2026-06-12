export default interface ICoord {
  x: number
  y: number
  z: number
  timestamp: string
}

//only the last coord array is safed
let currentCoords: ICoord[] = []
let onMessageReceived: ((currentCoords: ICoord[]) => void) | null = null //is set from App.tsx to update the cube

const socket = new WebSocket('ws://localhost:8000/api/coordinates/stream')

socket.addEventListener('message', (event) => {
  currentCoords = JSON.parse(event.data)

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