//This file will likely change a lot! Very experimental!
/*global ValidationError */
var ValidationTypes = {

    isLiteral: function (part, literals) {
        var text = part.text.toString().toLowerCase(),
            args = literals.split(" | "),
            i, len, found = false;

        for (i=0,len=args.length; i < len && !found; i++){
            if (text === args[i].toLowerCase()){
                found = true;
            }
        }

        return found;
    },

    isSimple: function(type) {
        return !!this.simple[type];
    },

    isComplex: function(type) {
        return !!this.complex[type];
    },

    /**
     * Determines if the next part(s) of the given expression
     * are any of the given types.
     */
    isAny: function (expression, types) {
        var args = types.split(" | "),
            i, len, found = false;

        for (i=0,len=args.length; i < len && !found && expression.hasNext(); i++){
            found = this.isType(expression, args[i]);
        }

        return found;
    },

    /**
     * Determines if the next part(s) of the given expression
     * are one of a group.
     */
    isAnyOfGroup: function(expression, types) {
        var args = types.split(" || "),
            i, len, found = false;

        for (i=0,len=args.length; i < len && !found; i++){
            found = this.isType(expression, args[i]);
        }

        return found ? args[i-1] : false;
    },

    /**
     * Determines if the next part(s) of the given expression
     * are of a given type.
     */
    isType: function (expression, type) {
        var part = expression.peek(),
            result = false;

        if (type.charAt(0) !== "<") {
            result = this.isLiteral(part, type);
            if (result) {
                expression.next();
            }
        } else if (this.simple[type]) {
            result = this.simple[type](part);
            if (result) {
                expression.next();
            }
        } else {
            result = this.complex[type](expression);
        }

        return result;
    },



    simple: {

        "<absolute-size>": function(part){
            return ValidationTypes.isLiteral(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
        },

        "<attachment>": function(part){
            return ValidationTypes.isLiteral(part, "scroll | fixed | local");
        },

        "<attr>": function(part){
            return part.type === "function" && part.name === "attr";
        },

        "<bg-image>": function(part){
            return this["<image>"](part) || this["<gradient>"](part) ||  part == "none";
        },

        "<gradient>": function(part) {
            return part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?(?:repeating\-)?(?:radial\-|linear\-)?gradient/i.test(part);
        },

        "<box>": function(part){
            return ValidationTypes.isLiteral(part, "padding-box | border-box | content-box");
        },

        "<content>": function(part){
            return part.type === "function" && part.name === "content";
        },

        "<relative-size>": function(part){
            return ValidationTypes.isLiteral(part, "smaller | larger");
        },

        //any identifier
        "<ident>": function(part){
            return part.type === "identifier" || part.wasIdent;
        },

        "<length>": function(part){
            if (part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?calc/i.test(part)){
                return true;
            }else{
                return part.type === "length" || part.type === "number" || part.type === "integer" || part == "0";
            }
        },

        "<color>": function(part){
            return part.type === "color" || part == "transparent" || part == "currentColor";
        },

        "<number>": function(part){
            return part.type === "number" || this["<integer>"](part);
        },

        "<integer>": function(part){
            return part.type === "integer";
        },

        "<line>": function(part){
            return part.type === "integer";
        },

        "<angle>": function(part){
            return part.type === "angle";
        },

        "<glyph-angle>": function(part){
            return part.type == "angle" && part.units == 'deg';
        },

        "<uri>": function(part){
            return part.type === "uri";
        },

        "<image>": function(part){
            return this["<uri>"](part);
        },

        "<percentage>": function(part){
            return part.type === "percentage" || part == "0";
        },

        "<border-width>": function(part){
            return this["<length>"](part) || ValidationTypes.isLiteral(part, "thin | medium | thick");
        },

        "<border-style>": function(part){
            return ValidationTypes.isLiteral(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
        },

        "<content-sizing>": function(part){ // http://www.w3.org/TR/css3-sizing/#width-height-keywords
            return ValidationTypes.isLiteral(part, "fill-available | -moz-available | -webkit-fill-available | max-content | -moz-max-content | -webkit-max-content | min-content | -moz-min-content | -webkit-min-content | fit-content | -moz-fit-content | -webkit-fit-content");
        },

        "<margin-width>": function(part){
            return this["<length>"](part) || this["<percentage>"](part) || ValidationTypes.isLiteral(part, "auto");
        },

        "<padding-width>": function(part){
            return (this["<length>"](part) || this["<percentage>"](part)) &&
                (String(part) === "0" || part.type === "function" || (part.value) >= 0);
        },

        "<shape>": function(part){
            return part.type === "function" && (part.name === "rect" || part.name === "inset-rect");
        },

        "<basic-shape>": function(part){
            // inset() = inset( <shape-arg>{1,4} [round <border-radius>]? )
            // circle() = circle( [<shape-radius>]? [at <position>]? )
            // ellipse() = ellipse( [<shape-radius>{2}]? [at <position>]? )
            // polygon() = polygon( [<fill-rule>,]? [<shape-arg> <shape-arg>]# )
            return part.type === "function" && (
                part.name === "inset" || part.name === "circle" || part.name === "ellipse" || part.name === "polygon"
            );
        },

        "<shape-box>": function(part) {
            return this["<box>"](part) || ValidationTypes.isLiteral(part, "margin-box");
        },

        "<geometry-box>": function(part) {
            return this["<shape-box>"](part) || ValidationTypes.isLiteral(part, "fill-box | stroke-box | view-box");
        },

        "<time>": function(part) {
            return part.type === "time";
        },

        "<flex-grow>": function(part){
            return this["<number>"](part);
        },

        "<flex-shrink>": function(part){
            return this["<number>"](part);
        },

        "<width>": function(part){
            return this["<margin-width>"](part);
        },

        "<flex-basis>": function(part){
            return this["<width>"](part);
        },

        "<flex-direction>": function(part){
            return ValidationTypes.isLiteral(part, "row | row-reverse | column | column-reverse");
        },

        "<flex-wrap>": function(part){
            return ValidationTypes.isLiteral(part, "nowrap | wrap | wrap-reverse");
        },

        "<feature-tag-value>": function(part){
            return (part.type === "function" && /^[A-Z0-9]{4}$/i.test(part));
        },

        "<filter-function>": function(part){
            return part.type === "function" && (
                    part.name === 'blur' ||
                    part.name === 'brightness' ||
                    part.name === 'contrast' ||
                    part.name === 'custom' || // Not actually in formal spec.
                    part.name === 'drop-shadow' ||
                    part.name === 'grayscale' ||
                    part.name === 'hue-rotate' ||
                    part.name === 'invert' ||
                    part.name === 'opacity' ||
                    part.name === 'saturate' ||
                    part.name === 'sepia');
        }
    },

    complex: {

        "<bg-position>": function(expression){
            var result  = false,
                numeric = "<percentage> | <length>",
                xDir    = "left | right",
                yDir    = "top | bottom",
                count = 0;

            while (expression.peek(count) && expression.peek(count).text !== ",") {
                count++;
            }

/*
<position> = [
  [ left | center | right | top | bottom | <percentage> | <length> ]
|
  [ left | center | right | <percentage> | <length> ]
  [ top | center | bottom | <percentage> | <length> ]
|
  [ center | [ left | right ] [ <percentage> | <length> ]? ] &&
  [ center | [ top | bottom ] [ <percentage> | <length> ]? ]
]
*/

            if (count < 3) {
                if (ValidationTypes.isAny(expression, xDir + " | center | " + numeric)) {
                        result = true;
                        ValidationTypes.isAny(expression, yDir + " | center | " + numeric);
                } else if (ValidationTypes.isAny(expression, yDir)) {
                        result = true;
                        ValidationTypes.isAny(expression, xDir + " | center");
                }
            } else {
                if (ValidationTypes.isAny(expression, xDir)) {
                    if (ValidationTypes.isAny(expression, yDir)) {
                        result = true;
                        ValidationTypes.isAny(expression, numeric);
                    } else if (ValidationTypes.isAny(expression, numeric)) {
                        if (ValidationTypes.isAny(expression, yDir)) {
                            result = true;
                            ValidationTypes.isAny(expression, numeric);
                        } else if (ValidationTypes.isAny(expression, "center")) {
                            result = true;
                        }
                    }
                } else if (ValidationTypes.isAny(expression, yDir)) {
                    if (ValidationTypes.isAny(expression, xDir)) {
                        result = true;
                        ValidationTypes.isAny(expression, numeric);
                    } else if (ValidationTypes.isAny(expression, numeric)) {
                        if (ValidationTypes.isAny(expression, xDir)) {
                                result = true;
                                ValidationTypes.isAny(expression, numeric);
                        } else if (ValidationTypes.isAny(expression, "center")) {
                            result = true;
                        }
                    }
                } else if (ValidationTypes.isAny(expression, "center")) {
                    if (ValidationTypes.isAny(expression, xDir + " | " + yDir)) {
                        result = true;
                        ValidationTypes.isAny(expression, numeric);
                    }
                }
            }

            return result;
        },

        "<bg-size>": function(expression){
            //<bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain
            var result  = false,
                numeric = "<percentage> | <length> | auto";

            if (ValidationTypes.isAny(expression, "cover | contain")) {
                result = true;
            } else if (ValidationTypes.isAny(expression, numeric)) {
                result = true;
                ValidationTypes.isAny(expression, numeric);
            }

            return result;
        },

        "<clip-source>": function(expression){
            return ValidationTypes.isAny(expression, "<uri>");
        },

        "<clip-path>": function(expression) {
            // <basic-shape> || <geometry-box>
            var result = false;

            if (ValidationTypes.isType(expression, "<basic-shape>")) {
                result = true;
                if (expression.hasNext()) {
                    result = ValidationTypes.isType(expression, "<geometry-box>");
                }
            } else if (ValidationTypes.isType(expression, "<geometry-box>")) {
                result = true;
                if (expression.hasNext()) {
                    result = ValidationTypes.isType(expression, "<basic-shape>");
                }
            }

            return result && !expression.hasNext();

        },

        "<filter-function-list>": function(expression){
            var result, part, i;
            for (i = 0, result = true; result && expression.hasNext(); i++) {
                result = ValidationTypes.isAny(expression, "<filter-function> | <uri>");
            }

            if (i > 1 && !result) {
                // More precise error message if we fail after the first
                // parsed <filter-function>.
                part = expression.peek();
                throw new ValidationError("Expected (<filter-function> | <uri>) but found '" + part.text + "'.", part.line, part.col);
            }

            return result;

        },

        "<repeat-style>": function(expression){
            //repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}
            var result  = false,
                values  = "repeat | space | round | no-repeat",
                part;

            if (expression.hasNext()){
                part = expression.next();

                if (ValidationTypes.isLiteral(part, "repeat-x | repeat-y")) {
                    result = true;
                } else if (ValidationTypes.isLiteral(part, values)) {
                    result = true;

                    if (expression.hasNext() && ValidationTypes.isLiteral(expression.peek(), values)) {
                        expression.next();
                    }
                }
            }

            return result;

        },

        "<shadow>": function(expression) {
            //inset? && [ <length>{2,4} && <color>? ]
            var result  = false,
                count   = 0,
                inset   = false,
                color   = false;

            if (expression.hasNext()) {

                if (ValidationTypes.isAny(expression, "inset")){
                    inset = true;
                }

                if (ValidationTypes.isAny(expression, "<color>")) {
                    color = true;
                }

                while (ValidationTypes.isAny(expression, "<length>") && count < 4) {
                    count++;
                }


                if (expression.hasNext()) {
                    if (!color) {
                        ValidationTypes.isAny(expression, "<color>");
                    }

                    if (!inset) {
                        ValidationTypes.isAny(expression, "inset");
                    }

                }

                result = (count >= 2 && count <= 4);

            }

            return result;
        },

        "<x-one-radius>": function(expression) {
            //[ <length> | <percentage> ] [ <length> | <percentage> ]?
            var result  = false,
                simple = "<length> | <percentage> | inherit";

            if (ValidationTypes.isAny(expression, simple)){
                result = true;
                ValidationTypes.isAny(expression, simple);
            }

            return result;
        },

        "<flex>": function(expression) {
            // http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-property
            // none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]
            // Valid syntaxes, according to https://developer.mozilla.org/en-US/docs/Web/CSS/flex#Syntax
            // * none
            // * <flex-grow>
            // * <flex-basis>
            // * <flex-grow> <flex-basis>
            // * <flex-grow> <flex-shrink>
            // * <flex-grow> <flex-shrink> <flex-basis>
            // * inherit
            var part,
                result = false;
            if (ValidationTypes.isAny(expression, "none | inherit")) {
                result = true;
            } else {
                if (ValidationTypes.isType(expression, "<flex-grow>")) {
                    if (expression.peek()) {
                        if (ValidationTypes.isType(expression, "<flex-shrink>")) {
                            if (expression.peek()) {
                                result = ValidationTypes.isType(expression, "<flex-basis>");
                            } else {
                                result = true;
                            }
                        } else if (ValidationTypes.isType(expression, "<flex-basis>")) {
                            result = expression.peek() === null;
                        }
                    } else {
                        result = true;
                    }
                } else if (ValidationTypes.isType(expression, "<flex-basis>")) {
                    result = true;
                }
            }

            if (!result) {
                // Generate a more verbose error than "Expected <flex>..."
                part = expression.peek();
                throw new ValidationError("Expected (none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]) but found '" + expression.value.text + "'.", part.line, part.col);
            }

            return result;
        },

        "<text-decoration>": function(expression) {
            // none | [ underline || overline || line-through || blink ] | inherit
            var part,
                result,
                someOf = "[ underline || overline || line-through || blink ]",
                identifiers = {},
                found;

            do {
                part = expression.next();
                found = 0;
                if (someOf.indexOf(part) > -1) {
                    if (!identifiers[part]) {
                        identifiers[part] = 0;
                    }
                    identifiers[part]++;
                    found = identifiers[part];
                }
            } while (found == 1 && expression.hasNext());

            result = found == 1 && !expression.hasNext();
            if (found === 0 && JSON.stringify(identifiers) == '{}') {
               expression.previous();
            }
            return result;
        }
    }
};
