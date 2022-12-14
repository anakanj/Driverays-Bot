import { default as fetch } from "node-fetch";
import cheerio from "cheerio";
import { AceFileVideoPlayer } from "./VideoPlayer";
import { HttpsProxyAgent } from "https-proxy-agent";

const proxy = new HttpsProxyAgent("http://182.253.109.41:8080");
async function acefile(url: string, useProxy = false) {
	const response = await (await fetch(url, { agent: useProxy ? proxy : undefined })).text();
	const $ = cheerio.load(response);
	const videolink = $("body > div.container > div > textarea").text().trim().split('"')[1];
	const json = await AceFileVideoPlayer(videolink, useProxy);
	return json;
}
export { acefile, proxy };
// export {}
