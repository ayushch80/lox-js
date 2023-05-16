/*
const fs = require("fs");
const args = process.argv.slice(2);

export class GenerateAstTS {

    private static defineAst ()

    public static main(args: string[]): void {
        if (args.length != 1) {
            console.log("Usage: generate_ast <output directory>");
            process.exit(64);
        }
        const outputDir: string = args[0];
        this.defineAst(outputDir, "Expr", [
            "Binary   : Expr left, Token operator, Expr right",
            "Grouping : Expr expression",
            "Literal  : Object value",
            "Unary    : Token operator, Expr right"
        ]);
    }

GenerateAstTS.main(args);
*/