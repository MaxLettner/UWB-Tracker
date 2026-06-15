export default interface ICalibrationStatus {
  calibrated: boolean
  message: string
}

export const calibrateMin = (dist: number) => post('calibrate/min/' + dist)

export const calibrateMax = (dist: number) => post('calibrate/max/' + dist)


const post = async (route: string): Promise<ICalibrationStatus> => {
  const res = await fetch(`/api/coordinates/${route}`, { method: 'POST' })
  return res.json()
}