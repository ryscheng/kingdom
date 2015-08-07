
import { AWSElastiCache } from "./storage/AWSElastiCache";

var f = v => {
  var a = new AWSElastiCache();
  a.print(v)
};

f("hi");
