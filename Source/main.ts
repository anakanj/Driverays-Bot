// import bot from "./Welcomes";
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import GoogleDrive from "../GDrive/Drive";
dotenv.config({ path: `${process.cwd()}/.env` });
const bot = new Telegraf(process.env.BOT_TOKEN!);
export default bot;
export const drive = new GoogleDrive(
	process.env.CLIENT_ID!,
	process.env.CLIENT_SECRET!,
	process.env.REDIRECT_URI!,
	process.env.REFRESH_TOKEN!,
);
