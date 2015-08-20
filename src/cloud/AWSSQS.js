import AWS from "aws-sdk";
import Q from "q";
import { LocalStorage } from "node-localstorage";

var localStorage;

if (typeof localStorage === "undefined" || 
    localStorage === null) {
  localStorage = new LocalStorage("/tmp/node-localstorage");
}

export class AWSSQS {
  constructor () {
    // Instance vars
    this.credentials = null;

    // Init
    if (AWS.config.credentials === null ||
        typeof AWS.config.credentials === "undefined") {
      this.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:b432afab-89a4-490d-8e42-9df309196a82'
      });
      AWS.config.credentials = this.credentials;
    } else {
      this.credentials = AWS.config.credentials;
    }
    AWS.config.region = "us-east-1";
    this.cognitoIdentity = new AWS.CognitoIdentity();
    this.sqs = new AWS.SQS();
  }

  print(str) {
    console.log(`${str} - ${JSON.stringify(this.credentials)}`);
    console.log(`IdentityId: ${JSON.stringify(this.credentials.identityId)}`);
    Q.ninvoke(this.sqs, "createQueue", {
      QueueName: "Test"
    }).then((data) => {
      console.log(data);
      console.log(`IdentityId: ${JSON.stringify(this.credentials.identityId)}`);

      return Q.ninvoke(this.cognitoIdentity, "getCredentialsForIdentity", {
        IdentityId: this.credentials.identityId
      });
    }).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log("!!!ERROR!!!");
      console.error(err);
    });

  }
}

