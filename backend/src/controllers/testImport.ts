import { getRating } from "../../bridge/phase1-bridge";

getRating("https://github.com/debug-js/debug").then((result) => {
  console.log(result);
});

  