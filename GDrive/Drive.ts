// import { OAuth2Client } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
// import path from "path";
import progress from "progress-stream";
import mime from "mime-types";
import { createReadStream, createWriteStream } from "fs";

interface DownloadOptions extends progress.Options {
	onDownload?: (progress: progress.Progress) => void;
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
	public async uploadFiles(path: string, filename: string) {
		const type = mime.lookup(filename);
		if (!type) {
			throw new Error("Cannot get File Type");
		}
		try {
			const response = await this.drive.files.create({
				requestBody: {
					name: filename,
					mimeType: type as string,
				},
				media: {
					mimeType: type as string,
					body: createReadStream(path),
				},
			});
			return response.data;
		} catch (err) {
			throw new Error("There's a problem when uploading a file...");
		}
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
		options: DownloadOptions,
	) {
		return new Promise((resolve, reject) => {
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
						if (typeof options.onDownload === "function") {
							options.onDownload(progress);
						}
					});
					str.on("error", reject);
					resolve(file.status);
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
}
