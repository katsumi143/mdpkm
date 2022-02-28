export default class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    }

    removeListener(event, listener) {
        if (typeof this.events[event] === 'object') {
            let id = this.events[event].indexOf(listener);
            if (id > -1) {
                this.events[event].splice(id, 1);
            }
        }
    }

    emit(event) {
        let i, listeners, length, args = [].slice.call(arguments, 1);
        if (typeof this.events[event] === 'object') {
            listeners = this.events[event].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    once(event, listener) {
        this.on(event, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    }
};