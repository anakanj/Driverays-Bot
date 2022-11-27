import { default as fetch } from "node-fetch";
import cheerio from "cheerio";
import { AceFileVideoPlayer } from "./VideoPlayer";
// import
async function acefile(url: string) {
	const response = await (await fetch(url)).text();
	const $ = cheerio.load(response);
	const videolink = $("body > div.container > div > textarea")
		.text()
		.trim()
		.split('"')[1];
	const json = await AceFileVideoPlayer(videolink);
	return json;
}
export { acefile };
// export {}
