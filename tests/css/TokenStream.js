"use strict";

var YUITest = require("yuitest"),
    Assert = YUITest.Assert,
    parserlib = require("../../"),
    TokenStream = parserlib.css.TokenStream,
    CSSTokens = parserlib.css.Tokens;

(function() {

    //-------------------------------------------------------------------------
    // New testcase type to make it easier to test patterns
    //-------------------------------------------------------------------------

    function CSSTokenTestCase(info) {

        YUITest.TestCase.call(this, info);
        this.patterns = info.patterns;

        for (var prop in this.patterns) {
            if (this.patterns.hasOwnProperty(prop)) {
                this["testPattern: " + prop] = function(prop) {
                    return function() {
                        this._testPattern(prop, this.patterns[prop]);
                    };
                }(prop);
            }
        }
    }

    CSSTokenTestCase.prototype = new YUITest.TestCase();

    CSSTokenTestCase.prototype._testPattern = function(pattern, outputs) {
        var tokenStream = new TokenStream(pattern, CSSTokens);
        var tt;

        for (var i = 0, len = outputs.length; i < len; i++) {
            tt = tokenStream.get(outputs[i] > -1 ? CSSTokens[outputs[i]].channel : undefined);
            Assert.areEqual(outputs[i], tt, "Token type should be " + CSSTokens.name(outputs[i]) + " but was " + CSSTokens.name(tt) + " (" + (tokenStream.token() ? tokenStream.token().value : "unknown") + ").");
        }

        //if there was an invalid token, stop here
        if (tt > -1) {
            tt = tokenStream.get();
            Assert.areEqual(CSSTokens.EOF, tt, "Expected end of input but found token " + CSSTokens.name(tt) + " (" + (tokenStream.token() ? tokenStream.token().value : "unknown") + ").");
        }
    };


    //-------------------------------------------------------------------------
    // Simple CSS token tests
    //-------------------------------------------------------------------------

    var suite = new YUITest.TestSuite("CSS Tokens");


    //note: \r\n is normalized to just \n by StringReader
    suite.add(new CSSTokenTestCase({
        name : "Tests for empty input",

        patterns: {
            ""        : [CSSTokens.EOF]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for Whitespace",

        patterns: {
            " "     : [CSSTokens.S],
            "\n"    : [CSSTokens.S],
            "\n \t" : [CSSTokens.S],
            "\f \n" : [CSSTokens.S],
            // Not legal whitespace (PR#16)
            "\v\u00A0\u1680": [CSSTokens.CHAR, CSSTokens.IDENT]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for comments",

        patterns: {
            //"/* booya */"     : [],
            //"/*\n booya */"   : [],
            //"/*\n booya \n*/" : [],
            //"/*/*/"           : [],
            "/*/hello*/abc"   : [CSSTokens.IDENT]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name: "Test for comparison operators",

        patterns: {
            "~=":   [CSSTokens.INCLUDES],
            "|=":   [CSSTokens.DASHMATCH],
            "^=":   [CSSTokens.PREFIXMATCH],
            "$=":   [CSSTokens.SUFFIXMATCH],
            "*=":   [CSSTokens.SUBSTRINGMATCH]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name: "Test for identifiers",

        patterns: {
            "a":            [CSSTokens.IDENT],
            "ab":           [CSSTokens.IDENT],
            "a1":           [CSSTokens.IDENT],
            "a_c":          [CSSTokens.IDENT],
            "a-c":          [CSSTokens.IDENT],
            "a90":          [CSSTokens.IDENT],
            "a\\09":        [CSSTokens.IDENT],
            "\\sa":         [CSSTokens.IDENT],
            "-foo":         [CSSTokens.IDENT],
            "flex":         [CSSTokens.IDENT],
            "-webkit-flex": [CSSTokens.IDENT],

            //not identifiers
            "9a":           [CSSTokens.DIMENSION],
            "a+boo":        [CSSTokens.IDENT, CSSTokens.PLUS, CSSTokens.IDENT],

            // existing parsing bugs
            // "u+boo":        [CSSTokens.IDENT, CSSTokens.PLUS, CSSTokens.IDENT],
            // "u+@":          [CSSTokens.IDENT, CSSTokens.PLUS, CSSTokens.CHAR],
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for strings",

        patterns: {
            "'hello'"       : [CSSTokens.STRING],
            "\"hello\""     : [CSSTokens.STRING],
            "''"            : [CSSTokens.STRING],
            "\"\""          : [CSSTokens.STRING],
            "'hello\""      : [CSSTokens.INVALID],
            "\"hello'"      : [CSSTokens.INVALID],
            "'hello"        : [CSSTokens.INVALID],
            "'hel\\'lo'"    : [CSSTokens.STRING],
            "\"hel\\\"lo\"" : [CSSTokens.STRING]
        }
    }));


    suite.add(new CSSTokenTestCase({
        name : "Tests for hashes",

        // need to use double \\ to represent a single \ due to escaping
        patterns: {
            "#identifier"       : [CSSTokens.HASH],
            "#_identifer"       : [CSSTokens.HASH],
            "#0-9_"             : [CSSTokens.HASH],
            "#name'"            : [CSSTokens.HASH, CSSTokens.INVALID],
            "#h\\0fllo"         : [CSSTokens.HASH],
            "#ffeeff"           : [CSSTokens.HASH],
            "#\\31 a2b3c"       : [CSSTokens.HASH],
            "#r0\\.5"           : [CSSTokens.HASH],
            // Invalid escape sequence
            "#a\\\r"            : [CSSTokens.HASH, CSSTokens.CHAR, CSSTokens.S]
        }
    }));

    //-------------------------------------------------------------------------
    // Tests for at-rules
    //-------------------------------------------------------------------------

    (function() {

        var atRules = {
            "@charset"      : CSSTokens.CHARSET_SYM,
            "@ch\\041 rset" : CSSTokens.CHARSET_SYM,
            "@import"       : CSSTokens.IMPORT_SYM,
            "@page"         : CSSTokens.PAGE_SYM,
            "@media"        : CSSTokens.MEDIA_SYM,
            "@font-face"    : CSSTokens.FONT_FACE_SYM,
            "@namespace"    : CSSTokens.NAMESPACE_SYM,
            "@supports"     : CSSTokens.SUPPORTS_SYM,
            "@top-left-corner"  : CSSTokens.TOPLEFTCORNER_SYM,
            "@top-left"     : CSSTokens.TOPLEFT_SYM,
            "@top-right-corner" : CSSTokens.TOPRIGHTCORNER_SYM,
            "@top-right"    : CSSTokens.TOPRIGHT_SYM,
            "@bottom-left-corner"   : CSSTokens.BOTTOMLEFTCORNER_SYM,
            "@bottom-left" : CSSTokens.BOTTOMLEFT_SYM,
            "@bottom-right-corner"  : CSSTokens.BOTTOMRIGHTCORNER_SYM,
            "@bottom-right" : CSSTokens.BOTTOMRIGHT_SYM,
            "@left-top"     : CSSTokens.LEFTTOP_SYM,
            "@left-middle"  : CSSTokens.LEFTMIDDLE_SYM,
            "@left-bottom"  : CSSTokens.LEFTBOTTOM_SYM,
            "@right-top"    : CSSTokens.RIGHTTOP_SYM,
            "@right-middle" : CSSTokens.RIGHTMIDDLE_SYM,
            "@right-bottom" : CSSTokens.RIGHTBOTTOM_SYM,

            "@-ms-viewport" : CSSTokens.VIEWPORT_SYM,
            "@viewport"     : CSSTokens.VIEWPORT_SYM,

            "@-moz-document" : CSSTokens.DOCUMENT_SYM,
            "@document"      : CSSTokens.DOCUMENT_SYM,

            //animation
            "@-webkit-keyframes":   CSSTokens.KEYFRAMES_SYM,
            "@-moz-keyframes"   : CSSTokens.KEYFRAMES_SYM,
            "@keyframes"        : CSSTokens.KEYFRAMES_SYM,

            //errors
            "@foo"              : CSSTokens.UNKNOWN_SYM,
            "@bar"              : CSSTokens.UNKNOWN_SYM
        };

        var patterns;

        for (var prop in atRules) { // jshint ignore:line
            patterns = {};

            patterns[prop] = [atRules[prop]];
            patterns[prop + " "] = [atRules[prop], CSSTokens.S];
            patterns[prop.toUpperCase()] = [atRules[prop]];
            patterns[prop.toUpperCase() + " "] = [atRules[prop], CSSTokens.S];

            suite.add(new CSSTokenTestCase({
                name: "Tests for " + prop,
                patterns: patterns
            }));
        }
    })();


    suite.add(new CSSTokenTestCase({
        name : "Tests for !important",

        patterns: {
            "!important"        : [CSSTokens.IMPORTANT_SYM],
            "!IMPORTANT"        : [CSSTokens.IMPORTANT_SYM],
            "!  important"      : [CSSTokens.IMPORTANT_SYM],
            "!  IMPORTANT"      : [CSSTokens.IMPORTANT_SYM],
            "!/*booya*/important"       : [CSSTokens.IMPORTANT_SYM],
            "!/*booya*/IMPORTANT"       : [CSSTokens.IMPORTANT_SYM],
            "! /*booya*/ important"     : [CSSTokens.IMPORTANT_SYM],
            "! /*booya*/ IMPORTANT"     : [CSSTokens.IMPORTANT_SYM],

            //bogus symbols
            "! /*IMPORTANT"     : [CSSTokens.CHAR, CSSTokens.S, CSSTokens.EOF],
            "! / important"     : [CSSTokens.CHAR, CSSTokens.S, CSSTokens.SLASH, CSSTokens.S, CSSTokens.IDENT],
            "!IMPO RTANT"       : [CSSTokens.CHAR, CSSTokens.IDENT, CSSTokens.S, CSSTokens.IDENT]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for HTML-style comments",

        patterns: {
            "<!--"  : [CSSTokens.CDO],
            "<!-- " : [CSSTokens.CDO, CSSTokens.S],
            "-->"   : [CSSTokens.CDC],
            "--> "  : [CSSTokens.CDC, CSSTokens.S]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for Unicode ranges",

        patterns: {
            "u+A5"          : [CSSTokens.UNICODE_RANGE],
            "U+A5"          : [CSSTokens.UNICODE_RANGE],
            "U+0-7F"        : [CSSTokens.UNICODE_RANGE],
            "U+590-5ff"     : [CSSTokens.UNICODE_RANGE],
            "U+AB-BC"       : [CSSTokens.UNICODE_RANGE],
            "U+4E00-9FFF"   : [CSSTokens.UNICODE_RANGE],
            "U+30??"        : [CSSTokens.UNICODE_RANGE],
            "U+00-FF"       : [CSSTokens.UNICODE_RANGE],
            "U+??????"      : [CSSTokens.UNICODE_RANGE],
            "U+0??????"     : [CSSTokens.UNICODE_RANGE, CSSTokens.CHAR],
            "U+00-??"       : [CSSTokens.UNICODE_RANGE, CSSTokens.MINUS, CSSTokens.CHAR, CSSTokens.CHAR],
            "U+?1"          : [CSSTokens.UNICODE_RANGE, CSSTokens.NUMBER],
            "U+00-J"        : [CSSTokens.UNICODE_RANGE, CSSTokens.IDENT],

            // Not unicode ranges
            "U20"           : [CSSTokens.IDENT],

            // existing parsing failures
            // "u+"            : [CSSTokens.IDENT, CSSTokens.PLUS],
            // "U+"            : [CSSTokens.IDENT, CSSTokens.PLUS],
            // "U+@"           : [CSSTokens.IDENT, CSSTokens.PLUS, CSSTokens.CHAR],
            // "U+U"           : [CSSTokens.IDENT, CSSTokens.PLUS, CSSTokens.IDENT],
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for :not",

        patterns: {
            ":not("   : [CSSTokens.NOT],
            ":noT("   : [CSSTokens.NOT],
            ":nOT("   : [CSSTokens.NOT],
            ":NOT("   : [CSSTokens.NOT],
            ":not "   : [CSSTokens.COLON, CSSTokens.IDENT, CSSTokens.S],
            "button:not([DISABLED])": [CSSTokens.IDENT, CSSTokens.NOT, CSSTokens.LBRACKET, CSSTokens.IDENT, CSSTokens.RBRACKET, CSSTokens.RPAREN]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for Media Queries",

        patterns: {
            "not"   : [CSSTokens.IDENT],
            "and"   : [CSSTokens.IDENT],
            "only"  : [CSSTokens.IDENT],
            "5dpi"  : [CSSTokens.RESOLUTION],
            "5.2dPi": [CSSTokens.RESOLUTION],
            ".5DPI" : [CSSTokens.RESOLUTION]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for Numbers",

        patterns: {


            //pixels
            "4px"       : [CSSTokens.LENGTH],
            "50.0PX"    : [CSSTokens.LENGTH],
            ".6Px"      : [CSSTokens.LENGTH],


            "7cm"       : [CSSTokens.LENGTH],
            "7CM"       : [CSSTokens.LENGTH],
            "7cM"       : [CSSTokens.LENGTH],
            "8.0mm"     : [CSSTokens.LENGTH],
            ".9in"      : [CSSTokens.LENGTH],
            "7pc"       : [CSSTokens.LENGTH],
            "8.0pt"     : [CSSTokens.LENGTH],

            "5em"       : [CSSTokens.LENGTH],
            "50.0EM"    : [CSSTokens.LENGTH],
            ".5eM"      : [CSSTokens.LENGTH],

            "5ex"       : [CSSTokens.LENGTH],
            "50.0EX"    : [CSSTokens.LENGTH],
            ".5eX"      : [CSSTokens.LENGTH],

            "5vw"       : [CSSTokens.LENGTH],
            "50.0VW"    : [CSSTokens.LENGTH],
            ".5vW"      : [CSSTokens.LENGTH],

            "5vh"       : [CSSTokens.LENGTH],
            "50.0VH"    : [CSSTokens.LENGTH],
            ".5vH"      : [CSSTokens.LENGTH],

            "5rem"       : [CSSTokens.LENGTH],
            "50.0REM"    : [CSSTokens.LENGTH],
            ".5rEm"      : [CSSTokens.LENGTH],

            "5vmax"      : [CSSTokens.LENGTH],
            "50.0VMAX"   : [CSSTokens.LENGTH],
            ".5vMax"     : [CSSTokens.LENGTH],

            "5vmin"      : [CSSTokens.LENGTH],
            "50.0VMIN"   : [CSSTokens.LENGTH],
            ".5vMin"     : [CSSTokens.LENGTH],

            "5ch"       : [CSSTokens.LENGTH],
            "50.0CH"    : [CSSTokens.LENGTH],
            ".5cH"      : [CSSTokens.LENGTH],


            "5deg"       : [CSSTokens.ANGLE],
            "50.0DEG"    : [CSSTokens.ANGLE],
            ".5Deg"      : [CSSTokens.ANGLE],

            "5rad"       : [CSSTokens.ANGLE],
            "50.0RAD"    : [CSSTokens.ANGLE],
            ".5Rad"      : [CSSTokens.ANGLE],

            "5grad"      : [CSSTokens.ANGLE],
            "50.0GRAD"   : [CSSTokens.ANGLE],
            ".5Grad"     : [CSSTokens.ANGLE],

            "5turn"      : [CSSTokens.ANGLE],
            "50.0TURN"   : [CSSTokens.ANGLE],
            ".5turn"     : [CSSTokens.ANGLE],

            "5ms"           : [CSSTokens.TIME],
            "50.0MS"        : [CSSTokens.TIME],
            ".5Ms"          : [CSSTokens.TIME],

            "5s"            : [CSSTokens.TIME],
            "50.0S"         : [CSSTokens.TIME],

            "5hz"           : [CSSTokens.FREQ],
            "50.0HZ"        : [CSSTokens.FREQ],
            ".5Hz"          : [CSSTokens.FREQ],

            "5khz"          : [CSSTokens.FREQ],
            "50.0KHZ"       : [CSSTokens.FREQ],
            ".5kHz"         : [CSSTokens.FREQ],

            "5ncz"          : [CSSTokens.DIMENSION],
            "50.0NCZ"       : [CSSTokens.DIMENSION],
            ".5nCz"         : [CSSTokens.DIMENSION],

            "3%"        : [CSSTokens.PERCENTAGE],
            "45.05%"    : [CSSTokens.PERCENTAGE],
            ".9%"       : [CSSTokens.PERCENTAGE],

            //regular numbers
            "1"         : [CSSTokens.NUMBER],
            "20.0"      : [CSSTokens.NUMBER],
            ".3"        : [CSSTokens.NUMBER],
            "-0.3"      : [CSSTokens.NUMBER],
            "+0"        : [CSSTokens.NUMBER],
            "-.3"       : [CSSTokens.NUMBER],
            "+.5"       : [CSSTokens.NUMBER],

            //invalid numbers
            "-name"     : [CSSTokens.IDENT],
            "+name"     : [CSSTokens.PLUS, CSSTokens.IDENT]

        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for URLs",

        patterns: {
            "url(foo.jpg)"      : [CSSTokens.URI],
            "url( foo.jpg)"     : [CSSTokens.URI],
            "url(foo.jpg )"     : [CSSTokens.URI],
            "url( foo.jpg )"    : [CSSTokens.URI],
            "url('foo.jpg')"    : [CSSTokens.URI],
            "url(\"foo.jpg\")"  : [CSSTokens.URI],

            "url(https://www.nczonline.net/favicon.ico)":    [CSSTokens.URI],
            "url('https://www.nczonline.net/favicon.ico')":  [CSSTokens.URI],
            "url(\"https://www.nczonline.net/favicon.ico\")":[CSSTokens.URI],

            "url(https://www.nczonline.net/favicon.ico?a=b&c=d)":    [CSSTokens.URI],
            "url('https://www.nczonline.net/favicon.ico?a=b&c=d')":  [CSSTokens.URI],
            "url(\"https://www.nczonline.net/favicon.ico?a=b&c=d\")":[CSSTokens.URI],

            //invalid URLs
            "url('booya\")"     : [CSSTokens.FUNCTION, CSSTokens.INVALID],
            "url('booya'"       : [CSSTokens.FUNCTION, CSSTokens.STRING]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for Functions",

        patterns: {

            //regular CSS functions
            "rgb(255,0,1)"      : [CSSTokens.FUNCTION, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.NUMBER, CSSTokens.RPAREN],
            "counter(par-num,upper-roman)" : [CSSTokens.FUNCTION, CSSTokens.IDENT, CSSTokens.COMMA, CSSTokens.IDENT, CSSTokens.RPAREN],
            "calc(100% - 5px)"      : [CSSTokens.FUNCTION, CSSTokens.PERCENTAGE, CSSTokens.S, CSSTokens.MINUS, CSSTokens.S, CSSTokens.LENGTH, CSSTokens.RPAREN],
            "calc((5em - 100%) / -2)" : [CSSTokens.FUNCTION, CSSTokens.LPAREN, CSSTokens.LENGTH, CSSTokens.S, CSSTokens.MINUS, CSSTokens.S, CSSTokens.PERCENTAGE, CSSTokens.RPAREN, CSSTokens.S, CSSTokens.SLASH, CSSTokens.S, CSSTokens.NUMBER, CSSTokens.RPAREN],

            //old-style IE filters - interpreted as bunch of tokens
            "alpha(opacity=50)" : [CSSTokens.FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN],

            //IE filters - not sure how to handle these yet
            "progid:DXImageTransform.Microsoft.Wave(strength=100)"                  : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN],
            "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)"    : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.S, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN],
            "progid:DXImageTransform.Microsoft.Iris(irisstyle='STAR', duration=4)"   : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.STRING, CSSTokens.COMMA, CSSTokens.S, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name: "Test for single-character tokens",

        patterns: {

            //single characters with defined tokens
            "/"     : [CSSTokens.SLASH],
            "-"     : [CSSTokens.MINUS],
            "+"     : [CSSTokens.PLUS],
            "*"     : [CSSTokens.STAR],
            ">"     : [CSSTokens.GREATER],
            "{"     : [CSSTokens.LBRACE],
            "}"     : [CSSTokens.RBRACE],
            "["     : [CSSTokens.LBRACKET],
            "]"     : [CSSTokens.RBRACKET],
            "="     : [CSSTokens.EQUALS],
            ":"     : [CSSTokens.COLON],
            ";"     : [CSSTokens.SEMICOLON],
            "("     : [CSSTokens.LPAREN],
            ")"     : [CSSTokens.RPAREN],
            "."     : [CSSTokens.DOT],
            ","     : [CSSTokens.COMMA],

            //single characters without tokens
            "@"     : [CSSTokens.CHAR]
        }
    }));

    //-------------------------------------------------------------------------
    // More complex testing patterns
    //-------------------------------------------------------------------------

    suite.add(new CSSTokenTestCase({
        name : "Tests for Properties",

        patterns: {

            //regular CSS functions
            "background: red;"       : [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IDENT, CSSTokens.SEMICOLON],
            "background-color: red;" : [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IDENT, CSSTokens.SEMICOLON],

            "filter: progid:DXImageTransform.Microsoft.Wave(strength=100);": [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN, CSSTokens.SEMICOLON]

        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for odd cases",

        patterns: {

            //regular CSS functions
            ".name"       : [CSSTokens.DOT, CSSTokens.IDENT],
            "-name"       : [CSSTokens.IDENT]

        }
    }));

    //-------------------------------------------------------------------------
    // Test line/column numbers
    //-------------------------------------------------------------------------
    var newSuite = new YUITest.TestSuite("Interface Tests");
    newSuite.add(new YUITest.TestCase({

        name: "Test line/column numbers",

        "Two identifiers in a row should have correct line and column numbers": function() {
            var tokenStream = new TokenStream("foo bar", CSSTokens),
                tt,
                token;

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(1, token.startCol);
            Assert.areEqual(4, token.endCol);

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.S, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(4, token.startCol);
            Assert.areEqual(5, token.endCol);

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(5, token.startCol);
            Assert.areEqual(8, token.endCol);
        },

        "An identifier followed by a dot and ident should have correct line and column numbers": function() {
            var tokenStream = new TokenStream("foo .bar", CSSTokens),
                tt,
                token;

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(1, token.startCol);
            Assert.areEqual(4, token.endCol);

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.S, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(4, token.startCol);
            Assert.areEqual(5, token.endCol);

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.DOT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(5, token.startCol);
            Assert.areEqual(6, token.endCol);

            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(6, token.startCol);
            Assert.areEqual(9, token.endCol);
        }

    }));


    YUITest.TestRunner.add(suite);
    YUITest.TestRunner.add(newSuite);

})();
