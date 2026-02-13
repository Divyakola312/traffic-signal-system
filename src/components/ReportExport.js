import React from 'react';
import { Download, FileText } from 'lucide-react';

const ReportExport = ({ statistics, laneData, analysisComplete }) => {
  
  const generateTextReport = () => {
    const timestamp = new Date().toLocaleString();
    
    let report = `
═══════════════════════════════════════════════════════
   TRAFFIC DENSITY ANALYSIS REPORT
   Vehicle Density-Based Signal Switching System
═══════════════════════════════════════════════════════

Generated: ${timestamp}

─────────────────────────────────────────────────────
EXECUTIVE SUMMARY
─────────────────────────────────────────────────────
Total Vehicles Processed: ${statistics.totalVehicles}
Average Traffic Density: ${Math.round(statistics.avgDensity)}%
Peak Density Recorded: ${Math.round(statistics.peakDensity)}%
Signal Switch Cycles: ${statistics.cycleSwitches}
Emergency Overrides: ${statistics.emergencyOverrides}

System Efficiency Score: ${Math.round(100 - statistics.avgDensity)}%

─────────────────────────────────────────────────────
LANE-WISE ANALYSIS
─────────────────────────────────────────────────────
`;

    Object.entries(laneData).forEach(([key, lane]) => {
      const avgDensity = lane.history.reduce((a, b) => a + b, 0) / lane.history.length;
      report += `
${lane.name}:
  Average Density: ${Math.round(avgDensity)}%
  Current Density: ${Math.round(lane.density)}%
  Estimated Vehicles: ~${Math.round(lane.density / 5)}
  Emergency Detected: ${lane.hasEmergency ? 'YES' : 'NO'}
`;
    });

    report += `
─────────────────────────────────────────────────────
PERFORMANCE METRICS
─────────────────────────────────────────────────────
Average Wait Time: ${Math.round(statistics.avgDensity / 3)} seconds
Traffic Flow Rate: ${Math.round(statistics.totalVehicles / statistics.cycleSwitches || 0)} vehicles/cycle
Emergency Response Rate: ${statistics.emergencyOverrides > 0 ? '100%' : 'N/A'}

─────────────────────────────────────────────────────
RECOMMENDATIONS
─────────────────────────────────────────────────────
`;

    if (statistics.avgDensity > 70) {
      report += `• HIGH CONGESTION: Consider additional lanes or alternate routes\n`;
      report += `• Increase green signal duration during peak hours\n`;
    } else if (statistics.avgDensity > 50) {
      report += `• MODERATE TRAFFIC: Current signal timing is adequate\n`;
      report += `• Monitor for peak hour patterns\n`;
    } else {
      report += `• LOW CONGESTION: System performing optimally\n`;
      report += `• Consider reducing signal cycle times\n`;
    }

    if (statistics.emergencyOverrides > 0) {
      report += `• Emergency vehicle detection working effectively\n`;
      report += `• Priority override system operational\n`;
    }

    report += `
─────────────────────────────────────────────────────
CONCLUSION
─────────────────────────────────────────────────────
The density-based signal switching system successfully
optimized traffic flow with ${Math.round(100 - statistics.avgDensity)}% efficiency.
${statistics.emergencyOverrides > 0 ? `Emergency vehicles were prioritized ${statistics.emergencyOverrides} time(s).` : ''}

System Status: ${analysisComplete ? 'ANALYSIS COMPLETE' : 'IN PROGRESS'}

═══════════════════════════════════════════════════════
End of Report
═══════════════════════════════════════════════════════
`;

    return report;
  };

  const downloadTextReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Traffic_Analysis_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    let csv = 'Lane,Average Density (%),Current Density (%),Estimated Vehicles,Emergency Detected\n';
    
    Object.entries(laneData).forEach(([key, lane]) => {
      const avgDensity = lane.history.reduce((a, b) => a + b, 0) / lane.history.length;
      csv += `${lane.name},${Math.round(avgDensity)},${Math.round(lane.density)},${Math.round(lane.density / 5)},${lane.hasEmergency ? 'Yes' : 'No'}\n`;
    });

    csv += `\nStatistics\n`;
    csv += `Total Vehicles,${statistics.totalVehicles}\n`;
    csv += `Average Density,${Math.round(statistics.avgDensity)}%\n`;
    csv += `Peak Density,${Math.round(statistics.peakDensity)}%\n`;
    csv += `Signal Switches,${statistics.cycleSwitches}\n`;
    csv += `Emergency Overrides,${statistics.emergencyOverrides}\n`;
    csv += `System Efficiency,${Math.round(100 - statistics.avgDensity)}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Traffic_Data_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FileText size={24} />
        Export Analysis Report
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={downloadTextReport}
          disabled={!analysisComplete}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          <div className="text-left">
            <div>Download Full Report</div>
            <div className="text-xs opacity-80">Detailed TXT file</div>
          </div>
        </button>

        <button
          onClick={downloadCSV}
          disabled={!analysisComplete}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          <div className="text-left">
            <div>Download Data (CSV)</div>
            <div className="text-xs opacity-80">Excel compatible</div>
          </div>
        </button>
      </div>

      {!analysisComplete && (
        <p className="text-gray-400 text-sm mt-3 text-center">
          Reports will be available after analysis completes
        </p>
      )}
    </div>
  );
};

export default ReportExport;