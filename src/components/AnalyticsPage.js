import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowLeft, LogOut, BarChart3, TrendingUp, Siren, AlertTriangle, Video } from 'lucide-react';
import TrafficLight from './TrafficLight';
import ComparisonCharts from './ComparisonCharts';
import ReportExport from './ReportExport';
import SystemInfo from './SystemInfo';
import VideoProcessor from './VideoProcessor';

const AnalyticsPage = ({ uploadedVideos, handleBackToUpload, handleLogout }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const [laneData, setLaneData] = useState({
    lane1: { 
      density: 0, 
      signal: 'green', 
      name: 'North Lane', 
      history: [], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.north,
      videoEnded: false,
      timer: 20
    },
    lane2: { 
      density: 0, 
      signal: 'red', 
      name: 'South Lane', 
      history: [], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.south,
      videoEnded: false,
      timer: 15
    },
    lane3: { 
      density: 0, 
      signal: 'yellow', 
      name: 'East Lane', 
      history: [], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.east,
      videoEnded: false,
      timer: 5
    },
    lane4: { 
      density: 0, 
      signal: 'red', 
      name: 'West Lane', 
      history: [], 
      hasEmergency: false, 
      hasVideo: !!uploadedVideos.west,
      videoEnded: false,
      timer: 10
    }
  });
  
  const [statistics, setStatistics] = useState({
    avgDensity: 0,
    peakDensity: 0,
    totalVehicles: 0,
    cycleSwitches: 0,
    emergencyOverrides: 0
  });

  const timerRef = useRef(null);
  const emergencyTimeoutRefs = useRef({});

  const laneVideoMap = {
    lane1: uploadedVideos.north,
    lane2: uploadedVideos.south,
    lane3: uploadedVideos.east,
    lane4: uploadedVideos.west
  };

  // Handle density updates from video
  const handleDensityUpdate = (lane, density) => {
    setLaneData(prev => ({
      ...prev,
      [lane]: {
        ...prev[lane],
        density: density,
        history: [...prev[lane].history, density].slice(-100)
      }
    }));
  };

  // Handle video ended
  const handleVideoEnded = (lane) => {
    setLaneData(prev => ({
      ...prev,
      [lane]: { ...prev[lane], videoEnded: true }
    }));
  };

  // Handle emergency detection
  const handleEmergencyDetected = (lane, detected) => {
    if (!detected || laneData[lane].hasEmergency) return;

    console.log(`🚨 EMERGENCY TRIGGERED: ${laneData[lane].name}`);

    if (emergencyTimeoutRefs.current[lane]) {
      clearTimeout(emergencyTimeoutRefs.current[lane]);
    }

    setLaneData(prev => ({
      ...prev,
      [lane]: { 
        ...prev[lane], 
        hasEmergency: true,
        signal: 'green',
        timer: 30
      }
    }));

    setStatistics(prev => ({ 
      ...prev, 
      emergencyOverrides: prev.emergencyOverrides + 1 
    }));

    emergencyTimeoutRefs.current[lane] = setTimeout(() => {
      setLaneData(prev => ({
        ...prev,
        [lane]: { ...prev[lane], hasEmergency: false }
      }));
      console.log(`✅ Emergency cleared: ${laneData[lane].name}`);
    }, 10000);
  };

  // Signal timer logic
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setLaneData(prev => {
        const newData = { ...prev };
        let allEnded = true;

        Object.keys(newData).forEach(laneKey => {
          const lane = newData[laneKey];
          
          if (!lane.hasVideo) return;
          if (!lane.videoEnded) allEnded = false;

          // Skip timer if emergency
          if (lane.hasEmergency) {
            lane.signal = 'green';
            return;
          }

          lane.timer--;

          if (lane.timer <= 0) {
            if (lane.signal === 'green') {
              lane.signal = 'yellow';
              lane.timer = 3;
            } else if (lane.signal === 'yellow') {
              lane.signal = 'red';
              lane.timer = 15;
            } else {
              lane.signal = 'green';
              lane.timer = Math.max(15, Math.min(40, 15 + lane.density / 5));
              setStatistics(s => ({ ...s, cycleSwitches: s.cycleSwitches + 1 }));
            }
          }
        });

        if (allEnded && !analysisComplete) {
          setAnalysisComplete(true);
          setIsPlaying(false);
        }

        return newData;
      });

      // Update statistics
      const lanes = Object.values(laneData).filter(l => l.hasVideo);
      if (lanes.length > 0) {
        const avg = lanes.reduce((sum, l) => sum + l.density, 0) / lanes.length;
        const peak = Math.max(...lanes.map(l => l.density));
        const vehicles = lanes.reduce((sum, l) => sum + Math.round(l.density / 4), 0);

        setStatistics(prev => ({
          ...prev,
          avgDensity: avg,
          peakDensity: Math.max(prev.peakDensity, peak),
          totalVehicles: vehicles
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, laneData, analysisComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(emergencyTimeoutRefs.current).forEach(t => clearTimeout(t));
    };
  }, []);

  const UnifiedGraph = () => {
    const colors = {
      lane1: '#3b82f6',
      lane2: '#10b981',
      lane3: '#a855f7',
      lane4: '#f59e0b'
    };

    const maxLen = Math.max(...Object.values(laneData).map(l => l.history.length), 1);

    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-3">All Lanes - Unified Density</h3>
        <div className="relative w-full h-64">
          <svg viewBox="0 0 500 200" className="w-full h-full">
            <line x1="0" y1="50" x2="500" y2="50" stroke="#374151" strokeWidth="1" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#374151" strokeWidth="1" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="#374151" strokeWidth="1" />

            {Object.entries(laneData).map(([key, lane]) => {
              if (lane.history.length < 2) return null;

              const path = lane.history.map((d, i) => {
                const x = (i / maxLen) * 500;
                const y = 190 - (d / 100) * 180;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ');

              return (
                <path
                  key={key}
                  d={path}
                  fill="none"
                  stroke={colors[key]}
                  strokeWidth="3"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {Object.entries(laneData).map(([key, lane]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[key] }}></div>
              <span className="text-xs text-white">{lane.name}: {Math.round(lane.density)}%</span>
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
          <h1 className="text-3xl font-bold text-white">Real Video Analysis System</h1>
          <div className="flex gap-3">
            <button onClick={handleBackToUpload} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-300 rounded-lg transition">
              <ArrowLeft size={20} />
              Upload New Videos
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-300 rounded-lg transition">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {Object.values(laneData).some(l => l.hasEmergency) && (
          <div className="bg-red-500 border-2 border-red-300 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center justify-center gap-3 text-white">
              <Siren size={32} />
              <div className="text-xl font-bold">🚨 EMERGENCY DETECTED 🚨</div>
              <AlertTriangle size={32} />
            </div>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            <strong>Detection Thresholds:</strong> White &gt; 12% AND (Red &gt; 3% OR Blue &gt; 3%). 
            Watch debug overlay (W/R/B/D) on each video. Analysis stops when all videos end.
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={analysisComplete}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
            </button>
            {analysisComplete && <span className="text-green-400 font-semibold">✓ Analysis Complete</span>}
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Live Video Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(laneVideoMap).map(([key, url]) => {
              const lane = laneData[key];
              return (
                <div key={key} className={`bg-gray-800 rounded-lg p-3 ${lane.hasEmergency ? 'ring-4 ring-red-500' : ''}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-white text-sm font-medium">{lane.name}</span>
                    <TrafficLight color={lane.signal} />
                  </div>
                  {url ? (
                    <VideoProcessor
                      videoUrl={url}
                      lane={key}
                      signalColor={lane.signal}
                      onDensityUpdate={(d) => handleDensityUpdate(key, d)}
                      onEmergencyDetected={(e) => handleEmergencyDetected(key, e)}
                      onVideoEnded={() => handleVideoEnded(key)}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Video</span>
                    </div>
                  )}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Signal:</span>
                      <span className={`font-bold ${lane.signal === 'green' ? 'text-green-400' : lane.signal === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {lane.signal.toUpperCase()} ({lane.timer}s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span className="text-white font-bold">{Math.round(lane.density)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vehicles:</span>
                      <span className="text-white font-bold">{Math.round(lane.density / 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Emergency:</span>
                      <span className={`font-bold ${lane.hasEmergency ? 'text-red-400' : 'text-green-400'}`}>
                        {lane.hasEmergency ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {lane.videoEnded && <div className="text-yellow-400">Video Ended</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Unified Graph</h2>
          <UnifiedGraph />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Lane Status</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(laneData).map(([key, lane]) => (
                <div key={key} className={`bg-gray-800/50 rounded-lg p-4 ${lane.hasEmergency ? 'ring-2 ring-red-500' : ''}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium">{lane.name}</span>
                    <TrafficLight color={lane.signal} />
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span className="text-white">{Math.round(lane.density)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vehicles:</span>
                      <span className="text-white">{Math.round(lane.density / 4)}</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-full rounded-full ${lane.hasEmergency ? 'bg-red-500' : lane.density > 60 ? 'bg-red-500' : lane.density > 30 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${lane.density}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-300 text-sm">Avg Density</div>
                <div className="text-white text-2xl font-bold">{Math.round(statistics.avgDensity)}%</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-300 text-sm">Peak Density</div>
                <div className="text-white text-2xl font-bold">{Math.round(statistics.peakDensity)}%</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-300 text-sm">Total Vehicles</div>
                <div className="text-white text-2xl font-bold">{statistics.totalVehicles}</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="text-orange-300 text-sm">Emergencies</div>
                <div className="text-white text-2xl font-bold">{statistics.emergencyOverrides}</div>
              </div>
            </div>
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
