import bot from "../main";
import { Markup } from "telegraf";
import { html } from "lit-html";
import { DriveraysMetadata } from "../../Driverays/Metadata";
import { Session } from "../Database/Session";
bot.hears(new RegExp(/^https?:\/\/(?:167\.86\.71\.48)?\//), async (tg) => {
	const context = await tg.reply("Tunggu Sebentar...");
	try {
		// console.log(JSON.stringify(tg.update.message, null, 2));
		const data = await DriveraysMetadata(tg.update.message.text);
		// console.log(data);
		const caption = `
Judul Film : <b>${data.title}</b>
Tahun : <b>${data.year}</b>
Score : <b>${data.score}</b>
Durasi : <b>${data.duration}</b>
Kualitas : <b>${data.quality}</b>
Genre : <b>${data.genre.join(", ")}</b>

Sinopsis : <span class="tg-spoiler">${data.synopsis}</span>


		`;

		const session_key = await Session.store(tg.update.message.from.id, data);

		await tg.telegram.sendPhoto(
			tg.update.message.from.id,
			{ url: data.image },
			{
				caption,
				parse_mode: "HTML",
				// Markup
				reply_markup: {
					inline_keyboard: [
						[
							Markup.button.callback("480p", `480p ${session_key}`),
							Markup.button.callback("720p", `720p ${session_key}`),
							Markup.button.callback("1080p", `1080p ${session_key}`),
						],
						[Markup.button.callback("Close", "close")],
					],
				},
			},
		);
		tg.deleteMessage(context.message_id);
	} catch (err) {
		// tg.deleteMessage(context.message_id);
		// tg.editMessageText("Terjadi Error ketika mendapatkan info URL...", {})
		tg.telegram.editMessageText(
			context.chat.id,
			context.message_id,
			undefined,
			"Terjadi Error ketika mendapatkan info URL...",
		);
		// tg.reply();
		console.log(err);
	}
});
