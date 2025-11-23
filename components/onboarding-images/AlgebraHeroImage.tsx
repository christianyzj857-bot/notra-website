import React from 'react';

export const AlgebraHeroImage = () => {
  const width = 1200;
  const height = 800;
  const originX = width / 2;
  const originY = height / 2;
  const scale = 40; // 1 unit = 40px

  // Helper to map math coordinates to SVG coordinates
  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * scale;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#F9F9F9', fontFamily: 'Arial, sans-serif' }}>
      <title>Algebra: Linear Equations on a Coordinate Plane</title>
      
      {/* Background Grid */}
      <g stroke="#E0E0E0" strokeWidth="1">
        {Array.from({ length: width / scale }).map((_, i) => (
          <line key={`grid-x-${i}`} x1={i * scale} y1={0} x2={i * scale} y2={height} />
        ))}
        {Array.from({ length: height / scale }).map((_, i) => (
          <line key={`grid-y-${i}`} x1={0} y1={i * scale} x2={width} y2={i * scale} />
        ))}
      </g>

      {/* Axes */}
      <g stroke="#333" strokeWidth="3" markerEnd="url(#arrow)">
        <line x1={50} y1={originY} x2={width - 50} y2={originY} /> {/* X Axis */}
        <line x1={originX} y1={height - 50} x2={originX} y2={50} /> {/* Y Axis */}
      </g>
      <text x={width - 40} y={originY + 30} fontSize="24" fontWeight="bold">x</text>
      <text x={originX - 40} y={60} fontSize="24" fontWeight="bold">y</text>

      {/* Definitions for markers */}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#333" />
        </marker>
      </defs>

      {/* Line 1: y = 2x + 3 (Blue, Positive Slope) */}
      <g stroke="#0074D9" strokeWidth="4" fill="none">
        <line x1={mapX(-5)} y1={mapY(2 * -5 + 3)} x2={mapX(5)} y2={mapY(2 * 5 + 3)} />
        <text x={mapX(2)} y={mapY(2 * 2 + 3) - 20} fontSize="20" fill="#0074D9" fontWeight="bold">y = 2x + 3</text>
        
        {/* Slope Triangle Annotation */}
        <g strokeWidth="2" strokeDasharray="5,5">
          <line x1={mapX(0)} y1={mapY(3)} x2={mapX(1)} y2={mapY(3)} />
          <line x1={mapX(1)} y1={mapY(3)} x2={mapX(1)} y2={mapY(5)} />
          <text x={mapX(0.5)} y={mapY(3) + 20} fontSize="16" fill="#0074D9">run (+1)</text>
          <text x={mapX(1) + 10} y={mapY(4)} fontSize="16" fill="#0074D9">rise (+2)</text>
        </g>
         {/* Y-intercept Annotation */}
         <circle cx={mapX(0)} cy={mapY(3)} r="6" fill="#0074D9"/>
         <text x={mapX(0) - 140} y={mapY(3)} fontSize="16" fill="#0074D9">y-intercept (b=3)</text>
      </g>

      {/* Line 2: y = -x + 5 (Red, Negative Slope) */}
      <g stroke="#FF4136" strokeWidth="4" fill="none">
        <line x1={mapX(-5)} y1={mapY(-1 * -5 + 5)} x2={mapX(8)} y2={mapY(-1 * 8 + 5)} />
        <text x={mapX(5)} y={mapY(-5) - 20} fontSize="20" fill="#FF4136" fontWeight="bold">y = -x + 5</text>
      </g>

      {/* Line 3: y = 0.5x - 2 (Green, Gentle Slope) */}
      <g stroke="#2ECC40" strokeWidth="4" fill="none">
        <line x1={mapX(-8)} y1={mapY(0.5 * -8 - 2)} x2={mapX(8)} y2={mapY(0.5 * 8 - 2)} />
        <text x={mapX(-6)} y={mapY(0.5 * -6 - 2) - 20} fontSize="20" fill="#2ECC40" fontWeight="bold">y = 0.5x - 2</text>
      </g>

      {/* Main Title */}
      <text x="60" y="60" fontSize="36" fontWeight="bold" fill="#333">Algebra: Linear Equations</text>
      <text x="60" y="100" fontSize="24" fill="#666">Visualizing y = mx + b</text>
    </svg>
  );
};

