import { Context, Markup } from "telegraf";
import bot from "../main";
import Users from "../Database/Users";
// bot.use()
bot.start(async (ctx) => {
	try {
		console.log(`A message from ${ctx.update.message.from.first_name}`);
		// console.log(JSON.stringify(ctx.update, null, 2));
		const caption = `
	Selamat Datang di Driverays Bot
		`;
		ctx.telegram.sendMessage(ctx.update.message.from.id, caption, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "Search",
							switch_inline_query_current_chat: "",
						},
					],
				],
			},
		});
		// Users.where()
		const userInfo = await Users.findOne({ id: ctx.message.from.id });
		// const userId = await Users.findOne();
		if (!userInfo) {
			const user = new Users(ctx.update.message.from);
			user.save();
			// .then(() => console.log("Success save User Data to Database..."));
		} else if (userInfo) {
			const username = ctx.update.message.from.username;
			const firstName = ctx.update.message.from.first_name;
			const lastName = ctx.update.message.from.last_name;
			async function update() {
				// console.log("User available, but profile has been updated...");
				await userInfo?.replaceOne(ctx.message.from);
				await userInfo?.save();
			}
			if (username !== userInfo.username) {
				await update();
			} else if (firstName !== userInfo.first_name) {
				await update();
			} else if (lastName !== userInfo.last_name) {
				await update();
			} else {
				// console.log("User already available in Database");
				// const data = await Users.findOne({ id: userId.id });
			}
		}
	} catch (err) {
		console.log("Terjadi error", err);
	}
	// writeFileSync("./JSON/BotContext.json", JSON.stringify(ctx.update, null, 2));
});
