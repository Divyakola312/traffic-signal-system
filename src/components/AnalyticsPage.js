import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowLeft, LogOut, BarChart3, TrendingUp, Siren, AlertTriangle, Video } from 'lucide-react';
import TrafficLight from './TrafficLight';
import ComparisonCharts from './ComparisonCharts';
import ReportExport from './ReportExport';
import SystemInfo from './SystemInfo';
import VideoProcessor from './VideoProcessor';

const AnalyticsPage = ({ uploadedVideos, handleBackToUpload, handleLogout }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const [laneData, setLaneData] = useState({
    lane1: { 
      density: 20, 
      signal: 'green', 
      name: 'North Lane', 
      history: [20], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.north,
      timer: 15,
      greenDuration: 15,
      yellowDuration: 3,
      redDuration: 12
    },
    lane2: { 
      density: 30, 
      signal: 'red', 
      name: 'South Lane', 
      history: [30], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.south,
      timer: 10,
      greenDuration: 15,
      yellowDuration: 3,
      redDuration: 12
    },
    lane3: { 
      density: 25, 
      signal: 'yellow', 
      name: 'East Lane', 
      history: [25], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.east,
      timer: 3,
      greenDuration: 15,
      yellowDuration: 3,
      redDuration: 12
    },
    lane4: { 
      density: 35, 
      signal: 'red', 
      name: 'West Lane', 
      history: [35], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.west,
      timer: 5,
      greenDuration: 15,
      yellowDuration: 3,
      redDuration: 12
    }
  });
  
  const [statistics, setStatistics] = useState({
    avgDensity: 0,
    peakDensity: 0,
    totalVehicles: 0,
    cycleSwitches: 0,
    emergencyOverrides: 0
  });

  const animationRef = useRef(null);
  const emergencyTimeoutRefs = useRef({});

  const handleDensityUpdate = (lane, density) => {
    setLaneData(prev => ({
      ...prev,
      [lane]: {
        ...prev[lane],
        density: density,
        history: [...prev[lane].history, density].slice(-50)
      }
    }));
  };

  // FIXED Emergency Trigger Function
  const triggerEmergency = (laneKey) => {
    // Clear any existing timeout for this lane
    if (emergencyTimeoutRefs.current[laneKey]) {
      clearTimeout(emergencyTimeoutRefs.current[laneKey]);
    }

    console.log(`🚨 EMERGENCY TRIGGERED in ${laneData[laneKey].name}!`);
    
    // Set emergency state
    setLaneData(prev => ({
      ...prev,
      [laneKey]: { 
        ...prev[laneKey], 
        hasEmergency: true,
        signal: 'green',
        timer: 30,
        greenDuration: 30
      }
    }));
    
    // Update statistics
    setStatistics(prev => ({ 
      ...prev, 
      emergencyOverrides: prev.emergencyOverrides + 1 
    }));
    
    // Set timeout to clear emergency after 10 seconds
    emergencyTimeoutRefs.current[laneKey] = setTimeout(() => {
      console.log(`✅ Emergency cleared in ${laneData[laneKey].name}`);
      
      setLaneData(prev => ({
        ...prev,
        [laneKey]: { 
          ...prev[laneKey], 
          hasEmergency: false, // CLEAR emergency
          greenDuration: Math.round(10 + (prev[laneKey].density / 100) * 20)
        }
      }));
      
      // Clean up the ref
      delete emergencyTimeoutRefs.current[laneKey];
    }, 10000); // 10 seconds
  };

  const handleEmergencyDetected = (lane, hasEmergency) => {
    // Only used for automatic detection (currently disabled)
    // Keep for future use
  };

  const laneVideoMap = {
    lane1: uploadedVideos.north,
    lane2: uploadedVideos.south,
    lane3: uploadedVideos.east,
    lane4: uploadedVideos.west
  };

  // Signal cycling logic
  useEffect(() => {
    if (isPlaying && currentFrame < totalFrames) {
      animationRef.current = setTimeout(() => {
        setCurrentFrame(prev => prev + 1);

        setLaneData(prev => {
          const newData = { ...prev };
          
          Object.keys(newData).forEach(laneKey => {
            const lane = newData[laneKey];
            
            if (!lane.hasVideo) return;
            
            // If emergency is active, keep it green
            if (lane.hasEmergency) {
              lane.signal = 'green';
              return; // Don't decrement timer during emergency
            }
            
            // Normal signal cycling
            lane.timer -= 1;
            
            if (lane.timer <= 0) {
              if (lane.signal === 'green') {
                lane.signal = 'yellow';
                lane.timer = lane.yellowDuration;
              } else if (lane.signal === 'yellow') {
                lane.signal = 'red';
                lane.timer = lane.redDuration;
              } else if (lane.signal === 'red') {
                lane.signal = 'green';
                lane.greenDuration = Math.round(10 + (lane.density / 100) * 20);
                lane.timer = lane.greenDuration;
                setStatistics(s => ({ ...s, cycleSwitches: s.cycleSwitches + 1 }));
              }
            }
          });
          
          return newData;
        });

        // Update statistics
        const activeLanes = Object.values(laneData).filter(l => l.hasVideo);
        if (activeLanes.length > 0) {
          const avgDens = activeLanes.reduce((sum, lane) => sum + lane.density, 0) / activeLanes.length;
          const maxDens = Math.max(...activeLanes.map(l => l.density));
          const totalVeh = activeLanes.reduce((sum, lane) => 
            sum + Math.round(lane.density / 3.5), 0
          );
          
          setStatistics(prev => ({
            ...prev,
            avgDensity: avgDens,
            peakDensity: Math.max(prev.peakDensity, maxDens),
            totalVehicles: totalVeh
          }));
        }

      }, 1000);
    } else if (currentFrame >= totalFrames && !analysisComplete) {
      setIsPlaying(false);
      setAnalysisComplete(true);
    }

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentFrame, totalFrames, laneData, analysisComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all emergency timeouts on unmount
      Object.values(emergencyTimeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const UnifiedDensityGraph = () => {
    const maxHistory = Math.max(...Object.values(laneData).map(l => l.history.length));
    const maxDensity = 100;
    
    const colors = {
      lane1: { stroke: '#3b82f6', name: 'North' },
      lane2: { stroke: '#10b981', name: 'South' },
      lane3: { stroke: '#a855f7', name: 'East' },
      lane4: { stroke: '#f59e0b', name: 'West' }
    };

    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-3">All Lanes - Real-time Density Comparison</h3>
        <div className="relative w-full h-64">
          <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="500" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#374151" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="#374151" strokeWidth="1" strokeDasharray="5,5" />
            
            <text x="5" y="15" fill="#9ca3af" fontSize="12">100%</text>
            <text x="5" y="105" fill="#9ca3af" fontSize="12">50%</text>
            <text x="5" y="195" fill="#9ca3af" fontSize="12">0%</text>

            {Object.entries(laneData).map(([laneKey, lane]) => {
              if (lane.history.length < 2) return null;
              
              const pathData = lane.history.map((density, i) => {
                const x = (i / Math.max(maxHistory - 1, 1)) * 500;
                const y = 190 - ((density / maxDensity) * 180);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ');

              return (
                <g key={laneKey}>
                  <path
                    d={`M 0 190 ${lane.history.map((density, i) => {
                      const x = (i / Math.max(maxHistory - 1, 1)) * 500;
                      const y = 190 - ((density / maxDensity) * 180);
                      return `L ${x} ${y}`;
                    }).join(' ')} L 500 190 Z`}
                    fill={colors[laneKey].stroke}
                    opacity="0.15"
                  />
                  <path
                    d={pathData}
                    fill="none"
                    stroke={colors[laneKey].stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {lane.history.length > 0 && (
                    <>
                      <circle
                        cx={Math.max((lane.history.length - 1) / Math.max(maxHistory - 1, 1) * 500, 0)}
                        cy={190 - ((lane.history[lane.history.length - 1] / maxDensity) * 180)}
                        r="6"
                        fill={colors[laneKey].stroke}
                        opacity="0.3"
                      />
                      <circle
                        cx={Math.max((lane.history.length - 1) / Math.max(maxHistory - 1, 1) * 500, 0)}
                        cy={190 - ((lane.history[lane.history.length - 1] / maxDensity) * 180)}
                        r="4"
                        fill={colors[laneKey].stroke}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Object.entries(laneData).map(([laneKey, lane]) => (
            <div key={laneKey} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: colors[laneKey].stroke }}
              ></div>
              <div className="text-xs">
                <div className="text-white font-medium">{lane.name}</div>
                <div className="text-gray-400">{Math.round(lane.density)}% • {lane.signal.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">4-Lane Independent Traffic System</h1>
          <div className="flex gap-3">
            <button
              onClick={handleBackToUpload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-300 rounded-lg transition"
            >
              <ArrowLeft size={20} />
              Upload New Videos
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-300 rounded-lg transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner - Only shows when there's ACTUALLY an emergency */}
        {Object.entries(laneData).some(([_, lane]) => lane.hasEmergency) && (
          <div className="bg-red-500 border-2 border-red-300 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center justify-center gap-3 text-white">
              <Siren size={32} className="animate-bounce" />
              <div className="text-center">
                <div className="text-xl font-bold">🚨 EMERGENCY VEHICLE ACTIVE 🚨</div>
                <div className="text-sm">
                  Emergency in: {Object.entries(laneData)
                    .filter(([_, lane]) => lane.hasEmergency)
                    .map(([_, lane]) => lane.name)
                    .join(', ')}
                </div>
              </div>
              <AlertTriangle size={32} className="animate-bounce" />
            </div>
          </div>
        )}

        {/* EMERGENCY TRIGGER BUTTONS */}
        <div className="bg-orange-500/10 backdrop-blur rounded-xl p-4 border border-orange-500/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-orange-300 font-semibold text-sm flex items-center gap-2">
              <Siren size={18} />
              Emergency Vehicle Override Control
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(laneData).map(([laneKey, lane]) => (
              <button
                key={laneKey}
                onClick={() => triggerEmergency(laneKey)}
                disabled={lane.hasEmergency}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  lane.hasEmergency 
                    ? 'bg-red-600 cursor-not-allowed text-white ring-2 ring-red-400 animate-pulse' 
                    : 'bg-red-500 hover:bg-red-600 text-white hover:ring-2 hover:ring-red-300'
                }`}
              >
                {lane.hasEmergency ? (
                  <span className="flex items-center justify-center gap-2">
                    <Siren size={16} className="animate-spin" />
                    ACTIVE
                  </span>
                ) : (
                  `🚨 ${lane.name}`
                )}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-3">
            ⚡ Click to simulate emergency vehicle. Lane turns GREEN immediately for 10 seconds.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Analysis Progress</span>
            <span className="text-gray-300">{Math.round((currentFrame / totalFrames) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
              style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={analysisComplete}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
            </button>
            <span className="text-gray-300 text-sm">Frame {currentFrame} / {totalFrames}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Video size={24} />
            Live Camera Feeds (Independent Signal Cycles)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(laneVideoMap).map(([laneKey, videoUrl]) => {
              const lane = laneData[laneKey];
              return (
                <div key={laneKey} className="relative">
                  <div className={`bg-gray-800 rounded-lg p-3 transition-all ${lane.hasEmergency ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium flex items-center gap-1">
                        {lane.name}
                        {lane.hasEmergency && <Siren size={14} className="text-red-500 animate-spin" />}
                      </span>
                      <TrafficLight color={lane.signal} />
                    </div>
                    {videoUrl ? (
                      <VideoProcessor
                        videoUrl={videoUrl}
                        lane={laneKey}
                        signalColor={lane.signal}
                        onDensityUpdate={(density) => handleDensityUpdate(laneKey, density)}
                        onEmergencyDetected={(hasEmergency) => handleEmergencyDetected(laneKey, hasEmergency)}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Video</span>
                      </div>
                    )}
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Signal:</span>
                        <span className={`text-sm font-bold uppercase ${
                          lane.signal === 'green' ? 'text-green-400' :
                          lane.signal === 'yellow' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {lane.signal} ({lane.hasEmergency ? '🚨' : `${lane.timer}s`})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Density:</span>
                        <span className="text-white text-sm font-bold">{Math.round(lane.density)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Vehicles:</span>
                        <span className="text-white text-sm font-bold">{Math.round(lane.density / 3.5)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Emergency:</span>
                        <span className={`text-sm font-bold ${lane.hasEmergency ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                          {lane.hasEmergency ? 'YES ⚠️' : 'NO ✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Unified Density Analysis
          </h2>
          <UnifiedDensityGraph />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Live Lane Status</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(laneData).map(([key, lane]) => (
                <div key={key} className={`bg-gray-800/50 rounded-lg p-4 transition-all ${lane.hasEmergency ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/30' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-medium flex items-center gap-2">
                      {lane.name}
                      {lane.hasEmergency && <Siren size={14} className="text-red-500 animate-spin" />}
                    </span>
                    <TrafficLight color={lane.signal} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Signal:</span>
                      <span className={`font-bold uppercase ${
                        lane.signal === 'green' ? 'text-green-400' :
                        lane.signal === 'yellow' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {lane.signal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white font-bold">
                        {lane.hasEmergency ? '🚨 EMERGENCY' : `${lane.timer}s`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span className="text-white font-bold">{Math.round(lane.density)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vehicles:</span>
                      <span className="text-white font-bold">~{Math.round(lane.density / 3.5)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        lane.hasEmergency ? 'bg-red-500' :
                        lane.density >= 70 ? 'bg-red-500' : 
                        lane.density >= 40 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${lane.density}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={24} />
                Statistics
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-300 text-sm mb-1">Average Density</div>
                  <div className="text-white text-3xl font-bold">{Math.round(statistics.avgDensity)}%</div>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-red-300 text-sm mb-1">Peak Density</div>
                  <div className="text-white text-3xl font-bold">{Math.round(statistics.peakDensity)}%</div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-300 text-sm mb-1">Total Vehicles</div>
                  <div className="text-white text-3xl font-bold">{statistics.totalVehicles}</div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-300 text-sm mb-1">Signal Cycles</div>
                  <div className="text-white text-3xl font-bold">{statistics.cycleSwitches}</div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="text-orange-300 text-sm mb-1 flex items-center gap-1">
                    <Siren size={14} />
                    Emergency Events
                  </div>
                  <div className="text-white text-3xl font-bold">{statistics.emergencyOverrides}</div>
                </div>
              </div>
            </div>

            {analysisComplete && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <div className="text-green-300 font-medium mb-2">✓ Analysis Complete</div>
                <p className="text-gray-300 text-sm">All lanes processed with {statistics.emergencyOverrides} emergency override(s).</p>
              </div>
            )}
          </div>
        </div>

        <ComparisonCharts statistics={statistics} laneData={laneData} />
        <ReportExport statistics={statistics} laneData={laneData} analysisComplete={analysisComplete} />
        <SystemInfo />

      </div>
    </div>
  );
};

export default AnalyticsPage;