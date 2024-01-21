"use strict";

const EventEmitter = require("events");
const fs = require("fs");
const Q = require("q");
const GoogleAuth = require("google-auth-library");
const google = require("googleapis");
//const gcloud = require("google-cloud");

const SCOPES = [
  //"https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/pubsub",
];
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
                process.env.USERPROFILE) + "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "kingdom-google.json";

class Gmail extends EventEmitter {
  constructor(clientId, clientSecret, authCode, authorizedUsers, pubsubTopic) {
    super();
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._authCode = authCode;
    this._authorizedUsers = authorizedUsers;
    this._pubsubTopic = pubsubTopic;
    this._token = null;
    this._gmail = google.gmail("v1");

    let auth = new GoogleAuth();
    this._oauth2Client = new auth.OAuth2(this._clientId, this._clientSecret, REDIRECT_URI);
    //this._oauth2Client.credentials = JSON.parse(token);
    this._init()
  }

  _init() {
    Q.nfapply(fs.readFile, [ TOKEN_PATH ]).then((token) => {
      //console.log("Gmail: found token in " + TOKEN_PATH);
      return Promise.resolve(token);
    }).catch((err) => {
      //console.log("Gmail: no cached token, trying to get one from configured authCode");
      return Q.npost(this._oauth2Client, "getToken", [ this._authCode ]);
    }).catch((err) => {
      //console.log('Invalid Gmail auth code', err);
      let authUrl = this._oauth2Client.generateAuthUrl({
        "access_type": "offline",
        "scope": SCOPES
      });
      console.log("Log in to this app's Gmail by visiting this url: ", authUrl);
      console.log("When done, insert the code into the configuration file and restart");
      process.exit(0);
    }).then((token) => {
      //console.log("Gmail: Got token!");// + JSON.stringify(token));
      // If read from file, need to parse
      if (Buffer.isBuffer(token)) {
        token = token.toString();
        token = JSON.parse(token);
      }
      // If from Google token endpoint, for some reason it's wrapped in an array
      token = this._extractFirst(token);
      this._token = token;
      this._oauth2Client.credentials = token;
      return this._storeToken(token);
    }).then(() => {
      //console.log('Token stored to ' + TOKEN_PATH);
      return Q.nfapply(this._gmail.users.watch, [{
        "auth": this._oauth2Client,
        "userId": "me",
        "resource": {
          "labelIds": [ "INBOX" ],
          "topicName": this._pubsubTopic
        }
      }]);
    }).then((resp) => {
      //console.log(resp);
    }).catch((err) => {
      console.error(err);
    });
  }

  _storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
    return Q.nfapply(fs.writeFile, [ TOKEN_PATH, JSON.stringify(token) ]);
  }

  _extractFirst(arr) {
    if (Array.isArray(arr) && arr.length > 1) {
      arr = arr[0];
    }
    return arr;
  }

  _checkMailbox() {
    if (this._token === null) {
      return Promise.reject("No Google token");
    }

    return Q.nfapply(this._gmail.users.messages.list, [{
      "auth": this._oauth2Client,
      "userId": "me"
    }]).then((resp) => {
      resp = this._extractFirst(resp);
      if (resp.hasOwnProperty("messages") && Array.isArray(resp.messages)) {
        let messages = resp.messages;
        for (let i = 0; i < messages.length; i++) {
          this._processMessage(messages[i].id);
        }
      }
    }).catch((err) => {
      console.error(err);
    });

  }

  _processMessage(id) {
    Q.nfapply(this._gmail.users.messages.get, [{
      "auth": this._oauth2Client,
      "userId": "me",
      "id": id,
    }]).then(function(id, msg) {
      let headers = this._extractFirst(msg).payload.headers;
      let authorized = false;
      let command = null;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].name === "From" && this._authorizedUsers.includes(headers[i].value)) {
          authorized = true;
        }
        if (headers[i].name === "Subject") {
          command = headers[i].value;
        }
      }
      if (authorized) {
        this.emit("command", command);
      }
      return Q.nfapply(this._gmail.users.messages.trash, [{
        "auth": this._oauth2Client,
        "userId": "me",
        "id": id,
      }]);
    }.bind(this, id)).then((resp) => {
      //console.log("Trash succeeded");
    }).catch((err) => {
      console.error(err);
    });
  }

  startListening() {
    this._checkMailbox();
  }

  respond(response) {
    console.log(response);
  }

}

module.exports = Gmail;
