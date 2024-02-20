import { Assistant } from "./Assistant.js";

describe("Assistant", () => {
  let app: Assistant;

  beforeEach(() => {
    app = new Assistant();
  });

  afterEach(() => {});

  describe("#_commandToRegExp", () => {
    test("handles", () => {
      const matchers = [
        "just a string",
        "head :single tail",
        "head *rest tail",
        "(optional) head *rest",
        "head *rest ignored",
      ];
      const matcherRegEx = matchers.map(function (elt) {
        return app._commandToRegExp(elt);
      });
      const match = function (phrase: string) {
        for (let i = 0; i < matcherRegEx.length; i++) {
          let result = matcherRegEx[i].exec(phrase);
          if (result) {
            //let parameters = result.slice(1);
            //console.log(phrase + " : Matches " + matchers[i]);
            //console.log(result);
            return matchers[i];
          }
        }
        return null;
      };

      expect(match("just a string")).toEqual(matchers[0]);
      expect(match("head stuff tail")).toEqual(matchers[1]);
      expect(match("head other stuff tail")).toEqual(matchers[2]);
      expect(match("head other stuff")).toEqual(matchers[3]);
      expect(match("optional head other stuff")).toEqual(matchers[3]);
    });
  });
});

//console.log(matchers);
//console.log(matchesRegEx);
