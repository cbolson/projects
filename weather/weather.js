const urlApi =
  "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&current_weather=true&timeformat=unixtime";

import axios from "axios";
export function getWeather(lat, lng, timezone) {
  return axios
    .get(urlApi, {
      params: {
        latitude: lat,
        longitude: lng,
        timezone,
      },
    })
    .then(({ data }) => {
      // return data;
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
}

function parseCurrentWeather({ current_weather, daily }) {
  const {
    temperature: currentTemp,
    windspeed: windSpeed,
    weathercode: iconCode,
  } = current_weather;

  const {
    temperature_2m_max: [maxTemp],
    temperature_2m_min: [minTemp],
   // apparent_temperature_max: [maxFeelsLike],
   // apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip],
  } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
   // highFeelsLike: Math.round(maxFeelsLike),
   // lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
    };
  });
}
function parseHourlyWeather({ current_weather, hourly }) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
      //  feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100,
      };
    })
    .filter(
      ({ timestamp }) =>
        timestamp >= current_weather.time * 1000 &&
        timestamp <= (current_weather.time * 1000) + 86400000
    );
}
//latitude=36 .72&longitude=-4.28
//&timeformat=unixtime&timezone=Europe%2FBerlin
