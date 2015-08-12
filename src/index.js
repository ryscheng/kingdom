import { Messaging } from "./client/Messaging";
//import { Client } from "./core/Client";

var client = new Messaging();
client.on("asdf", () => console.log("!!!"));
client.toString("input")

