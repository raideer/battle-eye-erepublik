export default class EventHandler {
    constructor() {
        this.events = {};
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(fn => {
                return fn(data);
            });
        }
    }

    on(eventName, closure) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(closure);
    }

    off(eventName, closure) {
        if (this.events[eventName]) {
            for (const i in this.events[eventName]) {
                var event = this.events[eventName][i];
                if (event == closure) {
                    this.events[eventName].splice(i, 1);
                }
            }
        }
    }
}
