import bot from "../main";
import { DriveraysSearch } from "../../Driverays/Search";
import { Driverays } from "../../Driverays";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
bot.on("inline_query", async (ctx) => {
	console.log(ctx.update.inline_query);
	if (ctx.update.inline_query.query) {
		const res = await DriveraysSearch(ctx.update.inline_query.query);
		// console.log(res);
		const answerResult = res.map((value): InlineQueryResult => {
			const url = new URL(value.link!);
			return {
				type: "article",
				id: url.pathname,
				title: value.title!,
				thumb_url: value.image,
				thumb_height: 150,
				thumb_width: 100,
				description: value.quality!,
				input_message_content: {
					message_text: value.link!,
				},
			};
		});
		return await ctx.answerInlineQuery(answerResult);
	} else {
		const res = await Driverays("https://167.86.71.48/category/movies/");
		const answerResult = res.map((value): InlineQueryResult => {
			const url = new URL(value.link!);
			return {
				type: "article",
				id: url.pathname,
				title: value.title!,
				thumb_url: value.image,
				thumb_height: 150,
				thumb_width: 100,
				description: value.quality!,
				input_message_content: {
					message_text: value.link!,
				},
			};
		});
		return await ctx.answerInlineQuery(answerResult);
	}
});
