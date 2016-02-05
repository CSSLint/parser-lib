//This file will likely change a lot! Very experimental!
var ValidationTypes;

/**
 * This class implements a combinator library for matcher functions.
 * The combinators are described at:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax#Component_value_combinators
 */
var Matcher = function(matchFunc, toString) {
    this.match = function(expression) {
        // Save/restore marks to ensure that failed matches always restore
        // the original location in the expression.
        var result;
        expression.mark();
        result = matchFunc(expression);
        if (result) {
            expression.drop();
        } else {
            expression.restore();
        }
        return result;
    };
    this.toString = typeof toString === "function" ? toString : function() {
        return toString;
    };
};

/** Precedence table of combinators. */
Matcher.prec = {
    MOD:    5,
    SEQ:    4,
    ANDAND: 3,
    OROR:   2,
    ALT:    1
};

/**
 * Convert a string to a matcher (parsing simple alternations),
 * or do nothing if the argument is already a matcher.
 */
Matcher.cast = function(m) {
    if (m instanceof Matcher) {
        return m;
    }
    if (/ \| /.test(m)) {
        return Matcher.alt.apply(Matcher, m.split(" | "));
    }
    return Matcher.fromType(m);
};

/**
 * Create a matcher for a single type.
 */
Matcher.fromType = function(type) {
    return new Matcher(function(expression) {
        return expression.hasNext() && ValidationTypes.isType(expression, type);
    }, type);
};

/**
 * Create a matcher for one or more juxtaposed words, which all must
 * occur, in the given order.
 */
Matcher.seq = function() {
    var ms = Array.prototype.slice.call(arguments).map(Matcher.cast);
    if (ms.length === 1) { return ms[0]; }
    return new Matcher(function(expression) {
        var i, result = true;
        for (i = 0; result && i < ms.length; i++) {
            result = ms[i].match(expression);
        }
        return result;
    }, function(prec) {
        var p = Matcher.prec.SEQ;
        var s = ms.map(function(m) { return m.toString(p); }).join(" ");
        if (prec > p) { s = "[ " + s + " ]"; }
        return s;
    });
};

/**
 * Create a matcher for one or more alternatives, where exactly one
 * must occur.
 */
Matcher.alt = function() {
    var ms = Array.prototype.slice.call(arguments).map(Matcher.cast);
    if (ms.length === 1) { return ms[0]; }
    return new Matcher(function(expression) {
        var i, result = false;
        for (i = 0; !result && i < ms.length; i++) {
            result = ms[i].match(expression);
        }
        return result;
    }, function(prec) {
        var p = Matcher.prec.ALT;
        var s = ms.map(function(m) { return m.toString(p); }).join(" | ");
        if (prec > p) { s = "[ " + s + " ]"; }
        return s;
    });
};

/**
 * Create a matcher for two or more options.  This implements the
 * double bar (||) and double ampersand (&&) operators, as well as
 * variants of && where some of the alternatives are optional.
 * This will backtrack through even successful matches to try to
 * maximize the number of items matched.
 */
Matcher.many = function(required) {
    var ms = Array.prototype.slice.call(arguments, 1).reduce(function(acc, v) {
        if (v.expand) {
            // Insert all of the options for the given complex rule as
            // individual options.
            acc.push.apply(acc, ValidationTypes.complex[v.expand].options);
        } else {
            acc.push(Matcher.cast(v));
        }
        return acc;
    }, []);
    if (required === true) { required = ms.map(function() { return true; }); }
    var result = new Matcher(function(expression) {
        var seen = [], max = 0, pass = 0;
        var success = function(matchCount) {
            if (pass === 0) {
                max = Math.max(matchCount, max);
                return matchCount === ms.length;
            } else {
                return matchCount === max;
            }
        };
        var tryMatch = function(matchCount) {
            for (var i = 0; i < ms.length; i++) {
                if (seen[i]) { continue; }
                expression.mark();
                if (ms[i].match(expression)) {
                    seen[i] = true;
                    // Increase matchCount iff this was a required element
                    // (or if all the elements are optional)
                    if (tryMatch(matchCount + ((required === false || required[i]) ? 1 : 0))) {
                        expression.drop();
                        return true;
                    }
                    // Backtrack: try *not* matching using this rule, and
                    // let's see if it leads to a better overall match.
                    expression.restore();
                    seen[i] = false;
                } else {
                    expression.drop();
                }
            }
            return success(matchCount);
        };
        if (!tryMatch(0)) {
            // Couldn't get a complete match, retrace our steps to make the
            // match with the maximum # of required elements.
            pass++;
            tryMatch(0);
        }

        if (required === false) {
            return (max > 0);
        }
        // Use finer-grained specification of which matchers are required.
        for (var i = 0; i < ms.length; i++) {
            if (required[i] && !seen[i]) {
                return false;
            }
        }
        return true;
    }, function(prec) {
        var p = (required === false) ? Matcher.prec.OROR : Matcher.prec.ANDAND;
        var s = ms.map(function(m, i) {
            if (required !== false && !required[i]) {
                return m.toString(Matcher.prec.MOD) + "?";
            }
            return m.toString(p);
        }).join(required === false ? " || " : " && ");
        if (prec > p) { s = "[ " + s + " ]"; }
        return s;
    });
    result.options = ms;
    return result;
};

/**
 * Create a matcher for two or more options, where all options are
 * mandatory but they may appear in any order.
 */
Matcher.andand = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(true);
    return Matcher.many.apply(Matcher, args);
};

/**
 * Create a matcher for two or more options, where options are
 * optional and may appear in any order, but at least one must be
 * present.
 */
Matcher.oror = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(false);
    return Matcher.many.apply(Matcher, args);
};

/** Instance methods on Matchers. */
Matcher.prototype = {
    constructor: Matcher,
    // These are expected to be overridden in every instance.
    match: function(expression) { throw new Error("unimplemented"); },
    toString: function() { throw new Error("unimplemented"); },
    // This returns a standalone function to do the matching.
    func: function() { return this.match.bind(this); },
    // Basic combinators
    then: function(m) { return Matcher.seq(this, m); },
    or: function(m) { return Matcher.alt(this, m); },
    andand: function(m) { return Matcher.many(true, this, m); },
    oror: function(m) { return Matcher.many(false, this, m); },
    // Component value multipliers
    star: function() { return this.braces(0, Infinity, "*"); },
    plus: function() { return this.braces(1, Infinity, "+"); },
    question: function() { return this.braces(0, 1, "?"); },
    hash: function() {
        return this.braces(1, Infinity, "#", Matcher.cast(","));
    },
    braces: function(min, max, marker, optSep) {
        var m1 = this, m2 = optSep ? optSep.then(this) : this;
        if (!marker) {
            marker = "{" + min + "," + max + "}";
        }
        return new Matcher(function(expression) {
            var result = true, i;
            for (i = 0; i < max; i++) {
                if (i > 0 && optSep) {
                    result = m2.match(expression);
                } else {
                    result = m1.match(expression);
                }
                if (!result) { break; }
            }
            return (i >= min);
        }, function() { return m1.toString(Matcher.prec.MOD) + marker; });
    }
};

ValidationTypes = {

    isLiteral: function (part, literals) {
        var text = part.text.toString().toLowerCase(),
            args = literals.split(" | "),
            i, len, found = false;

        for (i=0,len=args.length; i < len && !found; i++){
            if (args[i].slice(-2) === "()"){
                found = (part.type === "function" &&
                         part.name === args[i].slice(0, -2));
            } else if (text === args[i].toLowerCase()){
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

    describe: function(type) {
        if (this.complex[type] instanceof Matcher) {
            return this.complex[type].toString(0);
        }
        return type;
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
        } else if (this.complex[type] instanceof Matcher) {
            result = this.complex[type].match(expression);
        } else {
            result = this.complex[type](expression);
        }

        return result;
    },



    simple: {
        __proto__: null,

        "<absolute-size>": function(part){
            return ValidationTypes.isLiteral(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
        },

        "<attachment>": function(part){
            return ValidationTypes.isLiteral(part, "scroll | fixed | local");
        },

        "<attr>": function(part){
            return ValidationTypes.isLiteral(part, "attr()");
        },

        "<bg-image>": function(part){
            return this["<image>"](part) || this["<gradient>"](part) ||  String(part) === "none";
        },

        "<gradient>": function(part) {
            return part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?(?:repeating\-)?(?:radial\-|linear\-)?gradient/i.test(part);
        },

        "<box>": function(part){
            return ValidationTypes.isLiteral(part, "padding-box | border-box | content-box");
        },

        "<content>": function(part){
            return ValidationTypes.isLiteral(part, "content()");
        },

        "<relative-size>": function(part){
            return ValidationTypes.isLiteral(part, "smaller | larger");
        },

        //any identifier
        "<ident>": function(part){
            return part.type === "identifier" || part.wasIdent;
        },

        "<single-animation-name>": function(part) {
            return this["<ident>"](part) &&
                /^-?[a-z_][-a-z0-9_]+$/i.test(part) &&
                !/^(none|unset|initial|inherit)$/i.test(part);
        },

        "<animateable-feature-name>": function(part) {
            return this["<ident>"](part) &&
                !/^(unset|initial|inherit|will-change|auto|scroll-position|contents)$/i.test(part);
        },

        "<length>": function(part){
            if (part.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?calc/i.test(part)){
                return true;
            }else{
                return part.type === "length" || part.type === "number" || part.type === "integer" || String(part) === "0";
            }
        },

        "<color>": function(part){
            return part.type === "color" || String(part) === "transparent" || String(part) === "currentColor";
        },

        // The SVG <color> spec doesn't include "currentColor" or "transparent" as a color.
        "<color-svg>": function(part) {
            return part.type === "color";
        },

        "<icccolor>": function(part){
            /* ex.:
                https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/local
                    icc-color(acmecmyk, 0.11, 0.48, 0.83, 0.00)
                    cielab(62.253188, 23.950124, 48.410653)
                    cielch(62.253188, 54.011108, 63.677091)
                    icc-color(FooColors, Sandy23C)
                http://www.w3.org/TR/2009/WD-SVGColor12-20091001/#iccnamedcolor
                    ~"icc-color(" name (comma-wsp number)+ ")"
                    ~"icc-named-color(" name comma-wsp namedColor ")"
                    ~"cielab(" lightness comma-wsp a-value comma-wsp b-value ")"
                    ~"cielchab(" lightness comma-wsp chroma comma-wsp hue ")"
            */
            return ValidationTypes.isLiteral(part, "cielab() | cielch() | cielchab() | icc-color() | icc-named-color()");
        },

        "<number>": function(part){
            return part.type === "number" || this["<integer>"](part);
        },

        "<miterlimit>": function(part){
            return this["<number>"](part) && part.value >= 1;
        },

        "<opacity-value>": function(part){
            return this["<number>"](part) && part.value >= 0 && part.value <= 1;
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
            return part.type === "angle" && part.units === 'deg';
        },

        "<uri>": function(part){
            return part.type === "uri";
        },

        "<image>": function(part){
            return this["<uri>"](part);
        },

        "<percentage>": function(part){
            return part.type === "percentage" || String(part) === "0";
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
            return ValidationTypes.isLiteral(part, "rect() | inset-rect()");
        },

        "<basic-shape>": function(part){
            // inset() = inset( <shape-arg>{1,4} [round <border-radius>]? )
            // circle() = circle( [<shape-radius>]? [at <position>]? )
            // ellipse() = ellipse( [<shape-radius>{2}]? [at <position>]? )
            // polygon() = polygon( [<fill-rule>,]? [<shape-arg> <shape-arg>]# )
            return ValidationTypes.isLiteral(part, "inset() | circle() | ellipse() | polygon()");
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
            // custom() isn't actually in the spec
            return ValidationTypes.isLiteral(
                part, "blur() | brightness() | contrast() | custom() | " +
                    "drop-shadow() | grayscale() | hue-rotate() | invert() | " +
                    "opacity() | saturate() | sepia()");
        }
    },

    complex: {
        __proto__: null,

        "<animateable-feature>":
        // scroll-position | contents | <custom-ident>
        Matcher.cast("scroll-position | contents | <animateable-feature-name>"),

        "<bg-position>": Matcher.cast("<position>").hash(),

        "<bg-size>":
        //<bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain
        Matcher.alt("cover", "contain", Matcher.cast("<percentage> | <length> | auto").braces(1,2)),

        "<clip-source>": Matcher.cast("<uri>"),

        "<clip-path>":
        // <basic-shape> || <geometry-box>
        Matcher.cast("<basic-shape>").oror("<geometry-box>"),

        "<dasharray>":
        // "list of comma and/or white space separated <length>s and
        // <percentage>s".  We use <padding-width> to enforce the
        // nonnegative constraint.
        Matcher.cast("<padding-width>")
            .braces(1, Infinity, "#", Matcher.cast(",").question()),

        "<filter-function-list>":
        // [ <filter-function> | <uri> ]+
        Matcher.cast("<filter-function> | <uri>").plus(),

        "<paint>":
        // none | currentColor | <color> [<icccolor>]? |
        // <funciri> [ none | currentColor | <color> [<icccolor>]? ]?

        // Note that <color> here is "as defined in the SVG spec", which
        // is more restrictive that the <color> defined in the CSS spec.
        Matcher.alt("<paint-basic>",
                    Matcher.seq("<uri>", Matcher.cast("<paint-basic>").question())),
        // Helper definition for <paint> above.
        "<paint-basic>":
        Matcher.alt("none", "currentColor",
                    Matcher.seq("<color-svg>",
                                Matcher.cast("<icccolor>").question())),

        "<position>":
        // <position> = [
        //  [ left | center | right | top | bottom | <percentage> | <length> ]
        // |
        //  [ left | center | right | <percentage> | <length> ]
        //  [ top | center | bottom | <percentage> | <length> ]
        // |
        //  [ center | [ left | right ] [ <percentage> | <length> ]? ] &&
        //  [ center | [ top | bottom ] [ <percentage> | <length> ]? ]
        //]
        Matcher.alt(
            // Because `alt` combinator is ordered, we need to test these
            // in order from longest possible match to shortest.
            Matcher.andand(
                Matcher.cast("center").or(
                    Matcher.seq("left | right",
                                Matcher.cast("<percentage> | <length>").question())),
                Matcher.cast("center").or(
                    Matcher.seq("top | bottom",
                                Matcher.cast("<percentage> | <length>").question()))),
            Matcher.seq("left | center | right | <percentage> | <length>",
                        "top | center | bottom | <percentage> | <length>"),
            "left | center | right | top | bottom | <percentage> | <length>"
        ),

        "<repeat-style>":
        //repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}
        Matcher.alt("repeat-x | repeat-y", Matcher.cast("repeat | space | round | no-repeat").braces(1,2)),

        "<shadow>":
        //inset? && [ <length>{2,4} && <color>? ]
        Matcher.many([true /* length is required */],
                     Matcher.cast("<length>").braces(2,4), "inset", "<color>"),

        "<x-one-radius>":
        //[ <length> | <percentage> ] [ <length> | <percentage> ]?
        Matcher.cast("<length> | <percentage>").braces(1,2),

        "<flex>":
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
        Matcher.alt("none", "inherit", Matcher.cast("<flex-grow>").then(Matcher.cast("<flex-shrink>").question()).oror("<flex-basis>")),

        "<text-decoration>":
        // none | [ underline || overline || line-through || blink ] | inherit
        Matcher.oror("underline", "overline", "line-through", "blink"),

        "<will-change>":
        // auto | <animateable-feature>#
        Matcher.alt("auto", Matcher.cast("<animateable-feature>").hash())
    }
};
