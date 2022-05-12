class EventEmitter {
	static events: Event[] = [];

	static on(event: EventType, callback: Function, id: string) {
		if (!this.events[event]) this.events[event] = { listeners: [] };
		this.events[event].listeners.push({ callback, id });
	}

	static removeListener(event: EventType, id: string) {
		if (!this.events[event]) return;
		this.events[event].listeners = this.events[event].listeners.filter((e: Listener) => {
			if (e.id === id) {
				return false;
			}
			return true;
		});
	}

	static emit(event: EventType, data?: any) {
		if (!this.events[event]) return;
		this.events[event].listeners.forEach((e: Listener) => {
			e.callback(data);
		});
	}
}

enum EventType {
	OpenModal,
	UpdatedAssignments,
}

interface Listener {
	callback: Function;
	id: string;
}

interface Event {
	listeners: Listener[];
}

export { EventEmitter, EventType };
