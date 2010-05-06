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

//-----------------------------------------------------------------------------
// CSS Token Stream
//-----------------------------------------------------------------------------


function CSSTokenStream(input){

    this.input = (typeof input == "string" ? new StringReader(input) : input);

    this._token = null;
}

CSSTokenStream.prototype = {

    token: function(){
        return this._token;
    },

    get: function(channel){
    
        var c,
            reader = this.input,
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
        
        this._token = token;
        return token.type;
    },
    
    charToken: function(c, startLine, startCol){
        var tt      = Tokens.type(c) || -1,
            reader  = this.input;
            
        return this.createToken(tt, c, startLine, startCol);
    },
    comparisonToken: function(c, startLine, startCol){
        var reader  = this.input,
            comparison  = c + reader.read(),
            tt      = Tokens.type(comparison) || -1;
            
        return this.createToken(tt, comparison, startLine, startCol);
    },
    whitespaceToken: function(first, startLine, startCol){
        var reader  = this.input,
            value   = first + this.readWhitespace();
        return this.createToken(Tokens.S, value, startLine, startCol);            
    },

    numberToken: function(first, startLine, startCol){
        var reader  = this.input,
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
        var reader  = this.input,
            comment = this.readComment(first);

        return this.createToken(Tokens.COMMENT, comment, startLine, startCol);    
    },
    
    hashToken: function(first, startLine, startCol){
        var reader  = this.input,
            name    = this.readName(first);

        return this.createToken(Tokens.HASH, name, startLine, startCol);    
    },
    
    identOrFunctionToken: function(first, startLine, startCol){
        var reader  = this.input,
            ident   = this.readName(first),
            tt      = Tokens.IDENT;

        //if there's a left paren immediately after, it's a URI or function
        if (reader.peek() == "("){
            ident += reader.read();
            if (ident.toLowerCase() == "url("){
                tt = Tokens.URI;
                ident = readURI(ident);
            } else {
                tt = Tokens.FUNCTION;
            }
        }

        return this.createToken(tt, ident, startLine, startCol);    
    },
    
    importantToken: function(first, startLine, startCol){
        var reader      = this.input,
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
            reader  = this.input,
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
            reader  = this.input,
            tt      = -1,
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
        var reader  = this.input,
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
        var reader  = this.input,
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
    readString: function(first){
        return first;
        //TODO
    
    },
    readName: function(first){
        var reader  = this.input,
            ident   = first,
            c       = reader.peek();
        

        while(c && isNameChar(c)){
            ident += reader.read();
            c = reader.peek();
        }
        
        return ident;
    },    
    readComment: function(first){
        var reader  = this.input,
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
        var reader = this.input;
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


};

