/*
 * StringReader implementation.
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
 * Convenient way to read through strings.
 * @class StringReader
 * @constructor
 * @param {String} text The text to read.
 */
function StringReader(text){
    
    /**
     * The input text with line endings normalized.
     * @property _input
     * @type String
     * @private
     */
    this._input = text.replace(/\n\r?/g, "\n");
    
    
    /**
     * The row for the character to be read next.
     * @property _row
     * @type int
     * @private
     */
    this._row = 1;
    
    
    /**
     * The column for the character to be read next.
     * @property _col
     * @type int
     * @private
     */
    this._col = 1;
    
    /**
     * The index of the character in the input to be read next.
     * @property _cursor
     * @type int
     * @private
     */    
    this._cursor = 0;
}

StringReader.prototype = {

    //restore constructor
    constructor: StringReader,
        
    //-------------------------------------------------------------------------
    // Position info
    //-------------------------------------------------------------------------
    
    /**
     * Returns the column of the character to be read next.
     * @return {int} The column of the character to be read next.
     * @method getCol
     */
    getCol: function(){
        return this._col;
    },
    
    /**
     * Returns the row of the character to be read next.
     * @return {int} The row of the character to be read next.
     * @method getRow
     */    
    getRow: function(){
        return this._row ;
    },
    
    /**
     * Determines if you're at the end of the input.
     * @return {Boolean} True if there's no more input, false otherwise.
     * @method eof
     */    
    eof: function(){
        return (this._cursor == this._input.length)
    },
    
    //-------------------------------------------------------------------------
    // Basic reading
    //-------------------------------------------------------------------------
    
    /**
     * Reads the next character from the input and adjusts the row and column
     * accordingly.
     * @return {String} The next character or null if there is no next character.
     * @method read
     */
    read: function(){
        var c = null;
        
        //if we're not at the end of the input...
        if (this._cursor < this._input.length){
        
            //if the last character was a newline, increment row count
            //and reset column count
            if (this._input.charAt(this._cursor) == "\n"){
                this._row++;
                this._col=1;
            } else {
                this._col++;
            }
        
            //get character and increment cursor and column
            c = this._input.charAt(this._cursor++);
        }
        
        return c;
    },
    
    /**
     * Reverses the current position by one character, going back up through
     * the string. Adjusts column and row position.
     * @method unread
     */    
    unread: function(){
        
        //if we're not at the beginning of the input...
        if (this._cursor > 0){
        
            //decrement cursor
            this._cursor--;        
        
            //if the previous character was a newline, decrement row count
            //and reset column count
            if (this._input.charAt(this._cursor) == "\n"){
                this._row--;
                this._col=this._cursor-this._input.lastIndexOf("\n", this._cursor-1);
            } else {
                this._col--;
            }

        }
        
    },
       
    //-------------------------------------------------------------------------
    // Advanced reading
    //-------------------------------------------------------------------------
    
    /**
     * Reads up to and including the given string. Throws an error if that
     * string is not found.
     * @param {String} pattern The string to read.
     * @return {String} The string when it is found.
     * @throws Error when the string pattern is not found.
     * @method readTo
     */       
    readTo: function(pattern){
    
        var buffer = "",
            c;

        /*
         * First, buffer must be the same length as the pattern.
         * Then, buffer must end with the pattern or else reach the
         * end of the input.
         */
        while (buffer.length < pattern.length || buffer.lastIndexOf(pattern) != buffer.length - pattern.length){
            c = this.read();
            if (c){
                buffer += c;
            } else {
                throw new Error("Expected \"" + pattern + "\" at line " + this._row  + ", col " + this._col + ".");
            }
        }
        
        return buffer;
    
    },
    
    /**
     * Reads characters while each character causes the given
     * filter function to return true. The function is passed
     * in each character and either returns true to continue
     * reading or false to stop.
     * @param {Function} filter The function to read on each character.
     * @return {String} The string made up of all characters that passed the
     *      filter check.
     * @method readWhile
     */           
    readWhile: function(filter){
        
        var buffer = "",
            c = this.read();
        
        while(c !== null && filter(c)){
            buffer += c;
            c = this.read();
        }
        
        return buffer;
    
    },
    
    /**
     * Reads characters that match either text or a regular expression and
     * returns those characters. If a match is found, the row and column
     * are adjusted; if no match is found, the reader's state is unchanged.
     * reading or false to stop.
     * @param {String|RegExp} matchter If a string, then the literal string
     *      value is searched for. If a regular expression, then any string
     *      matching the pattern is search for.
     * @return {String} The string made up of all characters that matched or
     *      null if there was no match.
     * @method readMatch
     */               
    readMatch: function(matcher){
    
        var source = this._input.substring(this._cursor),
            value = null;
        
        //if it's a string, just do a straight match
        if (typeof matcher == "string"){
            if (source.indexOf(matcher) === 0){
                value = this.readCount(matcher.length); 
            }
        } else if (matcher instanceof RegExp){
            if (matcher.test(source)){
                value = this.readCount(RegExp.lastMatch.length);
            }
        }
        
        return value;        
    },
    
    
    /**
     * Reads a given number of characters. If the end of the input is reached,
     * it reads only the remaining characters and does not throw an error.
     * @param {int} count The number of characters to read.
     * @return {String} The string made up the read characters.
     * @method readCount
     */                   
    readCount: function(count){
        var buffer = "";
        
        while(count--){
            buffer += this.read();
        }
        
        return buffer;
    },
    
    
    /**
     * Unreads a set number of characters. If the beginning of the input is
     * reached, it stops at that point and does not throw an error.
     * @param {int} count The number of characters to unread.
     * @return {void}
     * @method unreadCount
     */                   
    unreadCount: function(count){
        while(count--){
            this.unread();
        }
    }

};