import React, { useState } from 'react';
import { Upload, Video, LogOut, Car, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

const UploadPage = ({ uploadedVideos, handleVideoUpload, startAnalysis, handleLogout }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onAnalyze = () => {
    const hasVideo = Object.values(uploadedVideos).some(video => video !== null);
    if (!hasVideo) {
      alert('Please upload at least one video!');
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      startAnalysis();
    }, 2000);
  };

  const lanes = [
    { key: 'north', name: 'North Lane', color: 'blue' },
    { key: 'south', name: 'South Lane', color: 'green' },
    { key: 'east', name: 'East Lane', color: 'purple' },
    { key: 'west', name: 'West Lane', color: 'orange' }
  ];

  const allVideosUploaded = Object.values(uploadedVideos).every(video => video !== null);
  const someVideosUploaded = Object.values(uploadedVideos).some(video => video !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Upload Traffic Videos</h1>
            <p className="text-gray-300 mt-1">Upload video feed from each lane camera</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-300 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
              <Video size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">4-Lane Traffic Camera System</h2>
            <p className="text-gray-300">Upload video from each lane's camera for comprehensive analysis</p>
          </div>

          {/* 4 Video Upload Slots */}
          {/* 4 Video Upload Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {lanes.map(lane => (
              <div key={lane.key} className="border-2 border-dashed border-white/30 rounded-xl p-6 bg-gray-800/30 hover:border-blue-400 transition">
                <div className="text-center">
                  <div className="inline-block p-4 bg-blue-500/20 rounded-full mb-3">
                    <Video size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{lane.name} Camera</h3>
                  
                  {!uploadedVideos[lane.key] ? (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(lane.key, e.target.files[0])}
                        className="hidden"
                        id={`video-upload-${lane.key}`}
                      />
                      <label 
                        htmlFor={`video-upload-${lane.key}`}
                        className="cursor-pointer block"
                      >
                        <Upload size={40} className="mx-auto text-blue-400 mb-2" />
                        <p className="text-gray-300 text-sm mb-1">Click to upload</p>
                        <p className="text-gray-500 text-xs">MP4, AVI, MOV</p>
                      </label>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <CheckCircle size={48} className="mx-auto text-green-400" />
                      <p className="text-green-300 font-medium">Video Uploaded ✓</p>
                      <video 
                        src={uploadedVideos[lane.key]} 
                        className="w-full h-32 object-cover rounded-lg"
                        muted
                      />
                      <button
                        onClick={() => handleVideoUpload(lane.key, null)}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Upload Status */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Upload Progress</span>
              <span className="text-gray-300">
                {Object.values(uploadedVideos).filter(v => v !== null).length} / 4 cameras
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${(Object.values(uploadedVideos).filter(v => v !== null).length / 4) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {allVideosUploaded ? '✓ All cameras ready!' : 
               someVideosUploaded ? 'You can start with uploaded cameras' : 
               'Upload at least one video to start'}
            </p>
          </div>

          {/* Start Analysis Button */}
          {someVideosUploaded && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Video size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {allVideosUploaded ? 'All cameras ready!' : `${Object.values(uploadedVideos).filter(v => v !== null).length} camera(s) ready`}
                    </p>
                    <p className="text-gray-300 text-sm">Ready for multi-lane analysis</p>
                  </div>
                </div>
                <button
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
                >
                  {isAnalyzing ? 'Processing Videos...' : 'Start Analysis'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 text-center border border-white/10">
            <Car size={32} className="mx-auto text-blue-400 mb-2" />
            <p className="text-white font-medium text-sm mb-1">Vehicle Detection</p>
            <p className="text-gray-400 text-xs">Per lane analysis</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 text-center border border-white/10">
            <BarChart3 size={32} className="mx-auto text-purple-400 mb-2" />
            <p className="text-white font-medium text-sm mb-1">Density Calculation</p>
            <p className="text-gray-400 text-xs">Real-time processing</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 text-center border border-white/10">
            <TrendingUp size={32} className="mx-auto text-green-400 mb-2" />
            <p className="text-white font-medium text-sm mb-1">Smart Optimization</p>
            <p className="text-gray-400 text-xs">Priority-based switching</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 text-center border border-white/10">
            <Video size={32} className="mx-auto text-orange-400 mb-2" />
            <p className="text-white font-medium text-sm mb-1">4-Camera System</p>
            <p className="text-gray-400 text-xs">Independent monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;