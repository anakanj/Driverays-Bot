import bot from "../main";
import { DriveraysSearch } from "../../Driverays/Search";
import { Driverays } from "../../Driverays";
import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import UploadImage from "../Utils/ImageUploader";
import crypto from "crypto";
import { Logger } from "../Utils/Logger";
bot.on("inline_query", async (ctx) => {
	if (ctx.update.inline_query.chat_type !== "sender") return ctx.answerInlineQuery([]);
	if (ctx.update.inline_query.query) {
		const res = await DriveraysSearch(ctx.update.inline_query.query);
		const time_before = Date.now();
		const answerResult = await Promise.all(
			res.map(async (value): Promise<InlineQueryResultArticle> => {
				const image = await UploadImage(value.image!);
				return {
					type: "article",
					id: crypto.randomUUID(),
					title: `${value.title} (${value.year})`,
					description: value.quality!,
					thumb_url: image.direct_link!,
					input_message_content: {
						message_text: value.link!,
					},
				};
			})
		);
		const time_after = Date.now();
		Logger.debug(`Proses Query Membutuhkan waktu ${time_after - time_before} ms`);
		ctx.telegram.answerInlineQuery(ctx.update.inline_query.id, answerResult, {
			cache_time: 1500,
		});
	} else {
		const res = await Driverays("https://167.86.71.48/category/movies/");
		const time_before = Date.now();
		const answerResult = await Promise.all(
			res.map(async (value): Promise<InlineQueryResultArticle> => {
				const image = await UploadImage(value.image!);

				return {
					type: "article",
					id: crypto.randomUUID(),
					title: `${value.title} (${value.year})`,
					description: value.quality!,
					thumb_url: image.direct_link,
					input_message_content: {
						message_text: value.link!,
					},
				};
			})
		);
		const time_after = Date.now();
		Logger.debug(`Proses Query Membutuhkan waktu ${time_after - time_before} ms`);
		ctx.telegram.answerInlineQuery(ctx.update.inline_query.id, answerResult, {
			cache_time: 1500,
		});
	}
});
