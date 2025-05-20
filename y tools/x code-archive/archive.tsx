    <div>


    
    <button id="darkModeToggle"
      class="fixed top-4 right-4 z-50 px-4 py-2 rounded-md bg-gray-200 text-gray-800 shadow hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition"
      aria-label="Toggle dark mode">
      🌙
    </button>

    <div class="w-screen h-screen bg-gray-50">

      <div class="container1 w-fit justify-center mx-auto">

        <div id="column1" class="mt-4 w-fit rounded-lg">
          
          <h1 class="mx-auto text-center text-2xl mt-4 mb-4">Season & Sun Info</h1>

          <div class="rounded-lg border-2 border-black bg-white">

            <h2 class="text-center text-[19px] mt-2 underline">Sun Info - Year View</h2>

            <canvas id="seasonsCanvas" class=" border-x-2 border-t-2 rounded-lg border-white mb-[7px]"></canvas>

            <div class="flex flex-row justify-center mb-4">

              <div class="flex flex-col pl-8">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="toggleYellowMarkers" checked />
                  Latent-Heat Adjusted Intensity-Based Markers
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="toggleRedMarkers" checked />
                  Intensity-Based Markers
                </label>
              </div>

              <div class="flex flex-col">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="toggleBlueMarkers" checked />
                  Time-based Markers
                </label>
              </div>

            </div>

            <div class="border-t-2"></div>
    
            <div id="bottom-features" class="border-x-2 border-b-2 pb-4 rounded-lg border-white">
    
              <div class="mx-auto w-fit mb-2.5">
                <button id="setToTodayButton" class="mt-4 px-5 py-2 bg-[#09bb4b] rounded-md text-white text-md cursor-pointer font-semibold text-[16px]">Set to Today</button>
              </div>
    
              <div id="formattedDate" class="info text-center mt-1 mb-1"></div>
              <p class="text-center underline mt-[4px] mb-1 text-[18px]">Sun Information:</p>
              <div id="sunlightPercentage" class="info text-center"></div>
              <div id="avgSunlightPercentage" class="info text-center"></div>
              
              <div id="sunElevationAngle" class="info text-center"></div>
              
              <div id="daylightPercentage" class="info text-center"></div>
              <div id="daylightLength" class="info text-center"></div>
    
            </div> 
          </div>



        </div>

        <div class="middleColumn border-2 rounded-lg h-fit mt-[130px] ml-3 w-[600px] pl-[11px] bg-white pb-3">

          <h2 class="text-center underline text-lg mt-2">Sun Info - Day View</h2>

          <div class="dayViewTool">
            <p>!-- Add this line for time selected display --</p>
          </div>

          
          <div class="mx-auto w-fit mb-2.5">
            <button id="setToNowButton" class="px-5 py-2 bg-[#09bb4b] rounded-md text-white text-md cursor-pointer font-semibold text-[16px]">Set to Now</button>
          </div>

          <div id="dayViewTimeSelected" class="text-center text-[16px] mt-2"></div>
          <div id="dayViewCurrentSunAngle" class="text-center text-[16px] mt-1"></div>
          
        </div>

        <div class="rightColumn">

          <div class="border-2 h-fit rounded-lg p-4 w-fit bg-white">


            <div class="mb-2">
              <label for="pet-select">Location Chosen:</label>
    
              <select name="location" id="location-select" class="border-[1px] border-black">
                <option value="london" selected="selected">&nbsp;London&nbsp;</option>
                <option value="tokyo">&nbsp;Tokyo&nbsp;</option>
              </select>
            </div>

            <p class="mt-[7px] text-center underline text-[17px]">Sun & Sunlight Information:</p>

            <p class="mt-2 underline text-center text-[16px]">Year-round Daily-Peak Intensities:</p>

            <div class="text-left w-fit mx-auto mt-[8px]">
              <p class="mt-2">Year's Highest: _____ˍ100%</p>
              <p class="">75th Percentile: ____ˍ80.0%</p>
              <p class="">Average: ___________ˍ59.9%</p>
              <p class="">25th Percentile: ˍ____40.0%</p>
              <p class="">Year's Lowest: ______ˍ19.7%</p>
            </div>

            <p class="mt-[8px] underline text-center text-[16px]">24hr Sunlight Intensity Averages</p>
            <div class="w-fit mx-auto mt-2">
              <p class="">Year's Highest: _____63.7%</p>
              <p class="">Average: _____38.1%</p>
              <p class="">Year's Lowest: _____ˍ12.5%</p>
            </div>
            
            <p class="mt-[8px] underline text-center text-[16px]">Year-round Daily-Peak Sun Elevation:</p>
            <div class="w-fit mx-auto mt-[5px]">
              <p class="">Highest: ______61.5°</p>
              <p class="">Average: ______38.5°</p>
              <p class="">Lowest: ______ˍ15.5°</p>
            </div>
            
            <p class="mt-[8px] underline text-center text-[16px]">Year-round Daily-peak True Sun Intensities</p>
            <div class="w-fit mx-auto mt-2">
              <p class="">Highest ≈ _____ˍ900W/m²</p>
              <p class="">Average ≈ _____ˍ537.5W/m²</p>
              <p class="">Lowest ≈ ______175W/m²</p>
            </div>

            <p class="mt-[8px] underline text-center text-[16px]">Year-round Daylight Lengths:</p>
            <div class="w-fit mx-auto mt-2">
              <p class="">Highest: _____16hrs 32mins</p>
              <p class="">Average: _____11hrs 0 mins</p>
              <p class="">Lowest: ______6hrs 32mins</p>
            </div>


          </div>

          <div class="border-2 h-fit mt-4 rounded-lg p-4 w-fit bg-white">
            <p>Three variables to track:</p>
            <p>- Maximum Intensity of Sun</p>
            <p>- Day Length</p>
            <p>- Maximum Height of Sun in Sky</p>

          </div>



        </div>