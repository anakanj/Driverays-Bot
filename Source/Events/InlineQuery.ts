import bot from "../main";
import { DriveraysSearch } from "../../Driverays/Search";
import { Driverays } from "../../Driverays";
import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import crypto from "crypto";
bot.on("inline_query", async (ctx) => {
	if (ctx.update.inline_query.chat_type !== "sender") return ctx.answerInlineQuery([]);
	if (ctx.update.inline_query.query) {
		const res = await DriveraysSearch(ctx.update.inline_query.query);
		const answerResult = res.map((value): InlineQueryResultArticle => {
			return {
				type: "article",
				id: crypto.randomUUID(),
				title: `${value.title} (${value.year})`,
				description: value.quality!,
				input_message_content: {
					message_text: value.link!,
				},
			};
		});
		return await ctx.answerInlineQuery(answerResult);
	} else {
		const res = await Driverays("https://167.86.71.48/category/movies/");
		const answerResult = res.map((value): InlineQueryResultArticle => {
			return {
				type: "article",
				id: crypto.randomUUID(),
				title: `${value.title} (${value.year})`,
				description: value.quality!,
				input_message_content: {
					message_text: value.link!,
				},
			};
		});
		return await ctx.answerInlineQuery(answerResult);
	}
});
