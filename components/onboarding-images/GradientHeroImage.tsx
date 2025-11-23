import React from 'react';

export const GradientHeroImage = () => {
  const width = 1200;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2 + 50;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#F0F2F5', fontFamily: 'Arial, sans-serif' }}>
      <title>Multivariable Calculus: Gradients and Level Curves</title>
      
      <text x="60" y="60" fontSize="32" fontWeight="bold" fill="#333">Multivariable Gradients: ∇f(x,y)</text>
      <text x="60" y="100" fontSize="20" fill="#555">Gradient vectors point in the direction of steepest ascent.</text>
      {/* Stylized "3D" Surface implied by color gradient background */}
      <defs>
        <radialGradient id="hillGradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <stop offset="0%" stopColor="#FF4136" stopOpacity="0.8"/> {/* Peak (Red) */}
          <stop offset="40%" stopColor="#FF851B" stopOpacity="0.6"/>
          <stop offset="80%" stopColor="#0074D9" stopOpacity="0.4"/> {/* Base (Blue) */}
          <stop offset="100%" stopColor="#F0F2F5" stopOpacity="0"/>
        </radialGradient>
        <marker id="arrowYellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#FFDC00" stroke="#B38B00" strokeWidth="1"/>
        </marker>
      </defs>
      
      <rect x="0" y="0" width={width} height={height} fill="url(#hillGradient)" opacity="0.5"/>
      {/* Contour Plot Layer (The x-y plane view) */}
      <g transform={`translate(${centerX}, ${centerY})`}>
        {/* Level Curves (Contours) */}
        {[50, 100, 160, 230, 310].map((r, i) => (
          <g key={r}>
            <ellipse cx="0" cy="0" rx={r*1.2} ry={r*0.8} fill="none" stroke="#333" strokeWidth={2 - i*0.2} opacity="0.7" />
            <text x={r*1.2 + 10} y="0" fontSize="14" fill="#333">c = {10 - i*2}</text>
          </g>
        ))}
        
        {/* Gradient Vectors (Perpendicular to contours, pointing inward to peak) */}
        {/* Point 1: Steep area (inner contours) */}
        <g transform="translate(70, 45)">
             <line x1="0" y1="0" x2="-40" y2="-25" stroke="#FFDC00" strokeWidth="5" markerEnd="url(#arrowYellow)"/>
             <text x="-50" y="-40" fontSize="18" fontWeight="bold" fill="#B38B00">∇f (Steep)</text>
        </g>
        {/* Point 2: Shallow area (outer contours) */}
         <g transform="translate(-250, -160)">
             <line x1="0" y1="0" x2="25" y2="15" stroke="#FFDC00" strokeWidth="3" markerEnd="url(#arrowYellow)"/>
             <text x="35" y="25" fontSize="18" fill="#B38B00">∇f (Shallow)</text>
        </g>
        {/* Point 3: Another angle */}
        <g transform="translate(100, -200)">
             <line x1="0" y1="0" x2="-20" y2="40" stroke="#FFDC00" strokeWidth="3" markerEnd="url(#arrowYellow)"/>
        </g>
        <circle cx="0" cy="0" r="5" fill="#FF4136"/>
        <text x="10" y="20" fontSize="16" fontWeight="bold" fill="#FF4136">Local Max</text>
      </g>
      {/* Formula Box */}
      <rect x="850" y="50" width="300" height="120" rx="10" fill="#FFF" stroke="#333" strokeWidth="2"/>
      <text x="1000" y="110" fontSize="28" fontFamily="Times New Roman" textAnchor="middle">
          ∇f = ⟨ <tspan fontStyle="italic">∂f/∂x</tspan>, <tspan fontStyle="italic">∂f/∂y</tspan> ⟩
      </text>
    </svg>
  );
};

