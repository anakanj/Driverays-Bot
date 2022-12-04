// import bot from "./Welcomes";
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/.env` });
const bot = new Telegraf(process.env.BOT_TOKEN!);
export default bot;
