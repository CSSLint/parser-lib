/*!
Parser-Lib
Copyright (c) 2009-2016 Nicholas C. Zakas. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/* Version v1.1.0, Build time: 6-December-2016 10:31:29 */
(function () {
var require = parserlib._require;
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"parserlib":[function(require,module,exports){
"use strict";

module.exports = {
    css  : require("./css"),
    util : require("./util")
};

},{"./css":22,"./util":"parserlib-core"}],22:[function(require,module,exports){
"use strict";

module.exports = {
    Colors            : require("./Colors"),
    Combinator        : require("./Combinator"),
    Parser            : require("./Parser"),
    PropertyName      : require("./PropertyName"),
    PropertyValue     : require("./PropertyValue"),
    PropertyValuePart : require("./PropertyValuePart"),
    Matcher           : require("./Matcher"),
    MediaFeature      : require("./MediaFeature"),
    MediaQuery        : require("./MediaQuery"),
    Selector          : require("./Selector"),
    SelectorPart      : require("./SelectorPart"),
    SelectorSubPart   : require("./SelectorSubPart"),
    Specificity       : require("./Specificity"),
    TokenStream       : require("./TokenStream"),
    Tokens            : require("./Tokens"),
    ValidationError   : require("./ValidationError")
};

},{"./Colors":1,"./Combinator":2,"./Matcher":3,"./MediaFeature":4,"./MediaQuery":5,"./Parser":6,"./PropertyName":8,"./PropertyValue":9,"./PropertyValuePart":11,"./Selector":13,"./SelectorPart":14,"./SelectorSubPart":15,"./Specificity":16,"./TokenStream":17,"./Tokens":18,"./ValidationError":20}],2:[function(require,module,exports){
"use strict";

module.exports = Combinator;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a selector combinator (whitespace, +, >).
 * @namespace parserlib.css
 * @class Combinator
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} text The text representation of the unit.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function Combinator(text, line, col) {

    SyntaxUnit.call(this, text, line, col, Parser.COMBINATOR_TYPE);

    /**
     * The type of modifier.
     * @type String
     * @property type
     */
    this.type = "unknown";

    //pretty simple
    if (/^\s+$/.test(text)) {
        this.type = "descendant";
    } else if (text === ">") {
        this.type = "child";
    } else if (text === "+") {
        this.type = "adjacent-sibling";
    } else if (text === "~") {
        this.type = "sibling";
    }

}

Combinator.prototype = new SyntaxUnit();
Combinator.prototype.constructor = Combinator;


},{"../util/SyntaxUnit":26,"./Parser":6}],6:[function(require,module,exports){
"use strict";

module.exports = Parser;

var EventTarget = require("../util/EventTarget");
var SyntaxError = require("../util/SyntaxError");
var SyntaxUnit = require("../util/SyntaxUnit");

var Combinator = require("./Combinator");
var MediaFeature = require("./MediaFeature");
var MediaQuery = require("./MediaQuery");
var PropertyName = require("./PropertyName");
var PropertyValue = require("./PropertyValue");
var PropertyValuePart = require("./PropertyValuePart");
var Selector = require("./Selector");
var SelectorPart = require("./SelectorPart");
var SelectorSubPart = require("./SelectorSubPart");
var TokenStream = require("./TokenStream");
var Tokens = require("./Tokens");
var Validation = require("./Validation");

/**
 * A CSS3 parser.
 * @namespace parserlib.css
 * @class Parser
 * @constructor
 * @param {Object} options (Optional) Various options for the parser:
 *      starHack (true|false) to allow IE6 star hack as valid,
 *      underscoreHack (true|false) to interpret leading underscores
 *      as IE6-7 targeting for known properties, ieFilters (true|false)
 *      to indicate that IE < 8 filters should be accepted and not throw
 *      syntax errors.
 */
function Parser(options) {

    //inherit event functionality
    EventTarget.call(this);


    this.options = options || {};

    this._tokenStream = null;
}

//Static constants
Parser.DEFAULT_TYPE = 0;
Parser.COMBINATOR_TYPE = 1;
Parser.MEDIA_FEATURE_TYPE = 2;
Parser.MEDIA_QUERY_TYPE = 3;
Parser.PROPERTY_NAME_TYPE = 4;
Parser.PROPERTY_VALUE_TYPE = 5;
Parser.PROPERTY_VALUE_PART_TYPE = 6;
Parser.SELECTOR_TYPE = 7;
Parser.SELECTOR_PART_TYPE = 8;
Parser.SELECTOR_SUB_PART_TYPE = 9;

Parser.prototype = function() {

    var proto = new EventTarget(),  //new prototype
        prop,
        additions =  {
            __proto__: null,

            //restore constructor
            constructor: Parser,

            //instance constants - yuck
            DEFAULT_TYPE : 0,
            COMBINATOR_TYPE : 1,
            MEDIA_FEATURE_TYPE : 2,
            MEDIA_QUERY_TYPE : 3,
            PROPERTY_NAME_TYPE : 4,
            PROPERTY_VALUE_TYPE : 5,
            PROPERTY_VALUE_PART_TYPE : 6,
            SELECTOR_TYPE : 7,
            SELECTOR_PART_TYPE : 8,
            SELECTOR_SUB_PART_TYPE : 9,

            //-----------------------------------------------------------------
            // Grammar
            //-----------------------------------------------------------------

            _stylesheet: function() {

                /*
                 * stylesheet
                 *  : [ CHARSET_SYM S* STRING S* ';' ]?
                 *    [S|CDO|CDC]* [ import [S|CDO|CDC]* ]*
                 *    [ namespace [S|CDO|CDC]* ]*
                 *    [ [ ruleset | media | page | font_face | keyframes_rule | supports_rule ] [S|CDO|CDC]* ]*
                 *  ;
                 */

                var tokenStream = this._tokenStream,
                    count,
                    token,
                    tt;

                this.fire("startstylesheet");

                //try to read character set
                this._charset();

                this._skipCruft();

                //try to read imports - may be more than one
                while (tokenStream.peek() === Tokens.IMPORT_SYM) {
                    this._import();
                    this._skipCruft();
                }

                //try to read namespaces - may be more than one
                while (tokenStream.peek() === Tokens.NAMESPACE_SYM) {
                    this._namespace();
                    this._skipCruft();
                }

                //get the next token
                tt = tokenStream.peek();

                //try to read the rest
                while (tt > Tokens.EOF) {

                    try {

                        switch (tt) {
                            case Tokens.MEDIA_SYM:
                                this._media();
                                this._skipCruft();
                                break;
                            case Tokens.PAGE_SYM:
                                this._page();
                                this._skipCruft();
                                break;
                            case Tokens.FONT_FACE_SYM:
                                this._font_face();
                                this._skipCruft();
                                break;
                            case Tokens.KEYFRAMES_SYM:
                                this._keyframes();
                                this._skipCruft();
                                break;
                            case Tokens.VIEWPORT_SYM:
                                this._viewport();
                                this._skipCruft();
                                break;
                            case Tokens.DOCUMENT_SYM:
                                this._document();
                                this._skipCruft();
                                break;
                            case Tokens.SUPPORTS_SYM:
                                this._supports();
                                this._skipCruft();
                                break;
                            case Tokens.UNKNOWN_SYM:  //unknown @ rule
                                tokenStream.get();
                                if (!this.options.strict) {

                                    //fire error event
                                    this.fire({
                                        type:       "error",
                                        error:      null,
                                        message:    "Unknown @ rule: " + tokenStream.LT(0).value + ".",
                                        line:       tokenStream.LT(0).startLine,
                                        col:        tokenStream.LT(0).startCol
                                    });

                                    //skip braces
                                    count=0;
                                    while (tokenStream.advance([Tokens.LBRACE, Tokens.RBRACE]) === Tokens.LBRACE) {
                                        count++;    //keep track of nesting depth
                                    }

                                    while (count) {
                                        tokenStream.advance([Tokens.RBRACE]);
                                        count--;
                                    }

                                } else {
                                    //not a syntax error, rethrow it
                                    throw new SyntaxError("Unknown @ rule.", tokenStream.LT(0).startLine, tokenStream.LT(0).startCol);
                                }
                                break;
                            case Tokens.S:
                                this._readWhitespace();
                                break;
                            default:
                                if (!this._ruleset()) {

                                    //error handling for known issues
                                    switch (tt) {
                                        case Tokens.CHARSET_SYM:
                                            token = tokenStream.LT(1);
                                            this._charset(false);
                                            throw new SyntaxError("@charset not allowed here.", token.startLine, token.startCol);
                                        case Tokens.IMPORT_SYM:
                                            token = tokenStream.LT(1);
                                            this._import(false);
                                            throw new SyntaxError("@import not allowed here.", token.startLine, token.startCol);
                                        case Tokens.NAMESPACE_SYM:
                                            token = tokenStream.LT(1);
                                            this._namespace(false);
                                            throw new SyntaxError("@namespace not allowed here.", token.startLine, token.startCol);
                                        default:
                                            tokenStream.get();  //get the last token
                                            this._unexpectedToken(tokenStream.token());
                                    }

                                }
                        }
                    } catch (ex) {
                        if (ex instanceof SyntaxError && !this.options.strict) {
                            this.fire({
                                type:       "error",
                                error:      ex,
                                message:    ex.message,
                                line:       ex.line,
                                col:        ex.col
                            });
                        } else {
                            throw ex;
                        }
                    }

                    tt = tokenStream.peek();
                }

                if (tt !== Tokens.EOF) {
                    this._unexpectedToken(tokenStream.token());
                }

                this.fire("endstylesheet");
            },

            _charset: function(emit) {
                var tokenStream = this._tokenStream,
                    charset,
                    token,
                    line,
                    col;

                if (tokenStream.match(Tokens.CHARSET_SYM)) {
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;

                    this._readWhitespace();
                    tokenStream.mustMatch(Tokens.STRING);

                    token = tokenStream.token();
                    charset = token.value;

                    this._readWhitespace();
                    tokenStream.mustMatch(Tokens.SEMICOLON);

                    if (emit !== false) {
                        this.fire({
                            type:   "charset",
                            charset:charset,
                            line:   line,
                            col:    col
                        });
                    }
                }
            },

            _import: function(emit) {
                /*
                 * import
                 *   : IMPORT_SYM S*
                 *    [STRING|URI] S* media_query_list? ';' S*
                 */

                var tokenStream = this._tokenStream,
                    uri,
                    importToken,
                    mediaList   = [];

                //read import symbol
                tokenStream.mustMatch(Tokens.IMPORT_SYM);
                importToken = tokenStream.token();
                this._readWhitespace();

                tokenStream.mustMatch([Tokens.STRING, Tokens.URI]);

                //grab the URI value
                uri = tokenStream.token().value.replace(/^(?:url\()?["']?([^"']+?)["']?\)?$/, "$1");

                this._readWhitespace();

                mediaList = this._media_query_list();

                //must end with a semicolon
                tokenStream.mustMatch(Tokens.SEMICOLON);
                this._readWhitespace();

                if (emit !== false) {
                    this.fire({
                        type:   "import",
                        uri:    uri,
                        media:  mediaList,
                        line:   importToken.startLine,
                        col:    importToken.startCol
                    });
                }

            },

            _namespace: function(emit) {
                /*
                 * namespace
                 *   : NAMESPACE_SYM S* [namespace_prefix S*]? [STRING|URI] S* ';' S*
                 */

                var tokenStream = this._tokenStream,
                    line,
                    col,
                    prefix,
                    uri;

                //read import symbol
                tokenStream.mustMatch(Tokens.NAMESPACE_SYM);
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;
                this._readWhitespace();

                //it's a namespace prefix - no _namespace_prefix() method because it's just an IDENT
                if (tokenStream.match(Tokens.IDENT)) {
                    prefix = tokenStream.token().value;
                    this._readWhitespace();
                }

                tokenStream.mustMatch([Tokens.STRING, Tokens.URI]);
                /*if (!tokenStream.match(Tokens.STRING)){
                    tokenStream.mustMatch(Tokens.URI);
                }*/

                //grab the URI value
                uri = tokenStream.token().value.replace(/(?:url\()?["']([^"']+)["']\)?/, "$1");

                this._readWhitespace();

                //must end with a semicolon
                tokenStream.mustMatch(Tokens.SEMICOLON);
                this._readWhitespace();

                if (emit !== false) {
                    this.fire({
                        type:   "namespace",
                        prefix: prefix,
                        uri:    uri,
                        line:   line,
                        col:    col
                    });
                }

            },

            _supports: function(emit) {
                /*
                 * supports_rule
                 *  : SUPPORTS_SYM S* supports_condition S* group_rule_body
                 *  ;
                 */
                var tokenStream = this._tokenStream,
                    line,
                    col;

                if (tokenStream.match(Tokens.SUPPORTS_SYM)) {
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;

                    this._readWhitespace();
                    this._supports_condition();
                    this._readWhitespace();

                    tokenStream.mustMatch(Tokens.LBRACE);
                    this._readWhitespace();

                    if (emit !== false) {
                        this.fire({
                            type:   "startsupports",
                            line:   line,
                            col:    col
                        });
                    }

                    while (true) {
                        if (!this._ruleset()) {
                            break;
                        }
                    }

                    tokenStream.mustMatch(Tokens.RBRACE);
                    this._readWhitespace();

                    this.fire({
                        type:   "endsupports",
                        line:   line,
                        col:    col
                    });
                }
            },

            _supports_condition: function() {
                /*
                 * supports_condition
                 *  : supports_negation | supports_conjunction | supports_disjunction |
                 *    supports_condition_in_parens
                 *  ;
                 */
                var tokenStream = this._tokenStream,
                    ident;

                if (tokenStream.match(Tokens.IDENT)) {
                    ident = tokenStream.token().value.toLowerCase();

                    if (ident === "not") {
                        tokenStream.mustMatch(Tokens.S);
                        this._supports_condition_in_parens();
                    } else {
                        tokenStream.unget();
                    }
                } else {
                    this._supports_condition_in_parens();
                    this._readWhitespace();

                    while (tokenStream.peek() === Tokens.IDENT) {
                        ident = tokenStream.LT(1).value.toLowerCase();
                        if (ident === "and" || ident === "or") {
                            tokenStream.mustMatch(Tokens.IDENT);
                            this._readWhitespace();
                            this._supports_condition_in_parens();
                            this._readWhitespace();
                        }
                    }
                }
            },

            _supports_condition_in_parens: function() {
                /*
                 * supports_condition_in_parens
                 *  : ( '(' S* supports_condition S* ')' ) | supports_declaration_condition |
                 *    general_enclosed
                 *  ;
                 */
                var tokenStream = this._tokenStream,
                    ident;

                if (tokenStream.match(Tokens.LPAREN)) {
                    this._readWhitespace();
                    if (tokenStream.match(Tokens.IDENT)) {
                        // look ahead for not keyword, if not given, continue with declaration condition.
                        ident = tokenStream.token().value.toLowerCase();
                        if (ident === "not") {
                            this._readWhitespace();
                            this._supports_condition();
                            this._readWhitespace();
                            tokenStream.mustMatch(Tokens.RPAREN);
                        } else {
                            tokenStream.unget();
                            this._supports_declaration_condition(false);
                        }
                    } else {
                        this._supports_condition();
                        this._readWhitespace();
                        tokenStream.mustMatch(Tokens.RPAREN);
                    }
                } else {
                    this._supports_declaration_condition();
                }
            },

            _supports_declaration_condition: function(requireStartParen) {
                /*
                 * supports_declaration_condition
                 *  : '(' S* declaration ')'
                 *  ;
                 */
                var tokenStream = this._tokenStream;

                if (requireStartParen !== false) {
                    tokenStream.mustMatch(Tokens.LPAREN);
                }
                this._readWhitespace();
                this._declaration();
                tokenStream.mustMatch(Tokens.RPAREN);
            },

            _media: function() {
                /*
                 * media
                 *   : MEDIA_SYM S* media_query_list S* '{' S* ruleset* '}' S*
                 *   ;
                 */
                var tokenStream     = this._tokenStream,
                    line,
                    col,
                    mediaList;//       = [];

                //look for @media
                tokenStream.mustMatch(Tokens.MEDIA_SYM);
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;

                this._readWhitespace();

                mediaList = this._media_query_list();

                tokenStream.mustMatch(Tokens.LBRACE);
                this._readWhitespace();

                this.fire({
                    type:   "startmedia",
                    media:  mediaList,
                    line:   line,
                    col:    col
                });

                while (true) {
                    if (tokenStream.peek() === Tokens.PAGE_SYM) {
                        this._page();
                    } else if (tokenStream.peek() === Tokens.FONT_FACE_SYM) {
                        this._font_face();
                    } else if (tokenStream.peek() === Tokens.VIEWPORT_SYM) {
                        this._viewport();
                    } else if (tokenStream.peek() === Tokens.DOCUMENT_SYM) {
                        this._document();
                    } else if (tokenStream.peek() === Tokens.SUPPORTS_SYM) {
                        this._supports();
                    } else if (tokenStream.peek() === Tokens.MEDIA_SYM) {
                        this._media();
                    } else if (!this._ruleset()) {
                        break;
                    }
                }

                tokenStream.mustMatch(Tokens.RBRACE);
                this._readWhitespace();

                this.fire({
                    type:   "endmedia",
                    media:  mediaList,
                    line:   line,
                    col:    col
                });
            },


            //CSS3 Media Queries
            _media_query_list: function() {
                /*
                 * media_query_list
                 *   : S* [media_query [ ',' S* media_query ]* ]?
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    mediaList   = [];


                this._readWhitespace();

                if (tokenStream.peek() === Tokens.IDENT || tokenStream.peek() === Tokens.LPAREN) {
                    mediaList.push(this._media_query());
                }

                while (tokenStream.match(Tokens.COMMA)) {
                    this._readWhitespace();
                    mediaList.push(this._media_query());
                }

                return mediaList;
            },

            /*
             * Note: "expression" in the grammar maps to the _media_expression
             * method.

             */
            _media_query: function() {
                /*
                 * media_query
                 *   : [ONLY | NOT]? S* media_type S* [ AND S* expression ]*
                 *   | expression [ AND S* expression ]*
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    type        = null,
                    ident       = null,
                    token       = null,
                    expressions = [];

                if (tokenStream.match(Tokens.IDENT)) {
                    ident = tokenStream.token().value.toLowerCase();

                    //since there's no custom tokens for these, need to manually check
                    if (ident !== "only" && ident !== "not") {
                        tokenStream.unget();
                        ident = null;
                    } else {
                        token = tokenStream.token();
                    }
                }

                this._readWhitespace();

                if (tokenStream.peek() === Tokens.IDENT) {
                    type = this._media_type();
                    if (token === null) {
                        token = tokenStream.token();
                    }
                } else if (tokenStream.peek() === Tokens.LPAREN) {
                    if (token === null) {
                        token = tokenStream.LT(1);
                    }
                    expressions.push(this._media_expression());
                }

                if (type === null && expressions.length === 0) {
                    return null;
                } else {
                    this._readWhitespace();
                    while (tokenStream.match(Tokens.IDENT)) {
                        if (tokenStream.token().value.toLowerCase() !== "and") {
                            this._unexpectedToken(tokenStream.token());
                        }

                        this._readWhitespace();
                        expressions.push(this._media_expression());
                    }
                }

                return new MediaQuery(ident, type, expressions, token.startLine, token.startCol);
            },

            //CSS3 Media Queries
            _media_type: function() {
                /*
                 * media_type
                 *   : IDENT
                 *   ;
                 */
                return this._media_feature();
            },

            /**
             * Note: in CSS3 Media Queries, this is called "expression".
             * Renamed here to avoid conflict with CSS3 Selectors
             * definition of "expression". Also note that "expr" in the
             * grammar now maps to "expression" from CSS3 selectors.
             * @method _media_expression
             * @private
             */
            _media_expression: function() {
                /*
                 * expression
                 *  : '(' S* media_feature S* [ ':' S* expr ]? ')' S*
                 *  ;
                 */
                var tokenStream = this._tokenStream,
                    feature     = null,
                    token,
                    expression  = null;

                tokenStream.mustMatch(Tokens.LPAREN);

                feature = this._media_feature();
                this._readWhitespace();

                if (tokenStream.match(Tokens.COLON)) {
                    this._readWhitespace();
                    token = tokenStream.LT(1);
                    expression = this._expression();
                }

                tokenStream.mustMatch(Tokens.RPAREN);
                this._readWhitespace();

                return new MediaFeature(feature, expression ? new SyntaxUnit(expression, token.startLine, token.startCol) : null);
            },

            //CSS3 Media Queries
            _media_feature: function() {
                /*
                 * media_feature
                 *   : IDENT
                 *   ;
                 */
                var tokenStream = this._tokenStream;

                this._readWhitespace();

                tokenStream.mustMatch(Tokens.IDENT);

                return SyntaxUnit.fromToken(tokenStream.token());
            },

            //CSS3 Paged Media
            _page: function() {
                /*
                 * page:
                 *    PAGE_SYM S* IDENT? pseudo_page? S*
                 *    '{' S* [ declaration | margin ]? [ ';' S* [ declaration | margin ]? ]* '}' S*
                 *    ;
                 */
                var tokenStream = this._tokenStream,
                    line,
                    col,
                    identifier  = null,
                    pseudoPage  = null;

                //look for @page
                tokenStream.mustMatch(Tokens.PAGE_SYM);
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;

                this._readWhitespace();

                if (tokenStream.match(Tokens.IDENT)) {
                    identifier = tokenStream.token().value;

                    //The value 'auto' may not be used as a page name and MUST be treated as a syntax error.
                    if (identifier.toLowerCase() === "auto") {
                        this._unexpectedToken(tokenStream.token());
                    }
                }

                //see if there's a colon upcoming
                if (tokenStream.peek() === Tokens.COLON) {
                    pseudoPage = this._pseudo_page();
                }

                this._readWhitespace();

                this.fire({
                    type:   "startpage",
                    id:     identifier,
                    pseudo: pseudoPage,
                    line:   line,
                    col:    col
                });

                this._readDeclarations(true, true);

                this.fire({
                    type:   "endpage",
                    id:     identifier,
                    pseudo: pseudoPage,
                    line:   line,
                    col:    col
                });

            },

            //CSS3 Paged Media
            _margin: function() {
                /*
                 * margin :
                 *    margin_sym S* '{' declaration [ ';' S* declaration? ]* '}' S*
                 *    ;
                 */
                var tokenStream = this._tokenStream,
                    line,
                    col,
                    marginSym   = this._margin_sym();

                if (marginSym) {
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;

                    this.fire({
                        type: "startpagemargin",
                        margin: marginSym,
                        line:   line,
                        col:    col
                    });

                    this._readDeclarations(true);

                    this.fire({
                        type: "endpagemargin",
                        margin: marginSym,
                        line:   line,
                        col:    col
                    });
                    return true;
                } else {
                    return false;
                }
            },

            //CSS3 Paged Media
            _margin_sym: function() {

                /*
                 * margin_sym :
                 *    TOPLEFTCORNER_SYM |
                 *    TOPLEFT_SYM |
                 *    TOPCENTER_SYM |
                 *    TOPRIGHT_SYM |
                 *    TOPRIGHTCORNER_SYM |
                 *    BOTTOMLEFTCORNER_SYM |
                 *    BOTTOMLEFT_SYM |
                 *    BOTTOMCENTER_SYM |
                 *    BOTTOMRIGHT_SYM |
                 *    BOTTOMRIGHTCORNER_SYM |
                 *    LEFTTOP_SYM |
                 *    LEFTMIDDLE_SYM |
                 *    LEFTBOTTOM_SYM |
                 *    RIGHTTOP_SYM |
                 *    RIGHTMIDDLE_SYM |
                 *    RIGHTBOTTOM_SYM
                 *    ;
                 */

                var tokenStream = this._tokenStream;

                if (tokenStream.match([Tokens.TOPLEFTCORNER_SYM, Tokens.TOPLEFT_SYM,
                        Tokens.TOPCENTER_SYM, Tokens.TOPRIGHT_SYM, Tokens.TOPRIGHTCORNER_SYM,
                        Tokens.BOTTOMLEFTCORNER_SYM, Tokens.BOTTOMLEFT_SYM,
                        Tokens.BOTTOMCENTER_SYM, Tokens.BOTTOMRIGHT_SYM,
                        Tokens.BOTTOMRIGHTCORNER_SYM, Tokens.LEFTTOP_SYM,
                        Tokens.LEFTMIDDLE_SYM, Tokens.LEFTBOTTOM_SYM, Tokens.RIGHTTOP_SYM,
                        Tokens.RIGHTMIDDLE_SYM, Tokens.RIGHTBOTTOM_SYM])) {
                    return SyntaxUnit.fromToken(tokenStream.token());
                } else {
                    return null;
                }

            },

            _pseudo_page: function() {
                /*
                 * pseudo_page
                 *   : ':' IDENT
                 *   ;
                 */

                var tokenStream = this._tokenStream;

                tokenStream.mustMatch(Tokens.COLON);
                tokenStream.mustMatch(Tokens.IDENT);

                //TODO: CSS3 Paged Media says only "left", "center", and "right" are allowed

                return tokenStream.token().value;
            },

            _font_face: function() {
                /*
                 * font_face
                 *   : FONT_FACE_SYM S*
                 *     '{' S* declaration [ ';' S* declaration ]* '}' S*
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    line,
                    col;

                //look for @page
                tokenStream.mustMatch(Tokens.FONT_FACE_SYM);
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;

                this._readWhitespace();

                this.fire({
                    type:   "startfontface",
                    line:   line,
                    col:    col
                });

                this._readDeclarations(true);

                this.fire({
                    type:   "endfontface",
                    line:   line,
                    col:    col
                });
            },

            _viewport: function() {
                /*
                 * viewport
                 *   : VIEWPORT_SYM S*
                 *     '{' S* declaration? [ ';' S* declaration? ]* '}' S*
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    line,
                    col;

                tokenStream.mustMatch(Tokens.VIEWPORT_SYM);
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;

                this._readWhitespace();

                this.fire({
                    type:   "startviewport",
                    line:   line,
                    col:    col
                });

                this._readDeclarations(true);

                this.fire({
                    type:   "endviewport",
                    line:   line,
                    col:    col
                });

            },

            _document: function() {
                /*
                 * document
                 *   : DOCUMENT_SYM S*
                 *     _document_function [ ',' S* _document_function ]* S*
                 *     '{' S* ruleset* '}'
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    token,
                    functions = [],
                    prefix = "";

                tokenStream.mustMatch(Tokens.DOCUMENT_SYM);
                token = tokenStream.token();
                if (/^@\-([^\-]+)\-/.test(token.value)) {
                    prefix = RegExp.$1;
                }

                this._readWhitespace();
                functions.push(this._document_function());

                while (tokenStream.match(Tokens.COMMA)) {
                    this._readWhitespace();
                    functions.push(this._document_function());
                }

                tokenStream.mustMatch(Tokens.LBRACE);
                this._readWhitespace();

                this.fire({
                    type:      "startdocument",
                    functions: functions,
                    prefix:    prefix,
                    line:      token.startLine,
                    col:       token.startCol
                });

                var ok = true;
                while (ok) {
                    switch (tokenStream.peek()) {
                        case Tokens.PAGE_SYM:
                            this._page();
                            break;
                        case Tokens.FONT_FACE_SYM:
                            this._font_face();
                            break;
                        case Tokens.VIEWPORT_SYM:
                            this._viewport();
                            break;
                        case Tokens.MEDIA_SYM:
                            this._media();
                            break;
                        case Tokens.KEYFRAMES_SYM:
                            this._keyframes();
                            break;
                        case Tokens.DOCUMENT_SYM:
                            this._document();
                            break;
                        default:
                            ok = Boolean(this._ruleset());
                    }
                }

                tokenStream.mustMatch(Tokens.RBRACE);
                token = tokenStream.token();
                this._readWhitespace();

                this.fire({
                    type:      "enddocument",
                    functions: functions,
                    prefix:    prefix,
                    line:      token.startLine,
                    col:       token.startCol
                });
            },

            _document_function: function() {
                /*
                 * document_function
                 *   : function | URI S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    value;

                if (tokenStream.match(Tokens.URI)) {
                    value = tokenStream.token().value;
                    this._readWhitespace();
                } else {
                    value = this._function();
                }

                return value;
            },

            _operator: function(inFunction) {

                /*
                 * operator (outside function)
                 *  : '/' S* | ',' S* | /( empty )/
                 * operator (inside function)
                 *  : '/' S* | '+' S* | '*' S* | '-' S* /( empty )/
                 *  ;
                 */

                var tokenStream = this._tokenStream,
                    token       = null;

                if (tokenStream.match([Tokens.SLASH, Tokens.COMMA]) ||
                    (inFunction && tokenStream.match([Tokens.PLUS, Tokens.STAR, Tokens.MINUS]))) {
                    token =  tokenStream.token();
                    this._readWhitespace();
                }
                return token ? PropertyValuePart.fromToken(token) : null;

            },

            _combinator: function() {

                /*
                 * combinator
                 *  : PLUS S* | GREATER S* | TILDE S* | S+
                 *  ;
                 */

                var tokenStream = this._tokenStream,
                    value       = null,
                    token;

                if (tokenStream.match([Tokens.PLUS, Tokens.GREATER, Tokens.TILDE])) {
                    token = tokenStream.token();
                    value = new Combinator(token.value, token.startLine, token.startCol);
                    this._readWhitespace();
                }

                return value;
            },

            _unary_operator: function() {

                /*
                 * unary_operator
                 *  : '-' | '+'
                 *  ;
                 */

                var tokenStream = this._tokenStream;

                if (tokenStream.match([Tokens.MINUS, Tokens.PLUS])) {
                    return tokenStream.token().value;
                } else {
                    return null;
                }
            },

            _property: function() {

                /*
                 * property
                 *   : IDENT S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    value       = null,
                    hack        = null,
                    tokenValue,
                    token,
                    line,
                    col;

                //check for star hack - throws error if not allowed
                if (tokenStream.peek() === Tokens.STAR && this.options.starHack) {
                    tokenStream.get();
                    token = tokenStream.token();
                    hack = token.value;
                    line = token.startLine;
                    col = token.startCol;
                }

                if (tokenStream.match(Tokens.IDENT)) {
                    token = tokenStream.token();
                    tokenValue = token.value;

                    //check for underscore hack - no error if not allowed because it's valid CSS syntax
                    if (tokenValue.charAt(0) === "_" && this.options.underscoreHack) {
                        hack = "_";
                        tokenValue = tokenValue.substring(1);
                    }

                    value = new PropertyName(tokenValue, hack, (line||token.startLine), (col||token.startCol));
                    this._readWhitespace();
                }

                return value;
            },

            //Augmented with CSS3 Selectors
            _ruleset: function() {
                /*
                 * ruleset
                 *   : selectors_group
                 *     '{' S* declaration? [ ';' S* declaration? ]* '}' S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    tt,
                    selectors;


                /*
                 * Error Recovery: If even a single selector fails to parse,
                 * then the entire ruleset should be thrown away.
                 */
                try {
                    selectors = this._selectors_group();
                } catch (ex) {
                    if (ex instanceof SyntaxError && !this.options.strict) {

                        //fire error event
                        this.fire({
                            type:       "error",
                            error:      ex,
                            message:    ex.message,
                            line:       ex.line,
                            col:        ex.col
                        });

                        //skip over everything until closing brace
                        tt = tokenStream.advance([Tokens.RBRACE]);
                        if (tt === Tokens.RBRACE) {
                            //if there's a right brace, the rule is finished so don't do anything
                        } else {
                            //otherwise, rethrow the error because it wasn't handled properly
                            throw ex;
                        }

                    } else {
                        //not a syntax error, rethrow it
                        throw ex;
                    }

                    //trigger parser to continue
                    return true;
                }

                //if it got here, all selectors parsed
                if (selectors) {

                    this.fire({
                        type:       "startrule",
                        selectors:  selectors,
                        line:       selectors[0].line,
                        col:        selectors[0].col
                    });

                    this._readDeclarations(true);

                    this.fire({
                        type:       "endrule",
                        selectors:  selectors,
                        line:       selectors[0].line,
                        col:        selectors[0].col
                    });

                }

                return selectors;

            },

            //CSS3 Selectors
            _selectors_group: function() {

                /*
                 * selectors_group
                 *   : selector [ COMMA S* selector ]*
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    selectors   = [],
                    selector;

                selector = this._selector();
                if (selector !== null) {

                    selectors.push(selector);
                    while (tokenStream.match(Tokens.COMMA)) {
                        this._readWhitespace();
                        selector = this._selector();
                        if (selector !== null) {
                            selectors.push(selector);
                        } else {
                            this._unexpectedToken(tokenStream.LT(1));
                        }
                    }
                }

                return selectors.length ? selectors : null;
            },

            //CSS3 Selectors
            _selector: function() {
                /*
                 * selector
                 *   : simple_selector_sequence [ combinator simple_selector_sequence ]*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    selector    = [],
                    nextSelector = null,
                    combinator  = null,
                    ws          = null;

                //if there's no simple selector, then there's no selector
                nextSelector = this._simple_selector_sequence();
                if (nextSelector === null) {
                    return null;
                }

                selector.push(nextSelector);

                do {

                    //look for a combinator
                    combinator = this._combinator();

                    if (combinator !== null) {
                        selector.push(combinator);
                        nextSelector = this._simple_selector_sequence();

                        //there must be a next selector
                        if (nextSelector === null) {
                            this._unexpectedToken(tokenStream.LT(1));
                        } else {

                            //nextSelector is an instance of SelectorPart
                            selector.push(nextSelector);
                        }
                    } else {

                        //if there's not whitespace, we're done
                        if (this._readWhitespace()) {

                            //add whitespace separator
                            ws = new Combinator(tokenStream.token().value, tokenStream.token().startLine, tokenStream.token().startCol);

                            //combinator is not required
                            combinator = this._combinator();

                            //selector is required if there's a combinator
                            nextSelector = this._simple_selector_sequence();
                            if (nextSelector === null) {
                                if (combinator !== null) {
                                    this._unexpectedToken(tokenStream.LT(1));
                                }
                            } else {

                                if (combinator !== null) {
                                    selector.push(combinator);
                                } else {
                                    selector.push(ws);
                                }

                                selector.push(nextSelector);
                            }
                        } else {
                            break;
                        }

                    }
                } while (true);

                return new Selector(selector, selector[0].line, selector[0].col);
            },

            //CSS3 Selectors
            _simple_selector_sequence: function() {
                /*
                 * simple_selector_sequence
                 *   : [ type_selector | universal ]
                 *     [ HASH | class | attrib | pseudo | negation ]*
                 *   | [ HASH | class | attrib | pseudo | negation ]+
                 *   ;
                 */

                var tokenStream = this._tokenStream,

                    //parts of a simple selector
                    elementName = null,
                    modifiers   = [],

                    //complete selector text
                    selectorText= "",

                    //the different parts after the element name to search for
                    components  = [
                        //HASH
                        function() {
                            return tokenStream.match(Tokens.HASH) ?
                                    new SelectorSubPart(tokenStream.token().value, "id", tokenStream.token().startLine, tokenStream.token().startCol) :
                                    null;
                        },
                        this._class,
                        this._attrib,
                        this._pseudo,
                        this._negation
                    ],
                    i           = 0,
                    len         = components.length,
                    component   = null,
                    line,
                    col;


                //get starting line and column for the selector
                line = tokenStream.LT(1).startLine;
                col = tokenStream.LT(1).startCol;

                elementName = this._type_selector();
                if (!elementName) {
                    elementName = this._universal();
                }

                if (elementName !== null) {
                    selectorText += elementName;
                }

                while (true) {

                    //whitespace means we're done
                    if (tokenStream.peek() === Tokens.S) {
                        break;
                    }

                    //check for each component
                    while (i < len && component === null) {
                        component = components[i++].call(this);
                    }

                    if (component === null) {

                        //we don't have a selector
                        if (selectorText === "") {
                            return null;
                        } else {
                            break;
                        }
                    } else {
                        i = 0;
                        modifiers.push(component);
                        selectorText += component.toString();
                        component = null;
                    }
                }


                return selectorText !== "" ?
                        new SelectorPart(elementName, modifiers, selectorText, line, col) :
                        null;
            },

            //CSS3 Selectors
            _type_selector: function() {
                /*
                 * type_selector
                 *   : [ namespace_prefix ]? element_name
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    ns          = this._namespace_prefix(),
                    elementName = this._element_name();

                if (!elementName) {
                    /*
                     * Need to back out the namespace that was read due to both
                     * type_selector and universal reading namespace_prefix
                     * first. Kind of hacky, but only way I can figure out
                     * right now how to not change the grammar.
                     */
                    if (ns) {
                        tokenStream.unget();
                        if (ns.length > 1) {
                            tokenStream.unget();
                        }
                    }

                    return null;
                } else {
                    if (ns) {
                        elementName.text = ns + elementName.text;
                        elementName.col -= ns.length;
                    }
                    return elementName;
                }
            },

            //CSS3 Selectors
            _class: function() {
                /*
                 * class
                 *   : '.' IDENT
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    token;

                if (tokenStream.match(Tokens.DOT)) {
                    tokenStream.mustMatch(Tokens.IDENT);
                    token = tokenStream.token();
                    return new SelectorSubPart("." + token.value, "class", token.startLine, token.startCol - 1);
                } else {
                    return null;
                }

            },

            //CSS3 Selectors
            _element_name: function() {
                /*
                 * element_name
                 *   : IDENT
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    token;

                if (tokenStream.match(Tokens.IDENT)) {
                    token = tokenStream.token();
                    return new SelectorSubPart(token.value, "elementName", token.startLine, token.startCol);

                } else {
                    return null;
                }
            },

            //CSS3 Selectors
            _namespace_prefix: function() {
                /*
                 * namespace_prefix
                 *   : [ IDENT | '*' ]? '|'
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    value       = "";

                //verify that this is a namespace prefix
                if (tokenStream.LA(1) === Tokens.PIPE || tokenStream.LA(2) === Tokens.PIPE) {

                    if (tokenStream.match([Tokens.IDENT, Tokens.STAR])) {
                        value += tokenStream.token().value;
                    }

                    tokenStream.mustMatch(Tokens.PIPE);
                    value += "|";

                }

                return value.length ? value : null;
            },

            //CSS3 Selectors
            _universal: function() {
                /*
                 * universal
                 *   : [ namespace_prefix ]? '*'
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    value       = "",
                    ns;

                ns = this._namespace_prefix();
                if (ns) {
                    value += ns;
                }

                if (tokenStream.match(Tokens.STAR)) {
                    value += "*";
                }

                return value.length ? value : null;

            },

            //CSS3 Selectors
            _attrib: function() {
                /*
                 * attrib
                 *   : '[' S* [ namespace_prefix ]? IDENT S*
                 *         [ [ PREFIXMATCH |
                 *             SUFFIXMATCH |
                 *             SUBSTRINGMATCH |
                 *             '=' |
                 *             INCLUDES |
                 *             DASHMATCH ] S* [ IDENT | STRING ] S*
                 *         ]? ']'
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    value       = null,
                    ns,
                    token;

                if (tokenStream.match(Tokens.LBRACKET)) {
                    token = tokenStream.token();
                    value = token.value;
                    value += this._readWhitespace();

                    ns = this._namespace_prefix();

                    if (ns) {
                        value += ns;
                    }

                    tokenStream.mustMatch(Tokens.IDENT);
                    value += tokenStream.token().value;
                    value += this._readWhitespace();

                    if (tokenStream.match([Tokens.PREFIXMATCH, Tokens.SUFFIXMATCH, Tokens.SUBSTRINGMATCH,
                            Tokens.EQUALS, Tokens.INCLUDES, Tokens.DASHMATCH])) {

                        value += tokenStream.token().value;
                        value += this._readWhitespace();

                        tokenStream.mustMatch([Tokens.IDENT, Tokens.STRING]);
                        value += tokenStream.token().value;
                        value += this._readWhitespace();
                    }

                    tokenStream.mustMatch(Tokens.RBRACKET);

                    return new SelectorSubPart(value + "]", "attribute", token.startLine, token.startCol);
                } else {
                    return null;
                }
            },

            //CSS3 Selectors
            _pseudo: function() {

                /*
                 * pseudo
                 *   : ':' ':'? [ IDENT | functional_pseudo ]
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    pseudo      = null,
                    colons      = ":",
                    line,
                    col;

                if (tokenStream.match(Tokens.COLON)) {

                    if (tokenStream.match(Tokens.COLON)) {
                        colons += ":";
                    }

                    if (tokenStream.match(Tokens.IDENT)) {
                        pseudo = tokenStream.token().value;
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol - colons.length;
                    } else if (tokenStream.peek() === Tokens.FUNCTION) {
                        line = tokenStream.LT(1).startLine;
                        col = tokenStream.LT(1).startCol - colons.length;
                        pseudo = this._functional_pseudo();
                    }

                    if (pseudo) {
                        pseudo = new SelectorSubPart(colons + pseudo, "pseudo", line, col);
                    } else {
                        var startLine = tokenStream.LT(1).startLine,
                            startCol  = tokenStream.LT(0).startCol;
                        throw new SyntaxError("Expected a `FUNCTION` or `IDENT` after colon at line " + startLine + ", col " + startCol + ".", startLine, startCol);
                    }
                }

                return pseudo;
            },

            //CSS3 Selectors
            _functional_pseudo: function() {
                /*
                 * functional_pseudo
                 *   : FUNCTION S* expression ')'
                 *   ;
                */

                var tokenStream = this._tokenStream,
                    value = null;

                if (tokenStream.match(Tokens.FUNCTION)) {
                    value = tokenStream.token().value;
                    value += this._readWhitespace();
                    value += this._expression();
                    tokenStream.mustMatch(Tokens.RPAREN);
                    value += ")";
                }

                return value;
            },

            //CSS3 Selectors
            _expression: function() {
                /*
                 * expression
                 *   : [ [ PLUS | '-' | DIMENSION | NUMBER | STRING | IDENT ] S* ]+
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    value       = "";

                while (tokenStream.match([Tokens.PLUS, Tokens.MINUS, Tokens.DIMENSION,
                        Tokens.NUMBER, Tokens.STRING, Tokens.IDENT, Tokens.LENGTH,
                        Tokens.FREQ, Tokens.ANGLE, Tokens.TIME,
                        Tokens.RESOLUTION, Tokens.SLASH])) {

                    value += tokenStream.token().value;
                    value += this._readWhitespace();
                }

                return value.length ? value : null;

            },

            //CSS3 Selectors
            _negation: function() {
                /*
                 * negation
                 *   : NOT S* negation_arg S* ')'
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    line,
                    col,
                    value       = "",
                    arg,
                    subpart     = null;

                if (tokenStream.match(Tokens.NOT)) {
                    value = tokenStream.token().value;
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;
                    value += this._readWhitespace();
                    arg = this._negation_arg();
                    value += arg;
                    value += this._readWhitespace();
                    tokenStream.match(Tokens.RPAREN);
                    value += tokenStream.token().value;

                    subpart = new SelectorSubPart(value, "not", line, col);
                    subpart.args.push(arg);
                }

                return subpart;
            },

            //CSS3 Selectors
            _negation_arg: function() {
                /*
                 * negation_arg
                 *   : type_selector | universal | HASH | class | attrib | pseudo
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    args        = [
                        this._type_selector,
                        this._universal,
                        function() {
                            return tokenStream.match(Tokens.HASH) ?
                                    new SelectorSubPart(tokenStream.token().value, "id", tokenStream.token().startLine, tokenStream.token().startCol) :
                                    null;
                        },
                        this._class,
                        this._attrib,
                        this._pseudo
                    ],
                    arg         = null,
                    i           = 0,
                    len         = args.length,
                    line,
                    col,
                    part;

                line = tokenStream.LT(1).startLine;
                col = tokenStream.LT(1).startCol;

                while (i < len && arg === null) {

                    arg = args[i].call(this);
                    i++;
                }

                //must be a negation arg
                if (arg === null) {
                    this._unexpectedToken(tokenStream.LT(1));
                }

                //it's an element name
                if (arg.type === "elementName") {
                    part = new SelectorPart(arg, [], arg.toString(), line, col);
                } else {
                    part = new SelectorPart(null, [arg], arg.toString(), line, col);
                }

                return part;
            },

            _declaration: function() {

                /*
                 * declaration
                 *   : property ':' S* expr prio?
                 *   | /( empty )/
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    property    = null,
                    expr        = null,
                    prio        = null,
                    invalid     = null,
                    propertyName= "";

                property = this._property();
                if (property !== null) {

                    tokenStream.mustMatch(Tokens.COLON);
                    this._readWhitespace();

                    expr = this._expr();

                    //if there's no parts for the value, it's an error
                    if (!expr || expr.length === 0) {
                        this._unexpectedToken(tokenStream.LT(1));
                    }

                    prio = this._prio();

                    /*
                     * If hacks should be allowed, then only check the root
                     * property. If hacks should not be allowed, treat
                     * _property or *property as invalid properties.
                     */
                    propertyName = property.toString();
                    if (this.options.starHack && property.hack === "*" ||
                            this.options.underscoreHack && property.hack === "_") {

                        propertyName = property.text;
                    }

                    try {
                        this._validateProperty(propertyName, expr);
                    } catch (ex) {
                        invalid = ex;
                    }

                    this.fire({
                        type:       "property",
                        property:   property,
                        value:      expr,
                        important:  prio,
                        line:       property.line,
                        col:        property.col,
                        invalid:    invalid
                    });

                    return true;
                } else {
                    return false;
                }
            },

            _prio: function() {
                /*
                 * prio
                 *   : IMPORTANT_SYM S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    result      = tokenStream.match(Tokens.IMPORTANT_SYM);

                this._readWhitespace();
                return result;
            },

            _expr: function(inFunction) {
                /*
                 * expr
                 *   : term [ operator term ]*
                 *   ;
                 */

                var values      = [],
                    //valueParts    = [],
                    value       = null,
                    operator    = null;

                value = this._term(inFunction);
                if (value !== null) {

                    values.push(value);

                    do {
                        operator = this._operator(inFunction);

                        //if there's an operator, keep building up the value parts
                        if (operator) {
                            values.push(operator);
                        } /*else {
                            //if there's not an operator, you have a full value
                            values.push(new PropertyValue(valueParts, valueParts[0].line, valueParts[0].col));
                            valueParts = [];
                        }*/

                        value = this._term(inFunction);

                        if (value === null) {
                            break;
                        } else {
                            values.push(value);
                        }
                    } while (true);
                }

                //cleanup
                /*if (valueParts.length) {
                    values.push(new PropertyValue(valueParts, valueParts[0].line, valueParts[0].col));
                }*/

                return values.length > 0 ? new PropertyValue(values, values[0].line, values[0].col) : null;
            },

            _term: function(inFunction) {

                /*
                 * term
                 *   : unary_operator?
                 *     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | ANGLE S* |
                 *       TIME S* | FREQ S* | function | ie_function ]
                 *   | STRING S* | IDENT S* | URI S* | UNICODERANGE S* | hexcolor
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    unary       = null,
                    value       = null,
                    endChar     = null,
                    part        = null,
                    token,
                    line,
                    col;

                //returns the operator or null
                unary = this._unary_operator();
                if (unary !== null) {
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;
                }

                //exception for IE filters
                if (tokenStream.peek() === Tokens.IE_FUNCTION && this.options.ieFilters) {

                    value = this._ie_function();
                    if (unary === null) {
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol;
                    }

                //see if it's a simple block
                } else if (inFunction && tokenStream.match([Tokens.LPAREN, Tokens.LBRACE, Tokens.LBRACKET])) {

                    token = tokenStream.token();
                    endChar = token.endChar;
                    value = token.value + this._expr(inFunction).text;
                    if (unary === null) {
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol;
                    }
                    tokenStream.mustMatch(Tokens.type(endChar));
                    value += endChar;
                    this._readWhitespace();

                //see if there's a simple match
                } else if (tokenStream.match([Tokens.NUMBER, Tokens.PERCENTAGE, Tokens.LENGTH,
                        Tokens.ANGLE, Tokens.TIME,
                        Tokens.FREQ, Tokens.STRING, Tokens.IDENT, Tokens.URI, Tokens.UNICODE_RANGE])) {

                    value = tokenStream.token().value;
                    if (unary === null) {
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol;
                        // Correct potentially-inaccurate IDENT parsing in
                        // PropertyValuePart constructor.
                        part = PropertyValuePart.fromToken(tokenStream.token());
                    }
                    this._readWhitespace();
                } else {

                    //see if it's a color
                    token = this._hexcolor();
                    if (token === null) {

                        //if there's no unary, get the start of the next token for line/col info
                        if (unary === null) {
                            line = tokenStream.LT(1).startLine;
                            col = tokenStream.LT(1).startCol;
                        }

                        //has to be a function
                        if (value === null) {

                            /*
                             * This checks for alpha(opacity=0) style of IE
                             * functions. IE_FUNCTION only presents progid: style.
                             */
                            if (tokenStream.LA(3) === Tokens.EQUALS && this.options.ieFilters) {
                                value = this._ie_function();
                            } else {
                                value = this._function();
                            }
                        }

                        /*if (value === null) {
                            return null;
                            //throw new Error("Expected identifier at line " + tokenStream.token().startLine + ", character " +  tokenStream.token().startCol + ".");
                        }*/

                    } else {
                        value = token.value;
                        if (unary === null) {
                            line = token.startLine;
                            col = token.startCol;
                        }
                    }

                }

                return part !== null ? part : value !== null ?
                        new PropertyValuePart(unary !== null ? unary + value : value, line, col) :
                        null;

            },

            _function: function() {

                /*
                 * function
                 *   : FUNCTION S* expr ')' S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    functionText = null,
                    expr        = null,
                    lt;

                if (tokenStream.match(Tokens.FUNCTION)) {
                    functionText = tokenStream.token().value;
                    this._readWhitespace();
                    expr = this._expr(true);
                    functionText += expr;

                    //START: Horrible hack in case it's an IE filter
                    if (this.options.ieFilters && tokenStream.peek() === Tokens.EQUALS) {
                        do {

                            if (this._readWhitespace()) {
                                functionText += tokenStream.token().value;
                            }

                            //might be second time in the loop
                            if (tokenStream.LA(0) === Tokens.COMMA) {
                                functionText += tokenStream.token().value;
                            }

                            tokenStream.match(Tokens.IDENT);
                            functionText += tokenStream.token().value;

                            tokenStream.match(Tokens.EQUALS);
                            functionText += tokenStream.token().value;

                            //functionText += this._term();
                            lt = tokenStream.peek();
                            while (lt !== Tokens.COMMA && lt !== Tokens.S && lt !== Tokens.RPAREN) {
                                tokenStream.get();
                                functionText += tokenStream.token().value;
                                lt = tokenStream.peek();
                            }
                        } while (tokenStream.match([Tokens.COMMA, Tokens.S]));
                    }

                    //END: Horrible Hack

                    tokenStream.match(Tokens.RPAREN);
                    functionText += ")";
                    this._readWhitespace();
                }

                return functionText;
            },

            _ie_function: function() {

                /* (My own extension)
                 * ie_function
                 *   : IE_FUNCTION S* IDENT '=' term [S* ','? IDENT '=' term]+ ')' S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    functionText = null,
                    lt;

                //IE function can begin like a regular function, too
                if (tokenStream.match([Tokens.IE_FUNCTION, Tokens.FUNCTION])) {
                    functionText = tokenStream.token().value;

                    do {

                        if (this._readWhitespace()) {
                            functionText += tokenStream.token().value;
                        }

                        //might be second time in the loop
                        if (tokenStream.LA(0) === Tokens.COMMA) {
                            functionText += tokenStream.token().value;
                        }

                        tokenStream.match(Tokens.IDENT);
                        functionText += tokenStream.token().value;

                        tokenStream.match(Tokens.EQUALS);
                        functionText += tokenStream.token().value;

                        //functionText += this._term();
                        lt = tokenStream.peek();
                        while (lt !== Tokens.COMMA && lt !== Tokens.S && lt !== Tokens.RPAREN) {
                            tokenStream.get();
                            functionText += tokenStream.token().value;
                            lt = tokenStream.peek();
                        }
                    } while (tokenStream.match([Tokens.COMMA, Tokens.S]));

                    tokenStream.match(Tokens.RPAREN);
                    functionText += ")";
                    this._readWhitespace();
                }

                return functionText;
            },

            _hexcolor: function() {
                /*
                 * There is a constraint on the color that it must
                 * have either 3 or 6 hex-digits (i.e., [0-9a-fA-F])
                 * after the "#"; e.g., "#000" is OK, but "#abcd" is not.
                 *
                 * hexcolor
                 *   : HASH S*
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    token = null,
                    color;

                if (tokenStream.match(Tokens.HASH)) {

                    //need to do some validation here

                    token = tokenStream.token();
                    color = token.value;
                    if (!/#[a-f0-9]{3,6}/i.test(color)) {
                        throw new SyntaxError("Expected a hex color but found '" + color + "' at line " + token.startLine + ", col " + token.startCol + ".", token.startLine, token.startCol);
                    }
                    this._readWhitespace();
                }

                return token;
            },

            //-----------------------------------------------------------------
            // Animations methods
            //-----------------------------------------------------------------

            _keyframes: function() {

                /*
                 * keyframes:
                 *   : KEYFRAMES_SYM S* keyframe_name S* '{' S* keyframe_rule* '}' {
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    token,
                    tt,
                    name,
                    prefix = "";

                tokenStream.mustMatch(Tokens.KEYFRAMES_SYM);
                token = tokenStream.token();
                if (/^@\-([^\-]+)\-/.test(token.value)) {
                    prefix = RegExp.$1;
                }

                this._readWhitespace();
                name = this._keyframe_name();

                this._readWhitespace();
                tokenStream.mustMatch(Tokens.LBRACE);

                this.fire({
                    type:   "startkeyframes",
                    name:   name,
                    prefix: prefix,
                    line:   token.startLine,
                    col:    token.startCol
                });

                this._readWhitespace();
                tt = tokenStream.peek();

                //check for key
                while (tt === Tokens.IDENT || tt === Tokens.PERCENTAGE) {
                    this._keyframe_rule();
                    this._readWhitespace();
                    tt = tokenStream.peek();
                }

                this.fire({
                    type:   "endkeyframes",
                    name:   name,
                    prefix: prefix,
                    line:   token.startLine,
                    col:    token.startCol
                });

                this._readWhitespace();
                tokenStream.mustMatch(Tokens.RBRACE);
                this._readWhitespace();

            },

            _keyframe_name: function() {

                /*
                 * keyframe_name:
                 *   : IDENT
                 *   | STRING
                 *   ;
                 */
                var tokenStream = this._tokenStream;

                tokenStream.mustMatch([Tokens.IDENT, Tokens.STRING]);
                return SyntaxUnit.fromToken(tokenStream.token());
            },

            _keyframe_rule: function() {

                /*
                 * keyframe_rule:
                 *   : key_list S*
                 *     '{' S* declaration [ ';' S* declaration ]* '}' S*
                 *   ;
                 */
                var keyList = this._key_list();

                this.fire({
                    type:   "startkeyframerule",
                    keys:   keyList,
                    line:   keyList[0].line,
                    col:    keyList[0].col
                });

                this._readDeclarations(true);

                this.fire({
                    type:   "endkeyframerule",
                    keys:   keyList,
                    line:   keyList[0].line,
                    col:    keyList[0].col
                });

            },

            _key_list: function() {

                /*
                 * key_list:
                 *   : key [ S* ',' S* key]*
                 *   ;
                 */
                var tokenStream = this._tokenStream,
                    keyList = [];

                //must be least one key
                keyList.push(this._key());

                this._readWhitespace();

                while (tokenStream.match(Tokens.COMMA)) {
                    this._readWhitespace();
                    keyList.push(this._key());
                    this._readWhitespace();
                }

                return keyList;
            },

            _key: function() {
                /*
                 * There is a restriction that IDENT can be only "from" or "to".
                 *
                 * key
                 *   : PERCENTAGE
                 *   | IDENT
                 *   ;
                 */

                var tokenStream = this._tokenStream,
                    token;

                if (tokenStream.match(Tokens.PERCENTAGE)) {
                    return SyntaxUnit.fromToken(tokenStream.token());
                } else if (tokenStream.match(Tokens.IDENT)) {
                    token = tokenStream.token();

                    if (/from|to/i.test(token.value)) {
                        return SyntaxUnit.fromToken(token);
                    }

                    tokenStream.unget();
                }

                //if it gets here, there wasn't a valid token, so time to explode
                this._unexpectedToken(tokenStream.LT(1));
            },

            //-----------------------------------------------------------------
            // Helper methods
            //-----------------------------------------------------------------

            /**
             * Not part of CSS grammar, but useful for skipping over
             * combination of white space and HTML-style comments.
             * @return {void}
             * @method _skipCruft
             * @private
             */
            _skipCruft: function() {
                while (this._tokenStream.match([Tokens.S, Tokens.CDO, Tokens.CDC])) {
                    //noop
                }
            },

            /**
             * Not part of CSS grammar, but this pattern occurs frequently
             * in the official CSS grammar. Split out here to eliminate
             * duplicate code.
             * @param {Boolean} checkStart Indicates if the rule should check
             *      for the left brace at the beginning.
             * @param {Boolean} readMargins Indicates if the rule should check
             *      for margin patterns.
             * @return {void}
             * @method _readDeclarations
             * @private
             */
            _readDeclarations: function(checkStart, readMargins) {
                /*
                 * Reads the pattern
                 * S* '{' S* declaration [ ';' S* declaration ]* '}' S*
                 * or
                 * S* '{' S* [ declaration | margin ]? [ ';' S* [ declaration | margin ]? ]* '}' S*
                 * Note that this is how it is described in CSS3 Paged Media, but is actually incorrect.
                 * A semicolon is only necessary following a declaration if there's another declaration
                 * or margin afterwards.
                 */
                var tokenStream = this._tokenStream,
                    tt;


                this._readWhitespace();

                if (checkStart) {
                    tokenStream.mustMatch(Tokens.LBRACE);
                }

                this._readWhitespace();

                try {

                    while (true) {

                        if (tokenStream.match(Tokens.SEMICOLON) || (readMargins && this._margin())) {
                            //noop
                        } else if (this._declaration()) {
                            if (!tokenStream.match(Tokens.SEMICOLON)) {
                                break;
                            }
                        } else {
                            break;
                        }

                        //if ((!this._margin() && !this._declaration()) || !tokenStream.match(Tokens.SEMICOLON)){
                        //    break;
                        //}
                        this._readWhitespace();
                    }

                    tokenStream.mustMatch(Tokens.RBRACE);
                    this._readWhitespace();

                } catch (ex) {
                    if (ex instanceof SyntaxError && !this.options.strict) {

                        //fire error event
                        this.fire({
                            type:       "error",
                            error:      ex,
                            message:    ex.message,
                            line:       ex.line,
                            col:        ex.col
                        });

                        //see if there's another declaration
                        tt = tokenStream.advance([Tokens.SEMICOLON, Tokens.RBRACE]);
                        if (tt === Tokens.SEMICOLON) {
                            //if there's a semicolon, then there might be another declaration
                            this._readDeclarations(false, readMargins);
                        } else if (tt !== Tokens.RBRACE) {
                            //if there's a right brace, the rule is finished so don't do anything
                            //otherwise, rethrow the error because it wasn't handled properly
                            throw ex;
                        }

                    } else {
                        //not a syntax error, rethrow it
                        throw ex;
                    }
                }

            },

            /**
             * In some cases, you can end up with two white space tokens in a
             * row. Instead of making a change in every function that looks for
             * white space, this function is used to match as much white space
             * as necessary.
             * @method _readWhitespace
             * @return {String} The white space if found, empty string if not.
             * @private
             */
            _readWhitespace: function() {

                var tokenStream = this._tokenStream,
                    ws = "";

                while (tokenStream.match(Tokens.S)) {
                    ws += tokenStream.token().value;
                }

                return ws;
            },


            /**
             * Throws an error when an unexpected token is found.
             * @param {Object} token The token that was found.
             * @method _unexpectedToken
             * @return {void}
             * @private
             */
            _unexpectedToken: function(token) {
                throw new SyntaxError("Unexpected token '" + token.value + "' at line " + token.startLine + ", col " + token.startCol + ".", token.startLine, token.startCol);
            },

            /**
             * Helper method used for parsing subparts of a style sheet.
             * @return {void}
             * @method _verifyEnd
             * @private
             */
            _verifyEnd: function() {
                if (this._tokenStream.LA(1) !== Tokens.EOF) {
                    this._unexpectedToken(this._tokenStream.LT(1));
                }
            },

            //-----------------------------------------------------------------
            // Validation methods
            //-----------------------------------------------------------------
            _validateProperty: function(property, value) {
                Validation.validate(property, value);
            },

            //-----------------------------------------------------------------
            // Parsing methods
            //-----------------------------------------------------------------

            parse: function(input) {
                this._tokenStream = new TokenStream(input, Tokens);
                this._stylesheet();
            },

            parseStyleSheet: function(input) {
                //just passthrough
                return this.parse(input);
            },

            parseMediaQuery: function(input) {
                this._tokenStream = new TokenStream(input, Tokens);
                var result = this._media_query();

                //if there's anything more, then it's an invalid selector
                this._verifyEnd();

                //otherwise return result
                return result;
            },

            /**
             * Parses a property value (everything after the semicolon).
             * @return {parserlib.css.PropertyValue} The property value.
             * @throws parserlib.util.SyntaxError If an unexpected token is found.
             * @method parserPropertyValue
             */
            parsePropertyValue: function(input) {

                this._tokenStream = new TokenStream(input, Tokens);
                this._readWhitespace();

                var result = this._expr();

                //okay to have a trailing white space
                this._readWhitespace();

                //if there's anything more, then it's an invalid selector
                this._verifyEnd();

                //otherwise return result
                return result;
            },

            /**
             * Parses a complete CSS rule, including selectors and
             * properties.
             * @param {String} input The text to parser.
             * @return {Boolean} True if the parse completed successfully, false if not.
             * @method parseRule
             */
            parseRule: function(input) {
                this._tokenStream = new TokenStream(input, Tokens);

                //skip any leading white space
                this._readWhitespace();

                var result = this._ruleset();

                //skip any trailing white space
                this._readWhitespace();

                //if there's anything more, then it's an invalid selector
                this._verifyEnd();

                //otherwise return result
                return result;
            },

            /**
             * Parses a single CSS selector (no comma)
             * @param {String} input The text to parse as a CSS selector.
             * @return {Selector} An object representing the selector.
             * @throws parserlib.util.SyntaxError If an unexpected token is found.
             * @method parseSelector
             */
            parseSelector: function(input) {

                this._tokenStream = new TokenStream(input, Tokens);

                //skip any leading white space
                this._readWhitespace();

                var result = this._selector();

                //skip any trailing white space
                this._readWhitespace();

                //if there's anything more, then it's an invalid selector
                this._verifyEnd();

                //otherwise return result
                return result;
            },

            /**
             * Parses an HTML style attribute: a set of CSS declarations
             * separated by semicolons.
             * @param {String} input The text to parse as a style attribute
             * @return {void}
             * @method parseStyleAttribute
             */
            parseStyleAttribute: function(input) {
                input += "}"; // for error recovery in _readDeclarations()
                this._tokenStream = new TokenStream(input, Tokens);
                this._readDeclarations();
            }
        };

    //copy over onto prototype
    for (prop in additions) {
        if (Object.prototype.hasOwnProperty.call(additions, prop)) {
            proto[prop] = additions[prop];
        }
    }

    return proto;
}();


/*
nth
  : S* [ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]? |
         ['-'|'+']? INTEGER | {O}{D}{D} | {E}{V}{E}{N} ] S*
  ;
*/

},{"../util/EventTarget":23,"../util/SyntaxError":25,"../util/SyntaxUnit":26,"./Combinator":2,"./MediaFeature":4,"./MediaQuery":5,"./PropertyName":8,"./PropertyValue":9,"./PropertyValuePart":11,"./Selector":13,"./SelectorPart":14,"./SelectorSubPart":15,"./TokenStream":17,"./Tokens":18,"./Validation":19}],19:[function(require,module,exports){
"use strict";

/* exported Validation */

var Matcher = require("./Matcher");
var Properties = require("./Properties");
var ValidationTypes = require("./ValidationTypes");
var ValidationError = require("./ValidationError");
var PropertyValueIterator = require("./PropertyValueIterator");

var Validation = module.exports = {

    validate: function(property, value) {

        //normalize name
        var name        = property.toString().toLowerCase(),
            expression  = new PropertyValueIterator(value),
            spec        = Properties[name],
            part;

        if (!spec) {
            if (name.indexOf("-") !== 0) {    //vendor prefixed are ok
                throw new ValidationError("Unknown property '" + property + "'.", property.line, property.col);
            }
        } else if (typeof spec !== "number") {

            // All properties accept some CSS-wide values.
            // https://drafts.csswg.org/css-values-3/#common-keywords
            if (ValidationTypes.isAny(expression, "inherit | initial | unset")) {
                if (expression.hasNext()) {
                    part = expression.next();
                    throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
                }
                return;
            }

            // Property-specific validation.
            this.singleProperty(spec, expression);

        }

    },

    singleProperty: function(types, expression) {

        var result      = false,
            value       = expression.value,
            part;

        result = Matcher.parse(types).match(expression);

        if (!result) {
            if (expression.hasNext() && !expression.isFirst()) {
                part = expression.peek();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected (" + ValidationTypes.describe(types) + ") but found '" + value + "'.", value.line, value.col);
            }
        } else if (expression.hasNext()) {
            part = expression.next();
            throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
        }

    }

};

},{"./Matcher":3,"./Properties":7,"./PropertyValueIterator":10,"./ValidationError":20,"./ValidationTypes":21}],20:[function(require,module,exports){
"use strict";

module.exports = ValidationError;

/**
 * Type to use when a validation error occurs.
 * @class ValidationError
 * @namespace parserlib.util
 * @constructor
 * @param {String} message The error message.
 * @param {int} line The line at which the error occurred.
 * @param {int} col The column at which the error occurred.
 */
function ValidationError(message, line, col) {

    /**
     * The column at which the error occurred.
     * @type int
     * @property col
     */
    this.col = col;

    /**
     * The line at which the error occurred.
     * @type int
     * @property line
     */
    this.line = line;

    /**
     * The text representation of the unit.
     * @type String
     * @property text
     */
    this.message = message;

}

//inherit from Error
ValidationError.prototype = new Error();

},{}],10:[function(require,module,exports){
"use strict";

module.exports = PropertyValueIterator;

/**
 * A utility class that allows for easy iteration over the various parts of a
 * property value.
 * @param {parserlib.css.PropertyValue} value The property value to iterate over.
 * @namespace parserlib.css
 * @class PropertyValueIterator
 * @constructor
 */
function PropertyValueIterator(value) {

    /**
     * Iterator value
     * @type int
     * @property _i
     * @private
     */
    this._i = 0;

    /**
     * The parts that make up the value.
     * @type Array
     * @property _parts
     * @private
     */
    this._parts = value.parts;

    /**
     * Keeps track of bookmarks along the way.
     * @type Array
     * @property _marks
     * @private
     */
    this._marks = [];

    /**
     * Holds the original property value.
     * @type parserlib.css.PropertyValue
     * @property value
     */
    this.value = value;

}

/**
 * Returns the total number of parts in the value.
 * @return {int} The total number of parts in the value.
 * @method count
 */
PropertyValueIterator.prototype.count = function() {
    return this._parts.length;
};

/**
 * Indicates if the iterator is positioned at the first item.
 * @return {Boolean} True if positioned at first item, false if not.
 * @method isFirst
 */
PropertyValueIterator.prototype.isFirst = function() {
    return this._i === 0;
};

/**
 * Indicates if there are more parts of the property value.
 * @return {Boolean} True if there are more parts, false if not.
 * @method hasNext
 */
PropertyValueIterator.prototype.hasNext = function() {
    return this._i < this._parts.length;
};

/**
 * Marks the current spot in the iteration so it can be restored to
 * later on.
 * @return {void}
 * @method mark
 */
PropertyValueIterator.prototype.mark = function() {
    this._marks.push(this._i);
};

/**
 * Returns the next part of the property value or null if there is no next
 * part. Does not move the internal counter forward.
 * @return {parserlib.css.PropertyValuePart} The next part of the property value or null if there is no next
 * part.
 * @method peek
 */
PropertyValueIterator.prototype.peek = function(count) {
    return this.hasNext() ? this._parts[this._i + (count || 0)] : null;
};

/**
 * Returns the next part of the property value or null if there is no next
 * part.
 * @return {parserlib.css.PropertyValuePart} The next part of the property value or null if there is no next
 * part.
 * @method next
 */
PropertyValueIterator.prototype.next = function() {
    return this.hasNext() ? this._parts[this._i++] : null;
};

/**
 * Returns the previous part of the property value or null if there is no
 * previous part.
 * @return {parserlib.css.PropertyValuePart} The previous part of the
 * property value or null if there is no previous part.
 * @method previous
 */
PropertyValueIterator.prototype.previous = function() {
    return this._i > 0 ? this._parts[--this._i] : null;
};

/**
 * Restores the last saved bookmark.
 * @return {void}
 * @method restore
 */
PropertyValueIterator.prototype.restore = function() {
    if (this._marks.length) {
        this._i = this._marks.pop();
    }
};

/**
 * Drops the last saved bookmark.
 * @return {void}
 * @method drop
 */
PropertyValueIterator.prototype.drop = function() {
    this._marks.pop();
};

},{}],7:[function(require,module,exports){
"use strict";

/* exported Properties */

var Properties = module.exports = {
    __proto__: null,

    //A
    "align-items"                   : "flex-start | flex-end | center | baseline | stretch",
    "align-content"                 : "flex-start | flex-end | center | space-between | space-around | stretch",
    "align-self"                    : "auto | flex-start | flex-end | center | baseline | stretch",
    "all"                           : "initial | inherit | unset",
    "-webkit-align-items"           : "flex-start | flex-end | center | baseline | stretch",
    "-webkit-align-content"         : "flex-start | flex-end | center | space-between | space-around | stretch",
    "-webkit-align-self"            : "auto | flex-start | flex-end | center | baseline | stretch",
    "alignment-adjust"              : "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length>",
    "alignment-baseline"            : "auto | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "animation"                     : 1,
    "animation-delay"               : "<time>#",
    "animation-direction"           : "<single-animation-direction>#",
    "animation-duration"            : "<time>#",
    "animation-fill-mode"           : "[ none | forwards | backwards | both ]#",
    "animation-iteration-count"     : "[ <number> | infinite ]#",
    "animation-name"                : "[ none | <single-animation-name> ]#",
    "animation-play-state"          : "[ running | paused ]#",
    "animation-timing-function"     : 1,

    //vendor prefixed
    "-moz-animation-delay"               : "<time>#",
    "-moz-animation-direction"           : "[ normal | alternate ]#",
    "-moz-animation-duration"            : "<time>#",
    "-moz-animation-iteration-count"     : "[ <number> | infinite ]#",
    "-moz-animation-name"                : "[ none | <single-animation-name> ]#",
    "-moz-animation-play-state"          : "[ running | paused ]#",

    "-ms-animation-delay"               : "<time>#",
    "-ms-animation-direction"           : "[ normal | alternate ]#",
    "-ms-animation-duration"            : "<time>#",
    "-ms-animation-iteration-count"     : "[ <number> | infinite ]#",
    "-ms-animation-name"                : "[ none | <single-animation-name> ]#",
    "-ms-animation-play-state"          : "[ running | paused ]#",

    "-webkit-animation-delay"               : "<time>#",
    "-webkit-animation-direction"           : "[ normal | alternate ]#",
    "-webkit-animation-duration"            : "<time>#",
    "-webkit-animation-fill-mode"           : "[ none | forwards | backwards | both ]#",
    "-webkit-animation-iteration-count"     : "[ <number> | infinite ]#",
    "-webkit-animation-name"                : "[ none | <single-animation-name> ]#",
    "-webkit-animation-play-state"          : "[ running | paused ]#",

    "-o-animation-delay"               : "<time>#",
    "-o-animation-direction"           : "[ normal | alternate ]#",
    "-o-animation-duration"            : "<time>#",
    "-o-animation-iteration-count"     : "[ <number> | infinite ]#",
    "-o-animation-name"                : "[ none | <single-animation-name> ]#",
    "-o-animation-play-state"          : "[ running | paused ]#",

    "appearance"                    : "none | auto",
    "-moz-appearance"               : "none | button | button-arrow-down | button-arrow-next | button-arrow-previous | button-arrow-up | button-bevel | button-focus | caret | checkbox | checkbox-container | checkbox-label | checkmenuitem | dualbutton | groupbox | listbox | listitem | menuarrow | menubar | menucheckbox | menuimage | menuitem | menuitemtext | menulist | menulist-button | menulist-text | menulist-textfield | menupopup | menuradio | menuseparator | meterbar | meterchunk | progressbar | progressbar-vertical | progresschunk | progresschunk-vertical | radio | radio-container | radio-label | radiomenuitem | range | range-thumb | resizer | resizerpanel | scale-horizontal | scalethumbend | scalethumb-horizontal | scalethumbstart | scalethumbtick | scalethumb-vertical | scale-vertical | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | separator | sheet | spinner | spinner-downbutton | spinner-textfield | spinner-upbutton | splitter | statusbar | statusbarpanel | tab | tabpanel | tabpanels | tab-scroll-arrow-back | tab-scroll-arrow-forward | textfield | textfield-multiline | toolbar | toolbarbutton | toolbarbutton-dropdown | toolbargripper | toolbox | tooltip | treeheader | treeheadercell | treeheadersortarrow | treeitem | treeline | treetwisty | treetwistyopen | treeview | -moz-mac-unified-toolbar | -moz-win-borderless-glass | -moz-win-browsertabbar-toolbox | -moz-win-communicationstext | -moz-win-communications-toolbox | -moz-win-exclude-glass | -moz-win-glass | -moz-win-mediatext | -moz-win-media-toolbox | -moz-window-button-box | -moz-window-button-box-maximized | -moz-window-button-close | -moz-window-button-maximize | -moz-window-button-minimize | -moz-window-button-restore | -moz-window-frame-bottom | -moz-window-frame-left | -moz-window-frame-right | -moz-window-titlebar | -moz-window-titlebar-maximized",
    "-ms-appearance"                : "none | icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal",
    "-webkit-appearance"            : "none | button | button-bevel | caps-lock-indicator | caret | checkbox | default-button | listbox	| listitem | media-fullscreen-button | media-mute-button | media-play-button | media-seek-back-button	| media-seek-forward-button	| media-slider | media-sliderthumb | menulist	| menulist-button	| menulist-text	| menulist-textfield | push-button	| radio	| searchfield	| searchfield-cancel-button	| searchfield-decoration | searchfield-results-button | searchfield-results-decoration | slider-horizontal | slider-vertical | sliderthumb-horizontal | sliderthumb-vertical	| square-button	| textarea	| textfield	| scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbargripper-horizontal | scrollbargripper-vertical | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical",
    "-o-appearance"                 : "none | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal",

    "azimuth"                       : "<azimuth>",

    //B
    "backface-visibility"           : "visible | hidden",
    "background"                    : 1,
    "background-attachment"         : "<attachment>#",
    "background-clip"               : "<box>#",
    "background-color"              : "<color>",
    "background-image"              : "<bg-image>#",
    "background-origin"             : "<box>#",
    "background-position"           : "<bg-position>",
    "background-repeat"             : "<repeat-style>#",
    "background-size"               : "<bg-size>#",
    "baseline-shift"                : "baseline | sub | super | <percentage> | <length>",
    "behavior"                      : 1,
    "binding"                       : 1,
    "bleed"                         : "<length>",
    "bookmark-label"                : "<content> | <attr> | <string>",
    "bookmark-level"                : "none | <integer>",
    "bookmark-state"                : "open | closed",
    "bookmark-target"               : "none | <uri> | <attr>",
    "border"                        : "<border-width> || <border-style> || <color>",
    "border-bottom"                 : "<border-width> || <border-style> || <color>",
    "border-bottom-color"           : "<color>",
    "border-bottom-left-radius"     :  "<x-one-radius>",
    "border-bottom-right-radius"    :  "<x-one-radius>",
    "border-bottom-style"           : "<border-style>",
    "border-bottom-width"           : "<border-width>",
    "border-collapse"               : "collapse | separate",
    "border-color"                  : "<color>{1,4}",
    "border-image"                  : 1,
    "border-image-outset"           : "[ <length> | <number> ]{1,4}",
    "border-image-repeat"           : "[ stretch | repeat | round ]{1,2}",
    "border-image-slice"            : "<border-image-slice>",
    "border-image-source"           : "<image> | none",
    "border-image-width"            : "[ <length> | <percentage> | <number> | auto ]{1,4}",
    "border-left"                   : "<border-width> || <border-style> || <color>",
    "border-left-color"             : "<color>",
    "border-left-style"             : "<border-style>",
    "border-left-width"             : "<border-width>",
    "border-radius"                 : "<border-radius>",
    "border-right"                  : "<border-width> || <border-style> || <color>",
    "border-right-color"            : "<color>",
    "border-right-style"            : "<border-style>",
    "border-right-width"            : "<border-width>",
    "border-spacing"                : "<length>{1,2}",
    "border-style"                  : "<border-style>{1,4}",
    "border-top"                    : "<border-width> || <border-style> || <color>",
    "border-top-color"              : "<color>",
    "border-top-left-radius"        : "<x-one-radius>",
    "border-top-right-radius"       : "<x-one-radius>",
    "border-top-style"              : "<border-style>",
    "border-top-width"              : "<border-width>",
    "border-width"                  : "<border-width>{1,4}",
    "bottom"                        : "<margin-width>",
    "-moz-box-align"                : "start | end | center | baseline | stretch",
    "-moz-box-decoration-break"     : "slice | clone",
    "-moz-box-direction"            : "normal | reverse",
    "-moz-box-flex"                 : "<number>",
    "-moz-box-flex-group"           : "<integer>",
    "-moz-box-lines"                : "single | multiple",
    "-moz-box-ordinal-group"        : "<integer>",
    "-moz-box-orient"               : "horizontal | vertical | inline-axis | block-axis",
    "-moz-box-pack"                 : "start | end | center | justify",
    "-o-box-decoration-break"       : "slice | clone",
    "-webkit-box-align"             : "start | end | center | baseline | stretch",
    "-webkit-box-decoration-break"  : "slice | clone",
    "-webkit-box-direction"         : "normal | reverse",
    "-webkit-box-flex"              : "<number>",
    "-webkit-box-flex-group"        : "<integer>",
    "-webkit-box-lines"             : "single | multiple",
    "-webkit-box-ordinal-group"     : "<integer>",
    "-webkit-box-orient"            : "horizontal | vertical | inline-axis | block-axis",
    "-webkit-box-pack"              : "start | end | center | justify",
    "box-decoration-break"          : "slice | clone",
    "box-shadow"                    : "<box-shadow>",
    "box-sizing"                    : "content-box | border-box",
    "break-after"                   : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
    "break-before"                  : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
    "break-inside"                  : "auto | avoid | avoid-page | avoid-column",

    //C
    "caption-side"                  : "top | bottom",
    "clear"                         : "none | right | left | both",
    "clip"                          : "<shape> | auto",
    "-webkit-clip-path"             : "<clip-source> | <clip-path> | none",
    "clip-path"                     : "<clip-source> | <clip-path> | none",
    "clip-rule"                     : "nonzero | evenodd",
    "color"                         : "<color>",
    "color-interpolation"           : "auto | sRGB | linearRGB",
    "color-interpolation-filters"   : "auto | sRGB | linearRGB",
    "color-profile"                 : 1,
    "color-rendering"               : "auto | optimizeSpeed | optimizeQuality",
    "column-count"                  : "<integer> | auto",                      //https://www.w3.org/TR/css3-multicol/
    "column-fill"                   : "auto | balance",
    "column-gap"                    : "<length> | normal",
    "column-rule"                   : "<border-width> || <border-style> || <color>",
    "column-rule-color"             : "<color>",
    "column-rule-style"             : "<border-style>",
    "column-rule-width"             : "<border-width>",
    "column-span"                   : "none | all",
    "column-width"                  : "<length> | auto",
    "columns"                       : 1,
    "content"                       : 1,
    "counter-increment"             : 1,
    "counter-reset"                 : 1,
    "crop"                          : "<shape> | auto",
    "cue"                           : "cue-after | cue-before",
    "cue-after"                     : 1,
    "cue-before"                    : 1,
    "cursor"                        : 1,

    //D
    "direction"                     : "ltr | rtl",
    "display"                       : "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex",
    "dominant-baseline"             : "auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge",
    "drop-initial-after-adjust"     : "central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length>",
    "drop-initial-after-align"      : "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "drop-initial-before-adjust"    : "before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length>",
    "drop-initial-before-align"     : "caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "drop-initial-size"             : "auto | line | <length> | <percentage>",
    "drop-initial-value"            : "<integer>",

    //E
    "elevation"                     : "<angle> | below | level | above | higher | lower",
    "empty-cells"                   : "show | hide",
    "enable-background"             : 1,

    //F
    "fill"                          : "<paint>",
    "fill-opacity"                  : "<opacity-value>",
    "fill-rule"                     : "nonzero | evenodd",
    "filter"                        : "<filter-function-list> | none",
    "fit"                           : "fill | hidden | meet | slice",
    "fit-position"                  : 1,
    "flex"                          : "<flex>",
    "flex-basis"                    : "<width>",
    "flex-direction"                : "row | row-reverse | column | column-reverse",
    "flex-flow"                     : "<flex-direction> || <flex-wrap>",
    "flex-grow"                     : "<number>",
    "flex-shrink"                   : "<number>",
    "flex-wrap"                     : "nowrap | wrap | wrap-reverse",
    "-webkit-flex"                  : "<flex>",
    "-webkit-flex-basis"            : "<width>",
    "-webkit-flex-direction"        : "row | row-reverse | column | column-reverse",
    "-webkit-flex-flow"             : "<flex-direction> || <flex-wrap>",
    "-webkit-flex-grow"             : "<number>",
    "-webkit-flex-shrink"           : "<number>",
    "-webkit-flex-wrap"             : "nowrap | wrap | wrap-reverse",
    "-ms-flex"                      : "<flex>",
    "-ms-flex-align"                : "start | end | center | stretch | baseline",
    "-ms-flex-direction"            : "row | row-reverse | column | column-reverse",
    "-ms-flex-order"                : "<number>",
    "-ms-flex-pack"                 : "start | end | center | justify",
    "-ms-flex-wrap"                 : "nowrap | wrap | wrap-reverse",
    "float"                         : "left | right | none",
    "float-offset"                  : 1,
    "flood-color"                   : 1,
    "flood-opacity"                 : "<opacity-value>",
    "font"                          : "<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar",
    "font-family"                   : "<font-family>",
    "font-feature-settings"         : "<feature-tag-value> | normal",
    "font-kerning"                  : "auto | normal | none",
    "font-size"                     : "<font-size>",
    "font-size-adjust"              : "<number> | none",
    "font-stretch"                  : "<font-stretch>",
    "font-style"                    : "<font-style>",
    "font-variant"                  : "<font-variant> | normal | none",
    "font-variant-alternates"       : "<font-variant-alternates> | normal",
    "font-variant-caps"             : "<font-variant-caps> | normal",
    "font-variant-east-asian"       : "<font-variant-east-asian> | normal",
    "font-variant-ligatures"        : "<font-variant-ligatures> | normal | none",
    "font-variant-numeric"          : "<font-variant-numeric> | normal",
    "font-variant-position"         : "normal | sub | super",
    "font-weight"                   : "<font-weight>",

    //G
    "glyph-orientation-horizontal"  : "<glyph-angle>",
    "glyph-orientation-vertical"    : "auto | <glyph-angle>",
    "grid"                          : 1,
    "grid-area"                     : 1,
    "grid-auto-columns"             : 1,
    "grid-auto-flow"                : 1,
    "grid-auto-position"            : 1,
    "grid-auto-rows"                : 1,
    "grid-cell-stacking"            : "columns | rows | layer",
    "grid-column"                   : 1,
    "grid-columns"                  : 1,
    "grid-column-align"             : "start | end | center | stretch",
    "grid-column-sizing"            : 1,
    "grid-column-start"             : 1,
    "grid-column-end"               : 1,
    "grid-column-span"              : "<integer>",
    "grid-flow"                     : "none | rows | columns",
    "grid-layer"                    : "<integer>",
    "grid-row"                      : 1,
    "grid-rows"                     : 1,
    "grid-row-align"                : "start | end | center | stretch",
    "grid-row-start"                : 1,
    "grid-row-end"                  : 1,
    "grid-row-span"                 : "<integer>",
    "grid-row-sizing"               : 1,
    "grid-template"                 : 1,
    "grid-template-areas"           : 1,
    "grid-template-columns"         : 1,
    "grid-template-rows"            : 1,

    //H
    "hanging-punctuation"           : 1,
    "height"                        : "<margin-width> | <content-sizing>",
    "hyphenate-after"               : "<integer> | auto",
    "hyphenate-before"              : "<integer> | auto",
    "hyphenate-character"           : "<string> | auto",
    "hyphenate-lines"               : "no-limit | <integer>",
    "hyphenate-resource"            : 1,
    "hyphens"                       : "none | manual | auto",

    //I
    "icon"                          : 1,
    "image-orientation"             : "angle | auto",
    "image-rendering"               : "auto | optimizeSpeed | optimizeQuality",
    "image-resolution"              : 1,
    "ime-mode"                      : "auto | normal | active | inactive | disabled",
    "inline-box-align"              : "last | <integer>",

    //J
    "justify-content"               : "flex-start | flex-end | center | space-between | space-around",
    "-webkit-justify-content"       : "flex-start | flex-end | center | space-between | space-around",

    //K
    "kerning"                       : "auto | <length>",

    //L
    "left"                          : "<margin-width>",
    "letter-spacing"                : "<length> | normal",
    "line-height"                   : "<line-height>",
    "line-break"                    : "auto | loose | normal | strict",
    "line-stacking"                 : 1,
    "line-stacking-ruby"            : "exclude-ruby | include-ruby",
    "line-stacking-shift"           : "consider-shifts | disregard-shifts",
    "line-stacking-strategy"        : "inline-line-height | block-line-height | max-height | grid-height",
    "list-style"                    : 1,
    "list-style-image"              : "<uri> | none",
    "list-style-position"           : "inside | outside",
    "list-style-type"               : "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none",

    //M
    "margin"                        : "<margin-width>{1,4}",
    "margin-bottom"                 : "<margin-width>",
    "margin-left"                   : "<margin-width>",
    "margin-right"                  : "<margin-width>",
    "margin-top"                    : "<margin-width>",
    "mark"                          : 1,
    "mark-after"                    : 1,
    "mark-before"                   : 1,
    "marker"                        : 1,
    "marker-end"                    : 1,
    "marker-mid"                    : 1,
    "marker-start"                  : 1,
    "marks"                         : 1,
    "marquee-direction"             : 1,
    "marquee-play-count"            : 1,
    "marquee-speed"                 : 1,
    "marquee-style"                 : 1,
    "mask"                          : 1,
    "max-height"                    : "<length> | <percentage> | <content-sizing> | none",
    "max-width"                     : "<length> | <percentage> | <content-sizing> | none",
    "min-height"                    : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats",
    "min-width"                     : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats",
    "move-to"                       : 1,

    //N
    "nav-down"                      : 1,
    "nav-index"                     : 1,
    "nav-left"                      : 1,
    "nav-right"                     : 1,
    "nav-up"                        : 1,

    //O
    "object-fit"                    : "fill | contain | cover | none | scale-down",
    "object-position"               : "<position>",
    "opacity"                       : "<opacity-value>",
    "order"                         : "<integer>",
    "-webkit-order"                 : "<integer>",
    "orphans"                       : "<integer>",
    "outline"                       : 1,
    "outline-color"                 : "<color> | invert",
    "outline-offset"                : 1,
    "outline-style"                 : "<border-style>",
    "outline-width"                 : "<border-width>",
    "overflow"                      : "visible | hidden | scroll | auto",
    "overflow-style"                : 1,
    "overflow-wrap"                 : "normal | break-word",
    "overflow-x"                    : 1,
    "overflow-y"                    : 1,

    //P
    "padding"                       : "<padding-width>{1,4}",
    "padding-bottom"                : "<padding-width>",
    "padding-left"                  : "<padding-width>",
    "padding-right"                 : "<padding-width>",
    "padding-top"                   : "<padding-width>",
    "page"                          : 1,
    "page-break-after"              : "auto | always | avoid | left | right",
    "page-break-before"             : "auto | always | avoid | left | right",
    "page-break-inside"             : "auto | avoid",
    "page-policy"                   : 1,
    "pause"                         : 1,
    "pause-after"                   : 1,
    "pause-before"                  : 1,
    "perspective"                   : 1,
    "perspective-origin"            : 1,
    "phonemes"                      : 1,
    "pitch"                         : 1,
    "pitch-range"                   : 1,
    "play-during"                   : 1,
    "pointer-events"                : "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all",
    "position"                      : "static | relative | absolute | fixed",
    "presentation-level"            : 1,
    "punctuation-trim"              : 1,

    //Q
    "quotes"                        : 1,

    //R
    "rendering-intent"              : 1,
    "resize"                        : 1,
    "rest"                          : 1,
    "rest-after"                    : 1,
    "rest-before"                   : 1,
    "richness"                      : 1,
    "right"                         : "<margin-width>",
    "rotation"                      : 1,
    "rotation-point"                : 1,
    "ruby-align"                    : 1,
    "ruby-overhang"                 : 1,
    "ruby-position"                 : 1,
    "ruby-span"                     : 1,

    //S
    "shape-rendering"               : "auto | optimizeSpeed | crispEdges | geometricPrecision",
    "size"                          : 1,
    "speak"                         : "normal | none | spell-out",
    "speak-header"                  : "once | always",
    "speak-numeral"                 : "digits | continuous",
    "speak-punctuation"             : "code | none",
    "speech-rate"                   : 1,
    "src"                           : 1,
    "stop-color"                    : 1,
    "stop-opacity"                  : "<opacity-value>",
    "stress"                        : 1,
    "string-set"                    : 1,
    "stroke"                        : "<paint>",
    "stroke-dasharray"              : "none | <dasharray>",
    "stroke-dashoffset"             : "<percentage> | <length>",
    "stroke-linecap"                : "butt | round | square",
    "stroke-linejoin"               : "miter | round | bevel",
    "stroke-miterlimit"             : "<miterlimit>",
    "stroke-opacity"                : "<opacity-value>",
    "stroke-width"                  : "<percentage> | <length>",

    "table-layout"                  : "auto | fixed",
    "tab-size"                      : "<integer> | <length>",
    "target"                        : 1,
    "target-name"                   : 1,
    "target-new"                    : 1,
    "target-position"               : 1,
    "text-align"                    : "left | right | center | justify | match-parent | start | end",
    "text-align-last"               : 1,
    "text-anchor"                   : "start | middle | end",
    "text-decoration"               : "<text-decoration-line> || <text-decoration-style> || <text-decoration-color>",
    "text-decoration-color"         : "<text-decoration-color>",
    "text-decoration-line"          : "<text-decoration-line>",
    "text-decoration-style"         : "<text-decoration-style>",
    "text-emphasis"                 : 1,
    "text-height"                   : 1,
    "text-indent"                   : "<length> | <percentage>",
    "text-justify"                  : "auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida",
    "text-outline"                  : 1,
    "text-overflow"                 : 1,
    "text-rendering"                : "auto | optimizeSpeed | optimizeLegibility | geometricPrecision",
    "text-shadow"                   : 1,
    "text-transform"                : "capitalize | uppercase | lowercase | none",
    "text-wrap"                     : "normal | none | avoid",
    "top"                           : "<margin-width>",
    "-ms-touch-action"              : "auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation",
    "touch-action"                  : "auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation",
    "transform"                     : 1,
    "transform-origin"              : 1,
    "transform-style"               : 1,
    "transition"                    : 1,
    "transition-delay"              : 1,
    "transition-duration"           : 1,
    "transition-property"           : 1,
    "transition-timing-function"    : 1,

    //U
    "unicode-bidi"                  : "normal | embed | isolate | bidi-override | isolate-override | plaintext",
    "user-modify"                   : "read-only | read-write | write-only",
    "user-select"                   : "none | text | toggle | element | elements | all",

    //V
    "vertical-align"                : "auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length>",
    "visibility"                    : "visible | hidden | collapse",
    "voice-balance"                 : 1,
    "voice-duration"                : 1,
    "voice-family"                  : 1,
    "voice-pitch"                   : 1,
    "voice-pitch-range"             : 1,
    "voice-rate"                    : 1,
    "voice-stress"                  : 1,
    "voice-volume"                  : 1,
    "volume"                        : 1,

    //W
    "white-space"                   : "normal | pre | nowrap | pre-wrap | pre-line | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap",   // https://perishablepress.com/wrapping-content/
    "white-space-collapse"          : 1,
    "widows"                        : "<integer>",
    "width"                         : "<length> | <percentage> | <content-sizing> | auto",
    "will-change"                   : "<will-change>",
    "word-break"                    : "normal | keep-all | break-all",
    "word-spacing"                  : "<length> | normal",
    "word-wrap"                     : "normal | break-word",
    "writing-mode"                  : "horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb",

    //Z
    "z-index"                       : "<integer> | auto",
    "zoom"                          : "<number> | <percentage> | normal"
};

},{}],3:[function(require,module,exports){
"use strict";

module.exports = Matcher;

var StringReader = require("../util/StringReader");
var SyntaxError = require("../util/SyntaxError");

/**
 * This class implements a combinator library for matcher functions.
 * The combinators are described at:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax#Component_value_combinators
 */
function Matcher(matchFunc, toString) {
    this.match = function(expression) {
        // Save/restore marks to ensure that failed matches always restore
        // the original location in the expression.
        var result;
        expression.mark();
        result = matchFunc(expression);
        if (result) {
            expression.drop();
        } else {
            expression.restore();
        }
        return result;
    };
    this.toString = typeof toString === "function" ? toString : function() {
        return toString;
    };
}

/** Precedence table of combinators. */
Matcher.prec = {
    MOD:    5,
    SEQ:    4,
    ANDAND: 3,
    OROR:   2,
    ALT:    1
};

/** Simple recursive-descent grammar to build matchers from strings. */
Matcher.parse = function(str) {
    var reader, eat, expr, oror, andand, seq, mod, term, result;
    reader = new StringReader(str);
    eat = function(matcher) {
        var result = reader.readMatch(matcher);
        if (result === null) {
            throw new SyntaxError(
                "Expected "+matcher, reader.getLine(), reader.getCol());
        }
        return result;
    };
    expr = function() {
        // expr = oror (" | " oror)*
        var m = [ oror() ];
        while (reader.readMatch(" | ") !== null) {
            m.push(oror());
        }
        return m.length === 1 ? m[0] : Matcher.alt.apply(Matcher, m);
    };
    oror = function() {
        // oror = andand ( " || " andand)*
        var m = [ andand() ];
        while (reader.readMatch(" || ") !== null) {
            m.push(andand());
        }
        return m.length === 1 ? m[0] : Matcher.oror.apply(Matcher, m);
    };
    andand = function() {
        // andand = seq ( " && " seq)*
        var m = [ seq() ];
        while (reader.readMatch(" && ") !== null) {
            m.push(seq());
        }
        return m.length === 1 ? m[0] : Matcher.andand.apply(Matcher, m);
    };
    seq = function() {
        // seq = mod ( " " mod)*
        var m = [ mod() ];
        while (reader.readMatch(/^ (?![&|\]])/) !== null) {
            m.push(mod());
        }
        return m.length === 1 ? m[0] : Matcher.seq.apply(Matcher, m);
    };
    mod = function() {
        // mod = term ( "?" | "*" | "+" | "#" | "{<num>,<num>}" )?
        var m = term();
        if (reader.readMatch("?") !== null) {
            return m.question();
        } else if (reader.readMatch("*") !== null) {
            return m.star();
        } else if (reader.readMatch("+") !== null) {
            return m.plus();
        } else if (reader.readMatch("#") !== null) {
            return m.hash();
        } else if (reader.readMatch(/^\{\s*/) !== null) {
            var min = eat(/^\d+/);
            eat(/^\s*,\s*/);
            var max = eat(/^\d+/);
            eat(/^\s*\}/);
            return m.braces(+min, +max);
        }
        return m;
    };
    term = function() {
        // term = <nt> | literal | "[ " expression " ]"
        if (reader.readMatch("[ ") !== null) {
            var m = expr();
            eat(" ]");
            return m;
        }
        return Matcher.fromType(eat(/^[^ ?*+#{]+/));
    };
    result = expr();
    if (!reader.eof()) {
        throw new SyntaxError(
            "Expected end of string", reader.getLine(), reader.getCol());
    }
    return result;
};

/**
 * Convert a string to a matcher (parsing simple alternations),
 * or do nothing if the argument is already a matcher.
 */
Matcher.cast = function(m) {
    if (m instanceof Matcher) {
        return m;
    }
    return Matcher.parse(m);
};

/**
 * Create a matcher for a single type.
 */
Matcher.fromType = function(type) {
    // Late require of ValidationTypes to break a dependency cycle.
    var ValidationTypes = require("./ValidationTypes");
    return new Matcher(function(expression) {
        return expression.hasNext() && ValidationTypes.isType(expression, type);
    }, type);
};

/**
 * Create a matcher for one or more juxtaposed words, which all must
 * occur, in the given order.
 */
Matcher.seq = function() {
    var ms = Array.prototype.slice.call(arguments).map(Matcher.cast);
    if (ms.length === 1) {
        return ms[0];
    }
    return new Matcher(function(expression) {
        var i, result = true;
        for (i = 0; result && i < ms.length; i++) {
            result = ms[i].match(expression);
        }
        return result;
    }, function(prec) {
        var p = Matcher.prec.SEQ;
        var s = ms.map(function(m) {
            return m.toString(p);
        }).join(" ");
        if (prec > p) {
            s = "[ " + s + " ]";
        }
        return s;
    });
};

/**
 * Create a matcher for one or more alternatives, where exactly one
 * must occur.
 */
Matcher.alt = function() {
    var ms = Array.prototype.slice.call(arguments).map(Matcher.cast);
    if (ms.length === 1) {
        return ms[0];
    }
    return new Matcher(function(expression) {
        var i, result = false;
        for (i = 0; !result && i < ms.length; i++) {
            result = ms[i].match(expression);
        }
        return result;
    }, function(prec) {
        var p = Matcher.prec.ALT;
        var s = ms.map(function(m) {
            return m.toString(p);
        }).join(" | ");
        if (prec > p) {
            s = "[ " + s + " ]";
        }
        return s;
    });
};

/**
 * Create a matcher for two or more options.  This implements the
 * double bar (||) and double ampersand (&&) operators, as well as
 * variants of && where some of the alternatives are optional.
 * This will backtrack through even successful matches to try to
 * maximize the number of items matched.
 */
Matcher.many = function(required) {
    var ms = Array.prototype.slice.call(arguments, 1).reduce(function(acc, v) {
        if (v.expand) {
            // Insert all of the options for the given complex rule as
            // individual options.
            var ValidationTypes = require("./ValidationTypes");
            acc.push.apply(acc, ValidationTypes.complex[v.expand].options);
        } else {
            acc.push(Matcher.cast(v));
        }
        return acc;
    }, []);

    if (required === true) {
        required = ms.map(function() {
            return true;
        });
    }

    var result = new Matcher(function(expression) {
        var seen = [], max = 0, pass = 0;
        var success = function(matchCount) {
            if (pass === 0) {
                max = Math.max(matchCount, max);
                return matchCount === ms.length;
            } else {
                return matchCount === max;
            }
        };
        var tryMatch = function(matchCount) {
            for (var i = 0; i < ms.length; i++) {
                if (seen[i]) {
                    continue;
                }
                expression.mark();
                if (ms[i].match(expression)) {
                    seen[i] = true;
                    // Increase matchCount iff this was a required element
                    // (or if all the elements are optional)
                    if (tryMatch(matchCount + ((required === false || required[i]) ? 1 : 0))) {
                        expression.drop();
                        return true;
                    }
                    // Backtrack: try *not* matching using this rule, and
                    // let's see if it leads to a better overall match.
                    expression.restore();
                    seen[i] = false;
                } else {
                    expression.drop();
                }
            }
            return success(matchCount);
        };
        if (!tryMatch(0)) {
            // Couldn't get a complete match, retrace our steps to make the
            // match with the maximum # of required elements.
            pass++;
            tryMatch(0);
        }

        if (required === false) {
            return max > 0;
        }
        // Use finer-grained specification of which matchers are required.
        for (var i = 0; i < ms.length; i++) {
            if (required[i] && !seen[i]) {
                return false;
            }
        }
        return true;
    }, function(prec) {
        var p = required === false ? Matcher.prec.OROR : Matcher.prec.ANDAND;
        var s = ms.map(function(m, i) {
            if (required !== false && !required[i]) {
                return m.toString(Matcher.prec.MOD) + "?";
            }
            return m.toString(p);
        }).join(required === false ? " || " : " && ");
        if (prec > p) {
            s = "[ " + s + " ]";
        }
        return s;
    });
    result.options = ms;
    return result;
};

/**
 * Create a matcher for two or more options, where all options are
 * mandatory but they may appear in any order.
 */
Matcher.andand = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(true);
    return Matcher.many.apply(Matcher, args);
};

/**
 * Create a matcher for two or more options, where options are
 * optional and may appear in any order, but at least one must be
 * present.
 */
Matcher.oror = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(false);
    return Matcher.many.apply(Matcher, args);
};

/** Instance methods on Matchers. */
Matcher.prototype = {
    constructor: Matcher,
    // These are expected to be overridden in every instance.
    match: function() { throw new Error("unimplemented"); },
    toString: function() { throw new Error("unimplemented"); },
    // This returns a standalone function to do the matching.
    func: function() { return this.match.bind(this); },
    // Basic combinators
    then: function(m) { return Matcher.seq(this, m); },
    or: function(m) { return Matcher.alt(this, m); },
    andand: function(m) { return Matcher.many(true, this, m); },
    oror: function(m) { return Matcher.many(false, this, m); },
    // Component value multipliers
    star: function() { return this.braces(0, Infinity, "*"); },
    plus: function() { return this.braces(1, Infinity, "+"); },
    question: function() { return this.braces(0, 1, "?"); },
    hash: function() {
        return this.braces(1, Infinity, "#", Matcher.cast(","));
    },
    braces: function(min, max, marker, optSep) {
        var m1 = this, m2 = optSep ? optSep.then(this) : this;
        if (!marker) {
            marker = "{" + min + "," + max + "}";
        }
        return new Matcher(function(expression) {
            var result = true, i;
            for (i = 0; i < max; i++) {
                if (i > 0 && optSep) {
                    result = m2.match(expression);
                } else {
                    result = m1.match(expression);
                }
                if (!result) {
                    break;
                }
            }
            return i >= min;
        }, function() {
            return m1.toString(Matcher.prec.MOD) + marker;
        });
    }
};

},{"../util/StringReader":24,"../util/SyntaxError":25,"./ValidationTypes":21}],21:[function(require,module,exports){
"use strict";

var ValidationTypes = module.exports;

var Matcher = require("./Matcher");

function copy(to, from) {
    Object.keys(from).forEach(function(prop) {
        to[prop] = from[prop];
    });
}
copy(ValidationTypes, {

    isLiteral: function (part, literals) {
        var text = part.text.toString().toLowerCase(),
            args = literals.split(" | "),
            i, len, found = false;

        for (i=0, len=args.length; i < len && !found; i++) {
            if (args[i].charAt(0) === "<") {
                found = this.simple[args[i]](part);
            } else if (args[i].slice(-2) === "()") {
                found = (part.type === "function" &&
                         part.name === args[i].slice(0, -2));
            } else if (text === args[i].toLowerCase()) {
                found = true;
            }
        }

        return found;
    },

    isSimple: function(type) {
        return Boolean(this.simple[type]);
    },

    isComplex: function(type) {
        return Boolean(this.complex[type]);
    },

    describe: function(type) {
        if (this.complex[type] instanceof Matcher) {
            return this.complex[type].toString(0);
        }
        return type;
    },

    /**
     * Determines if the next part(s) of the given expression
     * are any of the given types.
     */
    isAny: function (expression, types) {
        var args = types.split(" | "),
            i, len, found = false;

        for (i=0, len=args.length; i < len && !found && expression.hasNext(); i++) {
            found = this.isType(expression, args[i]);
        }

        return found;
    },

    /**
     * Determines if the next part(s) of the given expression
     * are one of a group.
     */
    isAnyOfGroup: function(expression, types) {
        var args = types.split(" || "),
            i, len, found = false;

        for (i=0, len=args.length; i < len && !found; i++) {
            found = this.isType(expression, args[i]);
        }

        return found ? args[i-1] : false;
    },

    /**
     * Determines if the next part(s) of the given expression
     * are of a given type.
     */
    isType: function (expression, type) {
        var part = expression.peek(),
            result = false;

        if (type.charAt(0) !== "<") {
            result = this.isLiteral(part, type);
            if (result) {
                expression.next();
            }
        } else if (this.simple[type]) {
            result = this.simple[type](part);
            if (result) {
                expression.next();
            }
        } else if (this.complex[type] instanceof Matcher) {
            result = this.complex[type].match(expression);
        } else {
            result = this.complex[type](expression);
        }

        return result;
    },


    simple: {
        __proto__: null,

        "<absolute-size>":
            "xx-small | x-small | small | medium | large | x-large | xx-large",

        "<animateable-feature>":
            "scroll-position | contents | <animateable-feature-name>",

        "<animateable-feature-name>": function(part) {
            return this["<ident>"](part) &&
                !/^(unset|initial|inherit|will-change|auto|scroll-position|contents)$/i.test(part);
        },

        "<angle>": function(part) {
            return part.type === "angle";
        },

        "<attachment>": "scroll | fixed | local",

        "<attr>": "attr()",

        // inset() = inset( <shape-arg>{1,4} [round <border-radius>]? )
        // circle() = circle( [<shape-radius>]? [at <position>]? )
        // ellipse() = ellipse( [<shape-radius>{2}]? [at <position>]? )
        // polygon() = polygon( [<fill-rule>,]? [<shape-arg> <shape-arg>]# )
        "<basic-shape>": "inset() | circle() | ellipse() | polygon()",

        "<bg-image>": "<image> | <gradient> | none",

        "<border-style>":
            "none | hidden | dotted | dashed | solid | double | groove | " +
            "ridge | inset | outset",

        "<border-width>": "<length> | thin | medium | thick",

        "<box>": "padding-box | border-box | content-box",

        "<clip-source>": "<uri>",

        "<color>": function(part) {
            return part.type === "color" || String(part) === "transparent" || String(part) === "currentColor";
        },

        // The SVG <color> spec doesn't include "currentColor" or "transparent" as a color.
        "<color-svg>": function(part) {
            return part.type === "color";
        },

        "<content>": "content()",

        // https://www.w3.org/TR/css3-sizing/#width-height-keywords
        "<content-sizing>":
            "fill-available | -moz-available | -webkit-fill-available | " +
            "max-content | -moz-max-content | -webkit-max-content | " +
            "min-content | -moz-min-content | -webkit-min-content | " +
            "fit-content | -moz-fit-content | -webkit-fit-content",

        "<feature-tag-value>": function(part) {
            return part.type === "function" && /^[A-Z0-9]{4}$/i.test(part);
        },

        // custom() isn't actually in the spec
        "<filter-function>":
            "blur() | brightness() | contrast() | custom() | " +
            "drop-shadow() | grayscale() | hue-rotate() | invert() | " +
            "opacity() | saturate() | sepia()",

        "<flex-basis>": "<width>",

        "<flex-direction>": "row | row-reverse | column | column-reverse",

        "<flex-grow>": "<number>",

        "<flex-shrink>": "<number>",

        "<flex-wrap>": "nowrap | wrap | wrap-reverse",

        "<font-size>":
            "<absolute-size> | <relative-size> | <length> | <percentage>",

        "<font-stretch>":
            "normal | ultra-condensed | extra-condensed | condensed | " +
            "semi-condensed | semi-expanded | expanded | extra-expanded | " +
            "ultra-expanded",

        "<font-style>": "normal | italic | oblique",

        "<font-variant-caps>":
            "small-caps | all-small-caps | petite-caps | all-petite-caps | " +
            "unicase | titling-caps",

        "<font-variant-css21>": "normal | small-caps",

        "<font-weight>":
            "normal | bold | bolder | lighter | " +
            "100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900",

        "<generic-family>":
            "serif | sans-serif | cursive | fantasy | monospace",

        "<geometry-box>": "<shape-box> | fill-box | stroke-box | view-box",

        "<glyph-angle>": function(part) {
            return part.type === "angle" && part.units === "deg";
        },

        "<gradient>": function(part) {
            return part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?(?:repeating\-)?(?:radial\-|linear\-)?gradient/i.test(part);
        },

        "<icccolor>":
            "cielab() | cielch() | cielchab() | " +
            "icc-color() | icc-named-color()",

        //any identifier
        "<ident>": function(part) {
            return part.type === "identifier" || part.wasIdent;
        },

        "<ident-not-generic-family>": function(part) {
            return this["<ident>"](part) && !this["<generic-family>"](part);
        },

        "<image>": "<uri>",

        "<integer>": function(part) {
            return part.type === "integer";
        },

        "<length>": function(part) {
            if (part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?calc/i.test(part)) {
                return true;
            } else {
                return part.type === "length" || part.type === "number" || part.type === "integer" || String(part) === "0";
            }
        },

        "<line>": function(part) {
            return part.type === "integer";
        },

        "<line-height>": "<number> | <length> | <percentage> | normal",

        "<margin-width>": "<length> | <percentage> | auto",

        "<miterlimit>": function(part) {
            return this["<number>"](part) && part.value >= 1;
        },

        "<nonnegative-length-or-percentage>": function(part) {
            return (this["<length>"](part) || this["<percentage>"](part)) &&
                (String(part) === "0" || part.type === "function" || (part.value) >= 0);
        },

        "<nonnegative-number-or-percentage>": function(part) {
            return (this["<number>"](part) || this["<percentage>"](part)) &&
                (String(part) === "0" || part.type === "function" || (part.value) >= 0);
        },

        "<number>": function(part) {
            return part.type === "number" || this["<integer>"](part);
        },

        "<opacity-value>": function(part) {
            return this["<number>"](part) && part.value >= 0 && part.value <= 1;
        },

        "<padding-width>": "<nonnegative-length-or-percentage>",

        "<percentage>": function(part) {
            return part.type === "percentage" || String(part) === "0";
        },

        "<relative-size>": "smaller | larger",

        "<shape>": "rect() | inset-rect()",

        "<shape-box>": "<box> | margin-box",

        "<single-animation-direction>":
            "normal | reverse | alternate | alternate-reverse",

        "<single-animation-name>": function(part) {
            return this["<ident>"](part) &&
                /^-?[a-z_][-a-z0-9_]+$/i.test(part) &&
                !/^(none|unset|initial|inherit)$/i.test(part);
        },

        "<string>": function(part) {
            return part.type === "string";
        },

        "<time>": function(part) {
            return part.type === "time";
        },

        "<uri>": function(part) {
            return part.type === "uri";
        },

        "<width>": "<margin-width>"
    },

    complex: {
        __proto__: null,

        "<azimuth>":
            "<angle>" +
            " | " +
            "[ [ left-side | far-left | left | center-left | center | " +
            "center-right | right | far-right | right-side ] || behind ]" +
            " | "+
            "leftwards | rightwards",

        "<bg-position>": "<position>#",

        "<bg-size>":
            "[ <length> | <percentage> | auto ]{1,2} | cover | contain",

        "<border-image-slice>":
        // [<number> | <percentage>]{1,4} && fill?
        // *but* fill can appear between any of the numbers
        Matcher.many([true /* first element is required */],
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     "fill"),

        "<border-radius>":
            "<nonnegative-length-or-percentage>{1,4} " +
            "[ / <nonnegative-length-or-percentage>{1,4} ]?",

        "<box-shadow>": "none | <shadow>#",

        "<clip-path>": "<basic-shape> || <geometry-box>",

        "<dasharray>":
        // "list of comma and/or white space separated <length>s and
        // <percentage>s".  There is a non-negative constraint.
        Matcher.cast("<nonnegative-length-or-percentage>")
            .braces(1, Infinity, "#", Matcher.cast(",").question()),

        "<family-name>":
            // <string> | <IDENT>+
            "<string> | <ident-not-generic-family> <ident>*",

        "<filter-function-list>": "[ <filter-function> | <uri> ]+",

        // https://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-property
        "<flex>":
            "none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]",

        "<font-family>": "[ <generic-family> | <family-name> ]#",

        "<font-shorthand>":
            "[ <font-style> || <font-variant-css21> || " +
            "<font-weight> || <font-stretch> ]? <font-size> " +
            "[ / <line-height> ]? <font-family>",

        "<font-variant-alternates>":
            // stylistic(<feature-value-name>)
            "stylistic() || " +
            "historical-forms || " +
            // styleset(<feature-value-name> #)
            "styleset() || " +
            // character-variant(<feature-value-name> #)
            "character-variant() || " +
            // swash(<feature-value-name>)
            "swash() || " +
            // ornaments(<feature-value-name>)
            "ornaments() || " +
            // annotation(<feature-value-name>)
            "annotation()",

        "<font-variant-ligatures>":
            // <common-lig-values>
            "[ common-ligatures | no-common-ligatures ] || " +
            // <discretionary-lig-values>
            "[ discretionary-ligatures | no-discretionary-ligatures ] || " +
            // <historical-lig-values>
            "[ historical-ligatures | no-historical-ligatures ] || " +
            // <contextual-alt-values>
            "[ contextual | no-contextual ]",

        "<font-variant-numeric>":
            // <numeric-figure-values>
            "[ lining-nums | oldstyle-nums ] || " +
            // <numeric-spacing-values>
            "[ proportional-nums | tabular-nums ] || " +
            // <numeric-fraction-values>
            "[ diagonal-fractions | stacked-fractions ] || " +
            "ordinal || slashed-zero",

        "<font-variant-east-asian>":
            // <east-asian-variant-values>
            "[ jis78 | jis83 | jis90 | jis04 | simplified | traditional ] || " +
            // <east-asian-width-values>
            "[ full-width | proportional-width ] || " +
            "ruby",

        // Note that <color> here is "as defined in the SVG spec", which
        // is more restrictive that the <color> defined in the CSS spec.
        // none | currentColor | <color> [<icccolor>]? |
        // <funciri> [ none | currentColor | <color> [<icccolor>]? ]?
        "<paint>": "<paint-basic> | <uri> <paint-basic>?",

        // Helper definition for <paint> above.
        "<paint-basic>": "none | currentColor | <color-svg> <icccolor>?",

        "<position>":
            // Because our `alt` combinator is ordered, we need to test these
            // in order from longest possible match to shortest.
            "[ center | [ left | right ] [ <percentage> | <length> ]? ] && " +
            "[ center | [ top | bottom ] [ <percentage> | <length> ]? ]" +
            " | " +
            "[ left | center | right | <percentage> | <length> ] " +
            "[ top | center | bottom | <percentage> | <length> ]" +
            " | " +
            "[ left | center | right | top | bottom | <percentage> | <length> ]",

        "<repeat-style>":
            "repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2}",

        "<shadow>":
        //inset? && [ <length>{2,4} && <color>? ]
        Matcher.many([true /* length is required */],
                     Matcher.cast("<length>").braces(2, 4), "inset", "<color>"),

        "<text-decoration-color>":
           "<color>",

        "<text-decoration-line>":
            "none | [ underline || overline || line-through || blink ]",

        "<text-decoration-style>":
            "solid | double | dotted | dashed | wavy",

        "<will-change>":
            "auto | <animateable-feature>#",

        "<x-one-radius>":
            //[ <length> | <percentage> ] [ <length> | <percentage> ]?
            "[ <length> | <percentage> ]{1,2}"
    }
});

Object.keys(ValidationTypes.simple).forEach(function(nt) {
    var rule = ValidationTypes.simple[nt];
    if (typeof rule === "string") {
        ValidationTypes.simple[nt] = function(part) {
            return ValidationTypes.isLiteral(part, rule);
        };
    }
});

Object.keys(ValidationTypes.complex).forEach(function(nt) {
    var rule = ValidationTypes.complex[nt];
    if (typeof rule === "string") {
        ValidationTypes.complex[nt] = Matcher.parse(rule);
    }
});

// Because this is defined relative to other complex validation types,
// we need to define it *after* the rest of the types are initialized.
ValidationTypes.complex["<font-variant>"] =
    Matcher.oror({ expand: "<font-variant-ligatures>" },
                 { expand: "<font-variant-alternates>" },
                 "<font-variant-caps>",
                 { expand: "<font-variant-numeric>" },
                 { expand: "<font-variant-east-asian>" });

},{"./Matcher":3}],17:[function(require,module,exports){
"use strict";

module.exports = TokenStream;

var TokenStreamBase = require("../util/TokenStreamBase");

var PropertyValuePart = require("./PropertyValuePart");
var Tokens = require("./Tokens");

var h = /^[0-9a-fA-F]$/,
    nonascii = /^[\u00A0-\uFFFF]$/,
    nl = /\n|\r\n|\r|\f/,
    whitespace = /\u0009|\u000a|\u000c|\u000d|\u0020/;

//-----------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------


function isHexDigit(c) {
    return c !== null && h.test(c);
}

function isDigit(c) {
    return c !== null && /\d/.test(c);
}

function isWhitespace(c) {
    return c !== null && whitespace.test(c);
}

function isNewLine(c) {
    return c !== null && nl.test(c);
}

function isNameStart(c) {
    return c !== null && /[a-z_\u00A0-\uFFFF\\]/i.test(c);
}

function isNameChar(c) {
    return c !== null && (isNameStart(c) || /[0-9\-\\]/.test(c));
}

function isIdentStart(c) {
    return c !== null && (isNameStart(c) || /\-\\/.test(c));
}

function mix(receiver, supplier) {
    for (var prop in supplier) {
        if (Object.prototype.hasOwnProperty.call(supplier, prop)) {
            receiver[prop] = supplier[prop];
        }
    }
    return receiver;
}

//-----------------------------------------------------------------------------
// CSS Token Stream
//-----------------------------------------------------------------------------


/**
 * A token stream that produces CSS tokens.
 * @param {String|Reader} input The source of text to tokenize.
 * @constructor
 * @class TokenStream
 * @namespace parserlib.css
 */
function TokenStream(input) {
    TokenStreamBase.call(this, input, Tokens);
}

TokenStream.prototype = mix(new TokenStreamBase(), {

    /**
     * Overrides the TokenStreamBase method of the same name
     * to produce CSS tokens.
     * @return {Object} A token object representing the next token.
     * @method _getToken
     * @private
     */
    _getToken: function() {

        var c,
            reader = this._reader,
            token   = null,
            startLine   = reader.getLine(),
            startCol    = reader.getCol();

        c = reader.read();


        while (c) {
            switch (c) {

                /*
                 * Potential tokens:
                 * - COMMENT
                 * - SLASH
                 * - CHAR
                 */
                case "/":

                    if (reader.peek() === "*") {
                        token = this.commentToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - DASHMATCH
                 * - INCLUDES
                 * - PREFIXMATCH
                 * - SUFFIXMATCH
                 * - SUBSTRINGMATCH
                 * - CHAR
                 */
                case "|":
                case "~":
                case "^":
                case "$":
                case "*":
                    if (reader.peek() === "=") {
                        token = this.comparisonToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - STRING
                 * - INVALID
                 */
                case "\"":
                case "'":
                    token = this.stringToken(c, startLine, startCol);
                    break;

                /*
                 * Potential tokens:
                 * - HASH
                 * - CHAR
                 */
                case "#":
                    if (isNameChar(reader.peek())) {
                        token = this.hashToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - DOT
                 * - NUMBER
                 * - DIMENSION
                 * - PERCENTAGE
                 */
                case ".":
                    if (isDigit(reader.peek())) {
                        token = this.numberToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - CDC
                 * - MINUS
                 * - NUMBER
                 * - DIMENSION
                 * - PERCENTAGE
                 */
                case "-":
                    if (reader.peek() === "-") {  //could be closing HTML-style comment
                        token = this.htmlCommentEndToken(c, startLine, startCol);
                    } else if (isNameStart(reader.peek())) {
                        token = this.identOrFunctionToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - IMPORTANT_SYM
                 * - CHAR
                 */
                case "!":
                    token = this.importantToken(c, startLine, startCol);
                    break;

                /*
                 * Any at-keyword or CHAR
                 */
                case "@":
                    token = this.atRuleToken(c, startLine, startCol);
                    break;

                /*
                 * Potential tokens:
                 * - NOT
                 * - CHAR
                 */
                case ":":
                    token = this.notToken(c, startLine, startCol);
                    break;

                /*
                 * Potential tokens:
                 * - CDO
                 * - CHAR
                 */
                case "<":
                    token = this.htmlCommentStartToken(c, startLine, startCol);
                    break;

                /*
                 * Potential tokens:
                 * - IDENT
                 * - CHAR
                 */
                case "\\":
                    if (/[^\r\n\f]/.test(reader.peek())) {
                        token = this.identOrFunctionToken(this.readEscape(c, true), startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;

                /*
                 * Potential tokens:
                 * - UNICODE_RANGE
                 * - URL
                 * - CHAR
                 */
                case "U":
                case "u":
                    if (reader.peek() === "+") {
                        token = this.unicodeRangeToken(c, startLine, startCol);
                        break;
                    }
                    /* falls through */
                default:

                    /*
                     * Potential tokens:
                     * - NUMBER
                     * - DIMENSION
                     * - LENGTH
                     * - FREQ
                     * - TIME
                     * - EMS
                     * - EXS
                     * - ANGLE
                     */
                    if (isDigit(c)) {
                        token = this.numberToken(c, startLine, startCol);
                    } else

                    /*
                     * Potential tokens:
                     * - S
                     */
                    if (isWhitespace(c)) {
                        token = this.whitespaceToken(c, startLine, startCol);
                    } else

                    /*
                     * Potential tokens:
                     * - IDENT
                     */
                    if (isIdentStart(c)) {
                        token = this.identOrFunctionToken(c, startLine, startCol);
                    } else {
                       /*
                        * Potential tokens:
                        * - CHAR
                        * - PLUS
                        */
                        token = this.charToken(c, startLine, startCol);
                    }

            }

            //make sure this token is wanted
            //TODO: check channel
            break;
        }

        if (!token && c === null) {
            token = this.createToken(Tokens.EOF, null, startLine, startCol);
        }

        return token;
    },

    //-------------------------------------------------------------------------
    // Methods to create tokens
    //-------------------------------------------------------------------------

    /**
     * Produces a token based on available data and the current
     * reader position information. This method is called by other
     * private methods to create tokens and is never called directly.
     * @param {int} tt The token type.
     * @param {String} value The text value of the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @param {Object} options (Optional) Specifies a channel property
     *      to indicate that a different channel should be scanned
     *      and/or a hide property indicating that the token should
     *      be hidden.
     * @return {Object} A token object.
     * @method createToken
     */
    createToken: function(tt, value, startLine, startCol, options) {
        var reader = this._reader;
        options = options || {};

        return {
            value:      value,
            type:       tt,
            channel:    options.channel,
            endChar:    options.endChar,
            hide:       options.hide || false,
            startLine:  startLine,
            startCol:   startCol,
            endLine:    reader.getLine(),
            endCol:     reader.getCol()
        };
    },

    //-------------------------------------------------------------------------
    // Methods to create specific tokens
    //-------------------------------------------------------------------------

    /**
     * Produces a token for any at-rule. If the at-rule is unknown, then
     * the token is for a single "@" character.
     * @param {String} first The first character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method atRuleToken
     */
    atRuleToken: function(first, startLine, startCol) {
        var rule    = first,
            reader  = this._reader,
            tt      = Tokens.CHAR,
            ident;

        /*
         * First, mark where we are. There are only four @ rules,
         * so anything else is really just an invalid token.
         * Basically, if this doesn't match one of the known @
         * rules, just return '@' as an unknown token and allow
         * parsing to continue after that point.
         */
        reader.mark();

        //try to find the at-keyword
        ident = this.readName();
        rule = first + ident;
        tt = Tokens.type(rule.toLowerCase());

        //if it's not valid, use the first character only and reset the reader
        if (tt === Tokens.CHAR || tt === Tokens.UNKNOWN) {
            if (rule.length > 1) {
                tt = Tokens.UNKNOWN_SYM;
            } else {
                tt = Tokens.CHAR;
                rule = first;
                reader.reset();
            }
        }

        return this.createToken(tt, rule, startLine, startCol);
    },

    /**
     * Produces a character token based on the given character
     * and location in the stream. If there's a special (non-standard)
     * token name, this is used; otherwise CHAR is used.
     * @param {String} c The character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method charToken
     */
    charToken: function(c, startLine, startCol) {
        var tt = Tokens.type(c);
        var opts = {};

        if (tt === -1) {
            tt = Tokens.CHAR;
        } else {
            opts.endChar = Tokens[tt].endChar;
        }

        return this.createToken(tt, c, startLine, startCol, opts);
    },

    /**
     * Produces a character token based on the given character
     * and location in the stream. If there's a special (non-standard)
     * token name, this is used; otherwise CHAR is used.
     * @param {String} first The first character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method commentToken
     */
    commentToken: function(first, startLine, startCol) {
        var comment = this.readComment(first);

        return this.createToken(Tokens.COMMENT, comment, startLine, startCol);
    },

    /**
     * Produces a comparison token based on the given character
     * and location in the stream. The next character must be
     * read and is already known to be an equals sign.
     * @param {String} c The character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method comparisonToken
     */
    comparisonToken: function(c, startLine, startCol) {
        var reader  = this._reader,
            comparison  = c + reader.read(),
            tt      = Tokens.type(comparison) || Tokens.CHAR;

        return this.createToken(tt, comparison, startLine, startCol);
    },

    /**
     * Produces a hash token based on the specified information. The
     * first character provided is the pound sign (#) and then this
     * method reads a name afterward.
     * @param {String} first The first character (#) in the hash name.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method hashToken
     */
    hashToken: function(first, startLine, startCol) {
        var name    = this.readName(first);

        return this.createToken(Tokens.HASH, name, startLine, startCol);
    },

    /**
     * Produces a CDO or CHAR token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method htmlCommentStartToken
     */
    htmlCommentStartToken: function(first, startLine, startCol) {
        var reader      = this._reader,
            text        = first;

        reader.mark();
        text += reader.readCount(3);

        if (text === "<!--") {
            return this.createToken(Tokens.CDO, text, startLine, startCol);
        } else {
            reader.reset();
            return this.charToken(first, startLine, startCol);
        }
    },

    /**
     * Produces a CDC or CHAR token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method htmlCommentEndToken
     */
    htmlCommentEndToken: function(first, startLine, startCol) {
        var reader      = this._reader,
            text        = first;

        reader.mark();
        text += reader.readCount(2);

        if (text === "-->") {
            return this.createToken(Tokens.CDC, text, startLine, startCol);
        } else {
            reader.reset();
            return this.charToken(first, startLine, startCol);
        }
    },

    /**
     * Produces an IDENT or FUNCTION token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the identifier.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method identOrFunctionToken
     */
    identOrFunctionToken: function(first, startLine, startCol) {
        var reader  = this._reader,
            ident   = this.readName(first),
            tt      = Tokens.IDENT,
            uriFns  = ["url(", "url-prefix(", "domain("],
            uri;

        //if there's a left paren immediately after, it's a URI or function
        if (reader.peek() === "(") {
            ident += reader.read();
            if (uriFns.indexOf(ident.toLowerCase()) > -1) {
                reader.mark();
                uri = this.readURI(ident);
                if (uri === null) {
                    //didn't find a valid URL or there's no closing paren
                    reader.reset();
                    tt = Tokens.FUNCTION;
                } else {
                    tt = Tokens.URI;
                    ident = uri;
                }
            } else {
                tt = Tokens.FUNCTION;
            }
        } else if (reader.peek() === ":") {  //might be an IE function

            //IE-specific functions always being with progid:
            if (ident.toLowerCase() === "progid") {
                ident += reader.readTo("(");
                tt = Tokens.IE_FUNCTION;
            }
        }

        return this.createToken(tt, ident, startLine, startCol);
    },

    /**
     * Produces an IMPORTANT_SYM or CHAR token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method importantToken
     */
    importantToken: function(first, startLine, startCol) {
        var reader      = this._reader,
            important   = first,
            tt          = Tokens.CHAR,
            temp,
            c;

        reader.mark();
        c = reader.read();

        while (c) {

            //there can be a comment in here
            if (c === "/") {

                //if the next character isn't a star, then this isn't a valid !important token
                if (reader.peek() !== "*") {
                    break;
                } else {
                    temp = this.readComment(c);
                    if (temp === "") {    //broken!
                        break;
                    }
                }
            } else if (isWhitespace(c)) {
                important += c + this.readWhitespace();
            } else if (/i/i.test(c)) {
                temp = reader.readCount(8);
                if (/mportant/i.test(temp)) {
                    important += c + temp;
                    tt = Tokens.IMPORTANT_SYM;

                }
                break;  //we're done
            } else {
                break;
            }

            c = reader.read();
        }

        if (tt === Tokens.CHAR) {
            reader.reset();
            return this.charToken(first, startLine, startCol);
        } else {
            return this.createToken(tt, important, startLine, startCol);
        }


    },

    /**
     * Produces a NOT or CHAR token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method notToken
     */
    notToken: function(first, startLine, startCol) {
        var reader      = this._reader,
            text        = first;

        reader.mark();
        text += reader.readCount(4);

        if (text.toLowerCase() === ":not(") {
            return this.createToken(Tokens.NOT, text, startLine, startCol);
        } else {
            reader.reset();
            return this.charToken(first, startLine, startCol);
        }
    },

    /**
     * Produces a number token based on the given character
     * and location in the stream. This may return a token of
     * NUMBER, EMS, EXS, LENGTH, ANGLE, TIME, FREQ, DIMENSION,
     * or PERCENTAGE.
     * @param {String} first The first character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method numberToken
     */
    numberToken: function(first, startLine, startCol) {
        var reader  = this._reader,
            value   = this.readNumber(first),
            ident,
            tt      = Tokens.NUMBER,
            c       = reader.peek();

        if (isIdentStart(c)) {
            ident = this.readName(reader.read());
            value += ident;

            if (/^em$|^ex$|^px$|^gd$|^rem$|^vw$|^vh$|^vmax$|^vmin$|^ch$|^cm$|^mm$|^in$|^pt$|^pc$/i.test(ident)) {
                tt = Tokens.LENGTH;
            } else if (/^deg|^rad$|^grad$|^turn$/i.test(ident)) {
                tt = Tokens.ANGLE;
            } else if (/^ms$|^s$/i.test(ident)) {
                tt = Tokens.TIME;
            } else if (/^hz$|^khz$/i.test(ident)) {
                tt = Tokens.FREQ;
            } else if (/^dpi$|^dpcm$/i.test(ident)) {
                tt = Tokens.RESOLUTION;
            } else {
                tt = Tokens.DIMENSION;
            }

        } else if (c === "%") {
            value += reader.read();
            tt = Tokens.PERCENTAGE;
        }

        return this.createToken(tt, value, startLine, startCol);
    },

    /**
     * Produces a string token based on the given character
     * and location in the stream. Since strings may be indicated
     * by single or double quotes, a failure to match starting
     * and ending quotes results in an INVALID token being generated.
     * The first character in the string is passed in and then
     * the rest are read up to and including the final quotation mark.
     * @param {String} first The first character in the string.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method stringToken
     */
    stringToken: function(first, startLine, startCol) {
        var delim   = first,
            string  = first,
            reader  = this._reader,
            tt      = Tokens.STRING,
            c       = reader.read(),
            i;

        while (c) {
            string += c;

            if (c === "\\") {
                c = reader.read();
                if (c === null) {
                    break; // premature EOF after backslash
                } else if (/[^\r\n\f0-9a-f]/i.test(c)) {
                    // single-character escape
                    string += c;
                } else {
                    // read up to six hex digits
                    for (i=0; isHexDigit(c) && i<6; i++) {
                        string += c;
                        c = reader.read();
                    }
                    // swallow trailing newline or space
                    if (c === "\r" && reader.peek() === "\n") {
                        string += c;
                        c = reader.read();
                    }
                    if (isWhitespace(c)) {
                        string += c;
                    } else {
                        // This character is null or not part of the escape;
                        // jump back to the top to process it.
                        continue;
                    }
                }
            } else if (c === delim) {
                break; // delimiter found.
            } else if (isNewLine(reader.peek())) {
                // newline without an escapement: it's an invalid string
                tt = Tokens.INVALID;
                break;
            }
            c = reader.read();
        }

        //if c is null, that means we're out of input and the string was never closed
        if (c === null) {
            tt = Tokens.INVALID;
        }

        return this.createToken(tt, string, startLine, startCol);
    },

    unicodeRangeToken: function(first, startLine, startCol) {
        var reader  = this._reader,
            value   = first,
            temp,
            tt      = Tokens.CHAR;

        //then it should be a unicode range
        if (reader.peek() === "+") {
            reader.mark();
            value += reader.read();
            value += this.readUnicodeRangePart(true);

            //ensure there's an actual unicode range here
            if (value.length === 2) {
                reader.reset();
            } else {

                tt = Tokens.UNICODE_RANGE;

                //if there's a ? in the first part, there can't be a second part
                if (value.indexOf("?") === -1) {

                    if (reader.peek() === "-") {
                        reader.mark();
                        temp = reader.read();
                        temp += this.readUnicodeRangePart(false);

                        //if there's not another value, back up and just take the first
                        if (temp.length === 1) {
                            reader.reset();
                        } else {
                            value += temp;
                        }
                    }

                }
            }
        }

        return this.createToken(tt, value, startLine, startCol);
    },

    /**
     * Produces a S token based on the specified information. Since whitespace
     * may have multiple characters, this consumes all whitespace characters
     * into a single token.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method whitespaceToken
     */
    whitespaceToken: function(first, startLine, startCol) {
        var value   = first + this.readWhitespace();
        return this.createToken(Tokens.S, value, startLine, startCol);
    },


    //-------------------------------------------------------------------------
    // Methods to read values from the string stream
    //-------------------------------------------------------------------------

    readUnicodeRangePart: function(allowQuestionMark) {
        var reader  = this._reader,
            part = "",
            c       = reader.peek();

        //first read hex digits
        while (isHexDigit(c) && part.length < 6) {
            reader.read();
            part += c;
            c = reader.peek();
        }

        //then read question marks if allowed
        if (allowQuestionMark) {
            while (c === "?" && part.length < 6) {
                reader.read();
                part += c;
                c = reader.peek();
            }
        }

        //there can't be any other characters after this point

        return part;
    },

    readWhitespace: function() {
        var reader  = this._reader,
            whitespace = "",
            c       = reader.peek();

        while (isWhitespace(c)) {
            reader.read();
            whitespace += c;
            c = reader.peek();
        }

        return whitespace;
    },
    readNumber: function(first) {
        var reader  = this._reader,
            number  = first,
            hasDot  = (first === "."),
            c       = reader.peek();


        while (c) {
            if (isDigit(c)) {
                number += reader.read();
            } else if (c === ".") {
                if (hasDot) {
                    break;
                } else {
                    hasDot = true;
                    number += reader.read();
                }
            } else {
                break;
            }

            c = reader.peek();
        }

        return number;
    },

    // returns null w/o resetting reader if string is invalid.
    readString: function() {
        var token = this.stringToken(this._reader.read(), 0, 0);
        return token.type === Tokens.INVALID ? null : token.value;
    },

    // returns null w/o resetting reader if URI is invalid.
    readURI: function(first) {
        var reader  = this._reader,
            uri     = first,
            inner   = "",
            c       = reader.peek();

        //skip whitespace before
        while (c && isWhitespace(c)) {
            reader.read();
            c = reader.peek();
        }

        //it's a string
        if (c === "'" || c === "\"") {
            inner = this.readString();
            if (inner !== null) {
                inner = PropertyValuePart.parseString(inner);
            }
        } else {
            inner = this.readUnquotedURL();
        }

        c = reader.peek();

        //skip whitespace after
        while (c && isWhitespace(c)) {
            reader.read();
            c = reader.peek();
        }

        //if there was no inner value or the next character isn't closing paren, it's not a URI
        if (inner === null || c !== ")") {
            uri = null;
        } else {
            // Ensure argument to URL is always double-quoted
            // (This simplifies later processing in PropertyValuePart.)
            uri += PropertyValuePart.serializeString(inner) + reader.read();
        }

        return uri;
    },
    // This method never fails, although it may return an empty string.
    readUnquotedURL: function(first) {
        var reader  = this._reader,
            url     = first || "",
            c;

        for (c = reader.peek(); c; c = reader.peek()) {
            // Note that the grammar at
            // https://www.w3.org/TR/CSS2/grammar.html#scanner
            // incorrectly includes the backslash character in the
            // `url` production, although it is correctly omitted in
            // the `baduri1` production.
            if (nonascii.test(c) || /^[\-!#$%&*-\[\]-~]$/.test(c)) {
                url += c;
                reader.read();
            } else if (c === "\\") {
                if (/^[^\r\n\f]$/.test(reader.peek(2))) {
                    url += this.readEscape(reader.read(), true);
                } else {
                    break; // bad escape sequence.
                }
            } else {
                break; // bad character
            }
        }

        return url;
    },

    readName: function(first) {
        var reader  = this._reader,
            ident   = first || "",
            c;

        for (c = reader.peek(); c; c = reader.peek()) {
            if (c === "\\") {
                if (/^[^\r\n\f]$/.test(reader.peek(2))) {
                    ident += this.readEscape(reader.read(), true);
                } else {
                    // Bad escape sequence.
                    break;
                }
            } else if (isNameChar(c)) {
                ident += reader.read();
            } else {
                break;
            }
        }

        return ident;
    },

    readEscape: function(first, unescape) {
        var reader  = this._reader,
            cssEscape = first || "",
            i       = 0,
            c       = reader.peek();

        if (isHexDigit(c)) {
            do {
                cssEscape += reader.read();
                c = reader.peek();
            } while (c && isHexDigit(c) && ++i < 6);
        }

        if (cssEscape.length === 1) {
            if (/^[^\r\n\f0-9a-f]$/.test(c)) {
                reader.read();
                if (unescape) {
                    return c;
                }
            } else {
                // We should never get here (readName won't call readEscape
                // if the escape sequence is bad).
                throw new Error("Bad escape sequence.");
            }
        } else if (c === "\r") {
            reader.read();
            if (reader.peek() === "\n") {
                c += reader.read();
            }
        } else if (/^[ \t\n\f]$/.test(c)) {
            reader.read();
        } else {
            c = "";
        }

        if (unescape) {
            var cp = parseInt(cssEscape.slice(first.length), 16);
            return String.fromCodePoint ? String.fromCodePoint(cp) :
                String.fromCharCode(cp);
        }
        return cssEscape + c;
    },

    readComment: function(first) {
        var reader  = this._reader,
            comment = first || "",
            c       = reader.read();

        if (c === "*") {
            while (c) {
                comment += c;

                //look for end of comment
                if (comment.length > 2 && c === "*" && reader.peek() === "/") {
                    comment += reader.read();
                    break;
                }

                c = reader.read();
            }

            return comment;
        } else {
            return "";
        }

    }
});

},{"../util/TokenStreamBase":27,"./PropertyValuePart":11,"./Tokens":18}],15:[function(require,module,exports){
"use strict";

module.exports = SelectorSubPart;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a selector modifier string, meaning a class name, element name,
 * element ID, pseudo rule, etc.
 * @namespace parserlib.css
 * @class SelectorSubPart
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} text The text representation of the unit.
 * @param {String} type The type of selector modifier.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function SelectorSubPart(text, type, line, col) {

    SyntaxUnit.call(this, text, line, col, Parser.SELECTOR_SUB_PART_TYPE);

    /**
     * The type of modifier.
     * @type String
     * @property type
     */
    this.type = type;

    /**
     * Some subparts have arguments, this represents them.
     * @type Array
     * @property args
     */
    this.args = [];

}

SelectorSubPart.prototype = new SyntaxUnit();
SelectorSubPart.prototype.constructor = SelectorSubPart;


},{"../util/SyntaxUnit":26,"./Parser":6}],13:[function(require,module,exports){
"use strict";

module.exports = Selector;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");
var Specificity = require("./Specificity");

/**
 * Represents an entire single selector, including all parts but not
 * including multiple selectors (those separated by commas).
 * @namespace parserlib.css
 * @class Selector
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {Array} parts Array of selectors parts making up this selector.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function Selector(parts, line, col) {

    SyntaxUnit.call(this, parts.join(" "), line, col, Parser.SELECTOR_TYPE);

    /**
     * The parts that make up the selector.
     * @type Array
     * @property parts
     */
    this.parts = parts;

    /**
     * The specificity of the selector.
     * @type parserlib.css.Specificity
     * @property specificity
     */
    this.specificity = Specificity.calculate(this);

}

Selector.prototype = new SyntaxUnit();
Selector.prototype.constructor = Selector;


},{"../util/SyntaxUnit":26,"./Parser":6,"./Specificity":16}],16:[function(require,module,exports){
"use strict";

module.exports = Specificity;

var Pseudos = require("./Pseudos");
var SelectorPart = require("./SelectorPart");

/**
 * Represents a selector's specificity.
 * @namespace parserlib.css
 * @class Specificity
 * @constructor
 * @param {int} a Should be 1 for inline styles, zero for stylesheet styles
 * @param {int} b Number of ID selectors
 * @param {int} c Number of classes and pseudo classes
 * @param {int} d Number of element names and pseudo elements
 */
function Specificity(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
}

Specificity.prototype = {
    constructor: Specificity,

    /**
     * Compare this specificity to another.
     * @param {Specificity} other The other specificity to compare to.
     * @return {int} -1 if the other specificity is larger, 1 if smaller, 0 if equal.
     * @method compare
     */
    compare: function(other) {
        var comps = ["a", "b", "c", "d"],
            i, len;

        for (i=0, len=comps.length; i < len; i++) {
            if (this[comps[i]] < other[comps[i]]) {
                return -1;
            } else if (this[comps[i]] > other[comps[i]]) {
                return 1;
            }
        }

        return 0;
    },

    /**
     * Creates a numeric value for the specificity.
     * @return {int} The numeric value for the specificity.
     * @method valueOf
     */
    valueOf: function() {
        return (this.a * 1000) + (this.b * 100) + (this.c * 10) + this.d;
    },

    /**
     * Returns a string representation for specificity.
     * @return {String} The string representation of specificity.
     * @method toString
     */
    toString: function() {
        return this.a + "," + this.b + "," + this.c + "," + this.d;
    }

};

/**
 * Calculates the specificity of the given selector.
 * @param {parserlib.css.Selector} The selector to calculate specificity for.
 * @return {parserlib.css.Specificity} The specificity of the selector.
 * @static
 * @method calculate
 */
Specificity.calculate = function(selector) {

    var i, len,
        part,
        b=0, c=0, d=0;

    function updateValues(part) {

        var i, j, len, num,
            elementName = part.elementName ? part.elementName.text : "",
            modifier;

        if (elementName && elementName.charAt(elementName.length-1) !== "*") {
            d++;
        }

        for (i=0, len=part.modifiers.length; i < len; i++) {
            modifier = part.modifiers[i];
            switch (modifier.type) {
                case "class":
                case "attribute":
                    c++;
                    break;

                case "id":
                    b++;
                    break;

                case "pseudo":
                    if (Pseudos.isElement(modifier.text)) {
                        d++;
                    } else {
                        c++;
                    }
                    break;

                case "not":
                    for (j=0, num=modifier.args.length; j < num; j++) {
                        updateValues(modifier.args[j]);
                    }
            }
        }
    }

    for (i=0, len=selector.parts.length; i < len; i++) {
        part = selector.parts[i];

        if (part instanceof SelectorPart) {
            updateValues(part);
        }
    }

    return new Specificity(0, b, c, d);
};

},{"./Pseudos":12,"./SelectorPart":14}],14:[function(require,module,exports){
"use strict";

module.exports = SelectorPart;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a single part of a selector string, meaning a single set of
 * element name and modifiers. This does not include combinators such as
 * spaces, +, >, etc.
 * @namespace parserlib.css
 * @class SelectorPart
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} elementName The element name in the selector or null
 *      if there is no element name.
 * @param {Array} modifiers Array of individual modifiers for the element.
 *      May be empty if there are none.
 * @param {String} text The text representation of the unit.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function SelectorPart(elementName, modifiers, text, line, col) {

    SyntaxUnit.call(this, text, line, col, Parser.SELECTOR_PART_TYPE);

    /**
     * The tag name of the element to which this part
     * of the selector affects.
     * @type String
     * @property elementName
     */
    this.elementName = elementName;

    /**
     * The parts that come after the element name, such as class names, IDs,
     * pseudo classes/elements, etc.
     * @type Array
     * @property modifiers
     */
    this.modifiers = modifiers;

}

SelectorPart.prototype = new SyntaxUnit();
SelectorPart.prototype.constructor = SelectorPart;


},{"../util/SyntaxUnit":26,"./Parser":6}],12:[function(require,module,exports){
"use strict";

var Pseudos = module.exports = {
    __proto__:       null,
    ":first-letter": 1,
    ":first-line":   1,
    ":before":       1,
    ":after":        1
};

Pseudos.ELEMENT = 1;
Pseudos.CLASS = 2;

Pseudos.isElement = function(pseudo) {
    return pseudo.indexOf("::") === 0 || Pseudos[pseudo.toLowerCase()] === Pseudos.ELEMENT;
};

},{}],11:[function(require,module,exports){
"use strict";

module.exports = PropertyValuePart;

var SyntaxUnit = require("../util/SyntaxUnit");

var Colors = require("./Colors");
var Parser = require("./Parser");
var Tokens = require("./Tokens");

/**
 * Represents a single part of a CSS property value, meaning that it represents
 * just one part of the data between ":" and ";".
 * @param {String} text The text representation of the unit.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 * @namespace parserlib.css
 * @class PropertyValuePart
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 */
function PropertyValuePart(text, line, col, optionalHint) {
    var hint = optionalHint || {};

    SyntaxUnit.call(this, text, line, col, Parser.PROPERTY_VALUE_PART_TYPE);

    /**
     * Indicates the type of value unit.
     * @type String
     * @property type
     */
    this.type = "unknown";

    //figure out what type of data it is

    var temp;

    //it is a measurement?
    if (/^([+\-]?[\d\.]+)([a-z]+)$/i.test(text)) {  //dimension
        this.type = "dimension";
        this.value = +RegExp.$1;
        this.units = RegExp.$2;

        //try to narrow down
        switch (this.units.toLowerCase()) {

            case "em":
            case "rem":
            case "ex":
            case "px":
            case "cm":
            case "mm":
            case "in":
            case "pt":
            case "pc":
            case "ch":
            case "vh":
            case "vw":
            case "vmax":
            case "vmin":
                this.type = "length";
                break;

            case "fr":
                this.type = "grid";
                break;

            case "deg":
            case "rad":
            case "grad":
            case "turn":
                this.type = "angle";
                break;

            case "ms":
            case "s":
                this.type = "time";
                break;

            case "hz":
            case "khz":
                this.type = "frequency";
                break;

            case "dpi":
            case "dpcm":
                this.type = "resolution";
                break;

            //default

        }

    } else if (/^([+\-]?[\d\.]+)%$/i.test(text)) {  //percentage
        this.type = "percentage";
        this.value = +RegExp.$1;
    } else if (/^([+\-]?\d+)$/i.test(text)) {  //integer
        this.type = "integer";
        this.value = +RegExp.$1;
    } else if (/^([+\-]?[\d\.]+)$/i.test(text)) {  //number
        this.type = "number";
        this.value = +RegExp.$1;

    } else if (/^#([a-f0-9]{3,6})/i.test(text)) {  //hexcolor
        this.type = "color";
        temp = RegExp.$1;
        if (temp.length === 3) {
            this.red    = parseInt(temp.charAt(0)+temp.charAt(0), 16);
            this.green  = parseInt(temp.charAt(1)+temp.charAt(1), 16);
            this.blue   = parseInt(temp.charAt(2)+temp.charAt(2), 16);
        } else {
            this.red    = parseInt(temp.substring(0, 2), 16);
            this.green  = parseInt(temp.substring(2, 4), 16);
            this.blue   = parseInt(temp.substring(4, 6), 16);
        }
    } else if (/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i.test(text)) { //rgb() color with absolute numbers
        this.type   = "color";
        this.red    = +RegExp.$1;
        this.green  = +RegExp.$2;
        this.blue   = +RegExp.$3;
    } else if (/^rgb\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(text)) { //rgb() color with percentages
        this.type   = "color";
        this.red    = +RegExp.$1 * 255 / 100;
        this.green  = +RegExp.$2 * 255 / 100;
        this.blue   = +RegExp.$3 * 255 / 100;
    } else if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i.test(text)) { //rgba() color with absolute numbers
        this.type   = "color";
        this.red    = +RegExp.$1;
        this.green  = +RegExp.$2;
        this.blue   = +RegExp.$3;
        this.alpha  = +RegExp.$4;
    } else if (/^rgba\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(text)) { //rgba() color with percentages
        this.type   = "color";
        this.red    = +RegExp.$1 * 255 / 100;
        this.green  = +RegExp.$2 * 255 / 100;
        this.blue   = +RegExp.$3 * 255 / 100;
        this.alpha  = +RegExp.$4;
    } else if (/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(text)) { //hsl()
        this.type   = "color";
        this.hue    = +RegExp.$1;
        this.saturation = +RegExp.$2 / 100;
        this.lightness  = +RegExp.$3 / 100;
    } else if (/^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(text)) { //hsla() color with percentages
        this.type   = "color";
        this.hue    = +RegExp.$1;
        this.saturation = +RegExp.$2 / 100;
        this.lightness  = +RegExp.$3 / 100;
        this.alpha  = +RegExp.$4;
    } else if (/^url\(("([^\\"]|\\.)*")\)/i.test(text)) { //URI
        // generated by TokenStream.readURI, so always double-quoted.
        this.type   = "uri";
        this.uri    = PropertyValuePart.parseString(RegExp.$1);
    } else if (/^([^\(]+)\(/i.test(text)) {
        this.type   = "function";
        this.name   = RegExp.$1;
        this.value  = text;
    } else if (/^"([^\n\r\f\\"]|\\\r\n|\\[^\r0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*"/i.test(text)) {    //double-quoted string
        this.type   = "string";
        this.value  = PropertyValuePart.parseString(text);
    } else if (/^'([^\n\r\f\\']|\\\r\n|\\[^\r0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*'/i.test(text)) {    //single-quoted string
        this.type   = "string";
        this.value  = PropertyValuePart.parseString(text);
    } else if (Colors[text.toLowerCase()]) {  //named color
        this.type   = "color";
        temp        = Colors[text.toLowerCase()].substring(1);
        this.red    = parseInt(temp.substring(0, 2), 16);
        this.green  = parseInt(temp.substring(2, 4), 16);
        this.blue   = parseInt(temp.substring(4, 6), 16);
    } else if (/^[,\/]$/.test(text)) {
        this.type   = "operator";
        this.value  = text;
    } else if (/^-?[a-z_\u00A0-\uFFFF][a-z0-9\-_\u00A0-\uFFFF]*$/i.test(text)) {
        this.type   = "identifier";
        this.value  = text;
    }

    // There can be ambiguity with escape sequences in identifiers, as
    // well as with "color" parts which are also "identifiers", so record
    // an explicit hint when the token generating this PropertyValuePart
    // was an identifier.
    this.wasIdent = Boolean(hint.ident);

}

PropertyValuePart.prototype = new SyntaxUnit();
PropertyValuePart.prototype.constructor = PropertyValuePart;

/**
 * Helper method to parse a CSS string.
 */
PropertyValuePart.parseString = function(str) {
    str = str.slice(1, -1); // Strip surrounding single/double quotes
    var replacer = function(match, esc) {
        if (/^(\n|\r\n|\r|\f)$/.test(esc)) {
            return "";
        }
        var m = /^[0-9a-f]{1,6}/i.exec(esc);
        if (m) {
            var codePoint = parseInt(m[0], 16);
            if (String.fromCodePoint) {
                return String.fromCodePoint(codePoint);
            } else {
                // XXX No support for surrogates on old JavaScript engines.
                return String.fromCharCode(codePoint);
            }
        }
        return esc;
    };
    return str.replace(/\\(\r\n|[^\r0-9a-f]|[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)/ig,
                       replacer);
};

/**
 * Helper method to serialize a CSS string.
 */
PropertyValuePart.serializeString = function(value) {
    var replacer = function(match, c) {
        if (c === "\"") {
            return "\\" + c;
        }
        var cp = String.codePointAt ? String.codePointAt(0) :
            // We only escape non-surrogate chars, so using charCodeAt
            // is harmless here.
            String.charCodeAt(0);
        return "\\" + cp.toString(16) + " ";
    };
    return "\"" + value.replace(/["\r\n\f]/g, replacer) + "\"";
};

/**
 * Create a new syntax unit based solely on the given token.
 * Convenience method for creating a new syntax unit when
 * it represents a single token instead of multiple.
 * @param {Object} token The token object to represent.
 * @return {parserlib.css.PropertyValuePart} The object representing the token.
 * @static
 * @method fromToken
 */
PropertyValuePart.fromToken = function(token) {
    var part = new PropertyValuePart(token.value, token.startLine, token.startCol, {
        // Tokens can have escaped characters that would fool the type
        // identification in the PropertyValuePart constructor, so pass
        // in a hint if this was an identifier.
        ident: token.type === Tokens.IDENT
    });
    return part;
};

},{"../util/SyntaxUnit":26,"./Colors":1,"./Parser":6,"./Tokens":18}],18:[function(require,module,exports){
"use strict";

var Tokens = module.exports = [

    /*
     * The following token names are defined in CSS3 Grammar: https://www.w3.org/TR/css3-syntax/#lexical
     */

    // HTML-style comments
    { name: "CDO" },
    { name: "CDC" },

    // ignorables
    { name: "S", whitespace: true/*, channel: "ws"*/ },
    { name: "COMMENT", comment: true, hide: true, channel: "comment" },

    // attribute equality
    { name: "INCLUDES", text: "~=" },
    { name: "DASHMATCH", text: "|=" },
    { name: "PREFIXMATCH", text: "^=" },
    { name: "SUFFIXMATCH", text: "$=" },
    { name: "SUBSTRINGMATCH", text: "*=" },

    // identifier types
    { name: "STRING" },
    { name: "IDENT" },
    { name: "HASH" },

    // at-keywords
    { name: "IMPORT_SYM", text: "@import" },
    { name: "PAGE_SYM", text: "@page" },
    { name: "MEDIA_SYM", text: "@media" },
    { name: "FONT_FACE_SYM", text: "@font-face" },
    { name: "CHARSET_SYM", text: "@charset" },
    { name: "NAMESPACE_SYM", text: "@namespace" },
    { name: "SUPPORTS_SYM", text: "@supports" },
    { name: "VIEWPORT_SYM", text: ["@viewport", "@-ms-viewport", "@-o-viewport"] },
    { name: "DOCUMENT_SYM", text: ["@document", "@-moz-document"] },
    { name: "UNKNOWN_SYM" },
    //{ name: "ATKEYWORD"},

    // CSS3 animations
    { name: "KEYFRAMES_SYM", text: [ "@keyframes", "@-webkit-keyframes", "@-moz-keyframes", "@-o-keyframes" ] },

    // important symbol
    { name: "IMPORTANT_SYM" },

    // measurements
    { name: "LENGTH" },
    { name: "ANGLE" },
    { name: "TIME" },
    { name: "FREQ" },
    { name: "DIMENSION" },
    { name: "PERCENTAGE" },
    { name: "NUMBER" },

    // functions
    { name: "URI" },
    { name: "FUNCTION" },

    // Unicode ranges
    { name: "UNICODE_RANGE" },

    /*
     * The following token names are defined in CSS3 Selectors: https://www.w3.org/TR/css3-selectors/#selector-syntax
     */

    // invalid string
    { name: "INVALID" },

    // combinators
    { name: "PLUS", text: "+" },
    { name: "GREATER", text: ">" },
    { name: "COMMA", text: "," },
    { name: "TILDE", text: "~" },

    // modifier
    { name: "NOT" },

    /*
     * Defined in CSS3 Paged Media
     */
    { name: "TOPLEFTCORNER_SYM", text: "@top-left-corner" },
    { name: "TOPLEFT_SYM", text: "@top-left" },
    { name: "TOPCENTER_SYM", text: "@top-center" },
    { name: "TOPRIGHT_SYM", text: "@top-right" },
    { name: "TOPRIGHTCORNER_SYM", text: "@top-right-corner" },
    { name: "BOTTOMLEFTCORNER_SYM", text: "@bottom-left-corner" },
    { name: "BOTTOMLEFT_SYM", text: "@bottom-left" },
    { name: "BOTTOMCENTER_SYM", text: "@bottom-center" },
    { name: "BOTTOMRIGHT_SYM", text: "@bottom-right" },
    { name: "BOTTOMRIGHTCORNER_SYM", text: "@bottom-right-corner" },
    { name: "LEFTTOP_SYM", text: "@left-top" },
    { name: "LEFTMIDDLE_SYM", text: "@left-middle" },
    { name: "LEFTBOTTOM_SYM", text: "@left-bottom" },
    { name: "RIGHTTOP_SYM", text: "@right-top" },
    { name: "RIGHTMIDDLE_SYM", text: "@right-middle" },
    { name: "RIGHTBOTTOM_SYM", text: "@right-bottom" },

    /*
     * The following token names are defined in CSS3 Media Queries: https://www.w3.org/TR/css3-mediaqueries/#syntax
     */
    /*{ name: "MEDIA_ONLY", state: "media"},
    { name: "MEDIA_NOT", state: "media"},
    { name: "MEDIA_AND", state: "media"},*/
    { name: "RESOLUTION", state: "media" },

    /*
     * The following token names are not defined in any CSS specification but are used by the lexer.
     */

    // not a real token, but useful for stupid IE filters
    { name: "IE_FUNCTION" },

    // part of CSS3 grammar but not the Flex code
    { name: "CHAR" },

    // TODO: Needed?
    // Not defined as tokens, but might as well be
    {
        name: "PIPE",
        text: "|"
    },
    {
        name: "SLASH",
        text: "/"
    },
    {
        name: "MINUS",
        text: "-"
    },
    {
        name: "STAR",
        text: "*"
    },

    {
        name: "LBRACE",
        endChar: "}",
        text: "{"
    },
    {
        name: "RBRACE",
        text: "}"
    },
    {
        name: "LBRACKET",
        endChar: "]",
        text: "["
    },
    {
        name: "RBRACKET",
        text: "]"
    },
    {
        name: "EQUALS",
        text: "="
    },
    {
        name: "COLON",
        text: ":"
    },
    {
        name: "SEMICOLON",
        text: ";"
    },
    {
        name: "LPAREN",
        endChar: ")",
        text: "("
    },
    {
        name: "RPAREN",
        text: ")"
    },
    {
        name: "DOT",
        text: "."
    }
];

(function() {
    var nameMap = [],
        typeMap = Object.create(null);

    Tokens.UNKNOWN = -1;
    Tokens.unshift({ name:"EOF" });
    for (var i=0, len = Tokens.length; i < len; i++) {
        nameMap.push(Tokens[i].name);
        Tokens[Tokens[i].name] = i;
        if (Tokens[i].text) {
            if (Tokens[i].text instanceof Array) {
                for (var j=0; j < Tokens[i].text.length; j++) {
                    typeMap[Tokens[i].text[j]] = i;
                }
            } else {
                typeMap[Tokens[i].text] = i;
            }
        }
    }

    Tokens.name = function(tt) {
        return nameMap[tt];
    };

    Tokens.type = function(c) {
        return typeMap[c] || -1;
    };
})();

},{}],9:[function(require,module,exports){
"use strict";

module.exports = PropertyValue;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a single part of a CSS property value, meaning that it represents
 * just everything single part between ":" and ";". If there are multiple values
 * separated by commas, this type represents just one of the values.
 * @param {String[]} parts An array of value parts making up this value.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 * @namespace parserlib.css
 * @class PropertyValue
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 */
function PropertyValue(parts, line, col) {

    SyntaxUnit.call(this, parts.join(" "), line, col, Parser.PROPERTY_VALUE_TYPE);

    /**
     * The parts that make up the selector.
     * @type Array
     * @property parts
     */
    this.parts = parts;

}

PropertyValue.prototype = new SyntaxUnit();
PropertyValue.prototype.constructor = PropertyValue;


},{"../util/SyntaxUnit":26,"./Parser":6}],8:[function(require,module,exports){
"use strict";

module.exports = PropertyName;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a selector combinator (whitespace, +, >).
 * @namespace parserlib.css
 * @class PropertyName
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} text The text representation of the unit.
 * @param {String} hack The type of IE hack applied ("*", "_", or null).
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function PropertyName(text, hack, line, col) {

    SyntaxUnit.call(this, text, line, col, Parser.PROPERTY_NAME_TYPE);

    /**
     * The type of IE hack applied ("*", "_", or null).
     * @type String
     * @property hack
     */
    this.hack = hack;

}

PropertyName.prototype = new SyntaxUnit();
PropertyName.prototype.constructor = PropertyName;
PropertyName.prototype.toString = function() {
    return (this.hack ? this.hack : "") + this.text;
};

},{"../util/SyntaxUnit":26,"./Parser":6}],5:[function(require,module,exports){
"use strict";

module.exports = MediaQuery;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents an individual media query.
 * @namespace parserlib.css
 * @class MediaQuery
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} modifier The modifier "not" or "only" (or null).
 * @param {String} mediaType The type of media (i.e., "print").
 * @param {Array} parts Array of selectors parts making up this selector.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function MediaQuery(modifier, mediaType, features, line, col) {

    SyntaxUnit.call(this, (modifier ? modifier + " ": "") + (mediaType ? mediaType : "") + (mediaType && features.length > 0 ? " and " : "") + features.join(" and "), line, col, Parser.MEDIA_QUERY_TYPE);

    /**
     * The media modifier ("not" or "only")
     * @type String
     * @property modifier
     */
    this.modifier = modifier;

    /**
     * The mediaType (i.e., "print")
     * @type String
     * @property mediaType
     */
    this.mediaType = mediaType;

    /**
     * The parts that make up the selector.
     * @type Array
     * @property features
     */
    this.features = features;

}

MediaQuery.prototype = new SyntaxUnit();
MediaQuery.prototype.constructor = MediaQuery;


},{"../util/SyntaxUnit":26,"./Parser":6}],4:[function(require,module,exports){
"use strict";

module.exports = MediaFeature;

var SyntaxUnit = require("../util/SyntaxUnit");

var Parser = require("./Parser");

/**
 * Represents a media feature, such as max-width:500.
 * @namespace parserlib.css
 * @class MediaFeature
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {SyntaxUnit} name The name of the feature.
 * @param {SyntaxUnit} value The value of the feature or null if none.
 */
function MediaFeature(name, value) {

    SyntaxUnit.call(this, "(" + name + (value !== null ? ":" + value : "") + ")", name.startLine, name.startCol, Parser.MEDIA_FEATURE_TYPE);

    /**
     * The name of the media feature
     * @type String
     * @property name
     */
    this.name = name;

    /**
     * The value for the feature or null if there is none.
     * @type SyntaxUnit
     * @property value
     */
    this.value = value;
}

MediaFeature.prototype = new SyntaxUnit();
MediaFeature.prototype.constructor = MediaFeature;


},{"../util/SyntaxUnit":26,"./Parser":6}],1:[function(require,module,exports){
"use strict";

/* exported Colors */

var Colors = module.exports = {
    __proto__       :null,
    aliceblue       :"#f0f8ff",
    antiquewhite    :"#faebd7",
    aqua            :"#00ffff",
    aquamarine      :"#7fffd4",
    azure           :"#f0ffff",
    beige           :"#f5f5dc",
    bisque          :"#ffe4c4",
    black           :"#000000",
    blanchedalmond  :"#ffebcd",
    blue            :"#0000ff",
    blueviolet      :"#8a2be2",
    brown           :"#a52a2a",
    burlywood       :"#deb887",
    cadetblue       :"#5f9ea0",
    chartreuse      :"#7fff00",
    chocolate       :"#d2691e",
    coral           :"#ff7f50",
    cornflowerblue  :"#6495ed",
    cornsilk        :"#fff8dc",
    crimson         :"#dc143c",
    cyan            :"#00ffff",
    darkblue        :"#00008b",
    darkcyan        :"#008b8b",
    darkgoldenrod   :"#b8860b",
    darkgray        :"#a9a9a9",
    darkgrey        :"#a9a9a9",
    darkgreen       :"#006400",
    darkkhaki       :"#bdb76b",
    darkmagenta     :"#8b008b",
    darkolivegreen  :"#556b2f",
    darkorange      :"#ff8c00",
    darkorchid      :"#9932cc",
    darkred         :"#8b0000",
    darksalmon      :"#e9967a",
    darkseagreen    :"#8fbc8f",
    darkslateblue   :"#483d8b",
    darkslategray   :"#2f4f4f",
    darkslategrey   :"#2f4f4f",
    darkturquoise   :"#00ced1",
    darkviolet      :"#9400d3",
    deeppink        :"#ff1493",
    deepskyblue     :"#00bfff",
    dimgray         :"#696969",
    dimgrey         :"#696969",
    dodgerblue      :"#1e90ff",
    firebrick       :"#b22222",
    floralwhite     :"#fffaf0",
    forestgreen     :"#228b22",
    fuchsia         :"#ff00ff",
    gainsboro       :"#dcdcdc",
    ghostwhite      :"#f8f8ff",
    gold            :"#ffd700",
    goldenrod       :"#daa520",
    gray            :"#808080",
    grey            :"#808080",
    green           :"#008000",
    greenyellow     :"#adff2f",
    honeydew        :"#f0fff0",
    hotpink         :"#ff69b4",
    indianred       :"#cd5c5c",
    indigo          :"#4b0082",
    ivory           :"#fffff0",
    khaki           :"#f0e68c",
    lavender        :"#e6e6fa",
    lavenderblush   :"#fff0f5",
    lawngreen       :"#7cfc00",
    lemonchiffon    :"#fffacd",
    lightblue       :"#add8e6",
    lightcoral      :"#f08080",
    lightcyan       :"#e0ffff",
    lightgoldenrodyellow  :"#fafad2",
    lightgray       :"#d3d3d3",
    lightgrey       :"#d3d3d3",
    lightgreen      :"#90ee90",
    lightpink       :"#ffb6c1",
    lightsalmon     :"#ffa07a",
    lightseagreen   :"#20b2aa",
    lightskyblue    :"#87cefa",
    lightslategray  :"#778899",
    lightslategrey  :"#778899",
    lightsteelblue  :"#b0c4de",
    lightyellow     :"#ffffe0",
    lime            :"#00ff00",
    limegreen       :"#32cd32",
    linen           :"#faf0e6",
    magenta         :"#ff00ff",
    maroon          :"#800000",
    mediumaquamarine:"#66cdaa",
    mediumblue      :"#0000cd",
    mediumorchid    :"#ba55d3",
    mediumpurple    :"#9370d8",
    mediumseagreen  :"#3cb371",
    mediumslateblue :"#7b68ee",
    mediumspringgreen   :"#00fa9a",
    mediumturquoise :"#48d1cc",
    mediumvioletred :"#c71585",
    midnightblue    :"#191970",
    mintcream       :"#f5fffa",
    mistyrose       :"#ffe4e1",
    moccasin        :"#ffe4b5",
    navajowhite     :"#ffdead",
    navy            :"#000080",
    oldlace         :"#fdf5e6",
    olive           :"#808000",
    olivedrab       :"#6b8e23",
    orange          :"#ffa500",
    orangered       :"#ff4500",
    orchid          :"#da70d6",
    palegoldenrod   :"#eee8aa",
    palegreen       :"#98fb98",
    paleturquoise   :"#afeeee",
    palevioletred   :"#d87093",
    papayawhip      :"#ffefd5",
    peachpuff       :"#ffdab9",
    peru            :"#cd853f",
    pink            :"#ffc0cb",
    plum            :"#dda0dd",
    powderblue      :"#b0e0e6",
    purple          :"#800080",
    red             :"#ff0000",
    rosybrown       :"#bc8f8f",
    royalblue       :"#4169e1",
    saddlebrown     :"#8b4513",
    salmon          :"#fa8072",
    sandybrown      :"#f4a460",
    seagreen        :"#2e8b57",
    seashell        :"#fff5ee",
    sienna          :"#a0522d",
    silver          :"#c0c0c0",
    skyblue         :"#87ceeb",
    slateblue       :"#6a5acd",
    slategray       :"#708090",
    slategrey       :"#708090",
    snow            :"#fffafa",
    springgreen     :"#00ff7f",
    steelblue       :"#4682b4",
    tan             :"#d2b48c",
    teal            :"#008080",
    thistle         :"#d8bfd8",
    tomato          :"#ff6347",
    turquoise       :"#40e0d0",
    violet          :"#ee82ee",
    wheat           :"#f5deb3",
    white           :"#ffffff",
    whitesmoke      :"#f5f5f5",
    yellow          :"#ffff00",
    yellowgreen     :"#9acd32",
    //'currentColor' color keyword https://www.w3.org/TR/css3-color/#currentcolor
    currentColor        :"The value of the 'color' property.",
    //CSS2 system colors https://www.w3.org/TR/css3-color/#css2-system
    activeBorder        :"Active window border.",
    activecaption       :"Active window caption.",
    appworkspace        :"Background color of multiple document interface.",
    background          :"Desktop background.",
    buttonface          :"The face background color for 3-D elements that appear 3-D due to one layer of surrounding border.",
    buttonhighlight     :"The color of the border facing the light source for 3-D elements that appear 3-D due to one layer of surrounding border.",
    buttonshadow        :"The color of the border away from the light source for 3-D elements that appear 3-D due to one layer of surrounding border.",
    buttontext          :"Text on push buttons.",
    captiontext         :"Text in caption, size box, and scrollbar arrow box.",
    graytext            :"Grayed (disabled) text. This color is set to #000 if the current display driver does not support a solid gray color.",
    greytext            :"Greyed (disabled) text. This color is set to #000 if the current display driver does not support a solid grey color.",
    highlight           :"Item(s) selected in a control.",
    highlighttext       :"Text of item(s) selected in a control.",
    inactiveborder      :"Inactive window border.",
    inactivecaption     :"Inactive window caption.",
    inactivecaptiontext :"Color of text in an inactive caption.",
    infobackground      :"Background color for tooltip controls.",
    infotext            :"Text color for tooltip controls.",
    menu                :"Menu background.",
    menutext            :"Text in menus.",
    scrollbar           :"Scroll bar gray area.",
    threeddarkshadow    :"The color of the darker (generally outer) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
    threedface          :"The face background color for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
    threedhighlight     :"The color of the lighter (generally outer) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
    threedlightshadow   :"The color of the darker (generally inner) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
    threedshadow        :"The color of the lighter (generally inner) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.",
    window              :"Window background.",
    windowframe         :"Window frame.",
    windowtext          :"Text in windows."
};

},{}]},{},[]);

parserlib.css = require('parserlib').css;
})();