import React from 'react';
import { BarChart3, Activity } from 'lucide-react';

const ComparisonCharts = ({ statistics, laneData }) => {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Activity size={24} />
        Performance Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lane Comparison Bar Chart */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4 text-sm">Average Density by Lane</h3>
          <div className="space-y-3">
            {Object.entries(laneData).map(([key, lane]) => {
              const avgDensity = lane.history.length > 0 
                ? lane.history.reduce((a, b) => a + b, 0) / lane.history.length 
                : lane.density;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{lane.name}</span>
                    <span className="text-white font-medium">{Math.round(avgDensity)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                      style={{ width: `${avgDensity}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4 text-sm">System Efficiency Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Average Wait Time</span>
              <span className="text-green-400 font-bold">{Math.round(statistics.avgDensity / 3)}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Traffic Flow Rate</span>
              <span className="text-blue-400 font-bold">{Math.round(statistics.totalVehicles / Math.max(statistics.cycleSwitches, 1))}/cycle</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">System Efficiency</span>
              <span className="text-purple-400 font-bold">
                {Math.round(100 - statistics.avgDensity)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Emergency Response</span>
              <span className="text-orange-400 font-bold">
                {statistics.emergencyOverrides > 0 ? '100%' : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Traffic Distribution with Different Values */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4 text-sm">Traffic Distribution</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(laneData).map(([key, lane]) => {
              const totalDensity = Object.values(laneData).reduce((sum, l) => sum + l.density, 0);
              const percentage = (lane.density / totalDensity) * 100;
              const colors = {
                lane1: 'from-blue-500 to-blue-600',
                lane2: 'from-green-500 to-green-600',
                lane3: 'from-purple-500 to-purple-600',
                lane4: 'from-orange-500 to-orange-600'
              };
              return (
                <div key={key} className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br ${colors[key]} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{Math.round(percentage)}%</span>
                  </div>
                  <span className="text-gray-300 text-xs">{lane.name}</span>
                  <div className="text-gray-400 text-xs mt-1">{Math.round(lane.density / 5)} vehicles</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center items-center">
          <h3 className="text-white font-medium mb-4 text-sm">Overall Performance Score</h3>
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - (100 - statistics.avgDensity) / 100)}`}
                className="text-green-500"
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{Math.round(100 - statistics.avgDensity)}</span>
              <span className="text-xs text-gray-400">Score</span>
            </div>
          </div>
          <p className="text-gray-300 text-xs mt-4 text-center">
            {Math.round(100 - statistics.avgDensity) > 70 ? 'Excellent Performance' : 
             Math.round(100 - statistics.avgDensity) > 50 ? 'Good Performance' : 'Needs Optimization'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCharts;