//import { Messaging } from "./client/Messaging";
//import { Client } from "./core/Client";
import { AWSSQS } from "./cloud/AWSSQS";

var client = new AWSSQS();
/**
client.on("asdf", () => console.log("!!!"));
client.toString("input")
**/

client.print("Test");
