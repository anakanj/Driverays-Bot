import chalk from "chalk";
import moment from "moment-timezone";

export namespace Logger {
	export function info(message: string) {
		console.log(
			color("[INFO]", "#03fc17"),
			chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`),
			chalk.yellow(message),
		);
	}
	function color(text: string, color: string) {
		return color
			? color.startsWith("#")
				? chalk.hex(color)(text)
				: chalk.yellow(text)
			: chalk.green(text);
	}
}

// Logger.info
