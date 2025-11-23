import React from 'react';

export const DirectionalDerivativeDiagram = () => {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <title>Concept Diagram: Directional Derivative</title>
       <defs>
        <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#0074D9" /></marker>
        <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2ECC40" /></marker>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#FF4136" /></marker>
        <marker id="arrowBlack" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#666" /></marker>
      </defs>
      
      <text x="600" y="60" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">The Directional Derivative: Dᵤf = ∇f · u</text>
      <g transform="translate(600, 450)">
        {/* Background Contours (Linear for simplicity in this zoom view) */}
        <line x1="-500" y1="-200" x2="500" y2="-200" stroke="#DDD" strokeWidth="2"/> <text x="510" y="-200" fill="#999">f=30</text>
        <line x1="-500" y1="0" x2="500" y2="0" stroke="#DDD" strokeWidth="2"/> <text x="510" y="0" fill="#999">f=20 (Contour Line)</text>
        <line x1="-500" y1="200" x2="500" y2="200" stroke="#DDD" strokeWidth="2"/> <text x="510" y="200" fill="#999">f=10</text>
        {/* Point P */}
        <circle cx="0" cy="0" r="8" fill="#333"/>
        <text x="-30" y="-20" fontSize="24" fontWeight="bold">P</text>
        {/* The Gradient Vector (Upwards, perpendicular to contour) */}
        <line x1="0" y1="0" x2="0" y2="-250" stroke="#0074D9" strokeWidth="6" markerEnd="url(#arrowBlue)"/>
        <text x="20" y="-260" fontSize="24" fontWeight="bold" fill="#0074D9">∇f (Gradient)</text>
        <text x="20" y="-230" fontSize="18" fill="#0074D9">Max Increase Direction</text>
        {/* Direction u1 (Aligned with gradient) */}
        <g>
             <line x1="0" y1="0" x2="0" y2="-150" stroke="#2ECC40" strokeWidth="4" markerEnd="url(#arrowGreen)" strokeDasharray="5,5"/>
             <text x="-40" y="-160" fontSize="20" fill="#2ECC40" fontWeight="bold">u₁</text>
             <text x="160" y="-100" fontSize="18" fill="#2ECC40">Dᵤ₁f = |∇f||u₁|cos(0) = Max Positive</text>
        </g>
        {/* Direction u2 (Perpendicular, along contour) */}
         <g>
             <line x1="0" y1="0" x2="150" y2="0" stroke="#FF851B" strokeWidth="4" markerEnd="url(#arrowRed)" strokeDasharray="5,5"/>
             <text x="160" y="30" fontSize="20" fill="#FF851B" fontWeight="bold">u₂</text>
             <text x="160" y="60" fontSize="18" fill="#FF851B">Dᵤ₂f = ∇f · u₂ = 0 (No Change)</text>
             {/* Right angle marker */}
             <polyline points="0,-20 20,-20 20,0" fill="none" stroke="#333" strokeWidth="2"/>
        </g>
         {/* Direction u3 (General angle) */}
         <g>
             <line x1="0" y1="0" x2="-106" y2="106" stroke="#AAAAAA" strokeWidth="4" markerEnd="url(#arrowBlack)" strokeDasharray="5,5"/> {/* 135 degrees */}
             <text x="-130" y="130" fontSize="20" fill="#666" fontWeight="bold">u₃</text>
             <text x="-350" y="100" fontSize="18" fill="#666">Dᵤ₃f = ∇f · u₃ &lt; 0 (Decreasing)</text>
             
             {/* Angle theta */}
             <path d="M 0 -50 A 50 50 0 0 0 -35 -35" fill="none" stroke="#666" strokeWidth="2"/>
             <text x="-20" y="-60" fontSize="18" fill="#666">θ</text>
        </g>
      </g>
      {/* Formula Interpretation */}
      <rect x="50" y="650" width="1100" height="100" fill="#F4F7FB" stroke="#CCE5FF" rx="10"/>
      <text x="600" y="700" fontSize="20" textAnchor="middle" fill="#333">
        Interpretation: The slope in direction <tspan fontWeight="bold">u</tspan> is the projection of the gradient onto that direction.
      </text>
       <text x="600" y="730" fontSize="20" textAnchor="middle" fontFamily="Times New Roman" fill="#333">
        D<tspan dy="5">u</tspan><tspan dy="-5">f = |∇f| cos(θ)</tspan>
      </text>
    </svg>
  );
};

