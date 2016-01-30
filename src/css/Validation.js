//This file will likely change a lot! Very experimental!
/*global Properties, ValidationTypes, ValidationError, PropertyValueIterator */
var Validation = {

    validate: function(property, value){

        //normalize name
        var name        = property.toString().toLowerCase(),
            expression  = new PropertyValueIterator(value),
            spec        = Properties[name];

        if (!spec) {
            if (name.indexOf("-") !== 0){    //vendor prefixed are ok
                throw new ValidationError("Unknown property '" + property + "'.", property.line, property.col);
            }
        } else if (typeof spec !== "number"){

            //initialization
            if (typeof spec === "string"){
                if (spec.indexOf("||") > -1) {
                    this.groupProperty(spec, expression);
                } else {
                    this.singleProperty(spec, expression, 1);
                }

            } else if (spec.multi) {
                this.multiProperty(spec.multi, expression, spec.comma, spec.max || Infinity);
            } else if (typeof spec === "function") {
                spec(expression);
            }

        }

    },

    singleProperty: function(types, expression, max, partial) {

        var result      = false,
            value       = expression.value,
            count       = 0,
            part;

        while (expression.hasNext() && count < max) {
            result = ValidationTypes.isAny(expression, types);
            if (!result) {
                break;
            }
            count++;
        }

        if (!result) {
            if (expression.hasNext() && !expression.isFirst()) {
                part = expression.peek();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                 throw new ValidationError("Expected (" + types + ") but found '" + value + "'.", value.line, value.col);
            }
        } else if (expression.hasNext()) {
            part = expression.next();
            throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
        }

    },

    multiProperty: function (types, expression, comma, max) {

        var result      = false,
            value       = expression.value,
            count       = 0,
            part;

        while(expression.hasNext() && !result && count < max) {
            if (ValidationTypes.isAny(expression, types)) {
                count++;
                if (!expression.hasNext()) {
                    result = true;

                } else if (comma) {
                    if (String(expression.peek()) === ",") {
                        part = expression.next();
                    } else {
                        break;
                    }
                }
            } else {
                break;

            }
        }

        if (!result) {
            if (expression.hasNext() && !expression.isFirst()) {
                part = expression.peek();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                part = expression.previous();
                if (comma && String(part) === ",") {
                    throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
                } else {
                    throw new ValidationError("Expected (" + types + ") but found '" + value + "'.", value.line, value.col);
                }
            }

        } else if (expression.hasNext()) {
            part = expression.next();
            throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
        }

    },

    groupProperty: function (types, expression, comma) {

        var result      = false,
            value       = expression.value,
            typeCount   = types.split("||").length,
            groups      = { count: 0 },
            partial     = false,
            name,
            part;

        while(expression.hasNext() && !result) {
            name = ValidationTypes.isAnyOfGroup(expression, types);
            if (name) {

                //no dupes
                if (groups[name]) {
                    break;
                } else {
                    groups[name] = 1;
                    groups.count++;
                    partial = true;

                    if (groups.count === typeCount || !expression.hasNext()) {
                        result = true;
                    }
                }
            } else {
                break;
            }
        }

        if (!result) {
            if (partial && expression.hasNext()) {
                    part = expression.peek();
                    throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected (" + types + ") but found '" + value + "'.", value.line, value.col);
            }
        } else if (expression.hasNext()) {
            part = expression.next();
            throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
        }
    }



};
