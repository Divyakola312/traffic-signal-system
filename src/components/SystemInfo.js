import React from 'react';
import { Info, Zap, Shield, TrendingUp } from 'lucide-react';

const SystemInfo = () => {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Info size={24} />
        System Methodology & Features
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <Zap size={32} className="text-blue-400 mb-3" />
          <h3 className="text-white font-semibold mb-2">Smart Algorithm</h3>
          <p className="text-gray-300 text-sm">
            Density-based signal optimization with real-time traffic pattern analysis
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <Shield size={32} className="text-green-400 mb-3" />
          <h3 className="text-white font-semibold mb-2">Emergency Priority</h3>
          <p className="text-gray-300 text-sm">
            Immediate override system for emergency vehicles with priority routing
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <TrendingUp size={32} className="text-purple-400 mb-3" />
          <h3 className="text-white font-semibold mb-2">Live Analytics</h3>
          <p className="text-gray-300 text-sm">
            Real-time density tracking with predictive traffic flow analysis
          </p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <Info size={32} className="text-orange-400 mb-3" />
          <h3 className="text-white font-semibold mb-2">Adaptive Timing</h3>
          <p className="text-gray-300 text-sm">
            Dynamic green signal duration based on vehicle density (10-60 seconds)
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Algorithm Workflow</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="text-white font-medium text-sm">Video Analysis</h4>
              <p className="text-gray-400 text-xs">Process traffic video frame-by-frame to detect vehicles</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="text-white font-medium text-sm">Density Calculation</h4>
              <p className="text-gray-400 text-xs">Calculate vehicle density percentage for each lane</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="text-white font-medium text-sm">Priority Decision</h4>
              <p className="text-gray-400 text-xs">Identify highest density lane or emergency vehicle presence</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="text-white font-medium text-sm">Signal Optimization</h4>
              <p className="text-gray-400 text-xs">Allocate green time proportional to density (higher density = longer green)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="text-white font-medium text-sm">Continuous Monitoring</h4>
              <p className="text-gray-400 text-xs">Real-time adjustment and emergency override capability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;