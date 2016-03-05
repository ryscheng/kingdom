"use strict";

const path = require("path");
const PocketSphinx = require("pocketsphinx").ps;
const mic = require("mic");

//const modeldir = path.join(__dirname, "../models/en-us/")
const modeldir = "/usr/local/share/pocketsphinx/model/en-us";

// Configure pocketsphinx
PocketSphinx.Decoder.DefaultConfig = PocketSphinx.Decoder.defaultConfig;
let psConfig = new PocketSphinx.Decoder.DefaultConfig();
psConfig.setString("-hmm", path.join(modeldir, "en-us"));
psConfig.setString("-dict", path.join(modeldir, "cmudict-en-us.dict"));
psConfig.setString("-lm", path.join(modeldir, "en-us.lm.bin"));
psConfig.setString("-keyphrase", "hello")
//psConfig.setFloat("-kws_threshold", 1e+20)
let psDecoder = new PocketSphinx.Decoder(psConfig);

// Start microphone capture
mic.startCapture ({
  "endian": "little", //default little
  "bitwidth": 16,     //default 16
  "encoding": "signed-integer", //default signed-integer
  "rate": "16000",    //default 16000
  "channels": "1",    //default 1
  "device": "default",
});
//var outputFileStream = fs.WriteStream("output.raw");
//mic.audioStream.pipe(outputFileStream);
//
let lightsOn = false;
 
psDecoder.startUtt();
mic.audioStream.on("data", function(data) {
  //console.log("mic data: " + data.length);

  psDecoder.processRaw(data, false, false);
  let hyp = psDecoder.hyp();
  if (hyp) {
    //print ([(seg.word, seg.prob, seg.start_frame, seg.end_frame) for seg in decoder.seg()])
    //console.log(psDecoder.seg());
    console.log("Detected keyword, restarting search");
    console.log("Lights on: " + lightsOn);
    if (lightsOn) {
      lightsOn = false;
    } else {
      lightsOn = true;
    }
    //console.log(hyp)
    psDecoder.endUtt();
    psDecoder.startUtt();
  }
      
});
 
mic.audioStream.on("error", function(err) {
  console.log("mic error: " + err);
});
 
mic.infoStream.on("data", function(data) {
  console.log("mic info: " + data);
});
 
mic.infoStream.on("error", function(err) {
  console.log("mic info error: " + err);
});

