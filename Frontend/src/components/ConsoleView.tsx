import React from 'react'
import type ICoord from "../services/coordinate.service"
import '../styles/ConsoleView.css'

interface Props {
  data: ICoord[][]
}

const ConsoleView = ({ data }: Props) => {
  return (
    <div className='consoleView'>
      {data.map((e, outerIndex) =>
        e.map((c, innerIndex) => (
          <React.Fragment key={`${outerIndex}-${innerIndex}`}>
            {innerIndex === 0 ? '>' : '\u00A0'} X: {c.x.toFixed(2)} Y: {c.y.toFixed(2)} Z: {c.z.toFixed(2)} Time: {c.timestamp.slice(11,19)}<br />
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default ConsoleView
