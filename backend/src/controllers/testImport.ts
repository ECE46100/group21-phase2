import { ratePackage } from "../../bridge/phase1-bridge";

ratePackage("https://www.npmjs.com/package/express").then((result) => {
  console.log(result);
});

  