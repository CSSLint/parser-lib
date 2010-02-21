/*
 * CSS token information based on Flex lexical scanner grammar:
 * http://www.w3.org/TR/CSS2/grammar.html#scanner
 */    
function CSSParser(handler){

    this._handler = handler || {};
    this._tokenStream = null;
}

CSSParser.prototype = {
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
            tt;
            
        this._callHandler("startStylesheet");
    
        //try to read character set
        if (tokenStream.match(CSSTokens.CHARSET_SYM)){
            tokenStream.mustMatch(CSSTokens.STRING);
            charset = tokenStream.token().value;
            tokenStream.mustMatch(CSSTokens.SEMICOLON);
            this._callHandler("charset", [charset]);
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
                    this._ruleset();
            }
            
            tt = tokenStream.get();
        }
        
        if (tt != CSSTokens.EOF){
            throw new Error("Unexpected token '" + this._tokenStream.token().value + "'");
        }
    
        this._callHandler("endStylesheet");
    },
    
    _import: function(){
        /*
         * import
         *   : IMPORT_SYM S*
         *    [STRING|URI] S* media_list? ';' S*
         */    
    
        var tokenStream = this._tokenStream,
            tt,
            uri;
        
        //read import symbol
        tokenStream.mustMatch(CSSTokens.IMPORT_SYM);
        
        //next must be either a string or URI
        if (!tokenStream.match(CSSTokens.STRING)){
            tokenStream.mustMatch(CSSTokens.URI);
        }
        
        //grab the URI
        uri = tokenStream.token().value;
        
        //check for media information
        if (tokenStream.peek() == CSSTokens.IDENT){
            //this._medialist();
        }
        
        //must end with a semicolon
        tokenStream.mustMatch(CSSTokens.SEMICOLON);
        
        this._callHandler("import", [uri]);

    },
    
    _media: function(){
        var tokenStream     = this._tokenStream;
        
        
    },
    
    _ruleset: function(){
    
    
    },
    
    
    _callHandler: function(name, args){
        var handler = this._handler;
        
        if (handler[name]){
            handler[name].apply(handler, args || []);
        }
    },
    
    
    
    
    parse: function(input){    
        this._tokenStream = new TokenStream(input, CSSTokens);
        this._stylesheet();
    }
};
