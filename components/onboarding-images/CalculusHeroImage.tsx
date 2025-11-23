import React from 'react';

export const CalculusHeroImage = () => {
  const width = 1200;
  const height = 800;
  
  // Coordinate mapping for a shifted origin suitable for Q1 emphasis
  const mapX = (x: number) => 100 + x * 100;
  const mapY = (y: number) => 700 - y * 100;
  // The function f(x) = 0.5 * x^2
  const f = (x: number) => 0.5 * x * x;
  const x_pt = 3;
  const h_val = 3;
  const xh_pt = x_pt + h_val;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FAFAFA', fontFamily: 'Georgia, serif' }}>
      <title>Calculus: Definition of the Derivative</title>
      {/* Background Grid & Axes */}
       <g stroke="#E0E0E0" strokeWidth="1">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`grid-x-${i}`} x1={mapX(i)} y1={mapY(0)} x2={mapX(i)} y2={mapY(6)} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`grid-y-${i}`} x1={mapX(0)} y1={mapY(i)} x2={mapX(9)} y2={mapY(i)} />
        ))}
      </g>
      <g stroke="#333" strokeWidth="2">
        <line x1={mapX(0)} y1={mapY(0)} x2={mapX(9)} y2={mapY(0)} markerEnd="url(#arrow)"/> {/* X */}
        <line x1={mapX(0)} y1={mapY(0)} x2={mapX(0)} y2={mapY(6)} markerEnd="url(#arrow)"/> {/* Y */}
      </g>
      {/* The Curve f(x) */}
      <path d={`M ${mapX(0)} ${mapY(f(0))} Q ${mapX(4.5)} ${mapY(f(9)*0.2)} ${mapX(9)} ${mapY(f(9))}`} stroke="#6A0DAD" strokeWidth="4" fill="none"/>
      <text x={mapX(8)} y={mapY(f(8))} fontSize="20" fill="#6A0DAD" fontWeight="bold">y = f(x)</text>
      {/* Secant Line Concept */}
      <g>
          {/* Points P and Q */}
          <circle cx={mapX(x_pt)} cy={mapY(f(x_pt))} r="6" fill="#333"/>
          <text x={mapX(x_pt)-25} y={mapY(f(x_pt))-15} fontSize="18">P</text>
          
          <circle cx={mapX(xh_pt)} cy={mapY(f(xh_pt))} r="6" fill="#333" opacity="0.6"/>
          <text x={mapX(xh_pt)+10} y={mapY(f(xh_pt))-10} fontSize="18" opacity="0.6">Q</text>
          {/* Dashed projection lines */}
          <line x1={mapX(x_pt)} y1={mapY(0)} x2={mapX(x_pt)} y2={mapY(f(x_pt))} stroke="#999" strokeDasharray="5,5"/>
          <line x1={mapX(xh_pt)} y1={mapY(0)} x2={mapX(xh_pt)} y2={mapY(f(xh_pt))} stroke="#999" strokeDasharray="5,5"/>
          <line x1={mapX(0)} y1={mapY(f(x_pt))} x2={mapX(x_pt)} y2={mapY(f(x_pt))} stroke="#999" strokeDasharray="5,5"/>
          <line x1={mapX(0)} y1={mapY(f(xh_pt))} x2={mapX(xh_pt)} y2={mapY(f(xh_pt))} stroke="#999" strokeDasharray="5,5"/>
          {/* Labels on axes */}
          <text x={mapX(x_pt)} y={mapY(0)+25} fontSize="18" textAnchor="middle">x</text>
          <text x={mapX(xh_pt)} y={mapY(0)+25} fontSize="18" textAnchor="middle">x + h</text>
          <text x={mapX(0)-10} y={mapY(f(x_pt))} fontSize="18" textAnchor="end">f(x)</text>
          <text x={mapX(0)-10} y={mapY(f(xh_pt))} fontSize="18" textAnchor="end">f(x+h)</text>
          {/* The Secant Line */}
          <line x1={mapX(x_pt)} y1={mapY(f(x_pt))} x2={mapX(xh_pt)} y2={mapY(f(xh_pt))} stroke="#FF851B" strokeWidth="2" strokeDasharray="10,5"/>
          <text x={mapX(xh_pt)+20} y={mapY(f(xh_pt))+40} fontSize="18" fill="#FF851B">Secant Line (Average Rate)</text>
           {/* Indicating 'h' and rise */}
           <line x1={mapX(x_pt)} y1={mapY(0)+10} x2={mapX(xh_pt)} y2={mapY(0)+10} stroke="#555" markerEnd="url(#arrow)" markerStart="url(#arrowRev)"/>
           <text x={mapX(x_pt + h_val/2)} y={mapY(0)+35} fontSize="18" textAnchor="middle" fontStyle="italic">h</text>
      </g>
       {/* The Tangent Line (The Goal) */}
      <line x1={mapX(1)} y1={mapY(f(x_pt) - 2 * (3-1))} x2={mapX(6)} y2={mapY(f(x_pt) + 2 * (6-3))} stroke="#FF4136" strokeWidth="4"/>
      <text x={mapX(1)} y={mapY(0)} fontSize="20" fill="#FF4136" fontWeight="bold">Tangent Line at P (Instantaneous Rate)</text>
      {/* Main Formula Display */}
      <rect x="750" y="100" width="400" height="200" rx="10" fill="#FFF" stroke="#6A0DAD" strokeWidth="2"/>
      <text x="950" y="150" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#333">The Derivative Definition</text>
      <text x="950" y="220" fontSize="36" textAnchor="middle" fill="#6A0DAD" fontFamily="Times New Roman, serif">
        f'(x) = lim
        <tspan dy="15" fontSize="18">h→0</tspan>
        <tspan dy="-15" dx="10"> [ </tspan>
        <tspan dy="-20" fontSize="28">f(x+h) - f(x)</tspan>
        <tspan dy="40" dx="-140">h</tspan>
        <tspan dy="-20" dx="10"> ] </tspan>
      </text>
       <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#333" /></marker>
        <marker id="arrowRev" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M9,0 L9,6 L0,3 z" fill="#333" /></marker>
      </defs>
    </svg>
  );
};

