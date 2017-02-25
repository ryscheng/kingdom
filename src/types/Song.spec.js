/*global describe, it, before, after, beforeEach, afterEach*/
"use strict";

const expect = require("chai").expect;
const Song = require("./Song");
require("../tools/loggerLevel").setLevel("warn");

describe("Song", function() {
  const ARTIST = "booboojenkins";
  const TITLE = "dontcryforthecheeseplate";

  beforeEach(function() {
  });

  afterEach(function() {
  });

  describe("#Song()", function() {
    it("getArtist()", function() {
      let s = new Song(ARTIST, TITLE, "", "");
      expect(s.getArtist()).to.equal(ARTIST);
    });

    it("getTitle()", function() {
      let s = new Song(ARTIST, TITLE, "", "");
      expect(s.getTitle()).to.equal(TITLE);
    });
  });

  describe("#createStream", function() {
    it("errors for invalid types", function(done) {
      let s = new Song(ARTIST, TITLE, "faketype", "fakeurl");
      let stream = s.createStream();
      //stream.on("format", console.log);
      stream.on("data", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("error", (data) => {
        expect(data).to.not.exist;
      });
      stream.once("end", () => {
        done();
      });
    });

    it("errors for invalid URLs", function(done) {
      let s = new Song(ARTIST, TITLE, "mp3", "fakeurl");
      let stream = s.createStream();
      //stream.on("format", console.log);
      stream.on("data", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("error", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("end", () => {
        done();
      });
      //stream.read(0);
    });
    
    it("errors for real non-MP3 URLs", function(done) {
      let s = new Song(ARTIST, TITLE, "mp3", "http://localhost");
      let stream = s.createStream({ "read_timeout": 20 });
      //stream.on("format", console.log);
      stream.on("data", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("error", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("end", () => {
        done();
      });
    });

    it("streams for valid URLs", function(done) {
      let s = new Song(ARTIST, TITLE, "mp3", "http://localhost:3000/download/baby.mp3");
      let stream = s.createStream();
      //stream.on("format", console.log);
      stream.once("data", (data) => {
        expect(data).to.exist;
        done();
      });
      stream.on("error", (data) => {
        expect(data).to.not.exist;
      });
      stream.on("end", () => {});
    });
  });

});

