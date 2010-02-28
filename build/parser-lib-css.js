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
        url         = "(?:[!#$%&\\*\\-~]|" + nonascii + "|" + escape + ")*",
        s           = "[ \\t\\r\\n\\f]+",
        w           = "(?:" + s + ")?",

        //return the token information
        symbols = [
            {
                name: "S",
                pattern: s,
                hide: true   //don't generate token
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
     * @property _text
     * @private
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

/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
function CSSParser(handler){

    EventTarget.call(this);

    this._handler = handler || {};
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
               
                var handler     = this._handler,
                    tokenStream = this._tokenStream,
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
                                this._parserError(tokenStream.token());
                            }
                    }
                    
                    tt = tokenStream.get();
                }
                
                if (tt != CSSTokens.EOF){
                    this._parserError(tokenStream.token());
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
                 
                var tokenStream = this._tokenStream;
                
                if (tokenStream.match(CSSTokens.SLASH, CSSTokens.COMMA)){
                    return tokenStream.token().value;
                } else {
                    return null;
                }
            },
            
            _combinator: function(){
            
                /*
                 * combinator
                 *  : '+' S*
                 *  | '>' S*
                 *  ;
                 */    
                 
                var tokenStream = this._tokenStream;
                
                return tokenStream.match(CSSTokens.PLUS, CSSTokens.GREATER) ?
                        tokenStream.token().value :
                        null;
            },
            
            _unary_operator: function(){
            
                /*
                 * unary_operator
                 *  : '-' | '+'
                 *  ;
                 */
                 
                var tokenStream = this._tokenStream;
                
                if (tokenStream.match(CSSTokens.MINUS, CSSTokens.PLUS)){
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
                 
                var tokenStream = this._tokenStream;
                
                return tokenStream.match(CSSTokens.IDENT) ?
                        tokenStream.token().value :
                        null;
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
                    combinator  = null;
                
                //if there's no simple selector, then there's no selector
                nextSelector = this._simple_selector();
                if (nextSelector === null){
                    return null;
                }
                
                selector.push(nextSelector);
                
                //TODO: Need to figure out whitespace issues
                //look for a combinator
                while(true){
                    combinator = this._combinator();
                    if (combinator !== null){
                        selector.push(combinator);
                    }
                    
                    nextSelector = this._selector();
                    if (nextSelector !== null){
                        selector = selector.concat(nextSelector);
                    }
                 
                    //if both are null, we're done
                    if (nextSelector === null && combinator === null){
                        break;
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
                    component   = null;
                    
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
                
                return tokenStream.match(CSSTokens.IDENT, CSSTokens.STAR) ?
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
                    if(tokenStream.match(CSSTokens.EQUALS, CSSTokens.INCLUDES, CSSTokens.DASHMATCH)){
                        
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
                            value = operator + this._term();
                        } else {
                            value = this._term();
                        }
                        
                        if (value === null){
                            break;
                        } else {
                            values.push(value);
                        }
                    } while(true);
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
                    value       = null;
                    
                //returns the operator or null
                unary = this._unary_operator();
                
                //see if there's a simple match
                if (tokenStream.match(CSSTokens.NUMBER, CSSTokens.PERCENTAGE, CSSTokens.LENGTH,
                        CSSTokens.EMS, CSSTokens.EXS, CSSTokens.ANGLE, CSSTokens.TIME,
                        CSSTokens.FREQ, CSSTokens.STRING, CSSTokens.IDENT, CSSTokens.URI)){
                 
                    value = tokenStream.token().value;
                        
                } else {
                
                    //see if it's a color
                    value = this._hexcolor();
                    if (value === null){
                    
                        //has to be a function
                        value = this._function();
                        
                        /*if (value === null){
                            return null;
                            //throw new Error("Expected identifier at line " + tokenStream.token().startLine + ", character " +  tokenStream.token().startCol + ".");
                        }*/
                    
                    }
                
                }
                
                return (unary !== null ? unary + value : value);
        
            },
            
            _function: function(){
            
                /*
                 * function
                 *   : FUNCTION S* expr ')' S*
                 *   ;
                 */
                 
                var tokenStream = this._tokenStream,
                    functionText = null;
                    
                if (tokenStream.match(CSSTokens.FUNCTION)){
                    functionText = tokenStream.token().value;
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
                        throw new Error("Expected a hex color but found '" + color + "' at line " + token.startRow + ", character " + token.startCol + ".");
                    }
                }
                
                return color;
            },
            
          
            
            _parserError: function(token){
                throw new Error("Unexpected token '" + token.value + "' at line " + token.startRow + ", char " + token.startCol + ".");
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