import { getRating } from "../../bridge/phase1-bridge";

getRating("git+https://github.com/Gninoskcaj/easy-math-module.git").then((result) => {
  console.log(result);
}).catch((err) => {
  console.error(err);
});

  