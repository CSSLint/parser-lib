var Tokens  = [
    /*
     * The following productions are defined by http://www.w3.org/TR/css3-syntax/
     * as the tokens of CSS:
     *
     * IDENT        ::=     ident
     * ATKEYWORD    ::=     '@' ident
     * STRING       ::=     string
     * HASH         ::=     '#' name
     * NUMBER       ::=     num
     * PERCENTAGE   ::=     num '%'
     * DIMENSION    ::=     num ident
     * URI          ::=     "url(" w (string | urlchar* ) w ")"
     * UNICODE-RANGE::=     "U+" [0-9A-F?]{1,6} ('-' [0-9A-F]{1,6})?
     * CDO          ::=     "<!--"
     * CDC          ::=     "-->"
     * S            ::=     wc+
     * COMMENT      ::=     "/*" [^*]* '*'+ ([^/] [^*]* '*'+)* "/"
     * FUNCTION     ::=     ident '('
     * INCLUDES     ::=     "~="
     * DASHMATCH    ::=     "|="
     * PREFIXMATCH  ::=     "^="
     * SUFFIXMATCH  ::=     "$="
     * SUBSTRINGMATCH   ::=     "*="
     * CHAR         ::=     any other character not matched by the above rules, except for " or '
     * BOM          ::=     #xFEFF
    */
    {
        name: "IDENT"
    },
    {
        name: "ATKEYWORD"
    },
    {
        name: "STRING"
    },
    {
        name: "INVALID"
    },
    {
        name: "HASH"
    },
    {
        name: "NUMBER"
    },
    {
        name: "PERCENTAGE"
    },
    {
        name: "DIMENSION"
    },
    {
        name: "URI"
    },
    {
        name: "UNICODE_RANGE"
    },
    {
        name: "CDO"
    },
    {
        name: "CDC"
    },
    {
        name: "S",
        channel: "ws"   //put onto another channel so I can get it later              
    },
    {
        name: "COMMENT",
        hide: true   //don't generate token
    },
    {
        name: "FUNCTION"
    },    
  
/*








*/  
  

    {
        name: "INCLUDES",
        text: "~="
    },
    {
        name: "DASHMATCH",
        text: "|="
    },
    {
        name: "PREFIXMATCH",
        text: "^="
    },
    {
        name: "SUFFIXMATCH",
        text: "$="
    },
    {
        name: "SUBSTRINGMATCH",
        text: "*="
    },
    {
        name: "CHAR"
    },
    {
        name: "BOM"
    },
    
    
    
    
    //not a real token, but useful for stupid IE filters
    {
        name: "IE_FUNCTION"
    },      
    //TODO: Needed?
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

(function(){

    var nameMap = [],
        typeMap = {};
    
    Tokens.UNKNOWN = -1;
    Tokens.unshift({name:"EOF"});
    for (var i=0, len = Tokens.length; i < len; i++){
        nameMap.push(Tokens[i].name);
        Tokens[Tokens[i].name] = i;
        if (Tokens[i].text){
            typeMap[Tokens[i].text] = i;
        }
    }
    
    Tokens.name = function(tt){
        return nameMap[tt];
    };
    
    Tokens.type = function(c){
        return typeMap[c];
    };

})();



