var args = process.argv.slice(2);

export class GenerateAst {

    private static defineType(writer: any, baseName: string, className: string, fieldList: string): void {
        writer.write(`    static class ${className} extends ${baseName} {\n`);
        // Constructor.
        writer.write(`        ${className}(${fieldList}) {\n`);
        // Store parameters in fields.
        const fields: string[] = fieldList.split(', ');
        for (const field of fields) {
            const name: string = field.split(' ')[1];
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

    private static defineVisitor(writer: any, baseName: string, types: string[]): void {
        writer.write(`    interface Visitor<R> {\n`);
        for (const type of types) {
            const typeName: string = type.split(':')[0].trim();
            writer.write(`        R visit${typeName}${baseName}(${typeName} ${baseName.toLowerCase()});\n`);
        }
        writer.write(`    }\n`);
    }

    private static defineAst(outputDir: string, baseName: string, types: string[]): void {
        const fs = require('fs');
        const path: string = `${outputDir}/${baseName}.java`;
        const writer = fs.createWriteStream(path);
        writer.write(`const { Token } = require('./token');\n\n`);
        writer.write(`export abstract class ${baseName} {\n`);
        this.defineVisitor(writer, baseName, types);
        for (const type of types) {
            const className: string = type.split(':')[0].trim();
            const fields: string = type.split(':')[1].trim();
            this.defineType(writer, baseName, className, fields);
        }
        // The base accept() method.
        writer.write(`    abstract <R> R accept(Visitor<R> visitor);\n`);
        writer.write(`}\n`);
        writer.close();
    }

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
}

GenerateAst.main(args);