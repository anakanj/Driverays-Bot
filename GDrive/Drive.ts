// import { OAuth2Client } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
import progress from "progress-stream";
import mime from "mime-types";
import { createReadStream, createWriteStream, statSync } from "fs";
import { MethodOptions } from "googleapis/build/src/apis/abusiveexperiencereport";
import { convertToPercentage } from "../Source/Utils/Formatters";

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
	// useProgress?: boolean;
	progressOptions?: Omit<progress.Options, "length">;
	onProgress?: (progress: progress.ProgressStream) => void;
	returnStreamEvents?: boolean;
}
interface UploadParameters {
	path: string;
	filename: string;
	folderId?: string;
}

export default class GoogleDrive {
	private readonly drive: drive_v3.Drive;
	private _lastUploadProgressFunctionRun: number | undefined;
	constructor(CLIENT_ID: string, CLIENT_SECRET: string, REDIRECT_URI: string, REFRESH_TOKEN: string) {
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
		this._lastUploadProgressFunctionRun = undefined;
	}
	public async uploadFiles({ path, filename, folderId }: UploadParameters, options?: UploadOptions) {
		return new Promise<progress.ProgressStream | drive_v3.Schema$File>((resolve, reject) => {
			const type = mime.lookup(filename);
			if (!type) {
				throw new Error("Cannot get File Type");
			}
			const stats = statSync(path);
			const Progress = progress({
				length: stats.size,
				time: options?.progressOptions?.time ? options.progressOptions.time : 2000,
			});
			const stream = createReadStream(path).pipe(Progress);
			type UploadParams = drive_v3.Params$Resource$Files$Create;
			const params: UploadParams = {
				requestBody: {
					name: filename,
					mimeType: type as string,
					parents: folderId ? [folderId] : undefined,
				},
				media: {
					mimeType: type as string,
					body: stream,
				},
				fields: "*",
			};
			const ThisClass = this;
			const additionalOptions: MethodOptions = {
				onUploadProgress(progress) {
					if (typeof options?.onUpload === "function") {
						if (ThisClass._lastUploadProgressFunctionRun) {
							if (ThisClass._lastUploadProgressFunctionRun - Date.now() < options.progressOptions?.time! ? options.progressOptions?.time : 2000) return;
							else {
								options?.onUpload({
									bytesRead: progress.bytesRead,
									size: stats.size,
									percentage: convertToPercentage(progress.bytesRead, stats.size),
								});
								ThisClass._lastUploadProgressFunctionRun = Date.now();
							}
						} else {
							ThisClass._lastUploadProgressFunctionRun = Date.now();
							options?.onUpload({
								bytesRead: progress.bytesRead,
								size: stats.size,
								percentage: convertToPercentage(progress.bytesRead, stats.size),
							});
						}
					}
				},
				...options,
			};
			// const response = this.drive.files.create(params, additionalOptions);
			const ThisDrive = this.drive;

			if (typeof options?.onProgress === "function") options.onProgress(Progress);
			async function AwaitUploadFile(params: UploadParams, options: MethodOptions) {
				const res = await ThisDrive.files.create(params, options);
				return res.data;
			}
			if (options?.returnStreamEvents) {
				const res = ThisDrive.files.create(params, additionalOptions);
				// const res = UploadFile(params, additionalOptions);
				// resolve(response as never as progress.ProgressStream);
				resolve(res as drive_v3.Schema$File);
				// if (options.returnStreamEvents) resolve(Progress as progress.ProgressStream);
				// else resolve(res as drive_v3.Schema$File);
			} else {
				AwaitUploadFile(params, additionalOptions).then((value) => resolve(value as drive_v3.Schema$File));
			}
			// else response.then((value) => resolve(value as never));
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
	public async downloadFile(fileId: string, path: string, options?: DownloadOptions) {
		return new Promise<progress.ProgressStream | number>((resolve, reject) => {
			this.drive.files
				.get(
					{
						fileId,
						alt: "media",
					},
					{
						responseType: "stream",
					}
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
			requestBody: {
				name: folderName,
				mimeType: "application/vnd.google-apps.folder",
			},
			fields: "id",
		});
		return result as unknown as Awaited<typeof result>;
	}
	public async createFolderInFolder(folderName: string, folderId: string) {
		try {
			const results = await this.drive.files.create({
				requestBody: {
					name: folderName,
					parents: [folderId],
					mimeType: "application/vnd.google-apps.folder",
				},
				fields: "*",
			});
			return results.data;
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
			const mappedFiles = results.data.files?.filter((value) => (includesTrash ? value.parents?.includes(inFolderId) : value.parents?.includes(inFolderId) && value.trashed === false));
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
		const init = await fetch(`https://www.bagusdl.pro/drive/direct.php?id=${fileId}`);
		const response: { url: string } = await init.json();
		return response;
	}
}
