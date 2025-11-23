import React from 'react';

export const LinearAlgebraHeroImage = () => {
  const width = 1200;
  const height = 800;
  const originX = width / 2;
  const originY = height / 2;
  const scale = 80; // 1 unit = 80px
  // Matrix A = [[2, 1], [0, 3]]
  // Eigenvals: 2, 3. Eigenvecs: (1,0) and (1,1)
  
  const transform = (x: number, y: number) => {
    return { tx: 2 * x + 1 * y, ty: 0 * x + 3 * y };
  };
  const drawVector = (x: number, y: number, color: string, width = 4, label = "") => {
    const x2 = originX + x * scale;
    const y2 = originY - y * scale;
    return (
      <g>
        <line x1={originX} y1={originY} x2={x2} y2={y2} stroke={color} strokeWidth={width} markerEnd={`url(#arrow${color.replace('#','')})`} />
        {label && <text x={x2 + 10} y={y2 - 10} fontSize="20" fontWeight="bold" fill={color}>{label}</text>}
      </g>
    );
  };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FDFDFD', fontFamily: 'Arial, sans-serif' }}>
      <title>Linear Algebra: Eigenvalues and Eigenvectors</title>
      
      {/* Definitions for colored arrows */}
      <defs>
        {['0074D9', 'FF4136', '2ECC40'].map(color => (
          <marker key={color} id={`arrow${color}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={`#${color}`} />
          </marker>
        ))}
         <marker id="arrow333" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
          </marker>
      </defs>
      {/* Background Grid */}
      <g stroke="#EFEFEF" strokeWidth="2">
        {Array.from({ length: 15 }).map((_, i) => {
          const offset = (i - 7) * scale;
          return (
            <g key={i}>
              <line x1={originX + offset} y1={0} x2={originX + offset} y2={height} />
              <line x1={0} y1={originY + offset} x2={width} y2={originY + offset} />
            </g>
          );
        })}
      </g>
      {/* Axes */}
      <g stroke="#333" strokeWidth="3" markerEnd="url(#arrow333)">
        <line x1={50} y1={originY} x2={width - 50} y2={originY} />
        <line x1={originX} y1={height - 50} x2={originX} y2={50} />
      </g>
      {/* Title and Matrix */}
      <text x="50" y="60" fontSize="32" fontWeight="bold">Eigenvalues & Eigenvectors</text>
      <g transform="translate(50, 100)">
        <text fontSize="24" fontStyle="italic">Transformation A = </text>
        <text x="210" y="0" fontSize="24" fontFamily="Times New Roman">[ 2  1 ]</text>
        <text x="210" y="30" fontSize="24" fontFamily="Times New Roman">[ 0  3 ]</text>
      </g>
       <text x="50" y="200" fontSize="36" fontWeight="bold" fill="#2ECC40" fontFamily="Times New Roman">A·v = λ·v</text>
      {/* --- Standard Vector Transformation (Rotation + Stretch) --- */}
      {/* Original Vector x = (-1, 2) */}
      {drawVector(-1, 2, "#0074D9", 4, "x")}
      {/* Transformed Vector Ax = (0, 6) */}
      {drawVector(0, 6, "#FF4136", 4, "Ax")}
      <text x={originX - 150} y={originY - 200} fontSize="18" fill="#FF4136">Standard vectors change direction</text>
      {/* --- Eigenvector 1 (v1 = (2,0), λ1 = 2) --- */}
      {drawVector(2, 0, "#2ECC40", 6, "v₁")}
      {/* Av1 = (4,0) */}
      {drawVector(4, 0, "#2ECC40", 4, "Av₁ = 2v₁")}
      <text x={originX + 200} y={originY + 30} fontSize="18" fill="#2ECC40" fontWeight="bold">λ₁ = 2 (Stretched x2)</text>
      {/* --- Eigenvector 2 (v2 = (1,1), λ2 = 3) --- */}
      {drawVector(1, 1, "#2ECC40", 6, "v₂")}
      {/* Av2 = (3,3) */}
      {drawVector(3, 3, "#2ECC40", 4, "Av₂ = 3v₂")}
      <text x={originX + 250} y={originY - 250} fontSize="18" fill="#2ECC40" fontWeight="bold">λ₂ = 3 (Stretched x3)</text>
    </svg>
  );
};

