import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

import { routes } from "@/router";

// Match routes without running loaders or rendering: loaders may need a network
// the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each(["/", "/signin", "/signup", "/app"])("matches a page for %s instead of falling back to not found", (path) => {
    const matches = matchRoutes(routes, path);

    expect(matches?.at(-1)?.route.path).not.toBe("*");
  });

  it("falls back to not found for unknown paths", () => {
    expect(matchRoutes(routes, "/nope")?.at(-1)?.route.path).toBe("*");
  });
});
