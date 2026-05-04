const fs = require('fs');

const TokenType = {
  Keyword: 'Keyword',
  Identifier: 'Identifier',
  Number: 'Number',
  String: 'String',
  Boolean: 'Boolean',
  Null: 'Null',
  Operator: 'Operator',
  Punctuation: 'Punctuation',
  EOF: 'EOF',
};

const Keywords = new Set([
  'var', 'let', 'const', 'if', 'else', 'while', 'for', 'function', 'return', 'print',
  'true', 'false', 'null',
]);

const BooleanLiterals = new Set(['true', 'false']);
const NullLiteral = 'null';

const MultiCharOperators = ['===', '!==', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='];
const SingleCharOperators = ['+', '-', '*', '/', '%', '<', '>', '=', '!', '?', ':'];
const Punctuations = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '.']);

class Lexer {
  constructor(source) {
    this.source = source;
    this.length = source.length;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  tokenize() {
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;
      const start = this.position;
      const startLine = this.line;
      const startColumn = this.column;
      const char = this.peek();

      if (this.isAlpha(char) || char === '_') {
        this.identifierOrKeyword(startLine, startColumn);
      } else if (this.isDigit(char)) {
        this.numberLiteral(startLine, startColumn);
      } else if (char === '"' || char === "'") {
        this.stringLiteral(startLine, startColumn);
      } else if (char === '/' && this.peek(1) === '/') {
        this.skipLineComment();
      } else if (char === '/' && this.peek(1) === '*') {
        this.skipBlockComment(startLine, startColumn);
      } else if (this.matchMultiCharOperator()) {
        const value = this.nextMultiCharOperator();
        this.tokens.push(this.createToken(TokenType.Operator, value, startLine, startColumn));
      } else if (SingleCharOperators.includes(char)) {
        this.advance();
        this.tokens.push(this.createToken(TokenType.Operator, char, startLine, startColumn));
      } else if (Punctuations.has(char)) {
        this.advance();
        this.tokens.push(this.createToken(TokenType.Punctuation, char, startLine, startColumn));
      } else {
        this.errors.push({
          type: 'LexicalError',
          message: `Carácter inválido '${char}'`,
          line: startLine,
          column: startColumn,
        });
        this.advance();
      }
    }

    this.tokens.push(this.createToken(TokenType.EOF, '<EOF>', this.line, this.column));
    return { tokens: this.tokens, errors: this.errors };
  }

  createToken(type, value, line, column) {
    return { type, value, line, column };
  }

  isAtEnd() {
    return this.position >= this.length;
  }

  peek(offset = 0) {
    return this.source[this.position + offset] || '\0';
  }

  advance() {
    const char = this.source[this.position++];
    if (char === '\n') {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    return char;
  }

  skipWhitespace() {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\r' || char === '\t' || char === '\n') {
        this.advance();
        continue;
      }
      break;
    }
  }

  isAlpha(char) {
    return /[a-zA-Z]/.test(char);
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  identifierOrKeyword(line, column) {
    let text = '';
    while (!this.isAtEnd() && (this.isAlpha(this.peek()) || this.isDigit(this.peek()) || this.peek() === '_')) {
      text += this.advance();
    }

    if (Keywords.has(text)) {
      if (BooleanLiterals.has(text)) {
        this.tokens.push(this.createToken(TokenType.Boolean, text, line, column));
      } else if (text === NullLiteral) {
        this.tokens.push(this.createToken(TokenType.Null, text, line, column));
      } else {
        this.tokens.push(this.createToken(TokenType.Keyword, text, line, column));
      }
    } else {
      this.tokens.push(this.createToken(TokenType.Identifier, text, line, column));
    }
  }

  numberLiteral(line, column) {
    let text = '';
    while (this.isDigit(this.peek())) {
      text += this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      text += this.advance();
      while (this.isDigit(this.peek())) {
        text += this.advance();
      }
    }

    this.tokens.push(this.createToken(TokenType.Number, text, line, column));
  }

  stringLiteral(line, column) {
    const quote = this.advance();
    let value = '';
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        this.errors.push({
          type: 'LexicalError',
          message: 'Cadena sin cerrar antes de fin de línea',
          line: this.line,
          column: this.column,
        });
        return;
      }

      if (this.peek() === '\\') {
        this.advance();
        const escape = this.advance();
        if (escape === 'n') value += '\n';
        else if (escape === 't') value += '\t';
        else if (escape === 'r') value += '\r';
        else if (escape === '"') value += '"';
        else if (escape === "'") value += "'";
        else if (escape === '\\') value += '\\';
        else value += escape;
        continue;
      }

      value += this.advance();
    }

    if (this.isAtEnd()) {
      this.errors.push({
        type: 'LexicalError',
        message: 'Cadena sin cerrar antes del fin de archivo',
        line,
        column,
      });
      return;
    }

    this.advance();
    this.tokens.push(this.createToken(TokenType.String, value, line, column));
  }

  skipLineComment() {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  skipBlockComment(line, column) {
    this.advance();
    this.advance();
    while (!this.isAtEnd() && !(this.peek() === '*' && this.peek(1) === '/')) {
      this.advance();
    }

    if (this.isAtEnd()) {
      this.errors.push({
        type: 'LexicalError',
        message: 'Comentario multilínea sin cerrar',
        line,
        column,
      });
      return;
    }

    this.advance();
    this.advance();
  }

  matchMultiCharOperator() {
    for (const op of MultiCharOperators) {
      if (this.source.startsWith(op, this.position)) {
        return true;
      }
    }
    return false;
  }

  nextMultiCharOperator() {
    for (const op of MultiCharOperators) {
      if (this.source.startsWith(op, this.position)) {
        for (let i = 0; i < op.length; i += 1) this.advance();
        return op;
      }
    }
    return this.advance();
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.errors = [];
  }

  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      } else {
        this.synchronize();
      }
    }
    return { type: 'Program', body, errors: this.errors };
  }

  parseStatement() {
    if (this.match(TokenType.Keyword, 'var') || this.match(TokenType.Keyword, 'let') || this.match(TokenType.Keyword, 'const')) {
      return this.parseVariableDeclaration();
    }
    if (this.match(TokenType.Keyword, 'if')) {
      return this.parseIfStatement();
    }
    if (this.match(TokenType.Keyword, 'while')) {
      return this.parseWhileStatement();
    }
    if (this.match(TokenType.Keyword, 'return')) {
      return this.parseReturnStatement();
    }
    if (this.match(TokenType.Keyword, 'print')) {
      return this.parsePrintStatement();
    }
    if (this.match(TokenType.Punctuation, '{')) {
      return this.parseBlockStatement();
    }
    return this.parseExpressionStatement();
  }

  parsePrintStatement() {
    this.consume(TokenType.Punctuation, '(', "Se esperaba '(' después de 'print'.");
    const argument = this.parseExpression();
    this.consume(TokenType.Punctuation, ')', "Se esperaba ')' después del argumento de 'print'.");
    this.consume(TokenType.Punctuation, ';', "Se esperaba ';' después de la instrucción 'print'.");
    return { type: 'PrintStatement', argument };
  }

  parseVariableDeclaration() {
    const token = this.previous();
    const kind = token.value;
    const identifier = this.consume(TokenType.Identifier, 'Se esperaba un identificador después de la declaración.');
    let initializer = null;
    if (this.match(TokenType.Operator, '=')) {
      initializer = this.parseExpression();
    }
    this.consume(TokenType.Punctuation, ';', "Se esperaba ';' después de la declaración.");
    return { type: 'VariableDeclaration', kind, id: identifier, init: initializer };
  }

  parseIfStatement() {
    this.consume(TokenType.Punctuation, '(', "Se esperaba '(' después de 'if'.");
    const test = this.parseExpression();
    this.consume(TokenType.Punctuation, ')', "Se esperaba ')' después de la condición de 'if'.");
    const consequent = this.parseStatement();
    let alternate = null;
    if (this.match(TokenType.Keyword, 'else')) {
      alternate = this.parseStatement();
    }
    return { type: 'IfStatement', test, consequent, alternate };
  }

  parseWhileStatement() {
    this.consume(TokenType.Punctuation, '(', "Se esperaba '(' después de 'while'.");
    const test = this.parseExpression();
    this.consume(TokenType.Punctuation, ')', "Se esperaba ')' después de la condición de 'while'.");
    const body = this.parseStatement();
    return { type: 'WhileStatement', test, body };
  }

  parseReturnStatement() {
    let argument = null;
    if (!this.check(TokenType.Punctuation, ';')) {
      argument = this.parseExpression();
    }
    this.consume(TokenType.Punctuation, ';', "Se esperaba ';' después de 'return'.");
    return { type: 'ReturnStatement', argument };
  }

  parseBlockStatement() {
    const body = [];
    while (!this.check(TokenType.Punctuation, '}') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      } else {
        this.synchronize();
      }
    }
    this.consume(TokenType.Punctuation, '}', "Se esperaba '}' al final del bloque.");
    return { type: 'BlockStatement', body };
  }

  parseExpressionStatement() {
    const expression = this.parseExpression();
    this.consume(TokenType.Punctuation, ';', "Se esperaba ';' después de la expresión.");
    return { type: 'ExpressionStatement', expression };
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    const expression = this.parseLogicalOr();
    if (this.match(TokenType.Operator, '=')) {
      const equals = this.previous();
      const value = this.parseAssignment();
      if (expression.type === 'Identifier') {
        return { type: 'AssignmentExpression', operator: equals.value, left: expression, right: value };
      }
      this.error(equals, 'La parte izquierda de la asignación debe ser un identificador.');
    }
    return expression;
  }

  parseLogicalOr() {
    let expression = this.parseLogicalAnd();
    while (this.match(TokenType.Operator, '||')) {
      const operator = this.previous().value;
      const right = this.parseLogicalAnd();
      expression = { type: 'LogicalExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseLogicalAnd() {
    let expression = this.parseEquality();
    while (this.match(TokenType.Operator, '&&')) {
      const operator = this.previous().value;
      const right = this.parseEquality();
      expression = { type: 'LogicalExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseEquality() {
    let expression = this.parseComparison();
    while (this.match(TokenType.Operator, '==') || this.match(TokenType.Operator, '!=') || this.match(TokenType.Operator, '===') || this.match(TokenType.Operator, '!==')) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      expression = { type: 'BinaryExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseComparison() {
    let expression = this.parseAddition();
    while (this.match(TokenType.Operator, '<') || this.match(TokenType.Operator, '<=') || this.match(TokenType.Operator, '>') || this.match(TokenType.Operator, '>=')) {
      const operator = this.previous().value;
      const right = this.parseAddition();
      expression = { type: 'BinaryExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseAddition() {
    let expression = this.parseMultiplication();
    while (this.match(TokenType.Operator, '+') || this.match(TokenType.Operator, '-')) {
      const operator = this.previous().value;
      const right = this.parseMultiplication();
      expression = { type: 'BinaryExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseMultiplication() {
    let expression = this.parseUnary();
    while (this.match(TokenType.Operator, '*') || this.match(TokenType.Operator, '/') || this.match(TokenType.Operator, '%')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      expression = { type: 'BinaryExpression', operator, left: expression, right };
    }
    return expression;
  }

  parseUnary() {
    if (this.match(TokenType.Operator, '!') || this.match(TokenType.Operator, '-') || this.match(TokenType.Operator, '+')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      return { type: 'UnaryExpression', operator, argument: right };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.match(TokenType.Number)) {
      return { type: 'Literal', value: Number(this.previous().value), raw: this.previous().value };
    }
    if (this.match(TokenType.String)) {
      return { type: 'Literal', value: this.previous().value, raw: `"${this.previous().value}"` };
    }
    if (this.match(TokenType.Boolean)) {
      return { type: 'Literal', value: this.previous().value === 'true', raw: this.previous().value };
    }
    if (this.match(TokenType.Null)) {
      return { type: 'Literal', value: null, raw: 'null' };
    }
    if (this.match(TokenType.Identifier)) {
      return { type: 'Identifier', name: this.previous().value };
    }
    if (this.match(TokenType.Punctuation, '(')) {
      const expression = this.parseExpression();
      this.consume(TokenType.Punctuation, ')', "Se esperaba ')' después de la expresión.");
      return { type: 'Grouping', expression };
    }

    this.error(this.peek(), 'Expresión esperada.');
    return { type: 'Literal', value: null, raw: 'null' };
  }

  match(type, value) {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  consume(type, valueOrMessage, messageOptional) {
    const message = messageOptional || valueOrMessage;
    const expectedValue = messageOptional ? valueOrMessage : undefined;
    if (this.check(type, expectedValue)) {
      return this.advance();
    }
    const token = this.peek();
    this.error(token, message);
    if (!this.isAtEnd()) {
      this.advance();
    }
    return { type, value: expectedValue || null, line: token.line, column: token.column };
  }

  check(type, value = undefined) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  advance() {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(token, message) {
    this.errors.push({
      type: 'SyntaxError',
      message,
      line: token.line,
      column: token.column,
      found: token.value,
    });
  }

  synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.Punctuation && this.previous().value === ';') return;
      if (this.peek().type === TokenType.Keyword) return;
      this.advance();
    }
  }
}

function analyzeSource(source) {
  const lexer = new Lexer(source);
  const lexResult = lexer.tokenize();
  const parser = new Parser(lexResult.tokens);
  const parseResult = parser.parse();
  return {
    tokens: lexResult.tokens,
    lexErrors: lexResult.errors,
    ast: parseResult,
    parseErrors: parseResult.errors,
  };
}

function prettyPrintTokens(tokens) {
  return tokens
    .filter((token) => token.type !== TokenType.EOF)
    .map((token) => `${token.line}:${token.column} ${token.type.padEnd(12)} ${token.value}`)
    .join('\n');
}

function prettyPrintErrors(errors) {
  return errors
    .map((error) => `${error.type} [${error.line}:${error.column}] ${error.message}${error.found ? ` (en '${error.found}')` : ''}`)
    .join('\n');
}

function main() {
  const args = process.argv.slice(2);
  let source;
  let filename;

  if (args[0]) {
    filename = args[0];
    try {
      source = fs.readFileSync(filename, 'utf8');
    } catch (error) {
      console.error('Error leyendo el archivo:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Pega el código fuente y presiona Ctrl+D (o Ctrl+Z en Windows) para finalizar:');
    source = fs.readFileSync(0, 'utf8');
    filename = '<entrada estándar>';
  }

  const result = analyzeSource(source);

  console.log(`=== Archivo: ${filename} ===\n`);
  console.log('--- Tokens ---');
  console.log(prettyPrintTokens(result.tokens));
  console.log('\n--- Errores Léxicos ---');
  console.log(result.lexErrors.length ? prettyPrintErrors(result.lexErrors) : 'Ninguno');
  console.log('\n--- Errores Sintácticos ---');
  console.log(result.parseErrors.length ? prettyPrintErrors(result.parseErrors) : 'Ninguno');
  console.log('\n--- AST ---');
  console.log(JSON.stringify(result.ast, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { Lexer, Parser, analyzeSource, TokenType };
