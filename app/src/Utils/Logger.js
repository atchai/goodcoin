
class Logger {

    constructor() {
    }

    logEvent(eventName,eventObj) {
        let handler = console.log(`New ${eventName}!`, eventObj);
        return handler;

    }

}

module.exports = Logger;


