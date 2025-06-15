import "mocha";

import {helloWorld} from ".";
import assert from "expect";

describe("helloWorld()", () => {
  it("does something", async () => {
    // Example using mock req/res for an onRequest function
    const req = { query: {text: 'input'} } as any;
    let resBody: any;
    const res = {
      json: (body: any) => { resBody = body; },
      status: function() { return this; }
    } as any;

    await helloWorld(req, res);

    // Add your assertions here
    assert(resBody).toBeDefined();
    assert(resBody[0]).toHaveProperty("test");
  });
});
