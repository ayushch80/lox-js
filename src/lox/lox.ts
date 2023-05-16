const { Scanner } = require('./scanner');

var args = process.argv.slice(2);

export class Lox {

    hadError: boolean = false;

    public main(args: string[]): void {
        if (args.length > 1) {
            console.log("Usage: jslox [script]")
            process.exit(64);
        } else if (args.length == 1) {
            this.runFile(args[0]);
        } else {
            this.runPrompt();
        }
    }

    private runFile(path: string): void {
        const fs = require('fs');
        let bytes: Uint8Array = new Uint8Array(fs.readFileSync(path));
    }

    private async runPrompt(): Promise<void> {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        for (; ;) {
            const line: string = await new Promise((resolve) => {
                rl.question('> ', (answer) => {
                    resolve(answer);
                });
            });

            if (line === null) {
                rl.close();
                return;
            } else if (line === 'exit') {
                rl.close();
                return;
            }

            this.run(line);
        }
    }

    private run(source: string): void {
        const scanner = new Scanner(source);
        Scanner.source = source;
        const tokens: String[] = scanner.scanTokens();

        for (const token of tokens) {
            console.log(token);
        }
    }

    public error(line: number, message: string): void {
        this.report(line, "", message);
    }

    private report(line: number, where: string, message: string): void {
        console.log(`[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }
}

const lox: Lox = new Lox();
lox.main(args);