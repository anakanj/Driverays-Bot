import bot from "./Source/main";
import { Logger } from "./Source/Utils/Logger";
import GoogleDrive from "./GDrive/Drive";
import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/.env` });

// Importing Bot Functions
import "./Source/Welcomes";
import "./Source/Metadata";
import "./Source/Middleware";
import "./Source/Downloader";
import "./Source/Actions/CloseButton";
async function init() {
	const drive = new GoogleDrive(
		process.env.CLIENT_ID!,
		process.env.CLIENT_SECRET!,
		process.env.REDIRECT_URI!,
		process.env.REFRESH_TOKEN!,
	);
	Logger.info("Checking Files");
	const { files } = await drive.listFiles();
	// console.log(files);

	const results = files?.find((value) => value.name === "Driverays");
	if (results) {
		const { files: files_in_driverays } = await drive.listFiles(results.id!);
		const movies_folder = files_in_driverays?.find(
			(value) => value.name === "Movies",
		);
		const series_folder = files_in_driverays?.find(
			(value) => value.name === "Series",
		);
		let movies_length: number | undefined = undefined;
		let series_length: number | undefined = undefined;
		if (movies_folder) {
			// Logger.info("Listing Movies...");
			const list = await drive.listFiles(movies_folder.id!);
			const filtered = list.files?.filter(
				(values) => values.mimeType === "application/vnd.google-apps.folder",
			);
			// Logger.info(`Ditemukan ${filtered?.length} Film`);
			movies_length = filtered?.length;
		} else {
			Logger.info("Movie folder is not created yet, creating folder...");
			await drive.createFolderInFolder("Movies", results.id!);
		}
		if (series_folder) {
			// Logger.info("Listing Series...");
			const list = await drive.listFiles(series_folder.id!);
			const filtered = list.files?.filter(
				(values) => values.mimeType === "application/vnd.google-apps.folder",
			);
			series_length = filtered?.length;
			// Logger.info(`Ditemukan ${filtered?.length} Series`);
		} else {
			Logger.info("Series folder is not created yet, creating folder...");
			await drive.createFolderInFolder("Series", results.id!);
		}
		Logger.info(`Ditemukan ${movies_length} Film dan ${series_length} Series`);
	} else {
		Logger.info("Driverays folder is not created yet, creating folder...");
		await drive.createFolder("Driverays");
		// console.log(metadata.data.id);
	}
	// console.log(results);
	bot.launch();
	Logger.info("Bot Has Been Started");
}
await init();
// console.log("Bot is Started!");
