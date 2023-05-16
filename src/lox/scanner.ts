const { Token } = require('./token');

enum TokenType {
    // Single-character tokens.
    LEFT_PAREN = 'LEFT_PAREN',
    RIGHT_PAREN = 'RIGHT_PAREN',
    LEFT_BRACE = 'LEFT_BRACE',
    RIGHT_BRACE = 'RIGHT_BRACE',
    COMMA = 'COMMA',
    DOT = 'DOT',
    MINUS = 'MINUS',
    PLUS = 'PLUS',
    SEMICOLON = 'SEMICOLON',
    SLASH = 'SLASH',
    STAR = 'STAR',

    // One or two character tokens.
    BANG = 'BANG',
    BANG_EQUAL = 'BANG_EQUAL',
    EQUAL = 'EQUAL',
    EQUAL_EQUAL = 'EQUAL_EQUAL',
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS = 'LESS',
    LESS_EQUAL = 'LESS_EQUAL',

    // Literals.
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    NUMBER = 'NUMBER',

    // Keywords.
    AND = 'AND',
    CLASS = 'CLASS',
    ELSE = 'ELSE',
    FALSE = 'FALSE',
    FUN = 'FUN',
    FOR = 'FOR',
    IF = 'IF',
    NIL = 'NIL',
    OR = 'OR',
    PRINT = 'PRINT',
    RETURN = 'RETURN',
    SUPER = 'SUPER',
    THIS = 'THIS',
    TRUE = 'TRUE',
    VAR = 'VAR',
    WHILE = 'WHILE',

    EOF = 'EOF'
}

export class Scanner {
    private source: string;
    private tokens: String[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private keywords: Map<string, TokenType> = new Map([
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

    constructor(source: string) {
        this.source = source;
    }

    public scanTokens(): String[] {
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme.
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    private scanToken(): void {
        const { Lox } = require('./lox');
        let lox = new Lox();
        const c: string = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
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
            case '"': this.string(); break;
            case 'o':
                if (this.peek() == 'r') this.addToken(TokenType.OR);
                break;

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    lox.error(this.line, "Unexpected character.");
                }
                break;
        }
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;

        this.current++;
        return true;

    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private isAtEnd(): boolean {
        //console.log(this.source);
        return this.current >= this._length(this.source);
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        let text: string = this.source.substring(this.start, this.current);
        let type: TokenType | undefined = this.keywords.get(text);
        if (type === undefined || type === null) type = TokenType.IDENTIFIER;
        this.addToken(type);
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.NUMBER, Number.parseFloat(this.source.substring(this.start, this.current)));
    }

    private string(): void {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
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

        let value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private advance(): string {
        return this.source.charAt(this.current++);
    }

    private addToken(type: TokenType, literal?: any): void {
        const text: string = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal ?? null, this.line));
    }

    private peekNext(): string {
        if (this.current + 1 >= this._length(this.source)) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private _length(str?: string): number {
        if (str === undefined) return 0;
        return str.length;
    }

}