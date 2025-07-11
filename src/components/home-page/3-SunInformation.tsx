import React from 'react';

function SunInformation() {
  return (
    <div className="rightColumn ml-2">
      <div className="border-2 h-fit rounded-lg p-4 w-fit bg-white mx-auto mb-2">
        <div className="mb-2 mx-auto">
          <label htmlFor="pet-select">Location Chosen:</label>
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
        <div className="text-left w-fit mx-auto mt-[4px]">
          <p className="mt-2">Year's Highest: _____ˍ100%</p>
          <p className="">75th Percentile: ____ˍ80.0%</p>
          <p className="">Average: ___________ˍ59.9%</p>
          <p className="">25th Percentile: ˍ____40.0%</p>
          <p className="">Year's Lowest: ______ˍ19.7%</p>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">24hr Average Sunlight Intensities</p>
        <div className="w-fit mx-auto mt-1">
          <p className="">Year's Highest: _____100%</p>
          <p className="">Average: __________57.9%</p>
          <p className="">Year's Lowest: _____ˍ15.8%</p>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-peak Sun Elevation:</p>
        <div className="w-fit mx-auto mt-[4px]">
          <p className="">Highest: ______61.5°</p>
          <p className="">Average: ______38.5°</p>
          <p className="">Lowest: ______ˍ15.5°</p>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-Peak True Sun Intensities</p>
        <div className="w-fit mx-auto mt-1">
          <p className="">Highest ≈ _____ˍ900W/m²</p>
          <p className="">Average ≈ _____ˍ537.5W/m²</p>
          <p className="">Lowest ≈ ______175W/m²</p>
        </div>
        <p className="mt-[5px] underline text-center text-[15px]">Year-round Daylight Lengths:</p>
        <div className="w-fit mx-auto mt-1">
          <p className="">Highest: _____16hrs 32mins</p>
          <p className="">Average: _____11hrs 0 mins</p>
          <p className="">Lowest: ______6hrs 32mins</p>
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