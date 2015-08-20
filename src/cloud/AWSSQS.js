import AWS from "aws-sdk";
import Q from "q";
import { LocalStorage } from "node-localstorage";

var localStorage;
if (typeof localStorage === "undefined" || 
    localStorage === null) {
  localStorage = new LocalStorage("/tmp/node-localstorage");
}

const CACHED_ID_KEY = "AWS_IdentityId";
const AWS_IDENTITYPOOLID = "us-east-1:b432afab-89a4-490d-8e42-9df309196a82";
const AWS_REGION = "us-east-1"

export class AWSSQS {
  constructor () {
    // Instance vars
    this.credentials = null;
    this.cognitoIdentity = null;
    this.sqs = null;
    
    this._init();
  }
  
  _init() {
    // Cached IdentityId
    let id = localStorage.getItem(CACHED_ID_KEY);

    // Set AWS Region
    AWS.config.region = AWS_REGION;

    // AWS Credentials
    if (AWS.config.credentials !== null &&
        typeof AWS.config.credentials !== "undefined") {
      // AWS already configured
      this.credentials = AWS.config.credentials;
    } else if (id !== null && typeof id !== "undefined") {
      // Cached Identity Id
      this.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: AWS_IDENTITYPOOLID,
        IdentityId: id
      });
    } else {
      // Nothing cached, create a new one
      this.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: AWS_IDENTITYPOOLID,
      });
    }

    AWS.config.credentials = this.credentials;
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
      localStorage.setItem(CACHED_ID_KEY, this.credentials.identityId);
    }).catch((err) => {
      console.log("!!!ERROR!!!");
      console.error(err);
    });

  }
}

