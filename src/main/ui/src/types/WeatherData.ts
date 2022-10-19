export default interface WeatherData {
  key: string;
  data: {
    temperature: string;
    feelsLikeTemperature: string;
    conditions: string;
    city: string;
    stateOrCountry: string;
  };
  timestamp: string;
}
