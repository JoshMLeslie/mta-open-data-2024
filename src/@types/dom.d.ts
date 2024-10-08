interface CustomEventMap {
	'date-update': CustomEvent<string>;
	'modal-message': CustomEvent<string>;
}
declare global {
	interface Document {
		addEventListener<K extends keyof CustomEventMap>(
			type: K,
			listener: (this: Document, ev: CustomEventMap[K]) => void
		): void;
		dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
	}
}

export { }; // keep that for TS compiler being a baby.

