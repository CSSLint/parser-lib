/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
var CSSTokens = function(){

    //token fragments
    var h           = "[0-9a-fA-F]",
        nonascii    = "[\\u0080-\\uFFFF]",
        unicode     = "(?:\\\\" + h + "{1,6}(?:\\r\\n|[ \\t\\r\\n\\f])?)",
        escape      = "(?:" + unicode + "|\\\\[^\r\n\f0-9a-fA-F])",
        nmstart     = "(?:[_a-zA-Z\\*]|" + nonascii + "|" + escape + ")",  //includes leading * and _ for IE
        nmchar      = "(?:[_a-zA-Z0-9\\-]|" + nonascii + "|" + escape + ")",
        nl          = "(?:\\n|\\r\\n|\\r|\\f)",
        string1     = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*\\\")",
        string2     = "(?:\\'(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*\\')",
        invalid1    = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        invalid2    = "(?:\\'(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        
        comment     = "\\/\\*[^\\*]*\\*+([^\/\\*][^\\*]*\\*+)*\\/",
        ident       = "(?:\\-?" + nmstart + nmchar + "*)",    
        name        = nmchar + "+",
        num         = "(?:[0-9]+|[0-9]*\\.[0-9]+)",
        string      = "(?:" + string1 + "|" + string2 + ")",
        invalid     = "(?:" + invalid1 + "|" + invalid2 + ")",
        url         = "(?:[!#$%&\\*\\-~]|" + nonascii + "|" + escape + ")*",
        s           = "[ \\t\\r\\n\\f]+",
        w           = "(?:" + s + ")?",

        //return the token information
        symbols = [
            {
                name: "S",
                pattern: s,
                whitespace: true
            },
            {
                name: "COMMENT",
                pattern: comment,
                hide: true   //don't generate token
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
                pattern: string1 + "|" + string2,
            },
            {
                name: "INVALID",
                pattern: invalid1 + "|" + invalid2,
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
                pattern: num + "px|" + num + "cm|" + num + "mm|" + num + "in|" + num + "pt|" + num + "pc",
                patternOpt: "i"
            },
            {
                name: "ANGLE",
                pattern: num + "deg|" + num + "rad|" + num + "grad",
                patternOpt: "i"
            },
            {
                name: "TIME",
                pattern: num + "ms|" + num + "s",
                patternOpt: "i"
            },
            {
                name: "FREQ",
                pattern: num + "hz|" + num + "khz",
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
                pattern: "url\\(" + w + string + w + "\\)" + "|" + "url\\(" + w + url + w + "\\)"
            },
            {
                name: "FUNCTION",
                pattern: ident + "\\("
            },    
        
        
            {
                name: "IDENT",
                pattern: ident
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
        
        return TokenStream.createTokenData(symbols);

}();
