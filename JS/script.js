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
let nSelectedCityLat;
let nSelectedCityLon;
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

H_BTN_SEARCH.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("click");
});

// El EventListener se vuelve asincrono para asegurar que la funcion GetCurrentWeather devuelva el
// ID correcto de nSelectedCityID antes de intentar ejecutar la funcion getWeatherPrediction y asi
// evitar el error 400 bad request
H_BTN_COMMON_CITIES.addEventListener("click", async (e) => {
  let btn_target = e.target;
  if (!(btn_target instanceof HTMLButtonElement)) {
    return;
  }

  H_SELECTED_CITY.textContent = btn_target.dataset.city;
  nSelectedCityLat = +btn_target.dataset.lat; // +btn_target.dataset.lat y Number(btn_target.dataset.lat) son lo mismo pero mas "fancy"
  nSelectedCityLon = +btn_target.dataset.lon;

  await getCurrentWeather(nSelectedCityLat, nSelectedCityLon); // Esperando a que esta funcion devuelva el ID de la ciudad seleccionada

  if (nSelectedCityID) {
    // Validando el ID de la ciudad
    getWeatherPrediction(nSelectedCityID); // Se ejecuta solo si hay un valor válido
    H_FORECAST_CONTAINER.innerHTML = ""; // Limpiar el contenedor para insertar los nuevos datos
  } else {
    console.error("Error: nSelectedCityID Is Not Defined");
  }

  H_CURRENT_WEATHER_DATE.textContent = oAppState.currentWeather.date;
  const foundWeatherEmoji = aEmojiWeather.find(
    (object) => oAppState.currentWeather.emoji === object.name
  );

  // Verifica si se encontró el objeto antes de acceder a sus propiedades
  if (foundWeatherEmoji) {
    H_CURRENT_EMOJI_WEATHER.textContent = foundWeatherEmoji.emoji;
  } else {
    console.error("Emoji Not Found: Assigning ❓ As Default");
    H_CURRENT_EMOJI_WEATHER.textContent = "❓"; // Asignar emoji por defecto
  }

  H_CURRENT_TEMP_LABEL.textContent = oAppState.currentWeather.temp;
  H_CURRENT_WIND_LABEL.textContent = oAppState.currentWeather.wind;
  H_CURRENT_HUMIDITY_LABEL.textContent = oAppState.currentWeather.humidity;
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
  oAppState.currentWeather.temp = oCurrentWeather.temp;
  oAppState.currentWeather.wind = oCurrentWeather.wind;
  oAppState.currentWeather.humidity = oCurrentWeather.humidity;
}

async function getCurrentWeather(lat, lon) {
  // Making the API call
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
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
