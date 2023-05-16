"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const { Token } = require('./token');
var TokenType;
(function (TokenType) {
    // Single-character tokens.
    TokenType["LEFT_PAREN"] = "LEFT_PAREN";
    TokenType["RIGHT_PAREN"] = "RIGHT_PAREN";
    TokenType["LEFT_BRACE"] = "LEFT_BRACE";
    TokenType["RIGHT_BRACE"] = "RIGHT_BRACE";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["MINUS"] = "MINUS";
    TokenType["PLUS"] = "PLUS";
    TokenType["SEMICOLON"] = "SEMICOLON";
    TokenType["SLASH"] = "SLASH";
    TokenType["STAR"] = "STAR";
    // One or two character tokens.
    TokenType["BANG"] = "BANG";
    TokenType["BANG_EQUAL"] = "BANG_EQUAL";
    TokenType["EQUAL"] = "EQUAL";
    TokenType["EQUAL_EQUAL"] = "EQUAL_EQUAL";
    TokenType["GREATER"] = "GREATER";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    TokenType["LESS"] = "LESS";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    // Literals.
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    // Keywords.
    TokenType["AND"] = "AND";
    TokenType["CLASS"] = "CLASS";
    TokenType["ELSE"] = "ELSE";
    TokenType["FALSE"] = "FALSE";
    TokenType["FUN"] = "FUN";
    TokenType["FOR"] = "FOR";
    TokenType["IF"] = "IF";
    TokenType["NIL"] = "NIL";
    TokenType["OR"] = "OR";
    TokenType["PRINT"] = "PRINT";
    TokenType["RETURN"] = "RETURN";
    TokenType["SUPER"] = "SUPER";
    TokenType["THIS"] = "THIS";
    TokenType["TRUE"] = "TRUE";
    TokenType["VAR"] = "VAR";
    TokenType["WHILE"] = "WHILE";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
class Scanner {
    constructor(source) {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.keywords = new Map([
            ["and", TokenType.AND],
            ["class", TokenType.CLASS],
            ["else", TokenType.ELSE],
            ["false", TokenType.FALSE],
            ["for", TokenType.FOR],
            ["fun", TokenType.FUN],
            ["if", TokenType.IF],
            ["nil", TokenType.NIL],
            ["or", TokenType.OR],
            ["print", TokenType.PRINT],
            ["return", TokenType.RETURN],
            ["super", TokenType.SUPER],
            ["this", TokenType.THIS],
            ["true", TokenType.TRUE],
            ["var", TokenType.VAR],
            ["while", TokenType.WHILE]
        ]);
        this.source = source;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme.
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }
    scanToken() {
        const { Lox } = require('./lox');
        let lox = new Lox();
        const c = this.advance();
        switch (c) {
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd())
                        this.advance();
                }
                else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;
            case 'o':
                if (this.peek() == 'r')
                    this.addToken(TokenType.OR);
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    lox.error(this.line, "Unexpected character.");
                }
                break;
        }
    }
    match(expected) {
        if (this.isAtEnd())
            return false;
        if (this.source.charAt(this.current) != expected)
            return false;
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.source.charAt(this.current);
    }
    isAtEnd() {
        //console.log(this.source);
        return this.current >= this._length(this.source);
    }
    identifier() {
        while (this.isAlphaNumeric(this.peek()))
            this.advance();
        let text = this.source.substring(this.start, this.current);
        let type = this.keywords.get(text);
        if (type === undefined || type === null)
            type = TokenType.IDENTIFIER;
        this.addToken(type);
    }
    number() {
        while (this.isDigit(this.peek()))
            this.advance();
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();
            while (this.isDigit(this.peek()))
                this.advance();
        }
        this.addToken(TokenType.NUMBER, Number.parseFloat(this.source.substring(this.start, this.current)));
    }
    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n')
                this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            const { Lox } = require('./lox');
            let lox = new Lox();
            lox.error(this.line, "Unterminated string.");
            return;
        }
        // The closing ".
        this.advance();
        let value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }
    advance() {
        return this.source.charAt(this.current++);
    }
    addToken(type, literal) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal !== null && literal !== void 0 ? literal : null, this.line));
    }
    peekNext() {
        if (this.current + 1 >= this._length(this.source))
            return '\0';
        return this.source.charAt(this.current + 1);
    }
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    }
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    _length(str) {
        if (str === undefined)
            return 0;
        return str.length;
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=scanner.js.map