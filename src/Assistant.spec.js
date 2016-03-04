"use strict";

const expect = require("chai").expect; 
const Assistant = require("./Assistant");

describe("Assistant", function() {
  let app;

  beforeEach(function() {
    app = new Assistant();
  });

  afterEach(function() {
  });

  describe("#_commandToRegExp", function() {
    it("handles", function() {
      const matchers = [
        "just a string",
        "head :single tail",
        "head *rest tail",
        "(optional) head *rest",
        "head *rest ignored",
      ];
      const matcherRegEx = matchers.map(function(elt) {
        return app._commandToRegExp(elt);
      });
      const match = function(phrase) {
        for (let i = 0; i < matcherRegEx.length; i++) {
          let result = matcherRegEx[i].exec(phrase)
          if (result) {
            //let parameters = result.slice(1);
            //console.log(phrase + " : Matches " + matchers[i]);
            //console.log(result);
            return matchers[i];
          }
        }
        return null;
      };

      expect(match("just a string")).to.equal(matchers[0]);
      expect(match("head stuff tail")).to.equal(matchers[1]);
      expect(match("head other stuff tail")).to.equal(matchers[2]);
      expect(match("head other stuff")).to.equal(matchers[3]);
      expect(match("optional head other stuff")).to.equal(matchers[3]);

    });
  });
});



//console.log(matchers);
//console.log(matchesRegEx);




