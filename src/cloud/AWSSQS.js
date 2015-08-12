import AWS from "aws-sdk"

export class AWSSQS {
  constructor () {
    this.testVar = "asdf";
  }

  print(str) {
    console.log(`${str} - ${this.testVar}`);
  }
}

