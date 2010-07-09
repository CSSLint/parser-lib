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
(function(){
var EventTarget = parserlib.util.EventTarget,
TokenStreamBase = parserlib.util.TokenStreamBase,
StringReader = parserlib.util.StringReader,
SyntaxError = parserlib.util.SyntaxError,
SyntaxUnit  = parserlib.util.SyntaxUnit;

var Colors = {
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
};
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
function Combinator(text, line, col){
    
    SyntaxUnit.call(this, text, line, col);

    /**
     * The type of modifier.
     * @type String
     * @property type
     */
    this.type = "unknown";
    
    //pretty simple
    if (/^\s+$/.test(text)){
        this.type = "descendant";
    } else if (text == ">"){
        this.type = "child";
    } else if (text == "+"){
        this.type = "adjacent-sibling";
    }

}

Combinator.prototype = new SyntaxUnit();
Combinator.prototype.constructor = Combinator;



var Level1Properties = {

    "background": 1,
    "background-attachment": 1,
    "background-color": 1,
    "background-image": 1,
    "background-position": 1,
    "background-repeat": 1,
 
    "border": 1,
    "border-bottom": 1,
    "border-bottom-width": 1,
    "border-color": 1,
    "border-left": 1,
    "border-left-width": 1,
    "border-right": 1,
    "border-right-width": 1,
    "border-style": 1,
    "border-top": 1,
    "border-top-width": 1,
    "border-width": 1,
 
    "clear": 1,
    "color": 1,
    "display": 1,
    "float": 1,
 
    "font": 1,
    "font-family": 1,
    "font-size": 1,
    "font-style": 1,
    "font-variant": 1,
    "font-weight": 1,
 
    "height": 1,
    "letter-spacing": 1,
    "line-height": 1,
 
    "list-style": 1,
    "list-style-image": 1,
    "list-style-position": 1,
    "list-style-type": 1,
 
    "margin": 1,
    "margin-bottom": 1,
    "margin-left": 1,
    "margin-right": 1,
    "margin-top": 1,
 
    "padding": 1,
    "padding-bottom": 1,
    "padding-left": 1,
    "padding-right": 1,
    "padding-top": 1,
 
    "text-align": 1,
    "text-decoration": 1,
    "text-indent": 1,
    "text-transform": 1,
 
    "vertical-align": 1,
    "white-space": 1,
    "width": 1,
    "word-spacing": 1
    
};

var Level2Properties = {

    //Aural
    "azimuth": 1,
    "cue-after": 1,
    "cue-before": 1,
    "cue": 1,
    "elevation": 1,
    "pause-after": 1,
    "pause-before": 1,
    "pause": 1,
    "pitch-range": 1,
    "pitch": 1,
    "play-during": 1,
    "richness": 1,
    "speak-header": 1,
    "speak-numeral": 1,
    "speak-punctuation": 1,
    "speak": 1,
    "speech-rate": 1,
    "stress": 1,
    "voice-family": 1,
    "volume": 1,
    
    //Paged
    "orphans": 1,
    "page-break-after": 1,
    "page-break-before": 1,
    "page-break-inside": 1,
    "widows": 1,

    //Interactive
    "cursor": 1,
    "outline-color": 1,
    "outline-style": 1,
    "outline-width": 1,
    "outline": 1,    
    
    //Visual
    "background-attachment": 1,
    "background-color": 1,
    "background-image": 1,
    "background-position": 1,
    "background-repeat": 1,
    "background": 1,    
    "border-collapse": 1,
    "border-color": 1,
    "border-spacing": 1,
    "border-style": 1,
    "border-top": 1,
    "border-top-color": 1,
    "border-top-style": 1,
    "border-top-width": 1,
    "border-width": 1,
    "border": 1,
    "bottom": 1,    
    "caption-side": 1,
    "clear": 1,
    "clip": 1,
    "color": 1,
    "content": 1,
    "counter-increment": 1,
    "counter-reset": 1,
    "direction": 1,
    "display": 1,
    "empty-cells": 1,
    "float": 1,
    "font-family": 1,
    "font-size": 1,
    "font-style": 1,
    "font-variant": 1,
    "font-weight": 1,
    "font": 1,
    "height": 1,
    "left": 1,
    "letter-spacing": 1,
    "line-height": 1,
    "list-style-image": 1,
    "list-style-position": 1,
    "list-style-type": 1,
    "list-style": 1,
    "margin-right": 1,
    "margin-top": 1,
    "margin": 1,
    "max-height": 1,
    "max-width": 1,
    "min-height": 1,
    "min-width": 1,
    "overflow": 1,
    "padding-top": 1,
    "padding": 1,
    "position": 1,
    "quotes": 1,
    "right": 1,
    "table-layout": 1,
    "text-align": 1,
    "text-decoration": 1,
    "text-indent": 1,
    "text-transform": 1,
    "top": 1,
    "unicode-bidi": 1,
    "vertical-align": 1,
    "visibility": 1,
    "white-space": 1,
    "width": 1,
    "word-spacing": 1,
    "z-index": 1
};
/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
 
/**
 * A CSS 2.1 parsers.
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
function Parser(options){

    //inherit event functionality
    EventTarget.call(this);


    this.options = options || {};

    this._tokenStream = null;
}

Parser.prototype = function(){

    var proto = new EventTarget(),  //new prototype
        prop,
        additions =  {
        
            //restore constructor
            constructor: Parser,
        
        
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
                if (tokenStream.match(Tokens.CHARSET_SYM)){
                    tokenStream.mustMatch(Tokens.STRING);
                    token = tokenStream.token();
                    charset = token.value;
                    tokenStream.mustMatch(Tokens.SEMICOLON);
                    this.fire({ 
                        type:       "charset",
                        charset:    charset
                    });
                }
                
                //try to read imports - may be more than one
                while (tokenStream.peek() == Tokens.IMPORT_SYM){
                    this._import();
                }
                
                //get the next token
                tt = tokenStream.get();
                
                //try to read the rest
                while(tt > Tokens.EOF){
                
                    switch(tt){
                        case Tokens.MEDIA_SYM:
                            tokenStream.unget();
                            this._media();
                            break;
                        case Tokens.PAGE_SYM:
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
                
                if (tt != Tokens.EOF){
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
                tokenStream.mustMatch(Tokens.IMPORT_SYM);
                
                //next must be either a string or URI
                if (!tokenStream.match(Tokens.STRING)){
                    tokenStream.mustMatch(Tokens.URI);
                }
                
                //grab the URI
                uri = tokenStream.token().value.replace(/(?:url\()?["']([^"']+)["']\)?/, "$1");                

                //check for media information
                if (tokenStream.peek() == Tokens.IDENT){
                    mediaList = this._media_list();
                }
                
                //must end with a semicolon
                tokenStream.mustMatch(Tokens.SEMICOLON);
                
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
                tokenStream.mustMatch(Tokens.MEDIA_SYM);
        
                //read the medialist
                mediaList = this._media_list();
         
                tokenStream.mustMatch(Tokens.LBRACE);
                
                this.fire({
                    type:   "startmedia",
                    media:  mediaList
                });
                
                while(this._ruleset()){}
                
                tokenStream.mustMatch(Tokens.RBRACE);
        
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
                while (tokenStream.match(Tokens.COMMA)){                
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
                tokenStream.mustMatch(Tokens.IDENT);                
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
                tokenStream.mustMatch(Tokens.PAGE_SYM);
                
                //see if there's a colon upcoming
                if (tokenStream.peek() == Tokens.COLON){
                    pseudoPage = this._pseudo_page();
                }
            
                tokenStream.mustMatch(Tokens.LBRACE);
            
                this.fire({
                    type:   "startpage",
                    pseudo: pseudoPage
                });            
        
                while(this._declaration()){
                    if (!tokenStream.match(Tokens.SEMICOLON)){
                        break;
                    }                    
                }
                
                tokenStream.mustMatch(Tokens.RBRACE);
                tokenStream.match(Tokens.S);
                
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
                
                tokenStream.mustMatch(Tokens.COLON);
                tokenStream.mustMatch(Tokens.IDENT);
                
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
                
                if (tokenStream.match([Tokens.SLASH, Tokens.COMMA])){
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
                    value       = null,
                    token;
                
                if(tokenStream.match([Tokens.PLUS, Tokens.GREATER])){                
                    token = tokenStream.token();
                    value = new Combinator(token.value, token.startLine, token.startCol);
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
                
                if (tokenStream.match([Tokens.MINUS, Tokens.PLUS])){
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
                    value       = null,
                    hack        = null,
                    tokenValue,
                    token,
                    line,
                    col;
                    
                //check for star hack - throws error if not allowed
                if (tokenStream.peek() == Tokens.STAR && this.options.starHack){
                    tokenStream.get();
                    token = tokenStream.token();
                    hack = token.value;
                    line = token.startLine;
                    col = token.startCol;
                }
                
                if(tokenStream.match(Tokens.IDENT)){
                    token = tokenStream.token();
                    tokenValue = token.value;
                    
                    //check for underscore hack - no error if not allowed because it's valid CSS syntax
                    if (tokenValue.charAt(0) == "_" && this.options.underscoreHack){
                        hack = "_";
                        tokenValue = tokenValue.substring(1);
                    }
                    
                    value = new PropertyName(tokenValue, hack, (line||token.startLine), (col||token.startCol));
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
                    selector    = null,
                    tt;
                
                selector = this._selector();
                if (selector !== null){
                
                    selectors.push(selector);
                    while(tokenStream.match(Tokens.COMMA)){
                        selector = this._selector();
                        if (selector !== null){
                            selectors.push(selector);
                        }
                    }
                } else {
                    return null;
                }        
                
                tokenStream.mustMatch(Tokens.LBRACE);
                
                this.fire({
                    type:       "startrule",
                    selectors:  selectors
                });                
                
                this._rulesetEnd();                
                
                this.fire({
                    type:       "endrule",
                    selectors:  selectors
                });  
                
                return selectors;
                
            },
            
            //abstracted for _ruleset for error correction
            _rulesetEnd: function(){
            
                /* Partial:
                 * declaration? [ ';' S* declaration? ]* '}'
                 */            
            
                var tokenStream = this._tokenStream,
                    tt;
                    
                try {
                    if (this._declaration()){
                        
                        //if there's a semicolon, there may be another declaration
                        while(this._tokenStream.match(Tokens.SEMICOLON)){
                            this._declaration();
                        }
                    }
                    tokenStream.mustMatch(Tokens.RBRACE);
                } catch (ex) {
                    if (ex instanceof SyntaxError && !this.options.strict){
                    
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
                        if (tt == Tokens.SEMICOLON){
                            //if there's a semicolon, then there might be another declaration
                            this._rulesetEnd();
                        } else if (tt == Tokens.RBRACE){
                            //if there's a right brace, the rule is finished so don't do anything
                        } else {
                            //otherwise, rethrow the error because it wasn't handled properly
                            throw ex;
                        }                        
                        
                    } else {
                        //not a syntax error, rethrow it
                        throw ex;
                    }
                }
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
                    
                        //nextSelector is an instance of Selector, but we really just want the parts
                        selector = selector.concat(nextSelector.parts);
                    }
                } else {
                    
                    //if there's not whitespace, we're done
                    if (tokenStream.match(Tokens.S, "ws")){           
    
                        //add whitespace separator
                        ws = new Combinator(tokenStream.token().value, tokenStream.token().startLine, tokenStream.token().startCol);
                        
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
                            
                            selector = selector.concat(nextSelector.parts);
                        }     
                    }                
                
                }                
                
                return new Selector(selector, selector[0].line, selector[0].col);
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
                            return tokenStream.match(Tokens.HASH) ?
                                    new SelectorSubPart(tokenStream.token().value, "id", tokenStream.token().startLine, tokenStream.token().startCol) :
                                    null;
                        },
                        this._class,
                        this._attrib,
                        this._pseudo            
                    ],
                    i           = 0,
                    len         = components.length,
                    component   = null,
                    found       = false,
                    line,
                    col;
                    
                elementName = this._element_name();
                if (elementName == null){
                
                    while(i < len && component == null){
                        component = components[i++].call(this);
                    }
        
                    //if it's still null, then we don't have a selector
                    if (component === null){
                        return null;
                    }
                    
                    modifiers.push(component);
                    selectorText = component.toString();
                } else {
                    selectorText = elementName.toString();
                }

                //get starting line and column for the selector
                line = tokenStream.token().startLine;
                col = tokenStream.token().startCol;
                        
                i = 0;
                while(i < len){
                
                    //whitespace means we're done
                    found = tokenStream.match(Tokens.S, "ws");                    
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
                        new SelectorPart(elementName, modifiers, selectorText, line, col) :
                        null;
            },
            
            _class: function(){
                /*
                 * class
                 *   : '.' IDENT
                 *   ;
                 */    
                 
                var tokenStream = this._tokenStream,
                    token;
                
                if (tokenStream.match(Tokens.DOT)){
                    tokenStream.mustMatch(Tokens.IDENT);    
                    token = tokenStream.token();
                    return new SelectorSubPart("." + token.value, "class", token.startLine, token.startCol);        
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
                
                var tokenStream = this._tokenStream,
                    token;
                
                if (tokenStream.match([Tokens.IDENT, Tokens.STAR])){
                    token = tokenStream.token();
                    return new SelectorSubPart(token.value, "elementName", token.startLine, token.startCol);        
                
                } else {
                    return null;
                }
            },
            
            _attrib: function(){
                /*
                 * attrib
                 *   : '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S*
                 *     [ IDENT | STRING ] S* ]? ']'
                 *   ;    
                 */
                 
                var tokenStream = this._tokenStream,
                    value       = null,
                    token;
                
                if (tokenStream.match(Tokens.LBRACKET)){
                    value = tokenStream.token().value;

                    tokenStream.mustMatch(Tokens.IDENT);
                    value += tokenStream.token().value;
                    
                    //may or may not be more to this expression
                    if(tokenStream.match([Tokens.EQUALS, Tokens.INCLUDES, Tokens.DASHMATCH])){               
                        
                        value += tokenStream.token().value;
                        
                        tokenStream.mustMatch(Tokens.IDENT, Tokens.STRING);
                        
                        value += tokenStream.token().value;                    
                    }
                    
                    tokenStream.mustMatch(Tokens.RBRACKET);
                    token = tokenStream.token();
                                        
                    return new SelectorSubPart(value + token.value, "attribute", token.startLine, token.startCol);
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
                    pseudo      = null,
                    token;
                
                if (tokenStream.match(Tokens.COLON)){
                
                    if (tokenStream.match(Tokens.IDENT)){
                        pseudo = tokenStream.token().value;
                    } else if (tokenStream.mustMatch(Tokens.FUNCTION)){
                        pseudo = tokenStream.token().value;
                        
                        if (tokenStream.match(Tokens.IDENT)){
                            pseudo += tokenStream.token().value;
                        }
                        
                        tokenStream.mustMatch(Tokens.RPAREN);
                        pseudo += tokenStream.token().value;
                    }
                    
                    token = tokenStream.token();
                    pseudo = new SelectorSubPart(":" + pseudo, "pseudo", token.startLine, token.startCol);
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
                    
                    tokenStream.mustMatch(Tokens.COLON);
                    
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
                 
                return this._tokenStream.match(Tokens.IMPORTANT_SYM);  
            },
            
            _expr: function(){
                /*
                 * expr
                 *   : term [ operator? term ]*
                 *   ;
                 */
        
                var tokenStream = this._tokenStream,
                    values      = [],
					valueParts	= [],
                    value       = null,
                    operator    = null;
                    
                value = this._term();
                if (value !== null){
                
                    valueParts.push(value);
                    
                    do {
                        operator = this._operator();
        
                        //if there's an operator, keep building up the value parts
                        if (operator){
                            valueParts.push(operator);
                        } else {
                            //if there's not an operator, you have a full value
							values.push(new PropertyValue(valueParts, valueParts[0].line, valueParts[0].col));
							valueParts = [];
						}
                        
                        value = this._term();
                        
                        if (value === null){
                            break;
                        } else {
                            valueParts.push(value);
                        }
                    } while(true);
                }
				
				//cleanup
                if (valueParts.length){
                    values.push(new PropertyValue(valueParts, valueParts[0].line, valueParts[0].col));
                }
        
                return values.length == 1 ? values[0] : values;
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
               
                //exception for IE filters
                if (tokenStream.peek() == Tokens.IE_FILTER && this.options.ieFilters){
                    tokenStream.get();
                    value = tokenStream.token().value;
                    if (unary === null){
                        line = tokenStream.token().startLine;
                        col = tokenStream.token().startCol;
                    }
                
                //see if there's a simple match
                } else if (tokenStream.match([Tokens.NUMBER, Tokens.PERCENTAGE, Tokens.LENGTH,
                        Tokens.EMS, Tokens.EXS, Tokens.ANGLE, Tokens.TIME,
                        Tokens.FREQ, Tokens.STRING, Tokens.IDENT, Tokens.URI])){
                 
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
                        new PropertyValuePart(unary !== null ? unary + value : value, line, col) :
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
                    
                if (tokenStream.match(Tokens.FUNCTION)){
                    functionText = tokenStream.token().value;
                    expr = this._expr();
                    
                    tokenStream.match(Tokens.RPAREN);    
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
                
                if(tokenStream.match(Tokens.HASH)){
                
                    //need to do some validation here
                    
                    token = tokenStream.token();
                    color = token.value;
                    if (!/#[a-f0-9]{3,6}/i.test(color)){
                        throw new SyntaxError("Expected a hex color but found '" + color + "' at line " + token.startLine + ", character " + token.startCol + ".", token.startLine, token.startCol);
                    }
                }
                
                return color;
            },
            
          
            
            _unexpectedToken: function(token){
                throw new SyntaxError("Unexpected token '" + token.value + "' at line " + token.startLine + ", char " + token.startCol + ".", token.startLine, token.startCol);
            },
            
            _verifyEnd: function(){
                if (this._tokenStream.LA(1) != Tokens.EOF){
                    this._unexpectedToken(this._tokenStream.LT(1));
                }            
            },
            
            //-----------------------------------------------------------------
            // Parsing methods
            //-----------------------------------------------------------------
            
            parse: function(input){    
                this._tokenStream = new TokenStream(input, Tokens);
                this._stylesheet();
            },
            
            parseSelector: function(input){
                this._tokenStream = new TokenStream(input, Tokens);
                var result = this._selector();
                
                //if there's anything more, then it's an invalid selector
                this._verifyEnd();
                
                //otherwise return result
                return result;
            }
            
        };
        
    //copy over onto prototype
    for (prop in additions){
        proto[prop] = additions[prop];
    }   
    
    return proto;
}();
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
function PropertyName(text, hack, line, col){
    
    SyntaxUnit.call(this, (hack||"") + text, line, col);

    /**
     * The type of IE hack applied ("*", "_", or null).
     * @type String
     * @property hack
     */
    this.hack = hack;

}

PropertyName.prototype = new SyntaxUnit();
PropertyName.prototype.constructor = PropertyName;


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
function PropertyValue(parts, line, col){

    SyntaxUnit.call(this, parts.join(" "), line, col);
    
    /**
     * The parts that make up the selector.
     * @type Array
     * @property parts
     */
    this.parts = parts;
    
}

PropertyValue.prototype = new SyntaxUnit();
PropertyValue.prototype.constructor = PropertyValue;


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
function PropertyValuePart(text, line, col){

    SyntaxUnit.apply(this,arguments);
    
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
    } else if (Colors[text.toLowerCase()]){  //named color
        this.type   = "color";
        temp        = Colors[text.toLowerCase()].substring(1);
        this.red    = parseInt(temp.substring(0,2),16);
        this.green  = parseInt(temp.substring(2,4),16);
        this.blue   = parseInt(temp.substring(4,6),16);         
    }


}

PropertyValuePart.prototype = new SyntaxUnit();
PropertyValuePart.prototype.constructor = PropertyValue;


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
function Selector(parts, line, col){
    
    SyntaxUnit.call(this, parts.join(" "), line, col);
    
    /**
     * The parts that make up the selector.
     * @type Array
     * @property parts
     */
    this.parts = parts;

}

Selector.prototype = new SyntaxUnit();
Selector.prototype.constructor = Selector;


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
function SelectorPart(elementName, modifiers, text, line, col){
    
    SyntaxUnit.call(this, text, line, col);

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
function SelectorSubPart(text, type, line, col){
    
    SyntaxUnit.call(this, text, line, col);

    /**
     * The type of modifier.
     * @type String
     * @property type
     */
    this.type = type;

}

SelectorSubPart.prototype = new SyntaxUnit();
SelectorSubPart.prototype.constructor = SelectorSubPart;


/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
 
var h = /^[0-9a-fA-F]$/,
    nonascii = /^[\u0080-\uFFFF]$/,
    nl = /\n|\r\n|\r|\f/;

//-----------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------
    
 
function isHexDigit(c){
    return c != null && h.test(c);
}

function isDigit(c){
    return c != null && /\d/.test(c);
}

function isWhitespace(c){
    return c != null && /\s/.test(c);
}

function isNewLine(c){
    return c != null && nl.test(c);
}

function isNameStart(c){
    return c != null && (/[a-z_\u0080-\uFFFF\\]/i.test(c));
}

function isNameChar(c){
    return c != null && (isNameStart(c) || /[0-9\-]/.test(c));
}

function isIdentStart(c){
    return c != null && (isNameStart(c) || c == "-");
}

function mix(receiver, supplier){
	for (var prop in supplier){
		if (supplier.hasOwnProperty(prop)){
			receiver[prop] = supplier[prop];
		}
	}
	return receiver;
}

//-----------------------------------------------------------------------------
// CSS Token Stream
//-----------------------------------------------------------------------------


function TokenStream(input){
	TokenStreamBase.call(this, input, Tokens);
}

TokenStream.prototype = mix(new TokenStreamBase(), {

    _getToken: function(channel){
    
        var c,
            reader = this._reader,
            token   = null,
            startLine   = reader.getLine(),
            startCol    = reader.getCol();
        
        c = reader.read();
        

        while(c){
            switch(c){
            
                /*
                 * Potential tokens:
                 * - COMMENT
                 * - SLASH
                 * - UNKNOWN
                 */
                case "/":

                    if(reader.peek() == "*"){
                        token = this.commentToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;                    
                
                /*
                 * Potential tokens:
                 * - DASHMATCH
                 * - INCLUDES
                 * - UNKNOWN
                 */
                case "|":
                case "~":
                    if(reader.peek() == "="){
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
                 */
                case "#":
                    if (isNameChar(reader.peek())){
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
                 * - LENGTH
                 * - FREQ
                 * - TIME
                 * - EMS
                 * - EXS
                 * - ANGLE
                 */
                case ".":
                    if (isDigit(reader.peek())){
                        token = this.numberToken(c, startLine, startCol);                        
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;                    
                    
                /*
                 * Potential tokens:
                 * - MINUS
                 * - NUMBER
                 * - DIMENSION
                 * - LENGTH
                 * - FREQ
                 * - TIME
                 * - EMS
                 * - EXS
                 * - ANGLE
                 */
                case "-":
                    if (isNameStart(reader.peek())){
                        token = this.identOrFunctionToken(c, startLine, startCol);
                    } else {
                        token = this.charToken(c, startLine, startCol);
                    }
                    break;
                
                /*
                 * Potential tokens:
                 * - IMPORTANT_SYM
                 * - UNKNOWN
                 */
                case "!":
                    token = this.importantToken(c, startLine, startCol);
                    break;
                    
                /*
                 * Potential tokens:
                 * - IMPORT_SYM
                 * - PAGE_SYM
                 * - MEDIA_SYM
                 * - CHARSET_SYM
                 */
                case "@":
                    token = this.atRuleToken(c, startLine, startCol);
                    break;
                    
                    
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
                    if (isDigit(c)){
                        token = this.numberToken(c, startLine, startCol);
                    } else 
                
                    /*
                     * Potential tokens:
                     * - S
                     */
                    if (isWhitespace(c)){
                        token = this.whitespaceToken(c, startLine, startCol);
                    } else 
                    
                    /*
                     * Potential tokens:
                     * - IDENT
                     */                    
                    if (isIdentStart(c)){
                        token = this.identOrFunctionToken(c, startLine, startCol);
                    } else 
                    
                    /*
                     * Potential tokens:
                     * - UNKNOWN
                     * - PLUS
                     */
                    {
                        token = this.charToken(c, startLine, startCol);                    
                    }
        
        
        
        
        
        
            }
            
            //make sure this token is wanted
            //TODO: check channel
            break;
            
            c = reader.read();
        }
        
        if (!token && c == null){
            token = this.createToken(Tokens.EOF,null,startLine,startCol);
        }
        
        return token;
    },
    
    charToken: function(c, startLine, startCol){
        var tt      = Tokens.type(c) || -1,
            reader  = this._reader;
            
        return this.createToken(tt, c, startLine, startCol);
    },
    comparisonToken: function(c, startLine, startCol){
        var reader  = this._reader,
            comparison  = c + reader.read(),
            tt      = Tokens.type(comparison) || -1;
            
        return this.createToken(tt, comparison, startLine, startCol);
    },
    whitespaceToken: function(first, startLine, startCol){
        var reader  = this._reader,
            value   = first + this.readWhitespace();
        return this.createToken(Tokens.S, value, startLine, startCol);            
    },

    numberToken: function(first, startLine, startCol){
        var reader  = this._reader,
            value   = this.readNumber(first),
            ident,
            tt      = Tokens.NUMBER,
            c       = reader.peek();
            
        if (isIdentStart(c)){
            ident = this.readName(reader.read());
            value += ident;
            
            if (/em/i.test(ident)){
                tt = Tokens.EMS;
            } else if (/ex/i.test(ident)){
                tt = Tokens.EXS;
            } else if (/px|cm|mm|in|pt|pc/i.test(ident)){
                tt = Tokens.LENGTH;
            } else if (/deg|rad|grad/i.test(ident)){
                tt = Tokens.ANGLE;
            } else if (/ms|s/i.test(ident)){
                tt = Tokens.TIME;
            } else if (/hz|khz/i.test(ident)){
                tt = Tokens.FREQ;
            } else {
                tt = Tokens.DIMENSION;
            }
        } else if (c == "%"){
            value += reader.read();
            tt = Tokens.PERCENTAGE;
        }
            

        return this.createToken(tt, value, startLine, startCol);            
    },
    
    commentToken: function(first, startLine, startCol){
        var reader  = this._reader,
            comment = this.readComment(first);

        return this.createToken(Tokens.COMMENT, comment, startLine, startCol);    
    },
    
    hashToken: function(first, startLine, startCol){
        var reader  = this._reader,
            name    = this.readName(first);

        return this.createToken(Tokens.HASH, name, startLine, startCol);    
    },
    
    identOrFunctionToken: function(first, startLine, startCol){
        var reader  = this._reader,
            ident   = this.readName(first),
            tt      = Tokens.IDENT;

        //if there's a left paren immediately after, it's a URI or function
        if (reader.peek() == "("){
            ident += reader.read();
            if (ident.toLowerCase() == "url("){
                tt = Tokens.URI;
                ident = this.readURI(ident);
                
                //didn't find a valid URL or there's no closing paren
                if (ident.toLowerCase() == "url("){
                    tt = Tokens.FUNCTION;
                }
            } else {
                tt = Tokens.FUNCTION;
            }
        }

        return this.createToken(tt, ident, startLine, startCol);    
    },
    
    importantToken: function(first, startLine, startCol){
        var reader      = this._reader,
            important   = first,
            tt          = -1,
            temp,
            c;

        reader.mark();
        c = reader.read();
            
        while(c){
        
            //there can be a comment in here
            if (c == "/"){
            
                //if the next character isn't a star, then this isn't a valid !important token
                if (reader.peek() != "*"){
                    break;
                } else {
                    temp = this.readComment(c);
                    if (temp == ""){    //broken!
                        break;
                    }
                }
            } else if (isWhitespace(c)){
                important += c + this.readWhitespace();
            } else if (/i/i.test(c)){
                temp = reader.readCount(8);
                if (/mportant/i.test(temp)){
                    important += c + temp;
                    tt = Tokens.IMPORTANT_SYM;
                    
                }
                break;  //we're done
            } else {
                break;
            }
        
            c = reader.read();
        }
        
        if (tt == -1){
            reader.reset();
            return this.charToken(first, startLine, startCol);
        } else {
            return this.createToken(tt, important, startLine, startCol);
        }
        
        
    },
    
    stringToken: function(first, startLine, startCol){
        var delim   = first,
            string  = first,
            reader  = this._reader,
            prev    = first,
            tt      = Tokens.STRING,
            c       = reader.read();
            
        while(c){
            string += c;
            
            //if the delimiter is found with an escapement, we're done.
            if (c == delim && prev != "\\"){
                break;
            }

            //if there's a newline without an escapement, it's an invalid string
            if (isNewLine(reader.peek()) && c != "\\"){
                tt = Tokens.INVALID;
                break;
            }
        
            //save previous and get next
            prev = c;
            c = reader.read();
        }
        
        //if c is null, that means we're out of input and the string was never closed
        if (c == null){
            tt = Tokens.INVALID;
        }
            
        return this.createToken(tt, string, startLine, startCol);        
    },
    
    atRuleToken: function(first, startLine, startCol){
        var rule    = first,
            reader  = this._reader,
            tt      = Tokens.UNKNOWN,
            valid   = false,
            c;
            
        /*
         * First, mark where we are. There are only four @ rules,
         * so anything else is really just an invalid token.
         * Basically, if this doesn't match one of the known @
         * rules, just return '@' as an unknown token and allow
         * parsing to continue after that point.
         */
        reader.mark();
        
        rule += c = reader.read();
        
        switch(c){
        
            //might be @import
            case "i":
            case "I":
                rule += reader.readCount(5);
                valid = /@import/i.test(rule);
                if (valid){
                    tt = Tokens.IMPORT_SYM;
                }
                break;
                
            //might be @page
            case "p":
            case "P":
                rule += reader.readCount(3);
                valid = /@page/i.test(rule);
                if (valid){
                    tt = Tokens.PAGE_SYM;
                }
                break;
                
            //might be @media
            case "m":
            case "M":
                rule += reader.readCount(4);
                valid = /@media/i.test(rule);
                if (valid){
                    tt = Tokens.MEDIA_SYM;
                }
                break;
                
            //might be @charset, requires space after
            case "c":
                rule += reader.readCount(7);
                valid = (rule == "@charset ");
                if (valid){
                    tt = Tokens.CHARSET_SYM;
                }
                break;

            //no default
        }
        
        //if it's not valid, use the first character only and reset the reader
        if (!valid){        
            rule = first;
            reader.reset();
        }            
            
        return this.createToken(tt, rule, startLine, startCol);        
    },


    readWhitespace: function(){
        var reader  = this._reader,
            whitespace = "",
            c       = reader.peek();
        
        while(isWhitespace(c)){
            reader.read();
            whitespace += c;
            c = reader.peek();            
        }
        
        return whitespace;
    },
    readNumber: function(first){
        var reader  = this._reader,
            number  = first,
            hasDot  = (first == "."),
            c       = reader.peek();
        

        while(c){
            if (isDigit(c)){
                number += reader.read();
            } else if (c == "."){
                if (hasDot){
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
    readString: function(){
        var reader  = this._reader,
            delim   = reader.read(),
            string  = delim,            
            prev    = delim,
            c       = reader.peek();
            
        while(c){
            c = reader.read();
            string += c;
            
            //if the delimiter is found with an escapement, we're done.
            if (c == delim && prev != "\\"){
                break;
            }

            //if there's a newline without an escapement, it's an invalid string
            if (isNewLine(reader.peek()) && c != "\\"){
                string = "";
                break;
            }
        
            //save previous and get next
            prev = c;
            c = reader.peek();
        }
        
        //if c is null, that means we're out of input and the string was never closed
        if (c == null){
            string = "";
        }
                
        return string;
    },
    readURI: function(first){
        var reader  = this._reader,
            uri     = first,
            inner   = "",
            c       = reader.peek();
            
        reader.mark();
            
        //it's a string
        if (c == "'" || c == "\""){
            inner = this.readString();
        } else {
            inner = this.readURL();
        }
        
        c = reader.peek();
        
        //if there was no inner value or the next character isn't closing paren, it's not a URI
        if (inner == "" || c != ")"){
            uri = first;
            reader.reset();
        } else {
            uri += inner + reader.read();
        }
                
        return uri;
    },
    readURL: function(){
        var reader  = this._reader,
            url     = "",
            c       = reader.peek();
    
        //TODO: Check for escape and nonascii
        while (/^[!#$%&\\*-~]$/.test(c)){
            url += reader.read();
            c = reader.peek();
        }
    
        return url;
    
    },
    readName: function(first){
        var reader  = this._reader,
            ident   = first,
            c       = reader.peek();
        

        while(c && isNameChar(c)){
            ident += reader.read();
            c = reader.peek();
        }
        
        return ident;
    },    
    readComment: function(first){
        var reader  = this._reader,
            comment = first,
            c       = reader.read();
        
        if (c == "*"){
            while(c){
                comment += c;
                
                //look for end of comment
                if (c == "*" && reader.peek() == "/"){
                    comment += reader.read();
                    break;
                }
                
                c = reader.read();
            }
            
            return comment;
        } else {
            return "";
        }
    
    },
    
    createToken: function(tt, value, startLine, startCol, options){
        var reader = this._reader;
        options = options || {};
        
        return {
            value:      value,
            type:       tt,
            channel:    options.channel,
            hide:       options.hide || false,
            startLine:  startLine,
            startCol:   startCol,
            endLine:    reader.getLine(),
            endCol:     reader.getCol()            
        };    
    },


});


/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
/* 
var Tokens = function(){

    //token fragments
    var h           = "[0-9a-fA-F]",
        nonascii    = "[\\u0080-\\uFFFF]",
        unicode     = "(?:\\\\" + h + "{1,6}(?:\\r\\n|[ \\t\\r\\n\\f])?)",
        escape      = "(?:" + unicode + "|\\\\[^\r\n\f0-9a-fA-F])",
        nmstart     = "(?:[_a-zA-Z]|" + nonascii + "|" + escape + ")", 
        nmchar      = "(?:[_a-zA-Z0-9\\-]|" + nonascii + "|" + escape + ")",
        nl          = "(?:\\n|\\r\\n|\\r|\\f)",
        string1     = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*\\\")",
        string2     = "(?:\\'(?:[^\\n\\r\\f\']|\\\\" + nl + "|" + escape + ")*\\')",
        invalid1    = "(?:\\\"(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        invalid2    = "(?:\\'(?:[^\\n\\r\\f\\\"]|\\\\" + nl + "|" + escape + ")*)",
        
        comment     = "\\/\\*[^\\*]*\\*+([^\/\\*][^\\*]*\\*+)*\\/",
        ident       = "(?:\\-?" + nmstart + nmchar + "*)",
        name        = nmchar + "+",
        num         = "(?:[0-9]*\\.[0-9]+|[0-9]+)",  //put decimal first as priority
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

            //exception for IE filters - yuck
            {
                name: "IE_FILTER",
                pattern: "progid:[a-z\\.]+\\([^\\)]*\\)",
                patternOpt: "i"
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
*/
var Tokens  = [
    {
        name: "S",
        channel: "ws"   //put onto another channel so I can get it later              
    },
    {
        name: "COMMENT",
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
        name: "STRING"
    },
    {
        name: "INVALID"
    },
    {
        name: "HASH"
    },
    {
        name: "IMPORT_SYM"
    },
    {
        name: "PAGE_SYM"
    },
    {
        name: "MEDIA_SYM"
    },
    {
        name: "CHARSET_SYM"
    },
    {
        name: "IMPORTANT_SYM"
    },
    {
        name: "EMS"
    },
    {
        name: "EXS"
    },
    {
        name: "LENGTH"
    },
    {
        name: "ANGLE"
    },
    {
        name: "TIME"
    },
    {
        name: "FREQ"
    },
    {
        name: "DIMENSION"
    },   
    {
        name: "PERCENTAGE"
    },
    {
        name: "NUMBER"
    },
    {
        name: "URI"
    },

    {
        name: "FUNCTION"
    },    
        
    {
        name: "IDENT"
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







var ValueTokens = (function(){


    var symbols = {
        
    
    
    
    
    
    
    
    
    
    
    
    };






















    return TokenStream.createTokenData(symbols);

});

parserlib.css = {
Colors              :Colors,    
Combinator          :Combinator,                
Parser              :Parser,
PropertyName        :PropertyName,
PropertyValue       :PropertyValue,
Selector            :Selector,
SelectorPart        :SelectorPart,
SelectorSubPart     :SelectorSubPart,
TokenStream         :TokenStream,
Tokens              :Tokens
};
})();
