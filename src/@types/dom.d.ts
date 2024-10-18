interface CustomEventMap {
	'borough-select': CustomEvent<string>;
	'date-update': CustomEvent<string>;
	'modal-message': CustomEvent<string>;
	'stop-animation': Event;
}
declare global {
	interface Document {
		addEventListener<K extends keyof CustomEventMap>(
			type: K,
			listener: (this: Document, ev: CustomEventMap[K]) => void
		): void;
		dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
		addEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
	}
}

export { }; // keep that for TS compiler being a baby.

