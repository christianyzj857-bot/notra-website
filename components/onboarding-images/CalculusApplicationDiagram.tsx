import React from 'react';

export const CalculusApplicationDiagram = () => {
  const width = 1200;
  const height = 800;
  const graphWidth = 900;
  const graphHeight = 200;
  const marginX = 150;
  
  // Helper for drawing the paths
  const timeScale = graphWidth / 10; // 0 to 10 seconds
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <title>Application of Derivatives: Position, Velocity, Acceleration</title>
      <text x="600" y="50" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">Derivatives in Motion Physics</text>
      {/* --- Graph 1: Position s(t) --- */}
      <g transform={`translate(${marginX}, 100)`}>
        <text x="-20" y={graphHeight/2} fontSize="18" fontWeight="bold" textAnchor="end" fill="#0074D9">Position s(t)</text>
        <line x1="0" y1={graphHeight} x2={graphWidth} y2={graphHeight} stroke="#333"/> {/* t-axis */}
        <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#333"/> {/* s-axis */}
        
        {/* Cubic Curve representing position moving forth and back */}
        <path d={`M 0 ${graphHeight-20} C ${timeScale*3} 0, ${timeScale*7} ${graphHeight}, ${graphWidth} ${graphHeight-150}`} fill="none" stroke="#0074D9" strokeWidth="4"/>
        
        {/* Highlights for critical points */}
        <circle cx={timeScale*2} cy={graphHeight-160} r="6" fill="#0074D9"/> {/* Peak */}
        <circle cx={timeScale*7.5} cy={graphHeight-40} r="6" fill="#0074D9"/> {/* Valley */}
      </g>
       {/* Connection Lines 1 -> 2 */}
       <g stroke="#999" strokeDasharray="5,5" strokeWidth="2">
           <line x1={marginX + timeScale*2} y1={100} x2={marginX + timeScale*2} y2={400} />
           <line x1={marginX + timeScale*7.5} y1={100} x2={marginX + timeScale*7.5} y2={400} />
       </g>
      {/* --- Graph 2: Velocity v(t) = s'(t) --- */}
      <g transform={`translate(${marginX}, 350)`}>
        <text x="-20" y={graphHeight/2} fontSize="18" fontWeight="bold" textAnchor="end" fill="#2ECC40">Velocity v(t) = s'(t)</text>
        <line x1="0" y1={graphHeight/2} x2={graphWidth} y2={graphHeight/2} stroke="#333"/> {/* t-axis (centered) */}
        <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#333"/> {/* v-axis */}
        
        {/* Parabolic Curve representing velocity (slope of position) */}
        {/* Starts positive, crosses 0 at s(t) peak, goes negative, crosses 0 at s(t) valley, goes positive */}
        <path d={`M 0 20 Q ${timeScale*4.75} ${graphHeight} ${graphWidth} 20`} fill="none" stroke="#2ECC40" strokeWidth="4"/>
        {/* Highlights zero crossings corresponding to peaks/valleys above */}
        <circle cx={timeScale*2} cy={graphHeight/2} r="6" fill="#2ECC40"/>
        <circle cx={timeScale*7.5} cy={graphHeight/2} r="6" fill="#2ECC40"/>
        <circle cx={timeScale*4.75} cy={graphHeight-10} r="6" fill="#2ECC40"/> {/* Vertex of velocity */}
        {/* Annotation */}
        <text x={graphWidth+20} y={graphHeight/2} fontSize="16" fill="#2ECC40">v(t) = 0 means stopped (turning point)</text>
      </g>
      {/* Connection Lines 2 -> 3 */}
       <g stroke="#999" strokeDasharray="5,5" strokeWidth="2">
           <line x1={marginX + timeScale*4.75} y1={350} x2={marginX + timeScale*4.75} y2={650} />
       </g>
      {/* --- Graph 3: Acceleration a(t) = v'(t) = s''(t) --- */}
      <g transform={`translate(${marginX}, 600)`}>
        <text x="-20" y={graphHeight/2} fontSize="18" fontWeight="bold" textAnchor="end" fill="#FF851B">Acceleration a(t) = v'(t)</text>
        <line x1="0" y1={graphHeight/2} x2={graphWidth} y2={graphHeight/2} stroke="#333"/> {/* t-axis (centered) */}
        <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#333"/> {/* a-axis */}
        
        {/* Linear Line representing acceleration (slope of velocity) */}
        {/* Velocity is concave up, so acceleration is increasing linearly */}
        <line x1="0" y1={graphHeight-20} x2={graphWidth} y2={20} stroke="#FF851B" strokeWidth="4"/>
         {/* Highlight zero crossing corresponding to velocity vertex */}
         <circle cx={timeScale*4.75} cy={graphHeight/2} r="6" fill="#FF851B"/>
         <text x={graphWidth+20} y={graphHeight/2} fontSize="16" fill="#FF851B">a(t) = 0 means max/min velocity</text>
      </g>
      {/* Common Time Axis Label */}
      <text x={width/2} y={height-20} fontSize="20" fontWeight="bold" textAnchor="middle">Time (t)</text>
    </svg>
  );
};

