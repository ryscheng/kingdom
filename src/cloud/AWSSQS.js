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
    this.myQueue = null;
    
    this._init();
  }
  
  _init() {
    // Cached IdentityId
    let id = localStorage.getItem(CACHED_ID_KEY);

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
    
    // Configure AWS
    AWS.config.region = AWS_REGION;
    AWS.config.credentials = this.credentials;
    this.cognitoIdentity = new AWS.CognitoIdentity();
    this.sqs = new AWS.SQS();
   
    // Create my mailbox
    Q.ninvoke(this.sqs, "listQueues", {}).then((data) => {
      // this.credentials.identityId is only populated after first request
      localStorage.setItem(CACHED_ID_KEY, this.credentials.identityId);
      console.log(`IdentityId: ${this.credentials.identityId}`);

      return Q.ninvoke(this.sqs, "createQueue", {
        QueueName: this._getQueueName(this.credentials.identityId),
        Attributes: {
          ReceiveMessageWaitTimeSeconds: "20",
          VisibilityTimeout: "30"
        }
      })
    }).then((data) => {
      this.myQueue = new AWS.SQS({ params: { QueueUrl: data.QueueUrl } });
    }).catch(this._onErr.bind(this));

  }

  _getQueues() {
    Q.ninvoke(this.sqs, "listQueues", {}).then((data) => {
      console.log(data);
      if (data.QueueUrls.length < 10) {
        setTimeout(this._getQueues.bind(this), 1000);
      }
    }).catch(this._onErr.bind(this));
  }
  
  _getQueueName(identityId) {
    return identityId.replace(/:/g, "_");
  }

  _onErr(err) {
    console.error(`ERROR: ${err}`);
  }

  print(str) {
    console.log(str);
    this._getQueues();

  }
}

