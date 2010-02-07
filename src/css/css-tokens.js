/*
 * CSS Token information.
 * Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
CSSTokens = function(){

    //token fragments
    var h           = "[0-9a-fA-F]",
        nonascii    = "[\\u0080-\\uFFFF]",
        unicode     = "(?:\\\\" + h + "{1,6}(?:\\r\\n|[ \\t\\r\\n\\f])?)",
        escape      = "(?:" + unicode + "|\\\\[^\r\n\f0-9a-fA-F])",
        nmstart     = "(?:[_a-zA-Z\\*]|" + nonascii + "|" + escape + ")",  //includes leading * and _ for IE
        nmchar      = "(?:[_a-zA-Z0-9\\-]|" + nonascii + "|" + escape + ")",
        string1     = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*\\\")",
        string2     = "(?:\\'(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*\\')",
        invalid1    = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        invalid2    = "(?:\\'(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        
        comment     = "\\/\\*[^\\*]*\\*+([^\/\\*][^\\*]*\\*+)*\\/",
        ident       = "(?:\\-?" + nmstart + nmchar + "*)",    
        name        = nmchar + "+",
        num         = "(?:[0-9]+|[0-9]*\\.[0-9]+)",
        string      = string1 + "|" + string2,
        invalid     = invalid1 + "|" + invalid2,
        url         = "(?:[!#$%&\\*\\-~]|" + nonascii + "|" + escape + ")*",
        s           = "[ \\t\\r\\n\\f]+",
        w           = "(?:" + s + ")?",
        nl          = "(?:\\n|\\r\\n|\\r|\\f)";

    //return the token information
    return [
        {
            name: "S",
            pattern: "[ \t\r\n\f]+"
        },
        {
            name: "COMMENT",
            pattern: comment
        },
        //CDO and CDC intentionally omitted
        {
            name: "INCLUDES",
            text: "~="
        },
        {
            name: "DASHMATCH",
            text: "|="
        },
        {
            name: "STRING",
            pattern: "(?:" + string1 + "|" + string2 + ")",
        },
        {
            name: "INVALID",
            pattern: "(?:" + invalid1 + "|" + invalid2 + ")",
        },  
    
    
        {
            name: "IDENT",
            pattern: ident
        },
        {
            name: "HASH",
            pattern: "#" + name
        },
        {
            name: "IMPORT_SYM",
            pattern: "@IMPORT",
            patternOpt: "i"
        },
        {
            name: "PAGE_SYM",
            pattern: "@PAGE",
            patternOpt: "i"
        },
        {
            name: "MEDIA_SYM",
            pattern: "@MEDIA",
            patternOpt: "i"
        },
        {
            name: "CHARSET_SYM",
            text: "@charset "
        },
        {
            name: "IMPORTANT_SYM",
            pattern: "!(?:" + w + "|" + comment + ")*IMPORTANT",
            patternOpt: "i"
        },
        {
            name: "EMS",
            pattern: num + "em",
            patternOpt: "i"
        },
        {
            name: "EXS",
            pattern: num + "ex",
            patternOpt: "i"
        },
        {
            name: "LENGTH",
            pattern: "(?:" + num + "px|" + num + "cm|" + num + "mm|" + num + "in|" + num + "pt|" + num + "pc" + ")",
            patternOpt: "i"
        },
        {
            name: "ANGLE",
            pattern: "(?:" + num + "deg|" + num + "rad|" + num + "grad" + ")",
            patternOpt: "i"
        },
        {
            name: "TIME",
            pattern: "(?:" + num + "ms|" + num + "s" + ")",
            patternOpt: "i"
        },
        {
            name: "FREQ",
            pattern: "(?:" + num + "hz|" + num + "khz" + ")",
            patternOpt: "i"
        },
        {
            name: "DIMENSION",
            pattern: num + ident
        },   
        {
            name: "PERCENTAGE",
            pattern: num + "%"
        },
        {
            name: "NUMBER",
            pattern: num 
        },
        {
            name: "URI",
            pattern: "url\\(" + w + string + w + "\\)"
        },
        {
            name: "URI",
            pattern: "url\\(" + w + url + w + "\\)"
        },
        {
            name: "FUNCTION",
            pattern: ident + "\\("
        },    
    
        //Not defined as tokens, but might as well be
        {
            name: "SLASH",
            text: "/"
        },
        {
            name: "MINUS",
            text: "-"
        },
        {
            name: "PLUS",
            text: "+"
        },
        {
            name: "STAR",
            text: "*"
        },
        {
            name: "GREATER",
            text: ">"
        },
        {
            name: "LBRACE",
            text: "{"
        },   
        {
            name: "RBRACE",
            text: "}"
        },      
        {
            name: "LBRACKET",
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
            text: "("
        },   
        {
            name: "RPAREN",
            text: ")"
        },   
      
        {
            name: "DOT",
            text: "."
        },    
        {
            name: "COMMA",
            text: ","
        }
    ];

}();

/*
stylesheet  : [ CDO | CDC | S | statement ]*;
statement   : ruleset | at-rule;
at-rule     : ATKEYWORD S* any* [ block | ';' S* ];
block       : '{' S* [ any | block | ATKEYWORD S* | ';' S* ]* '}' S*;
ruleset     : selector? '{' S* declaration? [ ';' S* declaration? ]* '}' S*;
selector    : any+;
declaration : property S* ':' S* value;
property    : IDENT;
value       : [ any | block | ATKEYWORD S* ]+;
any         : [ IDENT | NUMBER | PERCENTAGE | DIMENSION | STRING
              | DELIM | URI | HASH | UNICODE-RANGE | INCLUDES
              | DASHMATCH | ':' | FUNCTION S* any* ')' 
              | '(' S* any* ')' | '[' S* any* ']' ] S*;



*/

