import React from 'react';

export const EigenDecompositionDiagram = () => {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <title>Concept Diagram: Matrix Diagonalization A = PDP⁻¹</title>
      
      <text x="600" y="60" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">Understanding Matrix Diagonalization: A = PDP⁻¹</text>
      {/* Main Equation Flow Header */}
      <g transform="translate(250, 150)">
          <text x="0" y="0" fontSize="48" fontWeight="bold" fontFamily="Times New Roman">
              <tspan fill="#333">A</tspan>
              <tspan dx="30"> = </tspan>
              <tspan dx="30" fill="#6A0DAD">P</tspan>
              <tspan dx="10" fill="#D81B60">D</tspan>
              <tspan dx="10" fill="#6A0DAD">P⁻¹</tspan>
          </text>
      </g>
      
      {/* Three stages visual container */}
      <g transform="translate(50, 250)">
        
        {/* Stage 1: The "P⁻¹" Step (Change to Eigenbasis) */}
        <g transform="translate(0, 0)">
            <rect x="0" y="0" width="300" height="300" fill="#F3E5F5" stroke="#6A0DAD" strokeWidth="2" rx="10"/>
            <text x="150" y="40" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#6A0DAD">Step 1: P⁻¹ (Rotate)</text>
            <text x="150" y="70" fontSize="16" textAnchor="middle" fill="#555">Change from standard basis</text>
            <text x="150" y="90" fontSize="16" textAnchor="middle" fill="#555">to eigenvector basis</text>
            
            {/* Visual: Standard grid rotating to skewed grid */}
            <g transform="translate(150, 200)">
                <line x1="-80" y1="0" x2="80" y2="0" stroke="#999" strokeWidth="2"/>
                <line x1="0" y1="-80" x2="0" y2="80" stroke="#999" strokeWidth="2"/>
                <path d="M -60 20 L 60 -20 M -20 -60 L 20 60" stroke="#6A0DAD" strokeWidth="3" markerEnd="url(#arrowPurple)"/>
                <text x="70" y="-20" fill="#6A0DAD" fontSize="14">v₁</text>
            </g>
        </g>
        <text x="330" y="150" fontSize="36" fill="#999">→</text>
        {/* Stage 2: The "D" Step (Scale along axes) */}
        <g transform="translate(360, 0)">
            <rect x="0" y="0" width="300" height="300" fill="#FCE4EC" stroke="#D81B60" strokeWidth="2" rx="10"/>
            <text x="150" y="40" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#D81B60">Step 2: D (Scale)</text>
            <text x="150" y="70" fontSize="16" textAnchor="middle" fill="#555">Scale along the new axes</text>
            <text x="150" y="90" fontSize="16" textAnchor="middle" fill="#555">by eigenvalues λ₁, λ₂</text>
             
             {/* Visual: Aligned grid stretching */}
             <g transform="translate(150, 200) rotate(-20)"> {/* Aligned with eigenbasis */}
                <line x1="-80" y1="0" x2="80" y2="0" stroke="#D81B60" strokeWidth="1" strokeDasharray="4,4"/>
                <line x1="0" y1="-80" x2="0" y2="80" stroke="#D81B60" strokeWidth="1" strokeDasharray="4,4"/>
                {/* Stretched vectors */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#D81B60" strokeWidth="4" markerEnd="url(#arrowPink)"/>
                <text x="110" y="0" fill="#D81B60" fontWeight="bold">λ₁</text>
                <line x1="0" y1="0" x2="0" y2="60" stroke="#D81B60" strokeWidth="4" markerEnd="url(#arrowPink)"/>
                 <text x="10" y="70" fill="#D81B60" fontWeight="bold">λ₂</text>
            </g>
        </g>
        <text x="690" y="150" fontSize="36" fill="#999">→</text>
         {/* Stage 3: The "P" Step (Rotate back) */}
        <g transform="translate(720, 0)">
            <rect x="0" y="0" width="300" height="300" fill="#F3E5F5" stroke="#6A0DAD" strokeWidth="2" rx="10"/>
            <text x="150" y="40" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#6A0DAD">Step 3: P (Rotate Back)</text>
            <text x="150" y="70" fontSize="16" textAnchor="middle" fill="#555">Change back to</text>
            <text x="150" y="90" fontSize="16" textAnchor="middle" fill="#555">standard coordinates</text>
             {/* Visual: Skewed, stretched grid returning to standard orientation but kept stretch */}
             <g transform="translate(150, 200)">
                 <line x1="-80" y1="0" x2="80" y2="0" stroke="#999" strokeWidth="2"/>
                <line x1="0" y1="-80" x2="0" y2="80" stroke="#999" strokeWidth="2"/>
                {/* Final transformed result shown in standard basis space */}
                <line x1="0" y1="0" x2="90" y2="-30" stroke="#333" strokeWidth="3" markerEnd="url(#arrowBlack)"/> 
                <text x="100" y="-30" fill="#333" fontWeight="bold">Ax</text>
            </g>
        </g>
      </g>
      
       {/* Matrix Definitions Footnote */}
       <g transform="translate(200, 650)">
           <rect x="0" y="0" width="800" height="120" fill="#FAFAFA" stroke="#DDD" rx="5"/>
           <text x="20" y="30" fontSize="18" fontWeight="bold">Matrix Definitions:</text>
           <text x="40" y="60" fontSize="16" fontFamily="Times New Roman">P = [v₁ v₂ ...] (Eigenvectors are columns)</text>
           <text x="40" y="90" fontSize="16" fontFamily="Times New Roman">D = diag(λ₁, λ₂, ...) (Eigenvalues on diagonal)</text>
       </g>
       <defs>
        <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#6A0DAD" /></marker>
        <marker id="arrowPink" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#D81B60" /></marker>
        <marker id="arrowBlack" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#333" /></marker>
      </defs>
    </svg>
  );
};

