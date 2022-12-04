import bot from "../main";

bot.action("close", (ctx) => ctx.deleteMessage());
