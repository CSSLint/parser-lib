/**
 * Represents a selector combinator (whitespace, +, >).
 * @namespace parserlib.css
 * @class CombinatorUnit
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} text The text representation of the unit. 
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function CombinatorUnit(text, line, col){
    
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
        this.type = "adjacentSibling";
    }

}

CombinatorUnit.prototype = new SyntaxUnit();
CombinatorUnit.prototype.constructor = CombinatorUnit;

