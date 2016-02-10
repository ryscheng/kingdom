"use strict";

let weather = require("weather-js");
let Q = require("q");

const DEFAULT = "98195";

class Weather {
  constructor() {
    // Public properties
    this.name = "Weather"
    this.triggers = {
      "(what) (what's) (is) (the) weather (in) *searchQuery": this.getWeather.bind(this)
    };
  }

  getWeather(searchQuery) {
    console.log("Weather.getWeather("+searchQuery+")");
    // Set defaults
    if (searchQuery == "" ||
        searchQuery == null || 
        typeof searchQuery === "undefined") {
      searchQuery = DEFAULT;
    }

    return Q.npost(weather, "find", [{
      search: searchQuery,
      degreeType: "F"
    }]).then((result) => {
      //console.log(result);
      let response;
      if (result.length <= 0) {
        response = "I didn't get the location"
      } else {
        result = result[0];
        response = result.current.skytext + 
          " and " + result.current.temperature + " degrees" + 
          " in " + result.location.name;
      }
      return Promise.resolve(response);
    });
  }
}

module.exports = Weather;
