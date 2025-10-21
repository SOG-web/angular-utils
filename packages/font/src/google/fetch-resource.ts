import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import fs from "node:fs";
import { retry } from "../lib/core/retry";

/**
 * Makes a simple GET request and returns the entire response as a Buffer.
 * - Throws if the response status is not 200.
 * - Applies a 3000 ms timeout when `isDev` is `true`.
 */
export function fetchResource(
  url: string,
  isDev: boolean,
  errorMessage?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { protocol } = new URL(url);
    const client = protocol === "https:" ? https : http;
    const timeout = isDev ? 3000 : undefined;

    const req = client.request(
      url,
      {
        headers: {
          // The file format is based off of the user agent, make sure woff2 files are fetched
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/104.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              errorMessage ||
                `Request failed: ${url} (status: ${res.statusCode})`
            )
          );
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    if (timeout) {
      req.setTimeout(timeout, () => {
        req.destroy(new Error(`Request timed out after ${timeout}ms`));
      });
    }

    req.on("error", (err) => reject(err));
    req.end();
  });
}

/**
 * Fetches the CSS containing the @font-face declarations from Google Fonts.
 * The fetch has a user agent header with a modern browser to ensure we'll get .woff2 files.
 *
 * The env variable FONT_GOOGLE_MOCKED_RESPONSES may be set containing a path to mocked data.
 * It's used to define mocked data to avoid hitting the Google Fonts API during tests.
 */
export async function fetchCSSFromGoogleFonts(
  url: string,
  fontFamily: string,
  isDev: boolean
): Promise<string> {
  if (process.env.FONT_GOOGLE_MOCKED_RESPONSES) {
    const mockFile = require(process.env.FONT_GOOGLE_MOCKED_RESPONSES);
    const mockedResponse = mockFile[url];
    if (!mockedResponse) {
      throw new Error("Missing mocked response for URL: " + url);
    }
    return mockedResponse;
  }

  const buffer = await retry(
    async () => {
      return fetchResource(
        url,
        isDev,
        `Failed to fetch font \`${fontFamily}\`: ${url}\n` +
          `Please check your network connection.`
      );
    },
    3,
    { delay: 100 }
  );

  return buffer.toString("utf8");
}

/**
 * Fetches a font file and returns its contents as a Buffer.
 * If NEXT_FONT_GOOGLE_MOCKED_RESPONSES is set, we handle mock data logic.
 */
export async function fetchFontFile(
  url: string,
  isDev: boolean
): Promise<Buffer> {
  if (process.env.FONT_GOOGLE_MOCKED_RESPONSES) {
    if (url.startsWith("/")) {
      return fs.readFileSync(url);
    }
    return Buffer.from(url);
  }

  return await retry(
    async () => {
      return fetchResource(
        url,
        isDev,
        `Failed to fetch font file from \`${url}\`.`
      );
    },
    3,
    { delay: 100 }
  );
}
