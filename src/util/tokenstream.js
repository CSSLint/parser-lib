/*
 * TokenStream implementation.
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
 
/**
 * Generic TokenStream providing base functionality.
 * @class TokenStream
 * @constructor
 * @param {String} text The text to tokenize.
 * @param {Array} tokenInfo An array of token information.
 */
function TokenStream(text, tokenInfo){

    /**
     * The string reader for easy access to the text.
     * @type StringReader
     * @property _reader
     * @private
     */
    this._reader = new StringReader(text);
    
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
     * @property _tokenInfo
     * @private
     */
    this._tokenInfo = tokenInfo;
    
    //do a little magic on the token info
    this._processTokenInfo();
}



TokenStream.prototype = {

    //restore constructor
    constructor: TokenStream,    
    
    /**
     * Pre-process token information for the token stream. The first thing it
     * does is push an EOF token to the front of token info. This means that
     * EOF is always equivalent to token type 0. Next, it processes each token
     * pattern, either text or regex, into a function called "match" that is
     * attached to the tokenInfo object. This allows for faster lexing later
     * on.
     * @return {void}
     * @method _processTokenInfo
     * @private
     */
    _processTokenInfo: function(){
        var tokenInfo   = this._tokenInfo,
            i           = 0,
            len         = tokenInfo.length + 1;
            
        //push EOF token to the front
        tokenInfo.unshift({ 
            name:   "EOF", 
            match:  function(reader){ 
                        return reader.eof() ? " " : null;
                    }
        });
            
        //create match functions for each tokenInfo object
        while (i < len){
            if (typeof tokenInfo[i].text == "string"){
                tokenInfo[i].match = function(reader){
                    return reader.readMatch(this.text);
                };
            } else if (typeof tokenInfo[i].pattern == "string"){
                tokenInfo[i].match = function(reader){
                    return reader.readMatch(new RegExp("^" + this.pattern, this.patternOpt));
                };            
            }
            i++;
        }    
    
    },
    
    //-------------------------------------------------------------------------
    // Matching methods
    //-------------------------------------------------------------------------
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, the token is placed
     * back onto the token stream.
     * @param {int} tokenType The code for the token type to check.
     * @return {Boolean} True if the token type matches, false if not.
     * @method match
     */
    match: function(tokenType){
        return this.get() == tokenType || this.unget();
    },    
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, an error is thrown.
     * @param {int} tokenType The code for the token type to check.
     * @return {void}
     * @method mustMatch
     */    
    mustMatch: function(tokenType){
        if (!this.match(tokenType)){
            throw new Error("Expected " + this._tokenNames[tokenType] + 
                " at line " + this._reader.getRow() + ", character " + this._reader.getCol() + ".");
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
    get: function(){
    
        var tokenInfo   = this._tokenInfo,
            reader      = this._reader,
            startCol    = reader.getCol(),
            startRow    = reader.getRow(),
            value,
            i           =0,
            len         = tokenInfo.length,
            found       = false,
            token       = { startCol: reader.getCol(), startRow: reader.getRow() };
        
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
        token.endRow = reader.getRow();
        
        if (found){
            token.type = i;
            token.value = value;
        } else {
            token.type = -1;
            token.value = reader.read();
        }
        
        //save for later
        this._token = token;
        
        //just return the type
        return token.type;
    },
    
    /**
     * Returns the token type for the next token in the stream without 
     * consuming it.
     * @return {int} The token type of the next token in the stream.
     * @method peek
     */
    peek: function(){
        var tokenType = this.get();
        this.unget();
        return tokenType;
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
     * @return {String} The name of the token or "UNKNOWN_TOKEN" for any
     *      invalid token type.
     * @method tokenName
     */
    tokenName: function(tokenType){
        if (tokenType < 0 || tokenType > this._tokenInfo.length){
            return "UNKNOWN_TOKEN";
        } else {
            return this._tokenInfo[tokenType].name;
        }
    },
    
    /**
     * Returns the last consumed token to the token stream.
     * @method unget
     */      
    unget: function(){
        throw new Error("Unget not yet implemented.");
    }

};



