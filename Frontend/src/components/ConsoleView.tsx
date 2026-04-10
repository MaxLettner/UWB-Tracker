import React from 'react'
import type coord from "../services/coordinate.service"
import '../styles/ConsoleView.css'


interface Props{
  data: coord[]
}

const ConsoleView = ({data}: Props) => {
  return (
    <div className='consoleView'>
      {data.map((c, index) => {
        
        return <React.Fragment key={index}>&gt; X: {c.x.toFixed(2)} Y: {c.y.toFixed(2)} Z: {c.z.toFixed(2)} Time: {c.timestamp.slice(11, 23)}<br/></React.Fragment>
      })}
    </div>
  );
};

export default ConsoleView
