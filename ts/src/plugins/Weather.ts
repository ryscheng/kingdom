import { OpenWeatherAPI } from "openweather-api-node";
import { Plugin } from "../types/Plugin.js";
import { Intent } from "../types/Intent.js";
import { OPEN_WEATHER_API_KEY } from "../config.js";

const DEFAULT = "San Francisco";
const weather = new OpenWeatherAPI({
  key: OPEN_WEATHER_API_KEY,
  locationName: DEFAULT,
  units: "imperial",
});

class Weather implements Plugin {
  name: string;
  intents: Intent[];
  types: Record<string, string[]>;

  constructor() {
    // Public properties
    this.name = "Weather";
    this.intents = [
      {
        name: "query",
        description: "Get the current weather",
        callback: this.getWeather.bind(this),
        parameters: [{ name: "Location", type: "CITY" }],
        utterances: [
          "weather",
          "what is the weather",
          "what's the weather",
          "weather in *Location",
          "what is the weather in *Location",
          "what's the weather in *Location",
        ],
      },
    ];
    this.types = {
      CITY: [
        "Seattle",
        "New York",
        "Los Angeles",
        "San Francisco",
        "Palo Alto",
        "Mountain View",
        "San Jose",
        "Boston",
        "Chicago",
        "Hong Kong",
        "London",
      ],
    };
    /**
    this.triggers = {
      "(what) (what's) (is) (the) weather (in) *searchQuery": this.getWeather.bind(this)
    };
     **/
  }

  async getWeather(searchQuery?: string): Promise<string> {
    console.log("Weather.getWeather(" + searchQuery + ")");
    // Set defaults
    const search = searchQuery ?? DEFAULT;

    const result = await weather.getCurrent({
      locationName: search,
    });
    console.log(result);
    /**
    return new Promise<string>((resolve, reject) => {
      weather.find(
        {
          search,
          degreeType: "F",
        },
        (err: Error, result: any) => {
          if (err) {
            return reject(err);
          } else if (!Array.isArray(result) || result.length <= 0) {
            return resolve("I didn't get the location");
          } else {
            const r = result[0];
            return resolve(
              `${r.current?.skytext} and ${r.current?.temperature} degrees in ${r.location?.name}`,
            );
          }
        },
      );
    });
    **/
    return Promise.resolve("Woo");
  }
}

export { Weather };

/**
    let debug = through(function write(data) {
      console.log(data);
      this.queue(data);
    }, function end() {
      console.log("end");
    });
    **/
