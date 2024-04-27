if (!process.isBun) {
  console.error(`Tests only support Bun right now. Please run "bun test"`);
  process.exit();
}
import axios from "axios";
axios.defaults.headers.common["Accept-Encoding"] = "gzip";

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const port = process.env.PORT || 3000;

describe(`Check if the API is online`, () => {
  test("GET /", async () => {
    try {
      let res = await axios({
        url: `http://localhost:${port}/`,
        method: "get",
      });
      expect(res.status).toBe(200);
    } catch (error: any) {
      console.error(error);
    }
  });
});

describe(`Unauthorized - Check ocr-url endpoint`, () => {
  test(`GET /api/ocr-url/:url`, async () => {
    try {
      let imgUrlEncoded = encodeURIComponent(
        "https://tesseract.projectnaptha.com/img/eng_bw.png"
      );
      let res = await axios({
        url: `http://localhost:${port}/api/ocr-url/${imgUrlEncoded}`,
        method: "get",
      });
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });
});

describe(`Unauthorized - Check ocr-base64 endpoint`, () => {
  test(`POST /api/ocr-base64/:base64data/`, async () => {
    try {
      let base64data = readImage(join(process.cwd(), "src/test/img.png"));
      let res = await axios({
        url: `http://localhost:${port}/api/ocr-base64/`,
        method: "post",
        data: {
          base64data
        }
      });
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });
});

describe(`Check ocr-url endpoint`, () => {
  test(`GET /api/ocr-url/:url`, async () => {
    try {
      let imgUrlEncoded = encodeURIComponent(
        "https://tesseract.projectnaptha.com/img/eng_bw.png"
      );
      let key = process.env.APIKEY_1
      let res = await axios({
        url: `http://localhost:${port}/api/ocr-url/${imgUrlEncoded}/${key}`,
        method: "get",
      });
      expect(res.status).toBe(200);
    } catch (error: any) {
      console.error(`${error.name}: ${error.message}`)
    }
  });
});

describe(`Check ocr-base64 endpoint`, () => {
  test(`POST /api/ocr-base64/:base64data/`, async () => {
    try {
      let base64data = readImage(join(process.cwd(), "src/test/img.png"));
      let key = process.env.APIKEY_1
      let res = await axios({
        url: `http://localhost:${port}/api/ocr-base64/`,
        method: "post",
        data: {
          base64data,
          key
        }
      });
      expect(res.status).toBe(200);
    } catch (error: any) {
      console.error(`${error.name}: ${error.message}`)
    }
  });
});

function readImage(filepath: string) {
  let data = readFileSync(filepath);
  let base64 = data.toString("base64");
  return base64;
}

