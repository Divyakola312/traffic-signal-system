import React, { useRef, useEffect, useState } from 'react';

const VideoProcessor = ({ videoUrl, lane, onDensityUpdate, onEmergencyDetected, signalColor, onVideoEnded }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ white: 0, red: 0, blue: 0, density: 0 });

  // Play/Pause based on signal
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    if (signalColor === 'green') {
      video.play().catch(err => console.log('Play prevented'));
    } else {
      video.pause();
    }
  }, [signalColor]);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const analyzeFrame = () => {
      if (video.paused || video.ended) return;

      try {
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let darkPixels = 0;
        let whitePixels = 0;
        let redPixels = 0;
        let bluePixels = 0;
        let sampledPixels = 0;

        // Analyze every 16th pixel
        for (let i = 0; i < data.length; i += 64) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r === undefined) continue;

          const brightness = (r + g + b) / 3;

          // Vehicle detection (darker areas)
          if (brightness < 140) darkPixels++;

          // Emergency detection
          if (r > 200 && g > 200 && b > 200) whitePixels++; // White
          if (r > 120 && r > g + 40 && r > b + 40) redPixels++; // Red dominant
          if (b > 120 && b > r + 40 && b > g + 40) bluePixels++; // Blue dominant

          sampledPixels++;
        }

        // Calculate percentages
        const whitePercent = (whitePixels / sampledPixels) * 100;
        const redPercent = (redPixels / sampledPixels) * 100;
        const bluePercent = (bluePixels / sampledPixels) * 100;
        const densityPercent = Math.min(90, (darkPixels / sampledPixels) * 150);

        // Update debug info
        setDebugInfo({
          white: whitePercent.toFixed(1),
          red: redPercent.toFixed(1),
          blue: bluePercent.toFixed(1),
          density: densityPercent.toFixed(1)
        });

        // Send density to parent
        onDensityUpdate(densityPercent);

        // Emergency detection: White body + (Red OR Blue)
        if (whitePercent > 12 && (redPercent > 3 || bluePercent > 3)) {
          console.log(`🚨 EMERGENCY in ${lane}: W=${whitePercent.toFixed(1)}% R=${redPercent.toFixed(1)}% B=${bluePercent.toFixed(1)}%`);
          onEmergencyDetected(true);
        }

      } catch (err) {
        console.error('Frame analysis error:', err);
      }

      animationId = requestAnimationFrame(analyzeFrame);
    };

    const handlePlay = () => {
      setIsProcessing(true);
      analyzeFrame();
    };

    const handlePause = () => {
      setIsProcessing(false);
      if (animationId) cancelAnimationFrame(animationId);
    };

    const handleEnded = () => {
      setIsProcessing(false);
      if (animationId) cancelAnimationFrame(animationId);
      console.log(`✅ Video ended for ${lane}`);
      onVideoEnded();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, lane, onDensityUpdate, onEmergencyDetected, onVideoEnded]);

  if (!videoUrl) return null;

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover rounded-lg"
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        width="160"
        height="120"
        className="hidden"
      />
      
      {/* Debug overlay */}
      <div className="absolute bottom-1 left-1 bg-black/90 text-white text-xs p-2 rounded font-mono leading-tight">
        <div>W: {debugInfo.white}%</div>
        <div>R: {debugInfo.red}%</div>
        <div>B: {debugInfo.blue}%</div>
        <div>D: {debugInfo.density}%</div>
      </div>

      {isProcessing && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          ● LIVE
        </div>
      )}

      {signalColor === 'red' && (
        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-lg">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            🛑 STOPPED
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProcessor;
