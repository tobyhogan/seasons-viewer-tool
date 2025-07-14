import React, { useState, useEffect } from 'react';

function Page2() {
  const [brightness, setBrightness] = useState<number>(30);
  const [results, setResults] = useState<Array<{date: Date, times: string[]}>>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Solar calculation functions (copied from DayView component)
  function sunIntensityAtTime(date: Date, lat: number, lon: number) {
    const hours = date.getUTCHours() + date.getUTCMinutes() / 60;

    // Day of year
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Declination of the sun
    const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));

    const solarTime = hours;
    const hourAngle = (solarTime - 12) * 15;
    const toRad = Math.PI / 180;

    const elevationRad = Math.asin(
        Math.sin(lat * toRad) * Math.sin(decl * toRad) +
        Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
    );

    const I0 = 1000;
    const k = 0.18;

    if (elevationRad <= 0) return 0;

    const intensityWm2 = I0 * Math.sin(elevationRad) * Math.exp(-k / Math.sin(elevationRad));

    // Calculate maximum possible intensity for this location (summer solstice at solar noon)
    const maxDecl = 23.44;
    const maxElevationRad = Math.asin(
        Math.sin(lat * toRad) * Math.sin(maxDecl * toRad) +
        Math.cos(lat * toRad) * Math.cos(maxDecl * toRad)
    );
    const maxIntensityWm2 = I0 * Math.sin(maxElevationRad) * Math.exp(-k / Math.sin(maxElevationRad));

    return intensityWm2 / maxIntensityWm2;
  }

  function findTimesForBrightness(date: Date, targetBrightness: number, tolerance: number = 1): string[] {
    const lat = 51.5074; // London latitude
    const lon = -0.1278; // London longitude
    const times: string[] = [];

    // First pass: check every 5 minutes to find approximate times
    const roughTimes: number[] = [];
    for (let hour = 0; hour < 24; hour += 1/12) { // 5-minute intervals
      const testDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(hour), (hour % 1) * 60, 0);
      const intensity = sunIntensityAtTime(testDate, lat, lon) * 100;
      
      if (Math.abs(intensity - targetBrightness) <= tolerance) {
        roughTimes.push(hour);
      }
    }

    // Second pass: for each rough time, find the exact minute using binary search
    for (const roughTime of roughTimes) {
      // Skip if too close to previous time (avoid duplicates)
      if (times.length > 0) {
        const lastTime = times[times.length - 1];
        const [lastH, lastM] = lastTime.split(':').map(Number);
        const lastHour = lastH + lastM / 60;
        if (Math.abs(roughTime - lastHour) < 0.5) continue; // Less than 30 minutes apart
      }

      // Binary search for exact minute
      let minHour = Math.max(0, roughTime - 1/12); // Start 5 minutes before
      let maxHour = Math.min(24, roughTime + 1/12); // End 5 minutes after
      let bestHour = roughTime;
      let bestDiff = Infinity;

      // Search with 1-minute precision
      for (let searchHour = minHour; searchHour <= maxHour; searchHour += 1/60) {
        const testDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(searchHour), (searchHour % 1) * 60, 0);
        const intensity = sunIntensityAtTime(testDate, lat, lon) * 100;
        const diff = Math.abs(intensity - targetBrightness);
        
        if (diff < bestDiff) {
          bestDiff = diff;
          bestHour = searchHour;
        }
      }

      // Only add if within tolerance
      if (bestDiff <= tolerance) {
        const h = Math.floor(bestHour);
        const m = Math.round((bestHour % 1) * 60);
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }

    return times;
  }

  const calculateBrightnessTimes = () => {
    setIsCalculating(true);
    const resultsArray: Array<{date: Date, times: string[]}> = [];
    const today = new Date();
    
    // Calculate for next 30 days
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const times = findTimesForBrightness(currentDate, brightness);
      
      if (times.length > 0) {
        resultsArray.push({
          date: new Date(currentDate),
          times: times
        });
      }
    }
    
    setResults(resultsArray);
    setIsCalculating(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    // Calculate on component mount
    calculateBrightnessTimes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Sky Brightness Tool
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Find Times for Specific Sky Brightness
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Enter a brightness percentage (relative to solar noon on June 21st) and see when that brightness occurs over the next 30 days.
          </p>
          
          <div className="flex items-center gap-4 mb-6">
            <label className="text-gray-700 dark:text-gray-300 font-medium">
              Brightness:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-700 dark:text-gray-300">%</span>
            
            <button
              onClick={calculateBrightnessTimes}
              disabled={isCalculating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Times when sky brightness is {brightness}% (next 30 days):
              </h3>
              
              <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-900 dark:text-white text-sm min-w-16">
                        {formatDate(result.date)}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {result.times.map((time, timeIndex) => (
                          <span 
                            key={timeIndex}
                            className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {results.length === 0 && !isCalculating && (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No times found for {brightness}% brightness in the next 30 days. Try a different brightness value.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            About This Tool
          </h3>
          <div className="text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              • Brightness is calculated as a percentage of the maximum solar intensity at solar noon on June 21st (summer solstice)
            </p>
            <p>
              • Calculations are based on London, UK coordinates (51.5074°N, 0.1278°W)
            </p>
            <p>
              • Times are shown in local time and account for atmospheric effects
            </p>
            <p>
              • The tool finds times within ±1% of your target brightness for precise results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page2;
