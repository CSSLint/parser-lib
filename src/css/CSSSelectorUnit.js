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

