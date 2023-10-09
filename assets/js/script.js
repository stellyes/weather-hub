// Country codes provided by Github Gist at https://gist.github.com/ssskip/5a94bfcd2835bf1dea52
import countries from "./country-codes.json" assert { type: "json" };
import states from "./state-codes.json" assert { type: "json" };

// API Key for OpenWeather
const apikey = "2ee05d60d6216c6006254d141e764f3a";
const citySearch = $("#btn-search");
const searchItem = $(".search-item");
const searchHistory = $(".search-history");
const unitDisplay = $("#units");
const unitSwitch = $("#unit-switch");
const stateList = states.objects;
const countryList = countries.objects;
var units = "imperial";

const displayDefault = $(".default-view");
const displayCity = $(".current-city");
const displayHumidity = $(".current-humidity");
const displayWind = $(".current-wind");
const displayTemp = $(".current-temperature");
const displayConditions = $(".current-conditions");

const conditionList = [
  "Thunderstorm",
  "Drizzle",
  "Rain",
  "Snow",
  "Mist",
  "Smoke",
  "Haze",
  "Dust",
  "Fog",
  "Sand",
  "Ash",
  "Squall",
  "Tornado",
  "Clear",
  "Clouds",
];

const conditionIcons = [
  "11d",
  "09d",
  "10d",
  "13d",
  "50d",
  "50d",
  "50d",
  "50d",
  "50d",
  "50d",
  "50d",
  "50d",
  "50d",
  "01d",
  "03d",
];

function initializeLocalStorage() {
  // Create initial JSON object, convert to string before
  // adding to localStorage
  let initialObject = {
    searches: [],
  };
  let initObjToString = JSON.stringify(initialObject);
  localStorage.setItem("recent-searches", initObjToString);
}

// Uses radix algorithm to sort data in conditions array
// Returns condition of highest occurance
function radixSortConditions(array) {
  // Initialize temp array of conditionsList length
  // filled with zeros
  let radix = Array(conditionList.length).fill(0);

  // Fill temp array and increment each corresponding
  // index from conditionList in radix array
  for (let i = 0; i < array.length; i++) {
    let index = conditionList.indexOf(array[i]);
    radix[index]++;
  }

  let max = 0;
  let maxIndex = 0;
  // Find max value in radix array
  for (let i = 0; i < radix.length; i++) {
    if (radix[i] > max) {
      max = radix[i];
      maxIndex = i;
    }
  }

  return conditionList[maxIndex];
}

function retrieveSearches() {
  // Get recent-searches string from localStorage and
  // parse to JSON to get array of recent searches
  let recentSearches = localStorage.getItem("recent-searches");
  recentSearches = JSON.parse(recentSearches);
  return recentSearches.searches;
}

// Stores latest version of previous searches
// on every search
function storeSearches(array) {
  let recentSearches = { searches: array };
  recentSearches = JSON.stringify(recentSearches);
  localStorage.setItem("recent-searches", recentSearches);
}

function addSearchQuery(array, query) {
  // Checks if element already exists in history
  // Removes last element from array using .pop() method
  // If user exceeds 5 previous searches
  // Adds new search query using unshift to push to beginning of array
  if (array.indexOf(query) === -1) {
    if (array.length === 5) {
      array.pop();
    }
    array.unshift(query);
    return array;
  }
}

// Displays error message passed into function
function searchError(message) {
  citySearch.removeClass("btn-secondary");
  citySearch.addClass("btn-danger");
  citySearch.text(message);
  setTimeout(function () {
    citySearch.removeClass("btn-danger");
    citySearch.addClass("btn-secondary");
    citySearch.text("Search");
  }, 4000);
}

function fillSearchHistory(array) {
  let noResults = $(".no-history");

  // Prompt user to make a search if nothing is in the search history
  if (array.length !== 0) {
    // Hide noResults element
    noResults.css("display", "none");

    // Empty existing elements from parent ul
    searchHistory.empty();

    // If array has values, fill search history box with buttons of prior searches
    for (var i = 0; i < array.length; i++) {
      let previousSearchBtn = `<button type="button" class="search-item btn btn-secondary" style="width: 90%">${array[i]}</button>`;
      let previousSearchLi = `<li class="previous-search my-2">${previousSearchBtn}</li>`; // Sets ID to "previous-search-#"
      searchHistory.append(previousSearchLi);
    }
  } else {
    // Show filler if no elements present
    noResults.css("display", " ");
  }
}

// Function takes input string searchInput and parses
// city name, state codes, and country codes
function parseInput(searchInput) {
  searchInput = searchInput.split(", "); // Split values by comma for API call

  // Inialize empty variables for testing
  let city = "";
  let state = "";
  let country = "";
  let validState = false;
  let validCountry = false;
  // ADD TWO API CALLS, ONE FOR CURRENT ONE FIVE DAY
  let currentConditions = "";
  let fiveDay = "";

  console.log(searchInput);
  if (searchInput.length === 3) {
    city = searchInput[0];
    state = searchInput[1];
    country = searchInput[2];

    // Check if state input exists in list of states
    // JSON structure gives user option to type out name of
    // state or state abbreviation
    for (let i = 0; i < stateList.length - 1; i++) {
      if (stateList[i].name === state || stateList[i].code === state) {
        validState = true;
      }
    }

    // Return string with error message if invalid state
    if (validState === false) {
      return "Invalid input for state";
    }

    // Check if country input exists in list of countries
    // Same functionality as state search applies
    for (let i = 0; i < countryList.length - 1; i++) {
      if (countryList[i].name === country || countryList[i].code === country) {
        validCountry = true;
      }
    }

    if (validCountry === false) {
      return "Invalid input for country";
    }

    // If input is validated, return HTTP API call url
    return `http://api.openweathermap.org/data/2.5/forecast?q=${city},${state},${country}&units=${units}&appid=${apikey}`;
  } else if (searchInput.length === 2) {
    // Same functionality as prior conditional response
    // with one less parameter
    city = searchInput[0];
    country = searchInput[1];

    for (let i = 0; i < countryList.length - 1; i++) {
      if (countryList[i].name === country || countryList[i].code === country) {
        validCountry = true;
      }
    }

    if (validCountry === false) {
      return "Invalid input for country";
    }

    return `http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=${units}&appid=${apikey}`;
  } else if (searchInput.length === 1) {
    // One parameter API calls require no input validation
    return `http://api.openweathermap.org/data/2.5/forecast?q=${searchInput[0]}&units=${units}&appid=${apikey}`;
  }
  // Return instructional error message if input parameters
  // exceed three
  return 'Use "City, State, Country" format';
}

// Fills current weather and five day forecast cards
function fillFiveForecast(data) {
  // Gets forecast in 3hr intervals for five days
  let forecastData = data.list;
  for (let i = 0; i < 5; i++) {
    // tempAvg to store average temp reading for 3hr intervals
    // conditionAvg used to return most common condition reading
    let tempAvg = 0;
    let conditionAvg = "";
    let conditionAvgList = [];
    let dataDate = forecastData[i * 8].dt_txt.split(" ");
    let currDate = dayjs(dataDate[0]).format("MMM D");
    // i * 8 - 1 gets indexes for each corresponding day
    // Day 1 = 0-7, Day 2 = 8-15, and so on
    for (let j = i * 8; j < i * 8 + 8; j++) {
      tempAvg += forecastData[j].main.temp;
      conditionAvgList.push(forecastData[j].weather[0].main);
    }

    // Calculate average conditions for that day
    tempAvg = Math.floor(tempAvg / 5);
    conditionAvg = radixSortConditions(conditionAvgList);
    let imgCodeIndex = conditionList.indexOf(conditionAvg);
    let imgCode = conditionIcons[imgCodeIndex];
    let conditionImg = `http://openweathermap.org/img/w/${imgCode}.png`;
    // Fill HTML elements with corresponding data
    $(`#day${i + 1} .card-header`).text(currDate);
    $(`#day${i + 1} .card-body #temp`).text(tempAvg + "°F");
    $(`#day${i + 1} .card-body #condition-icon`).attr("src", conditionImg);
    $(`#day${i + 1} .card-body #condition`).text(conditionAvg);
  }
}

$(function () {
  // Try to get localStorage "recent-searches" item
  // If val doesn't exist, create item
  if (!localStorage.getItem("recent-searches")) {
    initializeLocalStorage();
  }

  // Retrieve preevious searches and fill recent search box
  let tempArray = retrieveSearches();
  fillSearchHistory(tempArray);

  // When user searches for city
  citySearch.on("click", function () {
    let cityQuery = $("#get-city").val(); // Get value from search box
    let apiCallFiveDay = parseInput(cityQuery);

    // Since all error messages don't begin with
    // an "h", we can check if returned apiCall
    // should be displayed as search or error
    if (apiCallFiveDay[0] !== "h") {
      searchError(apiCallFiveDay);
    } else {
      fetch(apiCallFiveDay, { cache: "reload" })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // Get response code
          let responseCode = data.cod;

          // Fill in forecast data if 200 response
          if (responseCode == 200) {
            fillFiveForecast(data); // Fills five day forecast data

            // Add search query to history if location is validated
            tempArray = addSearchQuery(tempArray, cityQuery); // Adds saerch query to array
            fillSearchHistory(tempArray); // Fills in recent searches
            storeSearches(tempArray); // Stores new data in localStorage
            // Display error message if 404 response
          } else if (responseCode == 404) {
            searchError("Unable to locate city");
          }
          console.log(data);
        });
    }

    // Displays five day forecast if it's hidden
    if ($("#inactive-display")) {
      $("#inactive-display").css("display", " ");
    }
  });

  unitSwitch.on("click", function () {
    if (unitDisplay.text() == "Metric Units") {
      unitDisplay.attr("data-units", "imperial");
      unitDisplay.text("Imperial Units");
      units = "imperial";
    } else {
      unitDisplay.attr("data-units", "metric");
      unitDisplay.text("Metric Units");
      units = "metric";
    }
  });

  // Isn't registering clicks?
  searchItem.on("click", function (event) {
    console.log(event);
  });
});
