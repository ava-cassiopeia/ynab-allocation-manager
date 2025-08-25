import {test} from "@playwright/test";

import {takeScreenshot} from "../../testing/screenshot";

test.describe("IndexPage", () => {
  test("should match screenshot", async ({page}) => {
    await takeScreenshot(page, "ya-index-page", "index-page");
  });
});
