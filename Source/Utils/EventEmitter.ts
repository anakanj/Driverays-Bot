import { EventEmitter } from "events";
import { Context } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { OnUploadProgress } from "../../GDrive/Drive";
export interface ContextAndProgress extends Context<Update.CallbackQueryUpdate> {
	progress: OnUploadProgress;
}

interface UploadEvent {
	fileName: string;
	fileDirectory: string;
	folderName: string;
	lastMessageTextContext: Message.TextMessage;
	ctx: Context<Update.CallbackQueryUpdate>;
	url?: string;
}
export default interface InternalBotEvents extends EventEmitter {
	emit(event: "upload", data: UploadEvent): boolean;
	emit(event: "progress.upload", data: ContextAndProgress): boolean;

	on(event: "upload", listener: (data: UploadEvent) => void): this;
	on(event: "progress.upload", listener: (data: ContextAndProgress) => void): this;
}
/**
 * TODO TASK - Emit event `upload` itu ga boleh jalan sebelum 1 detik terakhir kali function itu dijalankan menggunakan perpaduan antar waktu dan menggunakan class `Date`
 * */
export default class InternalBotEvents extends EventEmitter {
	// type data = ''
	private _lastUploadEventEmitted: number | undefined;
	constructor() {
		super();
		this._lastUploadEventEmitted = undefined;
	}
	// emit(eventName: string | symbol, ...args: any[]): boolean {

	// }
	emitProgressEvent(tgContextAndProgress: ContextAndProgress) {
		// if(this._lastUploadEventEmitted)
		if (this._lastUploadEventEmitted) {
			if (this._lastUploadEventEmitted - Date.now() < 2000) {
				this._lastUploadEventEmitted = Date.now();
				return this.emit("progress.upload", tgContextAndProgress);
			}
		} else return false;
	}
}
// new EventEmitter()

// // event.on()
