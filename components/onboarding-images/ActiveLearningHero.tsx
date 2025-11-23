import React from 'react';

export const ActiveLearningHero = () => {
  const orange = "#FF8C00";
  const blue = "#4A90E2";
  const green = "#50C878";
  const cream = "#FFFBF0";

  // Simple student icon component
  const StudentIcon = ({ x, y, color, mode }: { x: number, y: number, color: string, mode: 'think' | 'pair' | 'share' | 'none' }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="20" fill={color} />
      <circle cx="0" cy="-25" r="12" fill={color} /> {/* Head */}
      {mode === 'think' && (
        <g transform="translate(20, -40)">
           <path d="M0,0 Q10,-10 20,0 T40,0 T50,-10 L50,10 L0,10 Z" fill="#FFF" stroke={color}/>
           <text x="25" y="5" fontSize="14" textAnchor="middle" fill={color}>...</text>
        </g>
      )}
      {mode === 'pair' && (
         <path d="M 25 -10 L 55 -10" stroke={color} strokeWidth="2" markerEnd="url(#arrowPair)" markerStart="url(#arrowPairRev)"/>
      )}
    </g>
  );

  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: cream, fontFamily: 'Comic Sans MS, Arial, sans-serif' }}>
      <title>Active Learning Strategy: Think-Pair-Share Flow</title>
      
      <text x="600" y="60" fontSize="36" fontWeight="bold" textAnchor="middle" fill="#333">Active Learning in Action: Think-Pair-Share</text>
      <defs>
          <marker id="arrowBig" markerWidth="20" markerHeight="20" refX="15" refY="6" orient="auto">
              <path d="M0,0 L0,12 L18,6 z" fill="#999" />
          </marker>
           <marker id="arrowPair" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={blue} /></marker>
           <marker id="arrowPairRev" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M9,0 L9,6 L0,3 z" fill={blue} /></marker>
      </defs>
      {/* Main Container Layout with 3 distinct zones */}
      <g transform="translate(50, 150)">
          
          {/* ZONE 1: THINK (Individual) */}
          <g transform="translate(0, 0)">
              <rect x="0" y="0" width="300" height="500" rx="20" fill="#FFF" stroke={orange} strokeWidth="3" strokeDasharray="10,5"/>
              <text x="150" y="40" fontSize="28" fontWeight="bold" textAnchor="middle" fill={orange}>1. THINK</text>
              <text x="150" y="70" fontSize="18" textAnchor="middle" fill="#666">Individual reflection time</text>
              
              {/* Scattered Students thinking */}
              <StudentIcon x={80} y={150} color={orange} mode="think" />
              <StudentIcon x={220} y={200} color={orange} mode="think" />
              <StudentIcon x={100} y={350} color={orange} mode="think" />
              <StudentIcon x={200} y={450} color={orange} mode="think" />
          </g>
          {/* Transition Arrow 1 */}
          <path d="M 320 250 L 380 250" stroke="#999" strokeWidth="5" markerEnd="url(#arrowBig)"/>
          {/* ZONE 2: PAIR (Collaboration) */}
          <g transform="translate(400, 0)">
              <rect x="0" y="0" width="300" height="500" rx="20" fill="#FFF" stroke={blue} strokeWidth="3"/>
              <text x="150" y="40" fontSize="28" fontWeight="bold" textAnchor="middle" fill={blue}>2. PAIR</text>
              <text x="150" y="70" fontSize="18" textAnchor="middle" fill="#666">Discuss with a partner</text>
              {/* Paired Students interacting */}
              <g transform="translate(50, 150)"> <StudentIcon x={0} y={0} color={blue} mode="pair" /> <StudentIcon x={80} y={0} color={blue} mode="pair" /> </g>
              <g transform="translate(150, 280)"> <StudentIcon x={0} y={0} color={blue} mode="pair" /> <StudentIcon x={80} y={0} color={blue} mode="pair" /> </g>
              <g transform="translate(70, 420)"> <StudentIcon x={0} y={0} color={blue} mode="pair" /> <StudentIcon x={80} y={0} color={blue} mode="pair" /> </g>
          </g>
          {/* Transition Arrow 2 */}
          <path d="M 720 250 L 780 250" stroke="#999" strokeWidth="5" markerEnd="url(#arrowBig)"/>
          {/* ZONE 3: SHARE (Whole Class) */}
          <g transform="translate(800, 0)">
              <rect x="0" y="0" width="300" height="500" rx="20" fill="#FFF" stroke={green} strokeWidth="3"/>
              <text x="150" y="40" fontSize="28" fontWeight="bold" textAnchor="middle" fill={green}>3. SHARE</text>
              <text x="150" y="70" fontSize="18" textAnchor="middle" fill="#666">Share insights with class</text>
              {/* Teacher and larger group view */}
              <rect x="100" y="120" width="100" height="20" fill="#333"/> {/* Whiteboard/Screen */}
              <circle cx="150" cy="180" r="25" fill={green}/> <text x="150" y="220" textAnchor="middle">Teacher</text>
              
              {/* Students facing front */}
              <g transform="translate(40, 300)">
                  <StudentIcon x={0} y={0} color={green} mode="none" />
                  <StudentIcon x={60} y={0} color={green} mode="none" />
                  <StudentIcon x={120} y={0} color={green} mode="none" />
                  <StudentIcon x={180} y={0} color={green} mode="none" />
              </g>
              <g transform="translate(70, 400)">
                   {/* Student sharing with hand up */}
                   <g>
                    <StudentIcon x={90} y={0} color={green} mode="none" />
                    <line x1="110" y1="-25" x2="130" y2="-50" stroke={green} strokeWidth="3"/>
                    <path d="M130,-60 Q150,-80 170,-60 T200,-60" fill="#FFF" stroke={green}/>
                    <text x="165" y="-55" fontSize="14" textAnchor="middle" fill={green}>&quot;We thought...&quot;</text>
                   </g>
              </g>
          </g>
      </g>
    </svg>
  );
};

