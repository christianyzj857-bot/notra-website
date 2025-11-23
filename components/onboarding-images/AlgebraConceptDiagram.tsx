import React from 'react';

export const AlgebraConceptDiagram = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <title>Concept Diagram: Slope and Y-Intercept</title>
      {/* Main Header */}
      <text x="600" y="60" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">Understanding the Linear Equation: y = mx + b</text>

      {/* Context: Real World Example */}
      <g transform="translate(100, 150)">
        <rect x="0" y="0" width="1000" height="550" rx="20" fill="#F4F7FB" stroke="#CCE5FF" strokeWidth="2"/>
        <text x="500" y="40" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#0056b3">Real-World Example: Distance vs. Time</text>
        <text x="500" y="70" fontSize="18" textAnchor="middle" fill="#555">Scenario: A car starts 10 miles from home and travels at a constant speed of 30 mph.</text>

        {/* Graph Area */}
        <g transform="translate(100, 450)">
            {/* Axes */}
            <line x1="0" y1="0" x2="800" y2="0" stroke="#333" strokeWidth="3"/> {/* X Axis (Time) */}
            <line x1="0" y1="0" x2="0" y2="-350" stroke="#333" strokeWidth="3"/> {/* Y Axis (Distance) */}
            <text x="820" y="10" fontSize="18" fontWeight="bold">Time (hours) [x]</text>
            <text x="-20" y="-370" fontSize="18" fontWeight="bold" textAnchor="end">Distance (miles) [y]</text>
            
            {/* The Line representing y = 30x + 10 */}
            {/* Let's scale it: x axis 1 unit = 150px, y axis 10 units = 50px */}
            <line x1="0" y1="-50" x2="600" y2="-350" stroke="#0074D9" strokeWidth="5" strokeLinecap="round"/>
            
            {/* Y-Intercept (b) Annotation */}
            <circle cx="0" cy="-50" r="8" fill="#FF4136"/>
            <g transform="translate(20, -50)">
                <line x1="0" y1="0" x2="50" y2="0" stroke="#FF4136" strokeWidth="2" markerEnd="url(#arrowRed)"/>
                <rect x="60" y="-30" width="220" height="60" rx="5" fill="#FFF" stroke="#FF4136"/>
                <text x="70" y="-10" fontSize="16" fontWeight="bold" fill="#FF4136">y-intercept (b)</text>
                <text x="70" y="15" fontSize="14" fill="#333">Starting Point: 10 miles</text>
            </g>

            {/* Slope (m) Annotation */}
            <g transform="translate(300, -200)">
                {/* Rise/Run Triangle */}
                <line x1="0" y1="0" x2="150" y2="0" stroke="#2ECC40" strokeWidth="2" strokeDasharray="5,5"/> {/* Run */}
                <line x1="150" y1="0" x2="150" y2="-150" stroke="#2ECC40" strokeWidth="2" strokeDasharray="5,5"/> {/* Rise */}
                
                <text x="75" y="25" fontSize="16" textAnchor="middle" fill="#2ECC40">run = +1 hr</text>
                <text x="165" y="-75" fontSize="16" fill="#2ECC40">rise = +30 miles</text>
                
                {/* Label Box */}
                 <rect x="180" y="-180" width="280" height="80" rx="5" fill="#FFF" stroke="#2ECC40"/>
                 <text x="195" y="-155" fontSize="18" fontWeight="bold" fill="#2ECC40">Slope (m) = Rate of Change</text>
                 <text x="195" y="-130" fontSize="16" fill="#333">m = rise / run = 30 / 1</text>
                 <text x="195" y="-110" fontSize="16" fill="#333" fontWeight="bold">Speed = 30 mph</text>
            </g>
             <text x="620" y="-350" fontSize="22" fontWeight="bold" fill="#0074D9">Equation: y = 30x + 10</text>
        </g>
      </g>
       <defs>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#FF4136" />
        </marker>
      </defs>
    </svg>
  );
};

