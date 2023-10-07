// API Key for OpenWeather
const apikey = "2ee05d60d6216c6006254d141e764f3a";
const citySearch = $("#btn-search");
const searchItem = $("#search-item");
const searchHistory = $(".search-history");

const oneValSearch =
  "api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}";
const twoValSearch =
  "api.openweathermap.org/data/2.5/forecast?q={city name},{country code}&appid={API key}";
const threeValSearch =
  "api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={API key}";

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
  console.log(recentSearches.searches);
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
  for (var i = 0; i < array.length; i++) {
    let previousSearchBtn = `<button type="button" id="search-item" class="btn btn-secondary" style="width: 90%">${array[i]}</button>`;
    let previousSearchLi = `<li id="previous-search-${
      i + 1
    }" class="my-2">${previousSearchBtn}</li>`; // Sets ID to "previous-search-#"
    searchHistory.append(previousSearchLi);
  }
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
    let city = cityQuery.split(", "); // Split values by comma for API call

    tempArray = addSearchQuery(tempArray, cityQuery);
    fillSearchHistory(tempArray);
  });

  // When user clicks on recent search
  searchItem.on("click", function () {
    // Gets corresponding search and fills search box with value
    let previousSearch = $(this).val();
    $("#get-city").val(previousSearch);
  });
});
