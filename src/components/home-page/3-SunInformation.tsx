import React from 'react';

function SunInformation() {
  return (
    <div className="rightColumn ml-2">
      <div className="border-2 h-fit rounded-lg p-4 w-fit bg-white mx-auto mb-2">
        <div className="mb-2 mx-auto">
          <label htmlFor="pet-select" className='mr-3'>Location Chosen:</label>
          <select
            name="location"
            id="location-select"
            className="border-[1px] border-black"
            defaultValue="london"
          >
            <option value="london">&nbsp;London&nbsp;</option>
            <option value="tokyo">&nbsp;Tokyo&nbsp;</option>
          </select>
        </div>
        <p className="mt-[7px] text-center underline text-[17px]">Sun & Sunlight Information:</p>
        <p className="mt-2 underline text-center text-[15px]">Year-round Daily-Peak Sun Intensities:</p>
        <div className="text-left w-fit mx-auto mt-[4px] min-w-[280px]">
          <div className="mt-2 flex">
            <span>Year's Highest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">100%</span>
          </div>
          <div className="flex">
            <span>75th Percentile:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">80.0%</span>
          </div>
          <div className="flex">
            <span>Average:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">59.9%</span>
          </div>
          <div className="flex">
            <span>25th Percentile:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">40.0%</span>
          </div>
          <div className="flex">
            <span>Year's Lowest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">19.7%</span>
          </div>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">24hr Average Sunlight Intensities</p>
        <div className="w-fit mx-auto mt-1 min-w-[280px]">
          <div className="flex">
            <span>Year's Highest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">100%</span>
          </div>
          <div className="flex">
            <span>Average:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">57.9%</span>
          </div>
          <div className="flex">
            <span>Year's Lowest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">15.8%</span>
          </div>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-peak Sun Elevation:</p>
        <div className="w-fit mx-auto mt-[4px] min-w-[280px]">
          <div className="flex">
            <span>Highest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">61.5°</span>
          </div>
          <div className="flex">
            <span>Average:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">38.5°</span>
          </div>
          <div className="flex">
            <span>Lowest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-12 text-left">15.5°</span>
          </div>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-Peak True Sun Intensities</p>
        <div className="w-fit mx-auto mt-1 min-w-[280px]">
          <div className="flex">
            <span>Highest ≈</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-20 text-left">900W/m²</span>
          </div>
          <div className="flex">
            <span>Average ≈</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-20 text-left">537.5W/m²</span>
          </div>
          <div className="flex">
            <span>Lowest ≈</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-20 text-left">175W/m²</span>
          </div>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daylight Lengths:</p>
        <div className="w-fit mx-auto mt-1 min-w-[280px]">
          <div className="flex">
            <span>Highest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-25 text-left">16hrs 32mins</span>
          </div>
          <div className="flex">
            <span>Average:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-24 text-left">11hrs 0 mins</span>
          </div>
          <div className="flex">
            <span>Lowest:</span>
            <span className="flex-1 border-b border-dotted border-black mx-1 mb-1"></span>
            <span className="w-24 text-left">6hrs 32mins</span>
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
