/*global describe, it, before, after, beforeEach, afterEach*/
"use strict";

const expect = require("chai").expect;
const Song = require("./Song");

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
      let s = new Song(ARTIST, TITLE, "", "");
      done();
    });

    it("errors for invalid URLs", function(done) {
      let s = new Song(ARTIST, TITLE, "mp3", "");
      let stream = s.createStream();
      stream.on("format", (data) => {
        console.log("format");
        console.log(data);
        done();
      });
      stream.on("data", (data) => {
        console.log("data");
        console.log(data);
        done();
      });
      stream.on("end", (data) => {
        console.log("end");
        console.log(data);
        done();
      });
      stream.on("error", (data) => {
        console.log("error");
        console.log(data);
        done();
      });

      stream.read(0);
    });

    it("streams for valid URLs", function(done) {
      let s = new Song(ARTIST, TITLE, "mp3", "");
      done();
    });
  });

});

