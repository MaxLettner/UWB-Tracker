import '../styles/Header.css'
import * as calibrationService from '../services/calibration.service'
import { useState, useEffect } from 'react';
import type ICoord from '../services/coordinate.service';

interface Props {
  appendLog: (entry: (ICoord[] | string)) => void
}

const Header = ({appendLog}: Props) => {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(2)

  useEffect(() => {
    calibrationService.calibrateMin(0).then((res) => appendLog(res.message))
    calibrationService.calibrateMax(2).then((res) => appendLog(res.message))
  }, [])

  const handleMinChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setMin(value)
    calibrationService.calibrateMin(value).then((res) => appendLog(res.message))
  }

  const handleMaxChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setMax(value)
    calibrationService.calibrateMax(value).then((res) => appendLog(res.message))
  }

  return (
    <div className="header">
      <header className="header__title">
        UWB-Tracker
      </header>
      <div className="header__controls">
        <div className="header__field">
          <label className="header__label">Min distance</label>
          <input
            className="header__input"
            type="number"
            value={min}
            onChange={handleMinChange}
            placeholder="min"
            min={0}
            step={0.5}
          />
        </div>
        <div className="header__field">
          <label className="header__label">Max distance</label>
          <input
            className="header__input"
            type="number"
            value={max}
            onChange={handleMaxChange}
            placeholder="max"
            min={0}
            step={0.5}
          />
        </div>
      </div>
    </div>
  );
};

export default Header
