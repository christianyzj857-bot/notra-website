import React from 'react';

export const LearningStrategiesDiagram = () => {
  const energeticRed = "#E74C3C";
  const activeOrange = "#F39C12";
  const passiveGray = "#95A5A6";

  // Helper for flowchart boxes
  const FlowBox = ({ x, y, title, icon }: { x: number, y: number, title: string, icon: string }) => (
    <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width="220" height="120" rx="10" fill="#FFF" stroke={activeOrange} strokeWidth="3"/>
        <text x="110" y="35" fontSize="30" textAnchor="middle">{icon}</text>
        <text x="110" y="70" fontSize="18" fontWeight="bold" textAnchor="middle" fill={activeOrange}>
            {title.split('\n').map((line, i) => <tspan key={i} x="110" dy={i*20}>{line}</tspan>)}
        </text>
    </g>
  );

  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <title>Concept Diagram: Active Learning Flow &amp; Comparison</title>
      
      <defs>
          <marker id="arrowOrange" markerWidth="15" markerHeight="15" refX="12" refY="6" orient="auto">
              <path d="M0,0 L0,12 L18,6 z" fill={activeOrange} />
          </marker>
      </defs>
      
      {/* --- TOP SECTION: Active Learning Flowchart --- */}
      <text x="600" y="50" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">Active Learning Process Flow</text>
      
      <g transform="translate(100, 100)">
          <FlowBox x={0} y={0} title="Problem\nPresentation" icon="❓" />
          <line x1="230" y1="60" x2="290" y2="60" stroke={activeOrange} strokeWidth="4" markerEnd="url(#arrowOrange)"/>
          
          <FlowBox x={300} y={0} title="Peer\nInstruction" icon="👥" />
           <line x1="530" y1="60" x2="590" y2="60" stroke={activeOrange} strokeWidth="4" markerEnd="url(#arrowOrange)"/>

          <FlowBox x={600} y={0} title="Collaborative\nProjects" icon="🛠️" />
           <line x1="830" y1="60" x2="890" y2="60" stroke={activeOrange} strokeWidth="4" markerEnd="url(#arrowOrange)"/>

          <FlowBox x={900} y={0} title="Reflection &amp;\nSynthesis" icon="🧠" />
      </g>

      {/* --- BOTTOM SECTION: Engagement Comparison --- */}
      <line x1="100" y1="300" x2="1100" y2="300" stroke="#EEE" strokeWidth="3"/>
      <text x="600" y="350" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#333">Engagement Comparison: Traditional vs. Active</text>

      <g transform="translate(100, 400)">
          
          {/* LEFT: Traditional Lecture (Passive) */}
          <g transform="translate(0, 0)">
              <rect x="0" y="0" width="450" height="350" rx="15" fill="#F8F9F9" stroke={passiveGray} strokeWidth="2"/>
              <text x="225" y="40" fontSize="24" fontWeight="bold" textAnchor="middle" fill={passiveGray}>Traditional Lecture</text>
              
              {/* Teacher talking at front */}
              <rect x="180" y="80" width="90" height="15" fill={passiveGray}/> {/* Podium */}
              <circle cx="225" cy="70" r="15" fill={passiveGray}/>
              <path d="M240,60 L260,50 M240,70 L265,70 M240,80 L260,90" stroke={passiveGray} strokeWidth="2"/> {/* Sound waves */}
              
              {/* Passive Students in rows */}
              <g fill={passiveGray} opacity="0.7">
                  {[0, 1, 2].map(row => (
                      [0, 1, 2, 3, 4].map(col => (
                          <g key={`${row}-${col}`} transform={`translate(${60 + col*80}, ${150 + row*60})`}>
                              <circle cx="0" cy="0" r="15"/>
                              <rect x="-15" y="15" width="30" height="20"/>
                              {/* Some sleeping zzz */}
                              {(row === 1 && col === 1) || (row === 2 && col === 3) ? <text x="15" y="-10" fontSize="14">zzz</text> : null}
                          </g>
                      ))
                  ))}
              </g>

              {/* Low Engagement Bar */}
              <text x="225" y="300" fontSize="18" textAnchor="middle" fill={passiveGray}>Engagement Level: Low</text>
              <rect x="100" y="310" width="250" height="20" rx="10" fill="#E0E0E0"/>
              <rect x="100" y="310" width="70" height="20" rx="10" fill={passiveGray}/>
          </g>

          {/* RIGHT: Active Learning (Energetic) */}
          <g transform="translate(550, 0)">
              <rect x="0" y="0" width="450" height="350" rx="15" fill="#FFF5E8" stroke={energeticRed} strokeWidth="2"/>
              <text x="225" y="40" fontSize="24" fontWeight="bold" textAnchor="middle" fill={energeticRed}>Active Learning</text>
              
              {/* Teacher circulating */}
              <circle cx="50" cy="200" r="15" fill={energeticRed}/> <text x="50" y="230" textAnchor="middle" fontSize="14" fill={energeticRed}>Teacher</text>

              {/* Active Student Groups */}
              <g fill={energeticRed}>
                  {/* Group 1 discussing */}
                  <g transform="translate(150, 120)">
                      <circle cx="0" cy="0" r="15"/> <circle cx="40" cy="0" r="15"/> <circle cx="20" cy="30" r="15"/>
                      <text x="20" y="-20" fontSize="20" textAnchor="middle">💬</text>
                  </g>
                   {/* Group 2 working at board */}
                  <g transform="translate(300, 120)">
                      <rect x="20" y="-20" width="60" height="40" fill="#FFF" stroke={energeticRed}/>
                      <circle cx="0" cy="10" r="15"/> <circle cx="90" cy="10" r="15"/>
                      <line x1="30" y1="0" x2="70" y2="0" stroke={energeticRed} strokeWidth="2"/>
                  </g>
                  {/* Group 3 hands on */}
                  <g transform="translate(220, 250)">
                      <circle cx="0" cy="0" r="15"/> <circle cx="50" cy="0" r="15"/>
                      <text x="25" y="-20" fontSize="20" textAnchor="middle">⚙️</text>
                  </g>
              </g>

              {/* High Engagement Bar */}
              <text x="225" y="300" fontSize="18" textAnchor="middle" fill={energeticRed}>Engagement Level: High!</text>
              <rect x="100" y="310" width="250" height="20" rx="10" fill="#E0E0E0"/>
              <rect x="100" y="310" width="230" height="20" rx="10" fill={energeticRed}/>
              <text x="360" y="325">⭐</text>
          </g>
      </g>
    </svg>
  );
};

