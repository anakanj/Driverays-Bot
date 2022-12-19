import mongoose from "mongoose";

const cache = mongoose.connection.useDb("Cache");

namespace Cache {
	const ImageSchema = new mongoose.Schema({
		original_url: String,
		cached_url: String,
	});

	const model = cache.model("image", ImageSchema);

	export async function saveImageURL(url: string, cached_url: string) {
		const image = new model({
			original_url: url,
			cached_url,
		});
		return image.save();
	}
	export async function removeImageURL(url: string) {
		return await model.findOneAndDelete({ original_url: url });
	}
	export async function findSavedImageURL(original_url: string) {
		const results = await model.findOne({ original_url });
		return results;
	}
}

export default Cache;
