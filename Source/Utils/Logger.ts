import chalk from "chalk";
import moment from "moment-timezone";

export namespace Logger {
	export function info(message: string) {
		console.log(color("[INFO]", "#03fc17"), chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`), chalk.white(message));
	}
	export function error(message: string) {
		console.log(color("[ERROR]", "#ff1430"), chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`), chalk.hex("#ff1430")(message));
	}
	export function debug(message: string) {
		console.log(color("[DEBUG]", "#145aff"), chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`), chalk.hex("#145aff")(message));
	}
	export function warn(message: string) {
		console.log(color("[WARN]", "#d1f216"), chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`), chalk.hex("#d1f216")(message));
	}
	function color(text: string, color: string) {
		return color ? (color.startsWith("#") ? chalk.hex(color)(text) : chalk.yellow(text)) : chalk.green(text);
	}
}

// Logger.info
