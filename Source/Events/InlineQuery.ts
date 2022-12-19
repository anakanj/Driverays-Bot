import bot from "../main";
import { DriveraysSearch } from "../../Driverays/Search";
import { Driverays } from "../../Driverays";
import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import UploadImage from "../Utils/ImageUploader";
import crypto from "crypto";
import { Logger } from "../Utils/Logger";
import Cache from "../Database/Cache";
bot.on("inline_query", async (ctx) => {
	if (ctx.update.inline_query.chat_type !== "sender") return ctx.answerInlineQuery([]);
	if (ctx.update.inline_query.query) {
		const res = await DriveraysSearch(ctx.update.inline_query.query);
		const time_before = Date.now();
		const answerResult = await Promise.all(
			res.map(async (value): Promise<InlineQueryResultArticle> => {
				const database = await Cache.findSavedImageURL(value.image!);
				if (database?.cached_url) {
					return {
						type: "article",
						id: crypto.randomUUID(),
						title: `${value.title} (${value.year})`,
						description: value.quality!,
						thumb_url: database.cached_url,
						input_message_content: {
							message_text: value.link!,
						},
					};
				} else {
					const image = await UploadImage(value.image!);
					Cache.saveImageURL(value.image!, image.direct_link);
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
				}
			})
		);
		const time_after = Date.now();
		Logger.debug(`Proses Query Membutuhkan waktu ${time_after - time_before} ms`);
		try {
			await ctx.telegram.answerInlineQuery(ctx.update.inline_query.id, answerResult, {
				cache_time: 2000,
			});
		} catch (error) {
			Logger.error("Terjadi Error Saat Answer Inline Query...");
			return;
		}
	} else {
		const res = await Driverays("https://167.86.71.48/category/movies/");
		const time_before = Date.now();
		const answerResult = await Promise.all(
			res.map(async (value): Promise<InlineQueryResultArticle> => {
				const database = await Cache.findSavedImageURL(value.image!);
				if (database?.cached_url) {
					return {
						type: "article",
						id: crypto.randomUUID(),
						title: `${value.title} (${value.year})`,
						description: value.quality!,
						thumb_url: database.cached_url,
						input_message_content: {
							message_text: value.link!,
						},
					};
				} else {
					const image = await UploadImage(value.image!);
					Cache.saveImageURL(value.image!, image.direct_link);
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
				}
			})
		);
		const time_after = Date.now();
		Logger.debug(`Proses Query Membutuhkan waktu ${time_after - time_before} ms`);
		try {
			await ctx.telegram.answerInlineQuery(ctx.update.inline_query.id, answerResult, {
				cache_time: 2000,
			});
		} catch (error) {
			Logger.error("Terjadi Error Saat Answer Inline Query...");
			return;
		}
	}
});

bot.catch((err, ctx) => {
	Logger.error("Terjadi Error");
	console.error(err);
});
