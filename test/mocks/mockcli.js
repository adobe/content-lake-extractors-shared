import { MockExtractor } from "./mockextractor.js";
import { cli } from "../../src/cli.js";

const mockExtractor = new MockExtractor([
  {
    assets: [
      {
        assetId: 1,
      },
      {
        assetId: 2,
      },
    ],
    more: true,
    cursor: 1,
  },
  {
    assets: [
      {
        assetId: 3,
      },
    ],
    more: false,
  },
]);
if (process.argv.length > 3) {
  cli({
    args: process.argv,
    name: "test",
    getExtractor: () => mockExtractor,
    println: (payload) => logged.push(payload),
  });
}
