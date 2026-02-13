import React, { useRef, useEffect, useState } from 'react';

const VideoProcessor = ({ videoUrl, lane, onDensityUpdate, onEmergencyDetected, signalColor }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastDensityRef = useRef(40);
  const emergencyFrameCount = useRef(0);

  // Control video playback based on signal color
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    if (signalColor === 'green') {
      video.play().catch(err => console.log('Play prevented:', err));
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
    let frameCount = 0;

    const processFrame = () => {
      if (!video.paused && !video.ended) {
        frameCount++;
        
        // Process every 10th frame for better performance
        if (frameCount % 10 === 0) {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Divide canvas into grid for vehicle detection
          const gridSize = 20; // 20x20 grid
          const cellWidth = canvas.width / gridSize;
          const cellHeight = canvas.height / gridSize;
          
          let vehicleCells = 0;
          let totalCells = gridSize * gridSize;
          
          // Color detection counters
          let redPixels = 0;
          let bluePixels = 0;
          let whitePixels = 0;
          let totalPixels = 0;

          // Analyze each grid cell
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const startX = Math.floor(col * cellWidth);
              const startY = Math.floor(row * cellHeight);
              
              let cellDarkPixels = 0;
              let cellBrightPixels = 0;
              let cellPixelCount = 0;
              
              let cellRedPixels = 0;
              let cellBluePixels = 0;
              let cellWhitePixels = 0;

              // Sample pixels in this cell
              for (let y = startY; y < startY + cellHeight && y < canvas.height; y += 3) {
                for (let x = startX; x < startX + cellWidth && x < canvas.width; x += 3) {
                  const i = (y * canvas.width + x) * 4;
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  
                  const brightness = (r + g + b) / 3;
                  
                  // Detect dark objects (vehicles are usually darker than road)
                  if (brightness < 130) {
                    cellDarkPixels++;
                  } else if (brightness > 200) {
                    cellBrightPixels++;
                  }
                  
                  // EMERGENCY VEHICLE COLOR DETECTION
                  
                  // Strong RED detection (emergency lights, stripes)
                  if (r > 150 && r > g * 1.4 && r > b * 1.4) {
                    cellRedPixels++;
                    redPixels++;
                  }
                  
                  // Strong BLUE detection (emergency lights)
                  if (b > 150 && b > r * 1.4 && b > g * 1.4) {
                    cellBluePixels++;
                    bluePixels++;
                  }
                  
                  // WHITE detection (ambulance body)
                  if (r > 200 && g > 200 && b > 200) {
                    cellWhitePixels++;
                    whitePixels++;
                  }
                  
                  cellPixelCount++;
                  totalPixels++;
                }
              }

              // If cell has significant dark pixels, it likely contains a vehicle
              const darkRatio = cellDarkPixels / Math.max(cellPixelCount, 1);
              if (darkRatio > 0.3) {
                vehicleCells++;
              }
            }
          }

          // Calculate density based on occupied cells
          const occupancyRatio = vehicleCells / totalCells;
          let calculatedDensity = Math.min(95, Math.max(5, occupancyRatio * 200));
          
          // Smooth the density to avoid jumps
          const smoothedDensity = lastDensityRef.current * 0.7 + calculatedDensity * 0.3;
          lastDensityRef.current = smoothedDensity;
          
          // Estimate vehicle count (rough approximation)
          const estimatedVehicles = Math.round(smoothedDensity / 3.5);

          onDensityUpdate(smoothedDensity);

          // EMERGENCY VEHICLE DETECTION
          const redRatio = redPixels / totalPixels;
          const blueRatio = bluePixels / totalPixels;
          const whiteRatio = whitePixels / totalPixels;
          
          // Emergency vehicle characteristics:
          // - Significant white body (ambulance)
          // - Red OR blue lights (emergency lights)
          const hasStrongRed = redRatio > 0.05;   // 8% red pixels
          const hasStrongBlue = blueRatio > 0.05; // 8% blue pixels
          const hasWhiteBody = whiteRatio > 0.15; // 20% white pixels
          
          // Emergency detected if: (red OR blue) AND white
          const emergencyInVideo = (hasStrongRed || hasStrongBlue) && hasWhiteBody;
          
          if (emergencyInVideo) {
            emergencyFrameCount.current++;
            
            // Need at least 3 consecutive frames to confirm (reduce false positives)
            if (emergencyFrameCount.current >= 3) {
              console.log(`🚨 EMERGENCY VEHICLE DETECTED in ${lane}!`, {
                redRatio: (redRatio * 100).toFixed(2) + '%',
                blueRatio: (blueRatio * 100).toFixed(2) + '%',
                whiteRatio: (whiteRatio * 100).toFixed(2) + '%',
                frames: emergencyFrameCount.current
              });
              onEmergencyDetected(true);
              emergencyFrameCount.current = 0; // Reset after detection
            }
          } else {
            emergencyFrameCount.current = 0; // Reset if not detected
          }
          
          // Debug logging every 50 frames
          if (frameCount % 50 === 0) {
            console.log(`${lane} Analysis:`, {
              density: smoothedDensity.toFixed(1) + '%',
              vehicles: estimatedVehicles,
              vehicleCells: vehicleCells,
              redRatio: (redRatio * 100).toFixed(2) + '%',
              blueRatio: (blueRatio * 100).toFixed(2) + '%',
              whiteRatio: (whiteRatio * 100).toFixed(2) + '%'
            });
          }
        }

        animationId = requestAnimationFrame(processFrame);
      }
    };

    const handlePlay = () => {
      setIsProcessing(true);
      processFrame();
    };

    const handlePause = () => {
      setIsProcessing(false);
      if (animationId) cancelAnimationFrame(animationId);
    };

    const handleEnded = () => {
      setIsProcessing(false);
      if (animationId) cancelAnimationFrame(animationId);
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
  }, [videoUrl, lane, onDensityUpdate, onEmergencyDetected]);

  if (!videoUrl) return null;

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover rounded-lg"
        muted
        loop
        playsInline
      />
      <canvas
        ref={canvasRef}
        width="200"
        height="150"
        className="hidden"
      />
      {isProcessing && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          ● LIVE
        </div>
      )}
      {/* Signal Status Overlay */}
      {signalColor === 'red' && (
        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-lg border-2 border-red-500">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            🛑 STOPPED
          </div>
        </div>
      )}
      {signalColor === 'yellow' && (
        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center rounded-lg border-2 border-yellow-500">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            ⚠️ READY
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProcessor;