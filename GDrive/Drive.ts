// import { OAuth2Client } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
// import path from "path";
import progress from "progress-stream";
import mime from "mime-types";
import { createReadStream, createWriteStream, statSync } from "fs";
import { MethodOptions } from "googleapis/build/src/apis/abusiveexperiencereport";
import { convertToPercentage } from "../Source/Utils/Formatters";
import axios from "axios";

interface DownloadOptions extends progress.Options {
	onDownload?: (progress: progress.Progress) => void;
	useProgress?: boolean;
}
export interface OnUploadProgress {
	bytesRead: number;
	size: number;
	percentage: number;
}
interface UploadOptions extends MethodOptions {
	onUpload?: (progress: OnUploadProgress) => void;
	useProgress?: boolean;
	progressOptions?: Omit<progress.Options, "length">;
}
export default class GoogleDrive {
	private readonly drive: drive_v3.Drive;
	constructor(
		CLIENT_ID: string,
		CLIENT_SECRET: string,
		REDIRECT_URI: string,
		REFRESH_TOKEN: string,
	) {
		const oauth2client = new google.auth.OAuth2({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			redirectUri: REDIRECT_URI,
		});

		oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });
		this.drive = google.drive({
			version: "v3",
			auth: oauth2client,
		});
	}
	public async uploadFiles<T>(
		path: string,
		filename: string,
		options?: UploadOptions,
	) {
		return new Promise<T>((resolve, reject) => {
			const type = mime.lookup(filename);
			if (!type) {
				throw new Error("Cannot get File Type");
			}
			const stats = statSync(path);
			const Progress = progress({
				length: stats.size,
				time: options?.progressOptions?.time
					? options.progressOptions.time
					: 2000,
			});
			const stream = createReadStream(path).pipe(Progress);
			const response = this.drive.files.create(
				{
					requestBody: {
						name: filename,
						mimeType: type as string,
					},
					media: {
						mimeType: type as string,
						body: stream,
					},
				},
				{
					onUploadProgress(progress) {
						if (typeof options?.onUpload === "function") {
							options?.onUpload({
								bytesRead: progress.bytesRead,
								size: stats.size,
								percentage: convertToPercentage(progress.bytesRead, stats.size),
							});
						}
					},
					...options,
				},
			);
			if (options?.useProgress) resolve(Progress as never);
			else response.then((value) => resolve(value as never));
		});
	}
	public async deleteFile(fileId: string) {
		try {
			const response = await this.drive.files.delete({
				fileId,
			});
			return response.data;
		} catch (err) {
			throw new Error("Failed to delete file...");
		}
	}
	public async createPublicURL(fileId: string) {
		await this.drive.permissions.create({
			fileId,
			// fields: '',
			requestBody: {
				role: "reader",
				type: "anyone",
			},
		});
		const result = await this.drive.files.get({
			fileId,
			fields: "webViewLink, webContentLink",
		});
		return result.data;
	}
	public async downloadFile(
		fileId: string,
		path: string,
		options?: DownloadOptions,
	) {
		return new Promise<progress.ProgressStream | number>((resolve, reject) => {
			this.drive.files
				.get(
					{
						fileId,
						alt: "media",
					},
					{
						responseType: "stream",
					},
				)
				.then((file) => {
					const str = progress({
						length: parseInt(file.headers["content-length"]),
						...options,
					});
					const stream = createWriteStream(path);
					// stream.pipe()
					file.data.pipe(str).pipe(stream);
					str.on("progress", (progress) => {
						if (typeof options?.onDownload === "function") {
							options?.onDownload(progress);
						}
					});

					// str.on("error", reject);
					if (options?.useProgress) resolve(str);
					else resolve(file.status);
				})
				.catch(reject);
		});
	}
	public async createFolder(folderName: string) {
		const result = this.drive.files.create({
			// @ts-ignore
			resource: {
				name: folderName,
				mimeType: "application/vnd.google-apps.folder",
			},
			fields: "id",
		});
		return result as unknown as Awaited<typeof result>;
	}
	public async createFolderInFolder(folderName: string, folderId: string) {
		try {
			const results = this.drive.files.create({
				// @ts-ignore
				resource: {
					name: folderName,
					parents: [folderId],
					mimeType: "application/vnd.google-apps.folder",
				},
				fields: "id",
			});
			return results;
		} catch (err) {
			console.log("There a error while creating folder\n", err);
		}
	}
	public async listFiles(inFolderId?: string, includesTrash = false) {
		const results = await this.drive.files.list({
			corpora: "user",
			fields: "nextPageToken, files(*)",
		});
		if (inFolderId) {
			const mappedFiles = results.data.files?.filter((value) =>
				includesTrash
					? value.parents?.includes(inFolderId)
					: value.parents?.includes(inFolderId) && value.trashed === false,
			);
			return { ...results.data, files: mappedFiles };
		} else {
			if (includesTrash) {
				return results.data;
			} else {
				return {
					...results.data,
					files: results.data.files?.filter((value) => value.trashed === false),
				};
			}
		}
	}
	public async getDirectLink(fileId: string) {
		const res = await axios.get<{ url: string }>(
			`https://www.bagusdl.pro/drive/direct.php?id=${fileId}`,
		);
		return res.data;
	}
}
