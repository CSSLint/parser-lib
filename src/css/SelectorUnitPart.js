/**
 * Represents a selector modifier string, meaning a class name, element name,
 * element ID, pseudo rule, etc.
 * @namespace parserlib.css
 * @class SelectorUnitPart
 * @extends parserlib.util.SyntaxUnit
 * @constructor
 * @param {String} text The text representation of the unit. 
 * @param {String} type The type of selector modifier.
 * @param {int} line The line of text on which the unit resides.
 * @param {int} col The column of text on which the unit resides.
 */
function SelectorUnitPart(text, type, line, col){
    
    SyntaxUnit.call(this, text, line, col);

    /**
     * The type of modifier.
     * @type String
     * @property type
     */
    this.type = type;

}

SelectorUnitPart.prototype = new SyntaxUnit();
SelectorUnitPart.prototype.constructor = SelectorUnitPart;

