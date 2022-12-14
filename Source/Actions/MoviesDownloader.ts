import bot, { drive } from "../main";
import { Session } from "../Database/Session";
import { acefile } from "../../Acefile";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import mime from "mime-types";
import path from "path";
import { formatAsBytes, formatAsPercent } from "../Utils/Formatters";
import progress_stream from "progress-stream";
import { drive_v3 } from "googleapis";

interface DownloadCaption {
	title: string;
	year: string;
	resolution: "480p" | "720p" | "1080p";
	fileSize: string;
	downloaded: string;
	speed: string;
}
function downloadCaption({ title, year, resolution, fileSize, downloaded, speed }: DownloadCaption) {
	return `
Mengunduh Film
Nama Film: <i>${title}</i>
Tahun: <i>${year}</i>
Resolusi: <i>${resolution}</i>
Ukuran File: <i>${fileSize}</i>
		
Terunduh: <b>${downloaded}</b>
Kecepatan: <b>${speed}</b>
`;
}
bot.action(/480p/, async (ctx) => {
	const session = await Session.get(ctx.match.input.split(" ")[1]);
	session?.data;
	ctx.deleteMessage();
	const caption = "<i>Tunggu Sebentar...</i>";
	const context = await ctx.reply(caption, { parse_mode: "HTML" });
	if (session?.data) {
		const url = await acefile(session?.data.link_download["480p"]?.Googledrive!, true);
		const directory = path.resolve(process.cwd(), "Downloads");
		const ext = mime.extension(url.mimeType);
		const fileName = `${session?.data.title} (${session?.data.year}) 480p.${ext}`;
		const folderName = `${session?.data.title} (${session?.data.year})`;
		const fileDirectory = path.resolve(directory, fileName);
		async function downloadFiles() {
			const listFiles = await drive.listFiles();
			// const filtered = listFiles.files?.find((value) => value.name?.includes(folderName))
			const Movies = listFiles.files?.find((value) => value.name?.includes(fileName));
			if (Movies) {
				const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${Movies.webContentLink}
`;
				// console.log(Movies);

				if (!Movies.shared) await drive.createPublicURL(Movies.id!);
				ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
			} else {
				const download = (await drive.downloadFile(url.id, fileDirectory, {
					time: 2000,
					useProgress: true,
				})) as progress_stream.ProgressStream;
				download.on("progress", (progress) => {
					let percentage = formatAsPercent(progress.percentage);
					const downloadMessage = downloadCaption({
						title: session?.data.title!,
						year: session?.data.year!,
						resolution: "480p",
						fileSize: formatAsBytes(progress.length),
						downloaded: percentage,
						speed: formatAsBytes(progress.speed),
					});
					ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, downloadMessage, {
						parse_mode: "HTML",
					});
				});
				download.on("finish", async () => {
					const completedMessage = `
<i>Download Telah Selesai...</i>
	
<b>Mempersiapkan Tahap Upload...</b>
					`;

					await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, completedMessage, {
						parse_mode: "HTML",
					});
					const files = await drive.listFiles();
					const folderId = files.files?.find((value) => value.name === "Movies" && value.mimeType === "application/vnd.google-apps.folder")?.id;
					const inFolderMovies = files.files?.filter((value) => value.parents?.includes(folderId!));
					const findMoviesFolder = inFolderMovies?.find((value) => value.name === folderName);
					async function UploadFiles(folderId: string) {
						const upload = (await drive.uploadFiles(
							{
								path: fileDirectory,
								filename: fileName,
								folderId,
							},
							{
								returnStreamEvents: false,
								onProgress(progress) {
									progress.on("progress", (progress) => {
										const uploadMessage = `
<i>Uploading...</i>
	
Terupload: <b>${formatAsPercent(progress.percentage)}</b>
														`;
										ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, uploadMessage, { parse_mode: "HTML" });
									});
									progress.on("finish", async () => {
										const finishMessage = `
<i>Upload Telah Selesai...</i>
	
<b>Tunggu Sebentar</b>
									`;
										await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, finishMessage, { parse_mode: "HTML" });
									});
								},
							}
						)) as drive_v3.Schema$File;
						const publicURL = await drive.createPublicURL(upload.id!);
						const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${publicURL.webContentLink}
					`;
						ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
						unlinkSync(fileDirectory);
					}
					if (!findMoviesFolder) {
						const folder = await drive.createFolderInFolder(folderName, folderId!);
						await UploadFiles(folder?.id!);
					} else {
						await UploadFiles(findMoviesFolder.id!);
					}
				});
			}
		}
		if (existsSync(directory)) {
			await downloadFiles();
		} else {
			mkdirSync(directory);
			await downloadFiles();
		}
	}
});

bot.action(/720p/, async (ctx) => {
	const session = await Session.get(ctx.match.input.split(" ")[1]);
	if (session?.data) {
		const url = await acefile(session?.data.link_download["720p"]?.Googledrive!, true);
		// console.log(url.id);
		const directory = path.resolve(process.cwd(), "Downloads");
		const ext = mime.extension(url.mimeType);
		const fileName = `${session?.data.title} (${session?.data.year}) 720p.${ext}`;
		const folderName = `${session?.data.title} (${session?.data.year})`;
		const fileDirectory = path.resolve(directory, fileName);
		ctx.deleteMessage();
		const caption = "<i>Tunggu Sebentar...</i>";
		const context = await ctx.reply(caption, { parse_mode: "HTML" });
		async function downloadFiles() {
			const listFiles = await drive.listFiles();
			// const filtered = listFiles.files?.find((value) => value.name?.includes(folderName))
			const Movies = listFiles.files?.find((value) => value.name?.includes(fileName));
			if (Movies) {
				const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${Movies.webContentLink}
	`;
				// console.log(Movies);

				if (!Movies.shared) await drive.createPublicURL(Movies.id!);
				ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
			} else {
				const download = (await drive.downloadFile(url.id, fileDirectory, {
					time: 2000,
					useProgress: true,
				})) as progress_stream.ProgressStream;
				download.on("progress", (progress) => {
					let percentage = formatAsPercent(progress.percentage);
					const downloadMessage = downloadCaption({
						title: session?.data.title!,
						year: session?.data.year!,
						resolution: "720p",
						fileSize: formatAsBytes(progress.length),
						downloaded: percentage,
						speed: formatAsBytes(progress.speed),
					});
					ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, downloadMessage, {
						parse_mode: "HTML",
					});
				});
				download.on("finish", async () => {
					const completedMessage = `
<i>Download Telah Selesai...</i>
	
<b>Mempersiapkan Tahap Upload...</b>
					`;

					await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, completedMessage, {
						parse_mode: "HTML",
					});
					const files = await drive.listFiles();
					const folderId = files.files?.find((value) => value.name === "Movies" && value.mimeType === "application/vnd.google-apps.folder")?.id;
					const inFolderMovies = files.files?.filter((value) => value.parents?.includes(folderId!));
					const findMoviesFolder = inFolderMovies?.find((value) => value.name === folderName);
					async function UploadFiles(folderId: string) {
						const upload = (await drive.uploadFiles(
							{
								path: fileDirectory,
								filename: fileName,
								folderId,
							},
							{
								returnStreamEvents: false,
								onProgress(progress) {
									progress.on("progress", (progress) => {
										const uploadMessage = `
<i>Uploading...</i>
	
Terupload: <b>${formatAsPercent(progress.percentage)}</b>
														`;
										ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, uploadMessage, { parse_mode: "HTML" });
									});
									progress.on("finish", async () => {
										const finishMessage = `
<i>Upload Telah Selesai...</i>
	
<b>Tunggu Sebentar</b>
									`;
										await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, finishMessage, { parse_mode: "HTML" });
									});
								},
							}
						)) as drive_v3.Schema$File;
						const publicURL = await drive.createPublicURL(upload.id!);
						const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${publicURL.webContentLink}
					`;
						ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
						unlinkSync(fileDirectory);
					}
					if (!findMoviesFolder) {
						const folder = await drive.createFolderInFolder(folderName, folderId!);
						await UploadFiles(folder?.id!);
					} else {
						await UploadFiles(findMoviesFolder.id!);
					}
				});
			}
		}
		if (existsSync(directory)) {
			await downloadFiles();
		} else {
			mkdirSync(directory);
			await downloadFiles();
		}
	}
});

bot.action(/1080p/, async (ctx) => {
	const session = await Session.get(ctx.match.input.split(" ")[1]);
	if (session?.data) {
		const url = await acefile(session?.data.link_download["1080p"]?.Googledrive!, true);
		const directory = path.resolve(process.cwd(), "Downloads");
		const ext = mime.extension(url.mimeType);
		const fileName = `${session?.data.title} (${session?.data.year}) 1080p.${ext}`;
		const folderName = `${session?.data.title} (${session?.data.year})`;
		const fileDirectory = path.resolve(directory, fileName);
		ctx.deleteMessage();
		const caption = "<i>Tunggu Sebentar...</i>";
		const context = await ctx.reply(caption, { parse_mode: "HTML" });
		async function downloadFiles() {
			const listFiles = await drive.listFiles();
			const Movies = listFiles.files?.find((value) => value.name?.includes(fileName));
			if (Movies) {
				const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${Movies.webContentLink}
	`;
				if (!Movies.shared) await drive.createPublicURL(Movies.id!);
				ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
			} else {
				const download = (await drive.downloadFile(url.id, fileDirectory, {
					time: 2000,
					useProgress: true,
				})) as progress_stream.ProgressStream;
				download.on("progress", (progress) => {
					let percentage = formatAsPercent(progress.percentage);
					const downloadMessage = downloadCaption({
						title: session?.data.title!,
						year: session?.data.year!,
						resolution: "1080p",
						fileSize: formatAsBytes(progress.length),
						downloaded: percentage,
						speed: formatAsBytes(progress.speed),
					});
					ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, downloadMessage, {
						parse_mode: "HTML",
					});
				});
				download.on("finish", async () => {
					const completedMessage = `
<i>Download Telah Selesai...</i>

<b>Mempersiapkan Tahap Upload...</b>
					`;

					await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, completedMessage, {
						parse_mode: "HTML",
					});
					const files = await drive.listFiles();
					const folderId = files.files?.find((value) => value.name === "Movies" && value.mimeType === "application/vnd.google-apps.folder")?.id;
					const inFolderMovies = files.files?.filter((value) => value.parents?.includes(folderId!));
					const findMoviesFolder = inFolderMovies?.find((value) => value.name === folderName);
					async function UploadFiles(folderId: string) {
						const upload = (await drive.uploadFiles(
							{
								path: fileDirectory,
								filename: fileName,
								folderId,
							},
							{
								returnStreamEvents: false,
								onProgress(progress) {
									progress.on("progress", (progress) => {
										const uploadMessage = `
<i>Uploading...</i>

Terupload: <b>${formatAsPercent(progress.percentage)}</b>
														`;
										ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, uploadMessage, { parse_mode: "HTML" });
									});
									progress.on("finish", async () => {
										const finishMessage = `
<i>Upload Telah Selesai...</i>

<b>Tunggu Sebentar</b>
									`;
										await ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, finishMessage, { parse_mode: "HTML" });
									});
								},
							}
						)) as drive_v3.Schema$File;
						const publicURL = await drive.createPublicURL(upload.id!);
						const filmMessage = `
<b>Link Film Telah Dibuat</b>: ${publicURL.webContentLink}
					`;
						ctx.telegram.editMessageText(context.chat.id, context.message_id, undefined, filmMessage, { parse_mode: "HTML" });
						unlinkSync(fileDirectory);
					}
					if (!findMoviesFolder) {
						const folder = await drive.createFolderInFolder(folderName, folderId!);
						await UploadFiles(folder?.id!);
					} else {
						await UploadFiles(findMoviesFolder.id!);
					}
				});
			}
		}
		if (existsSync(directory)) {
			await downloadFiles();
		} else {
			mkdirSync(directory);
			await downloadFiles();
		}
	}
});
