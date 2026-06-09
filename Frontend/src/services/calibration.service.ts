export default interface ICalibrationStatus {
  calibrated: boolean
  ready: boolean
  message: string
}

export const calibrateBackground = () => post('calibrate/background')


export const calibrateMin = () => post('calibrate/min')


export const calibrateMax = () => post('calibrate/max')


const post = async (route: string): Promise<ICalibrationStatus> => {
  const res = await fetch(`http://localhost:8000/api/coordinates/${route}`, { method: 'POST' })
  return res.json()
}