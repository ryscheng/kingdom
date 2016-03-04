"use strict";


class LightControl {
  constructor(lights) {
    // Private
    this._lights = lights;

    // Public properties
    this.name = "Light Control"
    this.intents = {
      onoff: {
        description: "TODO",
        help: "TODO",
        callback: this.lightsOnOff.bind(this),
        parameters: [
          { name: "Toggle", type: "OnOff" },
        ],
        utterances: [
          "please turn the lights {Toggle}",
          "turn the lights {Toggle}",
          "turn lights {Toggle}",
          "lights {Toggle}",
        ],
      }
    };
    this.types = {
      "ONOFF": [ "on", "off"]
    };
    /**
    this.triggers = {
      "(turn) (the) light(s) *onoff": this.lightsOnOff.bind(this),
    };
    **/
  }

  lightsOnOff(onoff) {
    console.log("LightControl.lightsOnOff("+onoff+")");
    // Didn't catch parameter
    if ((onoff !== "on" && onoff !== "off") ||
        onoff === null ||
        typeof onoff === "undefined") {
      return Promise.resolve("Did you want the lights on or off?");
    }

    const isAllOff = function(lightState) {
      for (let k in lightState) {
        if (lightState.hasOwnProperty(k) && lightState[k].on === true) {
          return false;
        }
      }
      return true;
    };

    return this._lights.getState().then(function(onoff, lightState) {
      //@todo test
      if (onoff === "off" && isAllOff(lightState) === true) {
        return Promise.resolve("Lights are already off");
      } else if (onoff === "on" && isAllOff(lightState) === false) {
        return Promise.resolve("Lights are already on");
      } else if (onoff === "on") {
        return this._lights.allOn();
      } else if (onoff === "off") {
        return this._lights.allOff();
      } else {
        return Promise.resolve("Something went wrong");
      }
    }.bind(this, onoff)).then((result) => {
      if (typeof result !== "string") {
        result = "Consider it done";
      }
      return Promise.resolve(result);
    });
  }
}

module.exports = LightControl;
