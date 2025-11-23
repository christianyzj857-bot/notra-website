import React from 'react';

export const BusinessMetricsDiagram = () => {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <title>Q2 Business Metrics: Regions and Sales Funnel</title>
      
      <text x="600" y="60" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#24292E">Q2 Market Performance &amp; Sales Funnel Health</text>
      {/* Left Side: Regional Performance (Simplified Map Visualization) */}
      <g transform="translate(50, 150)">
        <rect x="0" y="0" width="600" height="550" rx="15" fill="#F5F7FA" stroke="#E1E4E8"/>
        <text x="300" y="40" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#0056b3">Regional Growth YoY</text>
        
        {/* Abstract World Map Shapes (Silhouettes) */}
        <g transform="translate(50, 100)" fill="#DCEEFB" stroke="#FFF" strokeWidth="2">
            <path d="M50,50 L150,50 L180,150 L100,200 L20,150 Z" /> {/* North America approx */}
            <path d="M200,50 L350,50 L380,120 L300,180 L220,150 Z" /> {/* Europe approx */}
            <path d="M350,150 L500,150 L530,300 L400,350 L320,250 Z" /> {/* Asia-Pacific approx */}
        </g>
        {/* Data Callouts */}
        {/* Asia-Pacific */}
        <g transform="translate(420, 300)">
            <circle cx="0" cy="0" r="60" fill="#28a745" opacity="0.9"/>
            <text x="0" y="-10" fontSize="16" textAnchor="middle" fill="#FFF" fontWeight="bold">APAC</text>
            <text x="0" y="20" fontSize="28" textAnchor="middle" fill="#FFF" fontWeight="bold">+45%</text>
        </g>
         {/* North America */}
        <g transform="translate(120, 150)">
            <circle cx="0" cy="0" r="50" fill="#0056b3" opacity="0.9"/>
            <text x="0" y="-10" fontSize="16" textAnchor="middle" fill="#FFF" fontWeight="bold">N. America</text>
            <text x="0" y="20" fontSize="24" textAnchor="middle" fill="#FFF" fontWeight="bold">+15%</text>
        </g>
         {/* Europe */}
        <g transform="translate(300, 120)">
            <circle cx="0" cy="0" r="40" fill="#00A0DC" opacity="0.9"/>
            <text x="0" y="-5" fontSize="14" textAnchor="middle" fill="#FFF" fontWeight="bold">Europe</text>
            <text x="0" y="15" fontSize="20" textAnchor="middle" fill="#FFF" fontWeight="bold">+8%</text>
        </g>
      </g>
      {/* Right Side: Sales Funnel &amp; Customer Metrics */}
      <g transform="translate(700, 150)">
          
          {/* Sales Funnel Visualization */}
          <text x="225" y="40" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#24292E">Sales Funnel Conversion</text>
          <g transform="translate(0, 80)">
              {/* Stage 1: Leads */}
              <path d="M0,0 L450,0 L400,80 L50,80 Z" fill="#00449E"/>
              <text x="225" y="45" fontSize="18" textAnchor="middle" fill="#FFF">Total Leads (15,000)</text>
              
              {/* Conversion Arrow */}
              <text x="225" y="105" fontSize="16" textAnchor="middle" fill="#586069">↓ 40% Conversion</text>
              {/* Stage 2: Qualified */}
              <path d="M50,130 L400,130 L360,210 L90,210 Z" fill="#0056b3"/>
               <text x="225" y="175" fontSize="18" textAnchor="middle" fill="#FFF">Qualified Opportunities (6,000)</text>
               {/* Conversion Arrow */}
              <text x="225" y="235" fontSize="16" textAnchor="middle" fill="#586069">↓ 30% Conversion</text>
              {/* Stage 3: Closed Won */}
              <path d="M90,260 L360,260 L330,340 L120,340 Z" fill="#28a745"/>
               <text x="225" y="305" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#FFF">Closed Won (1,800)</text>
          </g>
          {/* Customer Metrics Section Below Funnel */}
          <g transform="translate(0, 450)">
              <line x1="0" y1="0" x2="450" y2="0" stroke="#E1E4E8"/>
              <text x="225" y="30" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#24292E">Customer Health Metrics</text>
              
              {/* NPS Score Gauge */}
               <g transform="translate(100, 80)">
                   <path d="M-80,0 A80,80 0 0,1 80,0" fill="none" stroke="#E1E4E8" strokeWidth="15"/> {/* Background arc */}
                   <path d="M-80,0 A80,80 0 0,1 40,-69" fill="none" stroke="#28a745" strokeWidth="15"/> {/* Score arc (approx 72%) */}
                   <text x="0" y="-10" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#24292E">72</text>
                   <text x="0" y="20" fontSize="16" textAnchor="middle" fill="#586069">NPS Score</text>
               </g>
               
               {/* Retention Rate Metric */}
               <g transform="translate(350, 80)">
                   <circle cx="0" cy="0" r="60" fill="none" stroke="#00A0DC" strokeWidth="10"/>
                   <text x="0" y="10" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#24292E">92%</text>
                   <text x="0" y="35" fontSize="16" textAnchor="middle" fill="#586069">Retention</text>
               </g>
          </g>
      </g>
    </svg>
  );
};

