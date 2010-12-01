
 
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


/**
 * A token stream that produces CSS tokens.
 * @param {String|Reader} input The source of text to tokenize.
 * @constructor
 * @class TokenStream
 * @namespace parserlib.css
 */
function TokenStream(input){
	TokenStreamBase.call(this, input, Tokens);
}

TokenStream.prototype = mix(new TokenStreamBase(), {

    /**
     * Overrides the TokenStreamBase method of the same name
     * to produce CSS tokens.
     * @param {variant} channel The name of the channel to use
     *      for the next token.
     * @return {Object} A token object representing the next token.
     * @method _getToken
     * @private
     */
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
                 * - PREFIXMATCH
                 * - SUFFIXMATCH
                 * - SUBSTRINGMATCH
                 * - CHAR
                 */
                case "|":
                case "~":
                case "^":
                case "$":
                case "*":
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
                 * - CHAR
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
                 * - PERCENTAGE
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
                 * - PERCENTAGE
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
    
    //-------------------------------------------------------------------------
    // Methods to create tokens
    //-------------------------------------------------------------------------
    
    /**
     * Produces a token based on available data and the current
     * reader position information. This method is called by other
     * private methods to create tokens and is never called directly.
     * @param {int} tt The token type.
     * @param {String} value The text value of the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @param {Object} options (Optional) Specifies a channel property
     *      to indicate that a different channel should be scanned
     *      and/or a hide property indicating that the token should
     *      be hidden.
     * @return {Object} A token object.
     * @method createToken
     */    
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
    
    /**
     * Produces a character token based on the given character
     * and location in the stream. If there's a special (non-standard)
     * token name, this is used; otherwise CHAR is used.
     * @param {String} c The character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method charToken
     */
    charToken: function(c, startLine, startCol){
        var tt = Tokens.type(c) || Tokens.UNKNOWN;            
        return this.createToken(tt, c, startLine, startCol);
    },    
    
    /**
     * Produces a character token based on the given character
     * and location in the stream. If there's a special (non-standard)
     * token name, this is used; otherwise CHAR is used.
     * @param {String} first The first character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method commentToken
     */    
    commentToken: function(first, startLine, startCol){
        var reader  = this._reader,
            comment = this.readComment(first);

        return this.createToken(Tokens.COMMENT, comment, startLine, startCol);    
    },    
    
    /**
     * Produces a comparison token based on the given character
     * and location in the stream. The next character must be
     * read and is already known to be an equals sign.
     * @param {String} c The character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method comparisonToken
     */    
    comparisonToken: function(c, startLine, startCol){
        var reader  = this._reader,
            comparison  = c + reader.read(),
            tt      = Tokens.type(comparison) || Tokens.UNKNOWN;
            
        return this.createToken(tt, comparison, startLine, startCol);
    },
    
    /**
     * Produces a hash token based on the specified information. The
     * first character provided is the pound sign (#) and then this
     * method reads a name afterward.
     * @param {String} first The first character (#) in the hash name.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method hashToken
     */    
    hashToken: function(first, startLine, startCol){
        var reader  = this._reader,
            name    = this.readName(first);

        return this.createToken(Tokens.HASH, name, startLine, startCol);    
    },
    
    /**
     * Produces an IDENT or FUNCTION token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the identifier.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method identOrFunctionToken
     */    
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
        } else if (reader.peek() == ":"){  //might be an IE function
            
            //IE-specific functions always being with progid:
            if (ident.toLowerCase() == "progid"){
                ident += reader.readTo("(");
                tt = Tokens.IE_FUNCTION;
            }
        }

        return this.createToken(tt, ident, startLine, startCol);    
    },
    
    /**
     * Produces an IMPORTANT_SYM or CHAR token based on the specified information. The
     * first character is provided and the rest is read by the function to determine
     * the correct token to create.
     * @param {String} first The first character in the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method importantToken
     */      
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

    /**
     * Produces a number token based on the given character
     * and location in the stream. This may return a token of
     * NUMBER, EMS, EXS, LENGTH, ANGLE, TIME, FREQ, DIMENSION,
     * or PERCENTAGE.
     * @param {String} first The first character for the token.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method numberToken
     */    
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
    
    /**
     * Produces a string token based on the given character
     * and location in the stream. Since strings may be indicated
     * by single or double quotes, a failure to match starting
     * and ending quotes results in an INVALID token being generated.
     * The first character in the string is passed in and then
     * the rest are read up to and including the final quotation mark.
     * @param {String} first The first character in the string.
     * @param {int} startLine The beginning line for the character.
     * @param {int} startCol The beginning column for the character.
     * @return {Object} A token object.
     * @method stringToken
     */    
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
    
    whitespaceToken: function(first, startLine, startCol){
        var reader  = this._reader,
            value   = first + this.readWhitespace();
        return this.createToken(Tokens.S, value, startLine, startCol);            
    },    
    
    atRuleToken: function(first, startLine, startCol){
        var rule    = first,
            reader  = this._reader,
            tt      = Tokens.UNKNOWN,
            valid   = false,
            ident,
            c;            
                    
        /*
         * First, mark where we are. There are only four @ rules,
         * so anything else is really just an invalid token.
         * Basically, if this doesn't match one of the known @
         * rules, just return '@' as an unknown token and allow
         * parsing to continue after that point.
         */
        reader.mark();
        
        //try to find the at-keyword        
        ident = this.readName();
        tt = Tokens.type(first + ident.toLowerCase());
        
        /*
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
        */
        
        //if it's not valid, use the first character only and reset the reader
        if (tt == Tokens.UNKNOWN){        
            rule = first;
            reader.reset();
        }            
            
        return this.createToken(tt, rule, startLine, startCol);        
    },



    //-------------------------------------------------------------------------
    // Methods to read values from the string stream
    //-------------------------------------------------------------------------
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
            ident   = first || "",
            c       = reader.peek();
        

        while(c && isNameChar(c)){
            ident += reader.read();
            c = reader.peek();
        }
        
        return ident;
    },    
    readComment: function(first){
        var reader  = this._reader,
            comment = first || "",
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
    



});

