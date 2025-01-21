const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    log(type, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message,
            ...data
        };

        // Console output with color coding
        const colors = {
            MATCH: '\x1b[32m', // Green
            ERROR: '\x1b[31m', // Red
            INFO: '\x1b[36m',  // Cyan
            RESET: '\x1b[0m'
        };

        console.log(`${colors[type]}[${timestamp}] ${type}: ${message}${colors.RESET}`, data);

        // Write to file
        const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
}

const logger = new Logger();
module.exports = logger; 