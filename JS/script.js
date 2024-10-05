"use strict";

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
const htest = document.querySelector(".simon");

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

  // Borre el array de ciudades porque ya era innecesario

  H_SELECTED_CITY.textContent = btn_target.dataset.city;
  nSelectedCityLat = +btn_target.dataset.lat;
  nSelectedCityLon = +btn_target.dataset.lon;

  await getCurrentWeather(nSelectedCityLat, nSelectedCityLon); // Esperando a que esta funcion devuelva el ID de la ciudad seleccionada
  console.log(
    "nSelectedCityID después de getCurrentWeather: ",
    nSelectedCityID
  ); // Verifica el valor de nSelectedCityID

  if (nSelectedCityID) {
    // Validando el ID de la ciudad
    getWeatherPrediction(nSelectedCityID); // Se ejecuta solo si hay un valor válido
    H_FORECAST_CONTAINER.innerHTML = ""; // Limpiar el contenedor para insertar los nuevos datos
  } else {
    console.error("Error: nSelectedCityID no está definido.");
  }

  H_CURRENT_WEATHER_DATE.textContent = oAppState.currentWeather.date;
  H_CURRENT_EMOJI_WEATHER.textContent = aEmojiWeather.find(
    (object) => oAppState.currentWeather.emoji === object.name
  ).emoji;
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

// TODO: Al presionar cualquier boton, reemplazar los datos de
// las tarjetas html por las de este array con objetos
// Borrar todas las tarjetas y hacer el template string de 1 sola tarjeta.
// Iterar en la cantidad de dias de las tarjetas para usar ese template

// Ubicacion de la ciudad

// Escribi "&units=imperial" porque quiero que las unidades de medida sean imperiales ya esa es la que usan los gringos.
// function weatherFunction(lat, lon, apiKey, units) {
//   return { lat, lon, apiKey, units };
// }

// weatherFunction(
//   (apiKey = apiKey),
//   (units = "imperial"),
//   (lon = austinLon),
//   (lat = austinLat)
// );
// Se inicia la peticion de datos a la API
// fetch(url)
//   .then((response) => {
//     // Verificar si la respuesta es correcta
//     if (!response.ok) {
//       throw new Error("There was something wrong at gathering data");
//     }
//     return response.json(); // Convertimos la respuesta a JSON
//   })
//   .then((data) => {
//     // Los datos del clima se muestran en pantalla
//     console.log(data);
//     // Accede a propiedades especificas, por ejemplo, el pronostico actual
//     console.log(`The city is: ${data.name}`);
//     console.log(`Temp: ${data.main.temp}°F`);
//     console.log(`Wind: ${data.wind.speed} MPH`);
//     console.log(`Humidity: ${data.main.humidity}%`);
//     // O para el pronostico de varios dias (si esta en el objeto)
//     // const dailyForecast = data.daily;
//     // dailyForecast.forEach((day) => {
//     //   console.log(`Dia: ${new Date(day.dt * 1000).toLocaleDateString()}`);
//     //   console.log(`Temperatura: ${day.temp.day}°C`);
//     //   console.log(`Clima: ${day.weather[0].description}`);
//     // });
//   })
//   .catch((error) => {
//     console.log("An error has occurred", error);
//   });

async function getCurrentWeather(lat, lon) {
  const apiKey = "11d8e389af94a51e755bd821fe9be18a";
  // Making the API call
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    nSelectedCityID = data.id;
    console.log(nSelectedCityID);
    // console.log(`Clima: ${JSON.stringify(data, null, 2)}`);

    const oTodayWeatherInfo = {
      emoji: data.weather[0].main,
      temp: data.main.temp,
      wind: data.wind.speed,
      humidity: data.main.humidity,
    };
    updateStateCurrentWeather(data.name, oTodayWeatherInfo);
    // console.log("Este es el objecto app state: ", oAppState);
  } catch (error) {
    console.log(`An error has occurred: ${error}`);
  }
}

async function getWeatherPrediction(id) {
  const apiKey = "11d8e389af94a51e755bd821fe9be18a";
  // Making the API call
  // FIXME: Unidad de medida imperial
  const url = `https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${apiKey}&units=imperial`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // console.log(`Prediccion Clima: ${JSON.stringify(data, null, 2)}`);

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
    // console.log(oAppState);
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
