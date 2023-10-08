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

const displayCity = $(".current-city");
const displayHumidity = $(".current-humidity");
const displayWind = $(".current-wind");
const displayClouds = $(".current-clouds");
const displayTemp = $(".current-temperature");

function initializeLocalStorage() {
  // Create initial JSON object, convert to string before
  // adding to localStorage
  let initialObject = {
    searches: [],
  };
  let initObjToString = JSON.stringify(initialObject);
  localStorage.setItem("recent-searches", initObjToString);
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
  // Removes last element from array using .pop() method
  // If user exceeds 5 previous searches
  // Adds new search query using unshift to push to beginning of array
  if (array.length === 5) {
    array.pop();
  }
  array.unshift(query);
  return array;
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

// Function takes input string searchInput and parses city name,
// state codes, and country codes
function parseInput(searchInput) {
  searchInput = searchInput.split(", "); // Split values by comma for API call

  // Inialize empty variables for testing
  let city = "";
  let state = "";
  let country = "";
  let validState = false;
  let validCountry = false;

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

$(function () {
  // For testing purposes while OpenWeather
  // isn't integrated
  let tempResponse = true;
  let tempSuccess = 200;
  let tempFailure = 404;

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
    let apiCoordinates = parseInput(cityQuery);

    // Since all error messages don't begin with
    // an "h", we can check if returned apiCall
    // should be displayed as search or error
    if (apiCoordinates[0] !== "h") {
      // Set button to red background and display error
      citySearch.removeClass("btn-secondary");
      citySearch.addClass("btn-danger");
      citySearch.text("");
      citySearch.text(apiCoordinates);
      setTimeout(function () {
        citySearch.removeClass("btn-danger");
        citySearch.addClass("btn-secondary");
        citySearch.text("");
        citySearch.text("Search");
      }, 4000);
    } else {
      fetch(apiCoordinates, { cache: "reload" })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
        });
      tempArray = addSearchQuery(tempArray, cityQuery); // Adds saerch query to array
      fillSearchHistory(tempArray); // Fills in recent searches
      storeSearches(tempArray); // Stores new data in localStorage
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
