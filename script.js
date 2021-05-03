//Variables needed = city, search, clear, 
//temp, humidity, wind, UV, future forecast
const cityEl = document.getElementById("enter-city");
const searchEl = document.getElementById("search-button");
const clearEl = document.getElementById("clear-history");
const nameEl = document.getElementById("city-name");
const currentPicEl = document.getElementById("current-pic");
const currentTempEl = document.getElementById("temperature");
const currentHumidityEl = document.getElementById("humidity");
const currentWindEl = document.getElementById("wind-speed");
const currentUVEl = document.getElementById("UV-index");
const historyEl = document.getElementById("history");
var fivedayEl = document.getElementById("fiveday-header");
var todayweatherEl = document.getElementById("today-weather");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

// Use the API key here
const APIKey = "4522a7b988b7fe26751a3d7a52f304ab";

function getWeather(cityName) {
    // Pull the current weather from OpenWeather API
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial" + "&appid=" + APIKey;
    axios.get(queryURL)
        .then(function (response) {

            todayweatherEl.classList.remove("d-none");

            // Parse response to display current weather
            const currentDate = new Date(response.data.dt * 1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
            let weatherPic = response.data.weather[0].icon;
            currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicEl.setAttribute("alt", response.data.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + (response.data.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
            
            // Get UV Index
            let lat = response.data.coord.lat;
            let lon = response.data.coord.lon;
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
            axios.get(UVQueryURL)
                .then(function (response) {
                    let UVIndex = document.createElement("span");
                    
                    // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                    if (response.data[0].value < 4 ) {
                        UVIndex.setAttribute("class", "badge badge-success");
                    }
                    else if (response.data[0].value < 8) {
                        UVIndex.setAttribute("class", "badge badge-warning");
                    }
                    else {
                        UVIndex.setAttribute("class", "badge badge-danger");
                    }
                    
                    UVIndex.innerHTML = response.data[0].value;
                    currentUVEl.innerHTML = "UV Index: ";
                    currentUVEl.append(UVIndex);
                });
            
            // Get 5 day forecast for the chosen city
            let cityID = response.data.id;
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial" + "&appid=" + APIKey;
            axios.get(forecastQueryURL)
                .then(function (response) {
                    fivedayEl.classList.remove("d-none");
                    
                    //  Make it possible to display forecast for next 5 days
                    const forecastEls = document.querySelectorAll(".forecast");
                    for (i = 0; i < forecastEls.length; i++) {
                        forecastEls[i].innerHTML = "";
                        const forecastIndex = i * 8 + 4;
                        const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                        const forecastDay = forecastDate.getDate();
                        const forecastMonth = forecastDate.getMonth() + 1;
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                        forecastEls[i].append(forecastDateEl);

                        // Find and DISPLAY icon for current weather
                        const forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                        forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                        forecastEls[i].append(forecastWeatherEl);
                        const forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = "Temp: " + (response.data.list[forecastIndex].main.temp) + " &#176F";
                        forecastEls[i].append(forecastTempEl);
                        const forecastHumidityEl = document.createElement("p");
                        forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                        forecastEls[i].append(forecastHumidityEl);
                    }
                })
        });
}

// When you click "Search", push text to local storage
searchEl.addEventListener("click", function () {
    const searchTerm = cityEl.value;
    getWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
})

// Clear History button
clearEl.addEventListener("click", function () {
    localStorage.clear();
    searchHistory = [];
    renderSearchHistory();
})

//items from search history need to be displayed in a list
function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
            getWeather(historyItem.value);
        })
        historyEl.append(historyItem);
    }
}

renderSearchHistory();
if (searchHistory.length > 0) {
    getWeather(searchHistory[searchHistory.length - 1]);
}
 