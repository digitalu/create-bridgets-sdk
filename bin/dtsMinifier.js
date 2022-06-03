"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMinifier = void 0;
const typescript_1 = __importDefault(require("typescript"));
const newLineCharCode = '\n'.charCodeAt(0);
// todo: type the `ts` import (maybe with a local type that defines the expected compiler API structure)
/** Creates a minifier that should be stored and then used to minify one or more files. */
function createMinifier() {
    const scanner = typescript_1.default.createScanner(typescript_1.default.ScriptTarget.Latest, /* skipTrivia */ false, typescript_1.default.LanguageVariant.Standard);
    return {
        minify,
    };
    function minify(fileText, options) {
        var _a;
        const keepJsDocs = (_a = options === null || options === void 0 ? void 0 : options.keepJsDocs) !== null && _a !== void 0 ? _a : false;
        let result = '';
        let lastWrittenToken;
        let lastHadSeparatingNewLine = false;
        scanner.setText(fileText);
        while (scanner.scan() !== typescript_1.default.SyntaxKind.EndOfFileToken) {
            const currentToken = scanner.getToken();
            switch (currentToken) {
                case typescript_1.default.SyntaxKind.NewLineTrivia:
                    lastHadSeparatingNewLine = true;
                    break;
                case typescript_1.default.SyntaxKind.WhitespaceTrivia:
                    break;
                case typescript_1.default.SyntaxKind.SingleLineCommentTrivia:
                    if (isTripleSlashDirective()) {
                        writeSingleLineComment();
                        lastHadSeparatingNewLine = false;
                    }
                    break;
                case typescript_1.default.SyntaxKind.MultiLineCommentTrivia:
                    if (keepJsDocs && isJsDoc()) {
                        writeJsDoc();
                        lastHadSeparatingNewLine = false;
                    }
                    break;
                default:
                    // use a newline where ASI is probable
                    if (
                    // currentToken === ts.SyntaxKind.Identifier &&
                    lastHadSeparatingNewLine &&
                        lastWrittenToken !== typescript_1.default.SyntaxKind.SemicolonToken &&
                        // lastWrittenToken !== ts.SyntaxKind.CloseBraceToken &&
                        lastWrittenToken !== typescript_1.default.SyntaxKind.OpenBraceToken &&
                        lastWrittenToken !== typescript_1.default.SyntaxKind.OpenParenToken &&
                        lastWrittenToken !== typescript_1.default.SyntaxKind.CommaToken &&
                        lastWrittenToken !== typescript_1.default.SyntaxKind.ColonToken) {
                        result += '\n';
                    }
                    else if (lastHadSeparatingNewLine && lastWrittenToken === typescript_1.default.SyntaxKind.Identifier) {
                        result += '\n';
                    }
                    writeText(scanner.getTokenText());
                    lastHadSeparatingNewLine = false;
            }
        }
        return result;
        function isTripleSlashDirective() {
            const tokenText = scanner.getTokenText();
            // todo: better check
            return tokenText.startsWith('///') && tokenText.includes('<');
        }
        function writeSingleLineComment() {
            writeText(scanner.getTokenText());
            // write out the next newline as-is (ex. write \n or \r\n)
            const nextToken = scanner.scan();
            if (nextToken === typescript_1.default.SyntaxKind.NewLineTrivia) {
                writeText(scanner.getTokenText());
            }
            else if (nextToken !== typescript_1.default.SyntaxKind.EndOfFileToken) {
                throw new Error(`Unexpected scenario where the token after a comment was a ${nextToken}.`);
            }
        }
        function isJsDoc() {
            const tokenText = scanner.getTokenText();
            return tokenText.startsWith('/**');
        }
        function writeJsDoc() {
            writeText(scanner.getTokenText().replace(/^\s+\*/gm, ' *'));
        }
        function writeText(text) {
            const token = scanner.getToken();
            // ensure two tokens that would merge into a single token are separated by a space
            if (lastWrittenToken != null &&
                isAlphaNumericToken(token) &&
                isAlphaNumericToken(lastWrittenToken) &&
                !wasLastWrittenNewLine()) {
                result += ' ';
            }
            result += text;
            lastWrittenToken = token;
        }
        function wasLastWrittenNewLine() {
            return result.charCodeAt(result.length - 1) === newLineCharCode;
        }
    }
    function isAlphaNumericToken(token) {
        if (token >= typescript_1.default.SyntaxKind.FirstKeyword && token <= typescript_1.default.SyntaxKind.LastKeyword) {
            return true;
        }
        return token === typescript_1.default.SyntaxKind.Identifier;
    }
}
exports.createMinifier = createMinifier;
