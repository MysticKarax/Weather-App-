"use strict";

import config from "./config.js";
const apiKey = config.apiKey;

// HTML ELEMENTS
const H_INPUT_CITIES = document.querySelector(".input-cities");
const H_BTN_SEARCH = document.querySelector("#btn-search");
const H_SELECTED_CITY = document.querySelector("#city-name");
const H_CURRENT_WEATHER_DATE = document.querySelector("#current-weather-date");
const H_CURRENT_EMOJI_WEATHER = document.querySelector(
  "#current-emoji-weather"
);
const H_CURRENT_TEMP_LABEL = document.querySelector("#current-weather-temp");
const H_CURRENT_WIND_LABEL = document.querySelector("#current-weather-wind");
const H_CURRENT_HUMIDITY_LABEL = document.querySelector(
  "#current-weather-humidity"
);
const H_BTN_COMMON_CITIES = document.querySelector("#common-cities");
const H_FORECAST_CONTAINER = document.querySelector(
  ".cards-forecast-container"
);

// Global Variables
let nSelectedCityID;

const aEmojiWeather = [
  {
    name: "Clear",
    emoji: "☀️",
  },
  {
    name: "Clouds",
    emoji: "⛅",
  },
  {
    name: "Rain",
    emoji: "☔",
  },
];

H_BTN_SEARCH.addEventListener("click", async (e) => {
  e.preventDefault();
  await searchCity();

  let cityExist = false;

  if (H_BTN_COMMON_CITIES.childElementCount <= 10) {
    for (let child of H_BTN_COMMON_CITIES.children) {
      if (child.textContent === oAppState.city) {
        cityExist = true;
        H_BTN_COMMON_CITIES.prepend(child);

        break;
      }
    }
  }

  if (!cityExist) {
    H_BTN_COMMON_CITIES.insertAdjacentHTML(
      "beforeend",
      `<button>${oAppState.city}</button>`
    );
  }
});

H_BTN_COMMON_CITIES.addEventListener("click", (e) => {
  let btn_target = e.target;
  if (!(btn_target instanceof HTMLButtonElement)) {
    return;
  }

  H_SELECTED_CITY.textContent = oAppState.city;
});

const oAppState = {
  currentWeather: {
    date: new Date().toLocaleDateString(),
    emoji: "",
    temp: "",
    wind: "",
    humidity: "",
  },
  city: "",
  forecastWeather: [],
};

function updateStateCurrentWeather(city, oCurrentWeather) {
  oAppState.city = city;
  oAppState.currentWeather.emoji = oCurrentWeather.emoji;
  oAppState.currentWeather.temp = `Temp: ${oCurrentWeather.temp}°F`;
  oAppState.currentWeather.wind = `Wind: ${oCurrentWeather.wind} MPH`;
  oAppState.currentWeather.humidity = `Humidity: ${oCurrentWeather.humidity}%`;
}

async function getCurrentWeather(city) {
  // Making the API call
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    if (response.status === 404) {
      alert("City Not Found. Please Try Another One");
      return;
    }
    const data = await response.json();
    nSelectedCityID = data.id;

    const oTodayWeatherInfo = {
      emoji: data.weather[0].main,
      temp: data.main.temp,
      wind: data.wind.speed,
      humidity: data.main.humidity,
    };

    updateStateCurrentWeather(data.name, oTodayWeatherInfo);
  } catch (error) {
    console.error(`An error has occurred: ${error}`);
  }
}

async function getWeatherPrediction(id) {
  // Making the API call
  const url = `https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const sFiveDayForecastDates = data.list
      .filter((object) =>
        object.dt_txt // Recorre todos los objetos y solo traeme de vuelta
          // los objetos que contengan la proiedad dt_txt
          .includes("12:00:00")
      ) // Ahora traeme solo los objetos cuyo hora de sus propiedades dt_txt
      // sean las 12 de la tarde
      .slice(0, 6) // Ahora creame un array con solo los primeros 5 resultados que te encuentres
      // En este caso no es necesario porque solo hay 5 dias en total pero no esta demas el filtro
      // .map((list) => list.dt_txt); // Por cada lista de todas las listas que hay traeme solo el valor
      .map((list) => {
        const forecast = {
          date: list.dt_txt,
          emoji: list.weather[0].main,
          temp: list.main.temp,
          wind: list.wind.speed,
          humidity: list.main.humidity,
        };
        return forecast;
      }); // Por cada lista de todas las listas que hay traeme solo el valor
    // de la propiedad dt_txt y guardalo en la variable sFiveDaysForecastDates

    oAppState.forecastWeather = [...sFiveDayForecastDates];
    displayWeatherCardInfo();
  } catch (error) {
    console.log(`An error has occurred: ${error}`);
  }
}

function displayWeatherCardInfo() {
  oAppState.forecastWeather.forEach((day) => {
    const H_CARDS = `
    <div class="card-forecast-weather">
    <h4 class="label-date cards-forecast">${day.date.slice(0, 10)}</h4>
    <p class="emoji-weather">${
      aEmojiWeather.find((object) => day.emoji === object.name).emoji
    }</p>
      <p>Temp: <span class="label-temp">${day.temp}</span>&deg;F</p>
      <p>Wind: <span class="label-wind">${day.wind}</span>MPH</p>
      <p>Humidity: <span class="label-humidity">${day.humidity}</span>%</p>
      </div>
      `;
    H_FORECAST_CONTAINER.insertAdjacentHTML("beforeend", H_CARDS);
  });
}

async function searchCity() {
  if (
    H_INPUT_CITIES.value === "" ||
    H_INPUT_CITIES.value === null ||
    H_INPUT_CITIES.value === undefined
  ) {
    return alert("Please search a valid city");
  }

  let sSelectedCity = H_INPUT_CITIES.value;

  try {
    await getCurrentWeather(sSelectedCity);
  } catch (error) {
    console.error("Error en searchCity");
  }

  if (nSelectedCityID) {
    getWeatherPrediction(nSelectedCityID);
    H_FORECAST_CONTAINER.innerHTML = "";
  } else {
    console.error("Error: nSelectedCityID Is Not Defined");
  }

  H_CURRENT_WEATHER_DATE.textContent = oAppState.currentWeather.date;
  const foundWeatherEmoji = aEmojiWeather.find(
    (object) => oAppState.currentWeather.emoji === object.name
  );

  if (foundWeatherEmoji) {
    H_CURRENT_EMOJI_WEATHER.textContent = foundWeatherEmoji.emoji;
  } else {
    console.error("Emoji Not Found: Assigning ❓ As Default");
    H_CURRENT_EMOJI_WEATHER.textContent = "❓";
  }

  H_SELECTED_CITY.textContent = oAppState.city;

  H_CURRENT_TEMP_LABEL.textContent = oAppState.currentWeather.temp;
  H_CURRENT_WIND_LABEL.textContent = oAppState.currentWeather.wind;
  H_CURRENT_HUMIDITY_LABEL.textContent = oAppState.currentWeather.humidity;
}
