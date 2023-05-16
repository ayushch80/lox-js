"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lox = void 0;
const { Scanner } = require('./scanner');
var args = process.argv.slice(2);
class Lox {
    constructor() {
        this.hadError = false;
    }
    main(args) {
        if (args.length > 1) {
            console.log("Usage: jslox [script]");
            process.exit(64);
        }
        else if (args.length == 1) {
            this.runFile(args[0]);
        }
        else {
            this.runPrompt();
        }
    }
    runFile(path) {
        const fs = require('fs');
        let bytes = new Uint8Array(fs.readFileSync(path));
    }
    runPrompt() {
        return __awaiter(this, void 0, void 0, function* () {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            for (;;) {
                const line = yield new Promise((resolve) => {
                    rl.question('> ', (answer) => {
                        resolve(answer);
                    });
                });
                if (line === null) {
                    rl.close();
                    return;
                }
                else if (line === 'exit') {
                    rl.close();
                    return;
                }
                this.run(line);
            }
        });
    }
    run(source) {
        const scanner = new Scanner(source);
        Scanner.source = source;
        const tokens = scanner.scanTokens();
        for (const token of tokens) {
            console.log(token);
        }
    }
    error(line, message) {
        this.report(line, "", message);
    }
    report(line, where, message) {
        console.log(`[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }
}
exports.Lox = Lox;
const lox = new Lox();
lox.main(args);
//# sourceMappingURL=lox.js.map