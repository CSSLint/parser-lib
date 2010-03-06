/* 
Copyright (c) 2009 Nicholas C. Zakas. All rights reserved.

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
        url         = "(?:[!#$%&\\*-~]|" + nonascii + "|" + escape + ")*",
        s           = "[ \\t\\r\\n\\f]+",
        w           = "(?:" + s + ")?",

        //return the token information
        symbols = [
            {
                name: "S",
                pattern: s,
                channel: "ws"   //put onto another channel so I can get it later              
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
/**
 * Represents a single part of a selector string, meaning a single set of
 * element name and modifiers. This does not include combinators such as
 * spaces, +, >, etc.
 * @param {String} elementName The element name in the selector or null
 *      if there is no element name.
 * @param {Array} modifiers Array of individual modifiers for the element.
 *      May be empty if there are none.
 * @param {String} text The text representation of the unit.
 * @class CSSSelectorUnit
 * @constructor
 */
function CSSSelectorUnit(elementName, modifiers, text){
    
    /**
     * The text representation of the unit.
     * @type String
     * @property text
     */
    this.text = text;

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

CSSSelectorUnit.prototype = {

    //restore constructor
    constructor: CSSSelectorUnit,
    
    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method valueOf
     */
    valueOf: function(){
        return this.toString();
    },
    
    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method toString
     */
    toString: function(){
        return this.text;
    }

};


var CSSColors = {
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
    darkturquoise   :"#00ced1",
    darkviolet      :"#9400d3",
    deeppink        :"#ff1493",
    deepskyblue     :"#00bfff",
    dimgray         :"#696969",
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
    lightgrey       :"#d3d3d3",
    lightgreen      :"#90ee90",
    lightpink       :"#ffb6c1",
    lightsalmon     :"#ffa07a",
    lightseagreen   :"#20b2aa",
    lightskyblue    :"#87cefa",
    lightslategray  :"#778899",
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
    yellowgreen     :"#9acd32"
};/**
 * Represents a single part of a CSS property value, meaning that it represents
 * just one part of the data between ":" and ";".
 * @param {String} text The text representation of the unit.
 * @class CSSValueUnit
 * @constructor
 */
function CSSValueUnit(text, line, col){

    this.col = col;
    this.line = line;
    
    /**
     * The text representation of the unit.
     * @type String
     * @property text
     */
    this.text = text;
    
    /**
     * Indicates the type of value unit.
     * @type String
     * @property type
     */
    this.type = "unknown";

    //figure out what type of data it is
    
    var temp;
    
    //it is a measurement?
    if (/^([+\-]?[\d\.]+)([a-z]+)$/i.test(text)){  //length
        this.type = "length";
        this.value = +RegExp.$1;
        this.units = RegExp.$2 || null;
    } else if (/^([+\-]?[\d\.]+)%$/i.test(text)){  //percentage
        this.type = "percentage";
        this.value = +RegExp.$1;
    } else if (/^([+\-]?\d+)$/i.test(text)){  //integer
        this.type = "integer";
        this.value = +RegExp.$1;
    } else if (/^([+\-]?[\d\.]+)$/i.test(text)){  //number
        this.type = "number";
        this.value = +RegExp.$1;
    
    } else if (/^#([a-f0-9]{3,6})/i.test(text)){  //hexcolor
        this.type = "color";
        temp = RegExp.$1;
        if (temp.length == 3){
            this.red    = parseInt(temp.charAt(0)+temp.charAt(0),16);
            this.green  = parseInt(temp.charAt(1)+temp.charAt(1),16);
            this.blue   = parseInt(temp.charAt(2)+temp.charAt(2),16);            
        } else {
            this.red    = parseInt(temp.substring(0,2),16);
            this.green  = parseInt(temp.substring(2,4),16);
            this.blue   = parseInt(temp.substring(4,6),16);            
        }
    } else if (/^rgb\((\d+),(\d+),(\d+)\)/i.test(text)){ //rgb() color with absolute numbers
        this.type   = "color";
        this.red    = +RegExp.$1;
        this.green  = +RegExp.$2;
        this.blue   = +RegExp.$3;
    } else if (/^rgb\((\d+)%,(\d+)%,(\d+)%\)/i.test(text)){ //rgb() color with percentages
        this.type   = "color";
        this.red    = +RegExp.$1 * 255 / 100;
        this.green  = +RegExp.$2 * 255 / 100;
        this.blue   = +RegExp.$3 * 255 / 100;
    } else if (/^url\(["']?([^\)"']+)["']?\)/i.test(text)){ //URI
        this.type   = "uri";
        this.uri    = RegExp.$1;
    } else if (/^["'][^"']*["']/.test(text)){    //string
        this.type   = "string";
        this.value  = eval(text);
    } else if (CSSColors[text.toLowerCase()]){  //named color
        this.type   = "color";
        temp        = CSSColors[text.toLowerCase()].substring(1);
        this.red    = parseInt(temp.substring(0,2),16);
        this.green  = parseInt(temp.substring(2,4),16);
        this.blue   = parseInt(temp.substring(4,6),16);         
    }


}

CSSValueUnit.prototype = {

    //restore constructor
    constructor: CSSValueUnit,
    
    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method valueOf
     */
    valueOf: function(){
        return this.toString();
    },
    
    /**
     * Returns the text representation of the unit.
     * @return {String} The text representation of the unit.
     * @method toString
     */
    toString: function(){
        return this.text;
    }

};

/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
function CSSParser(handler){

    //inherit event functionality
    EventTarget.call(this);

    this._tokenStream = null;
}

CSSParser.prototype = function(){

    var proto = new EventTarget(),  //new prototype
        prop,
        additions =  {
        
            //restore constructor
            constructor: CSSParser,
        
        
            _stylesheet: function(){
            
                /*
                 * stylesheet
                 *   : [ CHARSET_SYM STRING ';' ]?
                 *     [ import ]*
                 *     [ [ ruleset | media | page ] ]*
                 */ 
               
                var tokenStream = this._tokenStream,
                    charset     = null,
                    token,
                    tt;
                    
                this.fire("startstylesheet");
            
                //try to read character set
                if (tokenStream.match(CSSTokens.CHARSET_SYM)){
                    tokenStream.mustMatch(CSSTokens.STRING);
                    token = tokenStream.token();
                    charset = token.value;
                    tokenStream.mustMatch(CSSTokens.SEMICOLON);
                    this.fire({ 
                        type:       "charset",
                        charset:    charset
                    });
                }
                
                //try to read imports - may be more than one
                while (tokenStream.peek() == CSSTokens.IMPORT_SYM){
                    this._import();
                }
                
                //get the next token
                tt = tokenStream.get();
                
                //try to read the rest
                while(tt > CSSTokens.EOF){
                
                    switch(tt){
                        case CSSTokens.MEDIA_SYM:
                            tokenStream.unget();
                            this._media();
                            break;
                        case CSSTokens.PAGE_SYM:
                            tokenStream.unget();
                            this._page(); 
                            break;                   
                        default:
                            tokenStream.unget();
                            
                            if(!this._ruleset()){
                                tokenStream.get();  //re-get the last token
                                this._unexpectedToken(tokenStream.token());
                            }
                    }
                    
                    tt = tokenStream.get();
                }
                
                if (tt != CSSTokens.EOF){
                    this._unexpectedToken(tokenStream.token());
                }
            
                this.fire("endstylesheet");
            },
            
            _import: function(){
                /*
                 * import
                 *   : IMPORT_SYM S*
                 *    [STRING|URI] S* media_list? ';' S*
                 */    
            
                var tokenStream = this._tokenStream,
                    tt,
                    uri,
                    mediaList   = [];
                
                //read import symbol
                tokenStream.mustMatch(CSSTokens.IMPORT_SYM);
                
                //next must be either a string or URI
                if (!tokenStream.match(CSSTokens.STRING)){
                    tokenStream.mustMatch(CSSTokens.URI);
                }
                
                //grab the URI
                uri = tokenStream.token().value.replace(/(?:url\()?["']([^"']+)["']\)?/, "$1");                

                //check for media information
                if (tokenStream.peek() == CSSTokens.IDENT){
                    mediaList = this._media_list();
                }
                
                //must end with a semicolon
                tokenStream.mustMatch(CSSTokens.SEMICOLON);
                
                this.fire({
                    type:   "import",
                    uri:    uri,
                    media:  mediaList                
                });
        
            },
            
            _media: function(){
                /*
                 * media
                 *   : MEDIA_SYM S* media_list LBRACE S* ruleset* '}' S*
                 *   ;
                 */
                var tokenStream     = this._tokenStream,
                    mediaList       = [];
                
                //look for @media
                tokenStream.mustMatch(CSSTokens.MEDIA_SYM);
        
                //read the medialist
                mediaList = this._media_list();
         
                tokenStream.mustMatch(CSSTokens.LBRACE);
                
                this.fire({
                    type:   "startmedia",
                    media:  mediaList
                });
                
                while(this._ruleset()){}
                
                tokenStream.mustMatch(CSSTokens.RBRACE);
        
                this.fire({
                    type:   "endmedia",
                    media:  mediaList
                });
            },    
        
            _media_list: function(){
                /*         
                 * media_list
                 *   : medium [ COMMA S* medium]*
                 *   ;
                 */    
            
                var tokenStream     = this._tokenStream,
                    mediaList       = [];
           
                //must be at least one
                mediaList.push(this._medium());
           
                //check for more
                while (tokenStream.match(CSSTokens.COMMA)){                
                    mediaList.push(this._medium());
                }
        
                return mediaList;    
            },
            
            _medium: function(){
                /*
                 * medium
                 *   : IDENT S*
                 */        
                var tokenStream = this._tokenStream;
                tokenStream.mustMatch(CSSTokens.IDENT);                
                return tokenStream.token().value;
            },
        
            _page: function(){
                /*
                 * page
                 *   : PAGE_SYM S* pseudo_page?
                 *     '{' S* declaration? [ ';' S* declaration? ]* '}' S*
                 *   ;
                 */     
                var tokenStream = this._tokenStream,
                    pseudoPage  = null;
                
                //look for @page
                tokenStream.mustMatch(CSSTokens.PAGE_SYM);
                
                //see if there's a colon upcoming
                if (tokenStream.peek() == CSSTokens.COLON){
                    pseudoPage = this._pseudo_page();
                }
            
                tokenStream.mustMatch(CSSTokens.LBRACE);
            
                this.fire({
                    type:   "startpage",
                    pseudo: pseudoPage
                });            
        
                while(this._declaration()){
                    if (!tokenStream.match(CSSTokens.SEMICOLON)){
                        break;
                    }                    
                }
                
                tokenStream.mustMatch(CSSTokens.RBRACE);
                tokenStream.match(CSSTokens.S);
                
                this.fire({
                    type:   "startpage",
                    pseudo: pseudoPage
                });  
                
            },
            
            _pseudo_page: function(){
                /*
                 * pseudo_page
                 *   : ':' IDENT S*
                 *   ;    
                 */
        
                var tokenStream = this._tokenStream;
                
                tokenStream.mustMatch(CSSTokens.COLON);
                tokenStream.mustMatch(CSSTokens.IDENT);
                
                return tokenStream.token().value;
            },
            
            _operator: function(){
            
                /*
                 * operator
                 *  : '/' S* | ',' S*
                 *  ;
                 */    
                 
                var tokenStream = this._tokenStream,
                    value       = null;
                
                if (tokenStream.match([CSSTokens.SLASH, CSSTokens.COMMA])){
                    value =  tokenStream.token().value;
                } 
                return value;
                
            },
            
            _combinator: function(){
            
                /*
                 * combinator
                 *  : '+' S*
                 *  | '>' S*
                 *  ;
                 */    
                 
                var tokenStream = this._tokenStream,
                    value       = null;
                
                if(tokenStream.match([CSSTokens.PLUS, CSSTokens.GREATER])){                
                    value = tokenStream.token().value;
                }
                
                return value;
            },
            
            _unary_operator: function(){
            
                /*
                 * unary_operator
                 *  : '-' | '+'
                 *  ;
                 */
                 
                var tokenStream = this._tokenStream;
                
                if (tokenStream.match([CSSTokens.MINUS, CSSTokens.PLUS])){
                    return tokenStream.token().value;
                } else {
                    return null;
                }         
            },
            
            _property: function(){
            
                /*
                 * property
                 *   : IDENT S*
                 *   ;        
                 */
                 
                var tokenStream = this._tokenStream,
                    value       = null;
                
                if(tokenStream.match(CSSTokens.IDENT)){
                    value = tokenStream.token().value;
                }
                
                return value;
            },
        
        
            _ruleset: function(){
                /*
                 * ruleset
                 *   : selector [ ',' S* selector ]*
                 *     '{' S* declaration? [ ';' S* declaration? ]* '}' S*
                 *   ;    
                 */    
                 
                var tokenStream = this._tokenStream,
                    selectors   = [],
                    selector    = null;
                
                selector = this._selector();
                if (selector !== null){
                
                    selectors.push(selector);
                    while(tokenStream.match(CSSTokens.COMMA)){
                        selector = this._selector();
                        if (selector !== null){
                            selectors.push(selector);
                        }
                    }
                } else {
                    return null;
                }        
                
                tokenStream.mustMatch(CSSTokens.LBRACE);
                
                this.fire({
                    type:       "startrule",
                    selectors:  selectors
                });                
                
                if (this._declaration()){
                    
                    //if there's a semicolon, there may be another declaration
                    while(tokenStream.match(CSSTokens.SEMICOLON)){
                        this._declaration();
                    }
                }
                
                tokenStream.mustMatch(CSSTokens.RBRACE);
                
                this.fire({
                    type:       "endrule",
                    selectors:  selectors
                });  
                
                return selectors;
                
            },
            
            _selector: function(){
                /*
                 * selector
                 *   : simple_selector [ combinator selector | S+ [ combinator? selector ]? ]?
                 *   ;    
                 */
                 
                var tokenStream = this._tokenStream,
                    selector    = [],
                    nextSelector = null,
                    combinator  = null,
                    ws          = null;
                
                //if there's no simple selector, then there's no selector
                nextSelector = this._simple_selector();
                if (nextSelector === null){
                    return null;
                }
                
                selector.push(nextSelector);
                
                //TODO: Cleanup this next section
                
                //look for a combinator
                combinator = this._combinator();
                if (combinator !== null){
                    selector.push(combinator);
                    nextSelector = this._selector();
                    
                    //there must be a next selector
                    if (nextSelector === null){
                        this._unexpectedToken(this.LT(1));
                    } else {
                        selector.concat(nextSelector);
                    }
                } else {
                    
                    //if there's not whitespace, we're done
                    if (!tokenStream.match(CSSTokens.S, "ws")){               
                        return selector;
                    }           

                    //add whitespace separator
                    ws = tokenStream.token().value;
                    
                    //combinator is not required
                    combinator = this._combinator();
                    
                    //selector is required if there's a combinator
                    nextSelector = this._selector();
                    if (nextSelector === null){                        
                        if (combinator !== null){
                            this._unexpectedToken(tokenStream.LT(1));
                        }
                    } else {
                        
                        if (combinator !== null){
                            selector.push(combinator);
                        } else {
                            selector.push(ws);
                        }
                        
                        selector = selector.concat(nextSelector);
                    }                    
                
                }                
                
                return selector;
            },
            
            
            /**
             * Parses a simple selector. A simple selector has the form
             * elementName#elementId.className:pseudo.
             * @method _simple_selector
             */
            _simple_selector: function(){
                /*
                 * simple_selector
                 *   : element_name [ HASH | class | attrib | pseudo ]*
                 *   | [ HASH | class | attrib | pseudo ]+
                 *   ;    
                 */
                 
                var tokenStream = this._tokenStream,
                
                    //parts of a simple selector
                    elementName = null,
                    modifiers   = [],
                    
                    //complete selector text
                    selectorText= null,

                    components  = [
                        //HASH
                        function(){
                            return tokenStream.match(CSSTokens.HASH) ?
                                    tokenStream.token().value :
                                    null;
                        },
                        this._class,
                        this._attrib,
                        this._pseudo            
                    ],
                    i           = 0,
                    len         = components.length,
                    component   = null,
                    found       = false;
                    
                selectorText = elementName = this._element_name();
                if (selectorText == null){
                
                    while(i < len && selectorText == null){
                        selectorText = components[i++].call(this);
                    }
        
                    //if it's still null, then we don't have a selector
                    if (selectorText === null){
                        return null;
                    }
                    
                    modifiers.push(selectorText);
                } 
                        
                i = 0;
                while(i < len){
                
                    //whitespace means we're done
                    found = tokenStream.match(CSSTokens.S, "ws");
                    
                    if (found){
                        tokenStream.unget();
                        break;
                    }
                
                    component = components[i++].call(this);
                    
                    //if it's not null, then reset i to keep looping
                    if (component !== null){
                        i = 0;
                        modifiers.push(component);
                        selectorText += component;
                    }
                }
                 
                return selectorText !== null ?
                        new CSSSelectorUnit(elementName, modifiers, selectorText) :
                        null;
            },
            
            _class: function(){
                /*
                 * class
                 *   : '.' IDENT
                 *   ;
                 */    
                 
                var tokenStream = this._tokenStream;
                
                if (tokenStream.match(CSSTokens.DOT)){
                    tokenStream.mustMatch(CSSTokens.IDENT);            
                    return "." + tokenStream.token().value;        
                } else {
                    return null;
                }
        
            },
            
            _element_name: function(){
                /*
                 * element_name
                 *   : IDENT | '*'
                 *   ;
                 */    
                
                var tokenStream = this._tokenStream;
                
                return tokenStream.match([CSSTokens.IDENT, CSSTokens.STAR]) ?
                        tokenStream.token().value :
                        null;
            },
            
            _attrib: function(){
                /*
                 * attrib
                 *   : '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S*
                 *     [ IDENT | STRING ] S* ]? ']'
                 *   ;    
                 */
                 
                var tokenStream = this._tokenStream,
                    value       = null;
                
                if (tokenStream.match(CSSTokens.LBRACKET)){
                    value = tokenStream.token().value;

                    tokenStream.mustMatch(CSSTokens.IDENT);
                    value += tokenStream.token().value;
                    
                    //may or may not be more to this expression
                    if(tokenStream.match([CSSTokens.EQUALS, CSSTokens.INCLUDES, CSSTokens.DASHMATCH])){               
                        
                        value += tokenStream.token().value;
                        
                        tokenStream.mustMatch(CSSTokens.IDENT, CSSTokens.STRING);
                        
                        value += tokenStream.token().value;                    
                    }
                    
                    tokenStream.mustMatch(CSSTokens.RBRACKET);
                    
                    return value + tokenStream.token().value;
                } else {
                    return null;
                }
            },
            
            _pseudo: function(){
            
                /*
                 * pseudo
                 *   : ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
                 *   ;    
                 */   
            
                var tokenStream = this._tokenStream,
                    pseudo      = null;
                
                if (tokenStream.match(CSSTokens.COLON)){
                
                    if (tokenStream.match(CSSTokens.IDENT)){
                        pseudo = tokenStream.token().value;
                    } else if (tokenStream.mustMatch(CSSTokens.FUNCTION)){
                        pseudo = tokenStream.token().value;
                        
                        if (tokenStream.match(CSSTokens.IDENT)){
                            pseudo += tokenStream.token().value;
                        }
                        
                        tokenStream.mustMatch(CSSTokens.RPAREN);
                        pseudo += tokenStream.token().value;
                    }
                }
        
                return pseudo;
            },
            
            _declaration: function(){
            
                /*
                 * declaration
                 *   : property ':' S* expr prio?
                 *   ;     
                 */    
            
                var tokenStream = this._tokenStream,
                    property    = null,
                    expr        = null,
                    prio        = null;
                
                property = this._property();
                if (property !== null){
                    
                    tokenStream.mustMatch(CSSTokens.COLON);
                    
                    expr = this._expr();
                    
                    //if there's no parts for the value, it's an error
                    if (expr.length === 0){
                        this._unexpectedToken(tokenStream.LT(1));
                    }
                    
                    prio = this._prio();
                    
                    this.fire({
                        type:       "property",
                        property:   property,
                        value:      expr,
                        important:  prio
                    });                      
                    
                    return true;
                } else {
                    return false;
                }
            },
            
            _prio: function(){
                /*
                 * prio
                 *   : IMPORTANT_SYM S*
                 *   ;    
                 */
                 
                return this._tokenStream.match(CSSTokens.IMPORTANT_SYM);  
            },
            
            _expr: function(){
                /*
                 * expr
                 *   : term [ operator? term ]*
                 *   ;
                 */
        
                var tokenStream = this._tokenStream,
                    values      = [],
                    value       = null,
                    operator    = null;
                    
                value = this._term();
                if (value !== null){
                
                    values.push(value);
                    
                    do {
                        operator = this._operator();
        
                        if (operator){
                            values.push(operator);
                        }
                        
                        value = this._term();
                        
                        if (value === null){
                            break;
                        } else {
                            values.push(value);
                        }
                    } while(true);
                }
        
                return /*values.length == 1 ? values[0] :*/ values;
            },
            
            _term: function(){
            
                /*
                 * term
                 *   : unary_operator?
                 *     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
                 *       TIME S* | FREQ S* ]
                 *   | STRING S* | IDENT S* | URI S* | hexcolor | function
                 *   ;   
                 */    
        
                var tokenStream = this._tokenStream,
                    unary       = null,
                    value       = null,
                    line,
                    col;
                    
                //returns the operator or null
                unary = this._unary_operator();
                if (unary !== null){
                    line = tokenStream.token().startLine;
                    col = tokenStream.token().startCol;
                }
                
                //see if there's a simple match
                if (tokenStream.match([CSSTokens.NUMBER, CSSTokens.PERCENTAGE, CSSTokens.LENGTH,
                        CSSTokens.EMS, CSSTokens.EXS, CSSTokens.ANGLE, CSSTokens.TIME,
                        CSSTokens.FREQ, CSSTokens.STRING, CSSTokens.IDENT, CSSTokens.URI])){
                 
                    value = tokenStream.token().value;
                    if (unary === null){
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol;
                    }
                } else {
                
                    //see if it's a color
                    value = this._hexcolor();
                    if (value === null){
                    
                        //if there's no unary, get the start of the next token for line/col info
                        if (unary === null){
                            line = tokenStream.LT(1).startLine;
                            col = tokenStream.LT(1).startCol;
                        }
                    
                        //has to be a function
                        value = this._function();
                        
                        /*if (value === null){
                            return null;
                            //throw new Error("Expected identifier at line " + tokenStream.token().startLine + ", character " +  tokenStream.token().startCol + ".");
                        }*/
                    
                    } else {
                        if (unary === null){
                            line = tokenStream.token().startLine;
                            col = tokenStream.token().startCol;
                        }                    
                    }
                
                }                
                
                return value !== null ?
                        new CSSValueUnit(unary !== null ? unary + value : value, line, col) :
                        null;
        
            },
            
            _function: function(){
            
                /*
                 * function
                 *   : FUNCTION S* expr ')' S*
                 *   ;
                 */
                 
                var tokenStream = this._tokenStream,
                    functionText = null,
                    expr        = null;
                    
                if (tokenStream.match(CSSTokens.FUNCTION)){
                    functionText = tokenStream.token().value;
                    expr = this._expr();
                    
                    tokenStream.match(CSSTokens.RPAREN);    
                    functionText += expr.join("") + ")"
                }                
                
                return functionText;
            }, 
            
            _hexcolor: function(){
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
                    token,
                    color = null;
                
                if(tokenStream.match(CSSTokens.HASH)){
                
                    //need to do some validation here
                    
                    token = tokenStream.token();
                    color = token.value;
                    if (!/#[a-f0-9]{3,6}/i.test(color)){
                        throw new Error("Expected a hex color but found '" + color + "' at line " + token.startLine + ", character " + token.startCol + ".");
                    }
                }
                
                return color;
            },
            
          
            
            _unexpectedToken: function(token){
                throw new Error("Unexpected token '" + token.value + "' at line " + token.startLine + ", char " + token.startCol + ".");
            },
            
            
            
            parse: function(input){    
                this._tokenStream = new TokenStream(input, CSSTokens);
                this._stylesheet();
            }
            
        };
        
    for (prop in additions){
        proto[prop] = additions[prop];
    }   
    
    return proto;
}();