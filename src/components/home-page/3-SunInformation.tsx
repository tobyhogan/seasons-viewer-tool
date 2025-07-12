import React from 'react';

function SunInformation() {
  return (
    <div className="w-fit mx-auto mb-2 animate-fade-in">
      <div className="modern-card shadow-modern-lg hover:shadow-modern-lg transition-all duration-300">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 rounded-t-2xl">
          <h2 className="text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
            📍 Location & Sun Data
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <label htmlFor="location-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              📍 Location Chosen:
            </label>
            <select
              name="location"
              id="location-select"
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              defaultValue="london"
            >
              <option value="london">🇬🇧 London</option>
              <option value="tokyo">🇯🇵 Tokyo</option>
            </select>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
            <h3 className="text-center font-semibold text-gray-800 dark:text-gray-100 mb-4 text-lg">
              ☀️ Sun & Sunlight Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-center text-gray-700 dark:text-gray-200 mb-2 text-sm border-b border-gray-200 dark:border-gray-600 pb-1">
                  🌞 Year-round Daily-Peak Sun Intensities
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Highest:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">75th %:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">80.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">59.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">25th %:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">40.0%</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Lowest:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">19.7%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-center text-gray-700 dark:text-gray-200 mb-2 text-sm border-b border-gray-200 dark:border-gray-600 pb-1">
                  📊 24hr Average Sunlight Intensities
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Highest:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">57.9%</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Lowest:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">15.8%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-center text-gray-700 dark:text-gray-200 mb-2 text-sm border-b border-gray-200 dark:border-gray-600 pb-1">
                  📐 Year-round Daily-peak Sun Elevation
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Highest:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">61.5°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">38.5°</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Lowest:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">15.5°</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-center text-gray-700 dark:text-gray-200 mb-2 text-sm border-b border-gray-200 dark:border-gray-600 pb-1">
                  ⚡ Year-round Daily-Peak True Sun Intensities
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Highest:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">≈900W/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">≈537.5W/m²</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Lowest:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">≈175W/m²</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-center text-gray-700 dark:text-gray-200 mb-2 text-sm border-b border-gray-200 dark:border-gray-600 pb-1">
                  🕐 Year-round Daylight Lengths
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Highest:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">16h 32m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Average:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">11h 0m</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-300">Lowest:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">6h 32m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden border-2 h-fit mt-4 rounded-lg p-4 w-fit bg-white">
        <p>Three variables to track:</p>
        <p>- Maximum Intensity of Sun</p>
        <p>- Day Length</p>
        <p>- Maximum Height of Sun in Sky</p>
      </div>
    </div>
  );
}

export default SunInformation;