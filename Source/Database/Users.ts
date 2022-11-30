import mongoose from "mongoose";
import { User } from "typegram";
import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/.env` });

mongoose.connect(process.env.MONGODB_URI!, (e) =>
	e ? console.log(e.message) : undefined,
);
const users = mongoose.connection.useDb("Users");
const UserSchema = new mongoose.Schema<User>({
	id: mongoose.Schema.Types.Number,
	is_bot: mongoose.Schema.Types.Boolean,
	first_name: mongoose.Schema.Types.String,
	last_name: mongoose.Schema.Types.String,
	username: mongoose.Schema.Types.String,
	is_premium: mongoose.Schema.Types.Boolean,
	language_code: mongoose.Schema.Types.String,
});

export default users.model<User>("data", UserSchema);
