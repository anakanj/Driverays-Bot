import cheerio from "cheerio";
import fetch from "node-fetch";
import FormData from "form-data";
export default async function UploadImage(url: string) {
	const res = await fetch("https://postimages.org/web");
	const html = await res.text();
	const parsed = cheerio.load(html);
	const selector = parsed("body > script:nth-child(6)").text();
	const index = selector.indexOf("token");
	const token = selector.substring(index + 8).split("'")[0];
	const date = new Date();
	function rand_string(e: number) {
		for (var t = "", i = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", n = 0; n < e; n++) t += i.charAt(Math.floor(Math.random() * i.length));
		return t;
	}
	const data = new FormData();
	interface UploadImageResponse {
		status: string;
		url: string;
	}
	data.append("token", token);
	data.append("upload_session", rand_string(32));
	data.append("url", url);
	data.append("numfiles", 1);
	data.append("ui", `[24, 1920, 1080, "true", "", "", ${date.toLocaleString("id")}]`);
	data.append("optsize", 0);
	data.append("expire", 0);
	data.append("session_upload", Date.now());
	const result = await fetch("https://postimages.org/json/rr", {
		method: "POST",
		body: data,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
			"X-Requested-With": "XMLHttpRequest",
			cookie: "expire=1",
		},
	});
	const json: UploadImageResponse = await result.json();
	const Image = await fetch(json.url);
	const ImageResponse = await Image.text();
	const $ = cheerio.load(ImageResponse);
	const ImageResults = {
		link: $("#code_html").val(),
		direct_link: $("#code_direct").val() as string,
		markdown: $("#code_reddit").val() as string,
		markdown_v2: $("#code_so").val() as string,
		thumbnail_for_forums: $("#code_bb_thumb").val() as string,
		thumbnail_for_website: $("#code_web_thumb").val() as string,
		hotlink_for_forums: $("#code_bb_hotlink").val() as string,
		hotlink_for_website: $("#code_bb_hotlink").val() as string,
		removal_link: $("#code_remove").val() as string,
	};
	type UploadImageResults = typeof ImageResults;
	return ImageResults as UploadImageResults;
}
// main();
// UploadImage("https://167.86.71.48/wp-content/uploads/2021/11/1637484379_30ULVKdjBcQTsj2aOSThXXZNSxF.jpg");
