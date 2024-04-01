import { SSTConfig } from "sst";
import { Home } from "./stacks/Home";
// import { PricePaid } from "./stacks/PricePaid";

export default {
  config(_input) {
    return {
      name: "moove",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(Home);
    // app.stack(PricePaid);
  },
} satisfies SSTConfig;
