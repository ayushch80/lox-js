"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateAst = void 0;
var args = process.argv.slice(2);
class GenerateAst {
    static defineType(writer, baseName, className, fieldList) {
        writer.write(`    static class ${className} extends ${baseName} {\n`);
        // Constructor.
        writer.write(`        ${className}(${fieldList}) {\n`);
        // Store parameters in fields.
        const fields = fieldList.split(', ');
        for (const field of fields) {
            const name = field.split(' ')[1];
            writer.write(`            this.${name} = ${name};\n`);
        }
        writer.write(`        }\n`);
        // Visitor pattern.
        writer.write(`        <R> R accept(Visitor<R> visitor) {\n`);
        writer.write(`            return visitor.visit${className}${baseName}(this);\n`);
        writer.write(`        }\n`);
        // Fields.
        for (const field of fields) {
            writer.write(`        final ${field};\n`);
        }
        writer.write(`    }\n`);
    }
    static defineVisitor(writer, baseName, types) {
        writer.write(`    interface Visitor<R> {\n`);
        for (const type of types) {
            const typeName = type.split(':')[0].trim();
            writer.write(`        R visit${typeName}${baseName}(${typeName} ${baseName.toLowerCase()});\n`);
        }
        writer.write(`    }\n`);
    }
    static defineAst(outputDir, baseName, types) {
        const fs = require('fs');
        const path = `${outputDir}/${baseName}.java`;
        const writer = fs.createWriteStream(path);
        writer.write(`const { Token } = require('./token');\n\n`);
        writer.write(`export abstract class ${baseName} {\n`);
        this.defineVisitor(writer, baseName, types);
        for (const type of types) {
            const className = type.split(':')[0].trim();
            const fields = type.split(':')[1].trim();
            this.defineType(writer, baseName, className, fields);
        }
        // The base accept() method.
        writer.write(`    abstract <R> R accept(Visitor<R> visitor);\n`);
        writer.write(`}\n`);
        writer.close();
    }
    static main(args) {
        if (args.length != 1) {
            console.log("Usage: generate_ast <output directory>");
            process.exit(64);
        }
        const outputDir = args[0];
        this.defineAst(outputDir, "Expr", [
            "Binary   : Expr left, Token operator, Expr right",
            "Grouping : Expr expression",
            "Literal  : Object value",
            "Unary    : Token operator, Expr right"
        ]);
    }
}
exports.GenerateAst = GenerateAst;
GenerateAst.main(args);
//# sourceMappingURL=generateAst.js.map