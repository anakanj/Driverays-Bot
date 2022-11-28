// import { OAuth2Client } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
// import path from "path";
import mime from "mime-types";
import { createReadStream } from "fs";
// const CLIENT_ID =
// "387577156343-kcq3tv2jhoq2gn88vbd2796ant5u5v7p.apps.googleusercontent.com";
// const CLIENT_SECRET = "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";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN =
// "1//04VTk9eRAtomcCgYIARAAGAQSNwF-L9Ir37GIfTC5Yyy-UKmacoLc1ob2PAYPLSbq2RNCcoSmhRG1yTZt2-3cIpUIQCL-ccHdQqE";

// const oauth2client = new google.auth.OAuth2({
// 	clientId: CLIENT_ID,
// 	clientSecret: CLIENT_SECRET,
// 	redirectUri: REDIRECT_URI,
// });

// console.log(typeof oauth2client);

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
	public async downloadFile(fileId: string) {
		try {
			const file = await this.drive.files.get({
				fileId,
				alt: "media",
			});
			return file.status;
		} catch (err) {
			throw new Error("Failed to download file");
		}
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
		return result;
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
	public async listFiles() {
		const results = await this.drive.files.list({
			corpora: "user",
			fields: "nextPageToken, files(*)",
		});
		return results.data;
	}
}
