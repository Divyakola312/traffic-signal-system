import React from 'react';

const LineGraph = ({ history, color = 'blue' }) => {
  if (!history || history.length === 0) return null;

  const maxVal = Math.max(...history);
  const minVal = Math.min(...history);
  const range = maxVal - minVal || 1;
  
  const colorMap = {
    blue: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.3)' },
    green: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.3)' },
    purple: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.3)' },
    orange: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.3)' }
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="relative w-full h-24 bg-gray-900/50 rounded-lg p-2 border border-gray-700">
      <svg 
        viewBox="0 0 300 100" 
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <line x1="0" y1="25" x2="300" y2="25" stroke="#374151" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="300" y2="50" stroke="#374151" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="300" y2="75" stroke="#374151" strokeWidth="0.5" />

        {/* Line path */}
        <path
          d={history.map((val, i) => {
            const x = (i / (history.length - 1)) * 300;
            const y = 90 - ((val - minVal) / range) * 80;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke={selectedColor.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area under line */}
        <path
          d={`M 0 90 ${history.map((val, i) => {
            const x = (i / (history.length - 1)) * 300;
            const y = 90 - ((val - minVal) / range) * 80;
            return `L ${x} ${y}`;
          }).join(' ')} L 300 90 Z`}
          fill={selectedColor.fill}
        />

        {/* Data points */}
        {history.map((val, i) => {
          const x = (i / (history.length - 1)) * 300;
          const y = 90 - ((val - minVal) / range) * 80;
          // Only show every 10th point to avoid clutter
          if (i % 10 === 0 || i === history.length - 1) {
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill={selectedColor.stroke}
              />
            );
          }
          return null;
        })}
      </svg>
      
      {/* Value labels */}
      <div className="absolute top-1 left-2 text-xs text-gray-400 font-mono">{Math.round(maxVal)}%</div>
      <div className="absolute bottom-1 left-2 text-xs text-gray-400 font-mono">{Math.round(minVal)}%</div>
      <div className="absolute bottom-1 right-2 text-xs text-gray-500">Now: {Math.round(history[history.length - 1])}%</div>
    </div>
  );
};

export default LineGraph;