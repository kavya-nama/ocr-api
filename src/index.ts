import express from "express";
import chalk from "chalk";
import { LoggerMessage, OEM, createWorker } from "tesseract.js";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { join } from "path";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/ocr-url/:url/:key?/:lang?", async (req, res) => {
  const { url, lang = "eng", key } = req.params;
  if(!checkAPIKey(key)) {
    console.log(`Unauthorized ocr attempt, url: ${url}`)
    res.status(403).json({})
    return
  }
  const worker = await createWorker(lang, OEM.DEFAULT, {
    logger,
  });
  let uuid = randomUUID();
  const ret = await worker.recognize(
    decodeURIComponent(url).trim(),
    {},
    {},
    uuid
  );
  await worker.terminate();
  console.log(ret.data.text);
  res.json({text: ret.data.text});
});

app.post("/api/ocr-base64/", async (req, res) => {
  const { base64data, lang = "eng", key } = req.body;
  if(!checkAPIKey(key)) {
    console.log(`Unauthorized ocr attempt, base64data: ${'base64data'}`)
    res.status(403).json({})
    return
  }
  const worker = await createWorker(lang, OEM.DEFAULT, {
    logger,
  });
  let uuid = randomUUID();
  let filepath = saveImage(base64data, join(process.cwd(), `src/tmp/${uuid}.png`));
  const ret = await worker.recognize(filepath, {}, {}, uuid);
  await worker.terminate();
  console.log(ret.data.text);
  res.json({text: ret.data.text});
});

function saveImage(base64Data: string, filepath: string) {
  let buf = Buffer.from(base64Data, "base64");
  writeFileSync(filepath, buf, { encoding: "base64" });
  return filepath;
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

function logger(arg: LoggerMessage) {
  console.log(arg.userJobId, arg.status, Number(arg.progress.toFixed(2)));
}

function checkAPIKey(key: string) {
  const keys = [
    process.env["APIKEY_1"],
    process.env["APIKEY_2"],
    process.env["APIKEY_3"],
    process.env["APIKEY_4"],
    process.env["APIKEY_5"],
    process.env["APIKEY_6"],
  ];
  return keys.includes(key)
}