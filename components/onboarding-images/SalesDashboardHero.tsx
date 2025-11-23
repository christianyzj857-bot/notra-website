import React from 'react';

export const SalesDashboardHero = () => {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#F5F7FA', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <title>Q2 Sales Report Dashboard – TechCorp</title>
      {/* Top Banner / Header */}
      <rect x="0" y="0" width="1200" height="100" fill="#FFFFFF"/>
      <text x="50" y="60" fontSize="32" fontWeight="bold" fill="#24292E">TechCorp: Q2 2024 Sales Performance</text>
      <g transform="translate(900, 30)">
          <text x="0" y="20" fontSize="16" fill="#586069">Total Revenue</text>
          <text x="0" y="50" fontSize="36" fontWeight="bold" fill="#24292E">$12.5M</text>
          <g transform="translate(140, 35)">
              <path d="M0,20 L10,0 L20,20 Z" fill="#28a745"/> {/* Up arrow */}
              <text x="25" y="20" fontSize="20" fontWeight="bold" fill="#28a745">+23% YoY</text>
          </g>
      </g>
      {/* Main Content Grid */}
      <g transform="translate(50, 130)">
          
          {/* Left Panel: Revenue Breakdown (Pie Chart) */}
          <rect x="0" y="0" width="400" height="400" rx="8" fill="#FFFFFF" filter="url(#shadow)"/>
          <text x="30" y="40" fontSize="20" fontWeight="bold" fill="#24292E">Revenue Breakdown by Segment</text>
          
          <g transform="translate(200, 220)">
              {/* Pie Chart Segments (Simplified approximation) */}
              <path d="M0,0 L130,0 A130,130 0 1,1 -65,-112 Z" fill="#0056b3"/> {/* Enterprise 68% */}
              <path d="M0,0 L-65,-112 A130,130 0 0,1 120,-50 Z" fill="#00A0DC"/> {/* SMB 26% */}
              <path d="M0,0 L120,-50 A130,130 0 0,1 130,0 Z" fill="#85CEF2"/> {/* Consumer 6% */}
              <circle cx="0" cy="0" r="70" fill="#FFFFFF"/> {/* Donut hole */}
              
              {/* Labels */}
              <text x="0" y="10" fontSize="28" fontWeight="bold" textAnchor="middle" fill="#24292E">Q2</text>
          </g>
          {/* Legend */}
          <g transform="translate(30, 360)">
              <rect x="0" y="0" width="15" height="15" fill="#0056b3" rx="2"/> <text x="25" y="12" fontSize="14">Enterprise (68%)</text>
              <rect x="150" y="0" width="15" height="15" fill="#00A0DC" rx="2"/> <text x="175" y="12" fontSize="14">SMB (26%)</text>
              <rect x="270" y="0" width="15" height="15" fill="#85CEF2" rx="2"/> <text x="295" y="12" fontSize="14">Consumer (6%)</text>
          </g>
          {/* Right Panel: Trends (Combo Chart) */}
          <rect x="430" y="0" width="670" height="400" rx="8" fill="#FFFFFF" filter="url(#shadow)"/>
          <text x="460" y="40" fontSize="20" fontWeight="bold" fill="#24292E">Quarterly Revenue Trend &amp; Growth</text>
          
          <g transform="translate(480, 100)">
              {/* Chart Axes */}
              <line x1="0" y1="250" x2="580" y2="250" stroke="#E1E4E8"/>
              {['Q3-23', 'Q4-23', 'Q1-24', 'Q2-24'].map((label, i) => (
                  <text key={label} x={70 + i*140} y="280" textAnchor="middle" fill="#586069">{label}</text>
              ))}
              
              {/* Bars (Revenue Volume) */}
              <rect x="30" y="100" width="80" height="150" fill="#E1E4E8"/> {/* Q3 */}
              <rect x="170" y="80" width="80" height="170" fill="#E1E4E8"/> {/* Q4 */}
              <rect x="310" y="50" width="80" height="200" fill="#00A0DC"/> {/* Q1 */}
              <rect x="450" y="20" width="80" height="230" fill="#0056b3"/> {/* Q2 */}
              
              {/* Line (Growth Trend) */}
              <polyline points="70,100 210,80 350,50 490,20" fill="none" stroke="#28a745" strokeWidth="4" markerEnd="url(#arrowGreenDot)"/>
          </g>
          {/* Bottom KPI Cards */}
          <g transform="translate(0, 430)">
               {/* KPI 1: Retention */}
              <rect x="0" y="0" width="350" height="150" rx="8" fill="#FFFFFF" filter="url(#shadow)"/>
              <text x="30" y="40" fontSize="18" fill="#586069">Customer Retention</text>
              <text x="30" y="90" fontSize="48" fontWeight="bold" fill="#24292E">92%</text>
              <text x="150" y="90" fontSize="18" fill="#28a745">▲ 2% from Q1</text>
               {/* KPI 2: Enterprise Growth */}
              <rect x="380" y="0" width="350" height="150" rx="8" fill="#FFFFFF" filter="url(#shadow)"/>
              <text x="410" y="40" fontSize="18" fill="#586069">Enterprise Sales Growth</text>
              <text x="410" y="90" fontSize="48" fontWeight="bold" fill="#24292E">+35%</text>
              <rect x="410" y="110" width="280" height="10" rx="5" fill="#E1E4E8"/>
              <rect x="410" y="110" width="200" height="10" rx="5" fill="#28a745"/> {/* Progress bar */}
              
               {/* KPI 3: Regional */}
              <rect x="760" y="0" width="340" height="150" rx="8" fill="#FFFFFF" filter="url(#shadow)"/>
              <text x="790" y="40" fontSize="18" fill="#586069">Top Region Growth</text>
              <text x="790" y="90" fontSize="36" fontWeight="bold" fill="#0056b3">Asia-Pacific</text>
              <text x="790" y="120" fontSize="24" fontWeight="bold" fill="#28a745">+45%</text>
          </g>
      </g>
      {/* Definitions */}
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
         <marker id="arrowGreenDot" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <circle cx="5" cy="5" r="4" fill="#28a745" />
        </marker>
      </defs>
    </svg>
  );
};

