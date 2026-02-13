import React from 'react';

const TrafficLight = ({ color }) => {
  const colors = {
    red: 'bg-red-500 shadow-lg shadow-red-500/70',
    yellow: 'bg-yellow-400 shadow-lg shadow-yellow-400/70',
    green: 'bg-green-500 shadow-lg shadow-green-500/70'
  };
  
  return (
    <div className="bg-gray-900 p-2 rounded-lg flex gap-1.5">
      <div className={`w-4 h-4 rounded-full ${color === 'red' ? colors.red : 'bg-red-900/30'}`}></div>
      <div className={`w-4 h-4 rounded-full ${color === 'yellow' ? colors.yellow : 'bg-yellow-900/30'}`}></div>
      <div className={`w-4 h-4 rounded-full ${color === 'green' ? colors.green : 'bg-green-900/30'}`}></div>
    </div>
  );
};

export default TrafficLight;