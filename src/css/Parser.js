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
                    value = new CombinatorUnit(token.value, token.startLine, token.startCol);
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
                    token,
                    line,
                    col;
                    
                if (tokenStream.peek() == Tokens.STAR && this.options.starHack ||
                        tokenStream.peek() == Tokens.UNDERSCORE && this.options.underscoreHack){
                    tokenStream.get();
                    token = tokenStream.token();
                    hack = token.value;
                    line = token.startLine;
                    col = token.startCol;
                }
                
                if(tokenStream.match(Tokens.IDENT)){
                    token = tokenStream.token();
                    value = new PropertyUnit(token.value, hack, (line||token.startLine), (col||token.startCol));
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
                
                if (this._declaration()){
                    
                    //if there's a semicolon, there may be another declaration
                    while(tokenStream.match(Tokens.SEMICOLON)){
                        this._declaration();
                    }
                }
                
                tokenStream.mustMatch(Tokens.RBRACE);
                
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
                    if (!tokenStream.match(Tokens.S, "ws")){               
                        return selector;
                    }           

                    //add whitespace separator
                    ws = new CombinatorUnit(tokenStream.token().value, tokenStream.token().startLine, tokenStream.token().startCol);
                    
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
                            return tokenStream.match(Tokens.HASH) ?
                                    new SelectorUnitPart(tokenStream.token().value, "id", tokenStream.token().startLine, tokenStream.token().startCol) :
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
                        new SelectorUnit(elementName, modifiers, selectorText, line, col) :
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
                    return new SelectorUnitPart("." + token.value, "class", token.startLine, token.startCol);        
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
                    return new SelectorUnitPart(token.value, "elementName", token.startLine, token.startCol);        
                
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
                                        
                    return new SelectorUnitPart(value + token.value, "attribute", token.startLine, token.startCol);
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
                    pseudo = new SelectorUnitPart(":" + pseudo, "pseudo", token.startLine, token.startCol);
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
                        new ValueUnit(unary !== null ? unary + value : value, line, col) :
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
                        throw new Error("Expected a hex color but found '" + color + "' at line " + token.startLine + ", character " + token.startCol + ".");
                    }
                }
                
                return color;
            },
            
          
            
            _unexpectedToken: function(token){
                throw new Error("Unexpected token '" + token.value + "' at line " + token.startLine + ", char " + token.startCol + ".");
            },
            
            
            
            parse: function(input){    
                this._tokenStream = new TokenStream(input, Tokens);
                this._stylesheet();
            }
            
        };
        
    for (prop in additions){
        proto[prop] = additions[prop];
    }   
    
    return proto;
}();