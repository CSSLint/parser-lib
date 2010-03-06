/**
 * Generic TokenStream providing base functionality.
 * @class TokenStream
 * @constructor
 * @param {String|StringReader} input The text to tokenize or a reader from 
 *      which to read the input.
 * @param {Array} tokenData An array of token data information created by
 *      TokenStream.createTokenData();
 */
function TokenStream(input, tokenData){

    /**
     * The string reader for easy access to the text.
     * @type StringReader
     * @property _reader
     * @private
     */
    this._reader = (typeof input == "string") ? new StringReader(input) : input;
    
    /**
     * Token object for the last consumed token.
     * @type Token
     * @property _token
     * @private
     */
    this._token = null;    
    
    /**
     * The array of token information.
     * @type Array
     * @property _tokenData
     * @private
     */
    this._tokenData = tokenData;
    
    /**
     * Lookahead token buffer.
     * @type Array
     * @property _lt
     * @private
     */
    this._lt = [];
    
    /**
     * Lookahead token buffer index.
     * @type int
     * @property _ltIndex
     * @private
     */
    this._ltIndex = -1;
}

/**
 * Accepts an array of token information and outputs
 * an array of token data containing key-value mappings
 * and matching functions that the TokenStream needs.
 * @param {Array} tokens An array of token descriptors.
 * @return {Array} An array of processed token data.
 * @method createTokenData
 * @static
 */
TokenStream.createTokenData = function(tokens){

    var tokenData   = [],
        tokenDatum,
        i           = 0,
        len         = tokens.length;
        
    //push EOF token to the front
    tokenData.push({ 
        name:   "EOF", 
        match:  function(reader){ 
                    return reader.eof() ? " " : null;
                }
    });
        
    tokenData.EOF = 0;
    
    while (i < len){
    
        //create a copy of the token info
        tokenDatum = {
            name:       tokens[i].name,
            hide:       tokens[i].hide,
            channel:    tokens[i].channel,
            text:       tokens[i].text,
            pattern:    tokens[i].pattern,
            patternOpt: tokens[i].patternOpt,
            match:      tokens[i].match
        };
        
        //store token type values by name for easy reference
        tokenData[tokenDatum.name] = i+1;
        
        //create match functions for each tokenInfo object
        if (typeof tokenDatum.text == "string"){
            tokenDatum.match = function(reader){
                return reader.readMatch(this.text);
            };
        } else if (typeof tokenDatum.pattern == "string"){
            tokenDatum.match = function(reader){
                return reader.readMatch(new RegExp("^(?:" + this.pattern + ")", this.patternOpt));
            };            
        }
        
        i++;

        tokenData.push(tokenDatum);
    }        

    return tokenData;
};


TokenStream.prototype = {

    //restore constructor
    constructor: TokenStream,    
    
    //-------------------------------------------------------------------------
    // Matching methods
    //-------------------------------------------------------------------------
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, the token is placed
     * back onto the token stream. You can pass in any number of
     * token types and this will return true if any of the token
     * types is found.
     * @param {int|int[]} tokenTypes Either a single token type or an array of
     *      token types that the next token might be. If an array is passed,
     *      it's assumed that the token can be any of these.
     * @param {variant} channel (Optional) The channel to read from. If not
     *      provided, reads from the default (unnamed) channel.
     * @return {Boolean} True if the token type matches, false if not.
     * @method match
     */
    match: function(tokenTypes, channel){
    
        //always convert to an array, makes things easier
        if (!(tokenTypes instanceof Array)){
            tokenTypes = [tokenTypes];
        }
                
        var tt  = this.get(channel),
            i   = 0,
            len = tokenTypes.length;
            
        while(i < len){
            if (tt == tokenTypes[i++]){
                return true;
            }
        }
        
        //no match found, put the token back
        this.unget();
        return false;
    },    
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, an error is thrown.
     * @param {int|int[]} tokenTypes Either a single token type or an array of
     *      token types that the next token should be. If an array is passed,
     *      it's assumed that the token must be one of these.
     * @param {variant} channel (Optional) The channel to read from. If not
     *      provided, reads from the default (unnamed) channel.
     * @return {void}
     * @method mustMatch
     */    
    mustMatch: function(tokenTypes, channel){

        //always convert to an array, makes things easier
        if (!(tokenTypes instanceof Array)){
            tokenTypes = [tokenTypes];
        }

        if (!this.match.apply(this, arguments)){    
            token = this.LT(1);
            throw new Error("Expected " + this._tokenData[tokenTypes[0]].name + 
                " at line " + token.startLine + ", character " + token.startCol + ".");
        }
    },
    
    //-------------------------------------------------------------------------
    // Consuming methods
    //-------------------------------------------------------------------------
    
    /**
     * Consumes the next token from the token stream. 
     * @return {int} The token type of the token that was just consumed.
     * @method get
     */      
    get: function(channel){
    
        var tokenInfo   = this._tokenData,
            reader      = this._reader,
            startCol    = reader.getCol(),
            startLine   = reader.getLine(),
            value,
            i           =0,
            len         = tokenInfo.length,
            found       = false,
            token       = { startCol: startCol, startLine: startLine },
            info;
            
        //check the lookahead buffer first
        if (this._lt.length && this._ltIndex >= 0 && this._ltIndex < this._lt.length){            
            this._token = this._lt[this._ltIndex++];
            info = tokenInfo[this._token.type];
            
            //obey channels logic
            while((info.channel !== undefined && channel !== info.channel) &&
                    this._ltIndex < this._lt.length){
                this._token = this._lt[this._ltIndex++];
                info = tokenInfo[this._token.type];
            }
            
            if (this._ltIndex <= this._lt.length){
                return this._token.type;
            }
        }
        
        //test each token pattern from top to bottom
        while (i < len && !found){    
        
            //wrap in try-catch to help debug tokenInfo errors
            try {
                value = tokenInfo[i].match(reader);
            } catch (ex){
                throw new Error("Error in token info for " + tokenInfo[i].name + ": " + ex.message);
            }
            
            //if there's a value, break the loop, otherwise continue
            if (value){
                found = true;
            } else {
                i++;
            }
        }
        
        token.endCol = reader.getCol();
        token.endLine = reader.getLine();
        
        if (found){
            token.type = i;
            token.value = value;
        } else {
            token.type = -1;
            token.value = reader.read();
        }
        
        //if it should be hidden, don't save a token
        if (!tokenInfo[token.type].hide){
         
            //save for later
            this._token = token;
            this._lt.push(token);
            
            //keep the buffer under 5 items
            if (this._lt.length > 15){
                this._lt.shift();
            }
    
            //update lookahead index
            this._ltIndex = this._lt.length;
        }
            
        /*
         * Skip to the next token if:
         * 1. The token type is marked as hidden.
         * 2. The token type has a channel specified and it isn't the current channel.
         */
        info = tokenInfo[token.type];
        if (info && 
                (info.hide || 
                (info.channel !== undefined && channel !== info.channel))){
            return this.get(channel);
        } else {
            
            //return just the type
            return token.type;
        }
    },
    
    /**
     * Looks ahead a certain number of tokens and returns the token type at
     * that position. This will throw an error if you lookahead past the
     * end of input, past the size of the lookahead buffer, or back past
     * the first token in the lookahead buffer.
     * @param {int} The index of the token type to retrieve. 0 for the
     *      current token, 1 for the next, -1 for the previous, etc.
     * @return {int} The token type of the token in the given position.
     * @method LA
     */
    LA: function(index){
        var total = index,
            tt;
        if (index > 0){
            //TODO: Store 15 somewhere
            if (index > 15){
                throw new Error("Too much lookahead.");
            }
        
            //get all those tokens
            while(total){
                tt = this.get();   
                total--;                            
            }
            
            //unget all those tokens
            while(total < index){
                this.unget();
                total++;
            }
        } else if (index < 0){
        
            if(this._lt[this._ltIndex+index]){
                tt = this._lt[this._ltIndex+index].type;
            } else {
                throw new Error("Too much lookbehind.");
            }
        
        } else {
            tt = this._token.type;
        }
        
        return tt;
    
    },
    
    /**
     * Looks ahead a certain number of tokens and returns the token at
     * that position. This will throw an error if you lookahead past the
     * end of input, past the size of the lookahead buffer, or back past
     * the first token in the lookahead buffer.
     * @param {int} The index of the token type to retrieve. 0 for the
     *      current token, 1 for the next, -1 for the previous, etc.
     * @return {Object} The token of the token in the given position.
     * @method LA
     */    
    LT: function(index){
    
        //lookahead first to prime the token buffer
        this.LA(index);
        
        //now find the token, subtract one because _ltIndex is already at the next index
        return this._lt[this._ltIndex+index-1];    
    },
    
    /**
     * Returns the token type for the next token in the stream without 
     * consuming it.
     * @return {int} The token type of the next token in the stream.
     * @method peek
     */
    peek: function(){
        return this.LA(1);
    },
    
    /**
     * Returns the actual token object for the last consumed token.
     * @return {Token} The token object for the last consumed token.
     * @method token
     */
    token: function(){
        return this._token;
    },
    
    /**
     * Returns the name of the token for the given token type.
     * @param {int} tokenType The type of token to get the name of.
     * @return {String} The name of the token or "UNKNOWN_TOKEN" for any
     *      invalid token type.
     * @method tokenName
     */
    tokenName: function(tokenType){
        if (tokenType < 0 || tokenType > this._tokenData.length){
            return "UNKNOWN_TOKEN";
        } else {
            return this._tokenData[tokenType].name;
        }
    },
    
    /**
     * Returns the token type value for the given token name.
     * @param {String} tokenName The name of the token whose value should be returned.
     * @return {int} The token type value for the given token name or -1
     *      for an unknown token.
     * @method tokenName
     */    
    tokenType: function(tokenName){
        return tokenInfo[tokenName] || -1;
    },
    
    /**
     * Returns the last consumed token to the token stream.
     * @method unget
     */      
    unget: function(){
        if (this._ltIndex > -1){
            this._ltIndex--;
            this._token = this._lt[this._ltIndex - 1];
        } else {
            throw new Error("Too much lookahead.");
        }
    }

};

