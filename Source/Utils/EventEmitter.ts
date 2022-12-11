import { EventEmitter } from "events";
import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { OnUploadProgress } from "../../GDrive/Drive";
type s = Update;
export interface ContextAndProgress
	extends Context<Update.CallbackQueryUpdate> {
	progress: OnUploadProgress;
}
export default interface InternalBotEvents extends EventEmitter {
	// on(event: 'EventName', listener: Context): this
	emit<CustomEventName extends string, CustomDataType>(
		event: CustomEventName,
		data: CustomDataType,
	): boolean;
	emit(event: "upload", data: Context): boolean;
	emit(event: "progress.upload", data: ContextAndProgress): boolean;

	on<CustomEventName extends string, CustomCallback>(
		event: CustomEventName,
		listener: CustomCallback,
	): this;
	on(event: "upload", listener: (data: Context) => void): this;
	on(
		event: "progress.upload",
		listener: (data: ContextAndProgress) => void,
	): this;
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
