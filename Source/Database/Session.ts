import mongoose from "mongoose";
import crypto from "crypto";
import { Metadata } from "../../Driverays/Metadata";
interface Sessions {
	user_id: string;
	key: string;
	data: Metadata;
	createdAt?: Date;
}

const session = mongoose.connection.useDb("Session");

export namespace Session {
	const schema = new mongoose.Schema<Sessions>({
		user_id: Number,
		key: String,
		data: {
			title: String,
			year: String,
			thumbnail: String,
			image: String,
			score: String,
			quality: String,
			tagline: String,
			duration: String,
			rating: String,
			genre: [String],
			synopsis: String,
			link_download: [
				{
					"480p": {
						Googledrive: String,
						"1fichier": String,
						Mega: String,
						Uptobox: String,
					},
				},
				{
					"720p": {
						Googledrive: String,
						"1fichier": String,
						Mega: String,
						Uptobox: String,
					},
				},
				{
					"1080p": {
						Googledrive: String,
						"1fichier": String,
						Mega: String,
						Uptobox: String,
					},
				},
			],
		},
		createdAt: Date,
	});

	// schema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
	const model = session.model<Sessions>("link", schema);

	export async function store(user_id: number, data: string): Promise<string> {
		const key = crypto.randomBytes(5).toString("hex");
		const session = new model({
			user_id,
			data,
			key,
		});
		await session.save();
		return key;
	}
	export async function get(key: string) {
		const results = await model.findOne({ key });
		await results?.delete();
		return results;
	}
}
