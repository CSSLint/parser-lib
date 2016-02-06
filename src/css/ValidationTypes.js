//This file will likely change a lot! Very experimental!
/*global StringReader*/
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

/** Simple recursive-descent grammar to build matchers from strings. */
Matcher.parse = function(str) {
    var reader, eat, expr, oror, andand, seq, mod, term, result;
    reader = new StringReader(str);
    eat = function(matcher) {
        var result = reader.readMatch(matcher);
        if (result === null) {
            throw new SyntaxError(
                "Expected "+matcher, reader.getLine(), reader.getCol());
        }
        return result;
    };
    expr = function() {
        // expr = oror (" | " oror)*
        var m = [ oror() ];
        while (reader.readMatch(" | ") !== null) {
            m.push(oror());
        }
        return m.length === 1 ? m[0] : Matcher.alt.apply(Matcher, m);
    };
    oror = function() {
        // oror = andand ( " || " andand)*
        var m = [ andand() ];
        while (reader.readMatch(" || ") !== null) {
            m.push(andand());
        }
        return m.length === 1 ? m[0] : Matcher.oror.apply(Matcher, m);
    };
    andand = function() {
        // andand = seq ( " && " seq)*
        var m = [ seq() ];
        while (reader.readMatch(" && ") !== null) {
            m.push(seq());
        }
        return m.length === 1 ? m[0] : Matcher.andand.apply(Matcher, m);
    };
    seq = function() {
        // seq = mod ( " " mod)*
        var m = [ mod() ];
        while (reader.readMatch(/^ (?![&|\]])/) !== null) {
            m.push(mod());
        }
        return m.length === 1 ? m[0] : Matcher.seq.apply(Matcher, m);
    };
    mod = function() {
        // mod = term ( "?" | "*" | "+" | "#" | "{<num>,<num>}" )?
        var m = term();
        if (reader.readMatch("?") !== null) {
            return m.question();
        } else if (reader.readMatch("*") !== null) {
            return m.star();
        } else if (reader.readMatch("+") !== null) {
            return m.plus();
        } else if (reader.readMatch("#") !== null) {
            return m.hash();
        } else if (reader.readMatch(/^\{\s*/) !== null) {
            var min = eat(/^\d+/);
            eat(/^\s*,\s*/);
            var max = eat(/^\d+/);
            eat(/^\s*\}/);
            return m.braces(+min, +max);
        }
        return m;
    };
    term = function() {
        // term = <nt> | literal | "[ " expression " ]"
        if (reader.readMatch("[ ") !== null) {
            var m = expr();
            eat(" ]");
            return m;
        }
        return Matcher.fromType(eat(/^[^ ?*+#{]+/));
    };
    result = expr();
    if (!reader.eof()) {
        throw new SyntaxError(
            "Expected end of string", reader.getLine(), reader.getCol());
    }
    return result;
};

/**
 * Convert a string to a matcher (parsing simple alternations),
 * or do nothing if the argument is already a matcher.
 */
Matcher.cast = function(m) {
    if (m instanceof Matcher) {
        return m;
    }
    return Matcher.parse(m);
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

        "<string>": function(part){
            return part.type === "string";
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

        "<nonnegative-length-or-percentage>": function(part){
            return (this["<length>"](part) || this["<percentage>"](part)) &&
                (String(part) === "0" || part.type === "function" || (part.value) >= 0);
        },

        "<nonnegative-number-or-percentage>": function(part){
            return (this["<number>"](part) || this["<percentage>"](part)) &&
                (String(part) === "0" || part.type === "function" || (part.value) >= 0);
        },

        "<padding-width>": function(part){
            return this["<nonnegative-length-or-percentage>"](part);
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
        },

        "<generic-family>": function(part){
            return ValidationTypes.isLiteral(part, "serif | sans-serif | cursive | fantasy | monospace");
        },

        "<ident-not-generic-family>": function(part){
            return this["<ident>"](part) && !this["<generic-family>"](part);
        },

        "<font-size>": function(part){
            var result = this["<absolute-size>"](part) || this["<relative-size>"](part) || this["<length>"](part) || this["<percentage>"](part);
            return result;
        },

        "<font-stretch>": function(part){
            return ValidationTypes.isLiteral(part, "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded");
        },

        "<font-style>": function(part){
            return ValidationTypes.isLiteral(part, "normal | italic | oblique");
        },

        "<font-weight>": function(part){
            return ValidationTypes.isLiteral(part, "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900");
        },

        "<line-height>": function(part){
            var result = this["<number>"](part) || this["<length>"](part) || this["<percentage>"](part) || ValidationTypes.isLiteral(part, "normal");
            return result;
        }
    },

    complex: {
        __proto__: null,

        "<animateable-feature>":
        // scroll-position | contents | <custom-ident>
        Matcher.cast("scroll-position | contents | <animateable-feature-name>"),

        "<azimuth>":
        // <angle> |
        // [[ left-side | far-left | left | center-left | center | center-right | right | far-right | right-side ] || behind ] |
        // leftwards | rightwards
        Matcher.alt("<angle>",
                    Matcher.cast(
                        "left-side | far-left | left | center-left | " +
                        "center | center-right | right | far-right | " +
                        "right-side").oror("behind"),
                    "leftwards", "rightwards"),

        "<bg-position>": Matcher.cast("<position>").hash(),

        "<bg-size>":
        //<bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain
        Matcher.alt("cover", "contain", Matcher.cast("<percentage> | <length> | auto").braces(1,2)),

        "<border-image-slice>":
        // [<number> | <percentage>]{1,4} && fill?
        // *but* fill can appear between any of the numbers
        Matcher.many([true /* first element is required */],
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     Matcher.cast("<nonnegative-number-or-percentage>"),
                     "fill"),

        "<border-radius>":
        // [ <length> | <percentage> ]{1,4} [ / [ <length> | <percentage> ]{1,4} ]?
        Matcher.seq(
            Matcher.cast("<nonnegative-length-or-percentage>").braces(1, 4),
            Matcher.seq(
                "/",
                Matcher.cast("<nonnegative-length-or-percentage>").braces(1, 4)
            ).question()),

        "<box-shadow>": Matcher.alt("none", Matcher.cast("<shadow>").hash()),

        "<clip-source>": Matcher.cast("<uri>"),

        "<clip-path>":
        // <basic-shape> || <geometry-box>
        Matcher.cast("<basic-shape>").oror("<geometry-box>"),

        "<dasharray>":
        // "list of comma and/or white space separated <length>s and
        // <percentage>s".  There is a non-negative constraint.
        Matcher.cast("<nonnegative-length-or-percentage>")
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
        Matcher.alt("none", Matcher.cast("<flex-grow>").then(Matcher.cast("<flex-shrink>").question()).oror("<flex-basis>")),

        "<font-family>":
        // [ <family-name> | <generic-family> ]#
        Matcher.cast("<generic-family> | <family-name>").hash(),

        "<family-name>":
        // <string> | <IDENT>+
        Matcher.alt("<string>",
                    Matcher.seq("<ident-not-generic-family>",
                                Matcher.cast("<ident>").star())),

        "<font-variant-alternates>":
        Matcher.oror(// stylistic(<feature-value-name>)
                     "stylistic()",
                     "historical-forms",
                     // styleset(<feature-value-name> #)
                     "styleset()",
                     // character-variant(<feature-value-name> #)
                     "character-variant()",
                     // swash(<feature-value-name>)
                     "swash()",
                     // ornaments(<feature-value-name>)
                     "ornaments()",
                     // annotation(<feature-value-name>)
                     "annotation()"),

        "<font-variant-caps>":
        Matcher.cast("small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps"),

        "<font-variant-css21>":
        Matcher.cast("normal | small-caps"),

        "<font-variant-ligatures>":
        Matcher.oror(// <common-lig-values>
                     "common-ligatures | no-common-ligatures",
                     // <discretionary-lig-values>
                     "discretionary-ligatures | no-discretionary-ligatures",
                     // <historical-lig-values>
                     "historical-ligatures | no-historical-ligatures",
                     // <contextual-alt-values>
                     "contextual | no-contextual"),

        "<font-variant-numeric>":
        Matcher.oror(// <numeric-figure-values>
                     "lining-nums | oldstyle-nums",
                     // <numeric-spacing-values>
                     "proportional-nums | tabular-nums",
                     // <numeric-fraction-values>
                     "diagonal-fractions | stacked-fractions",
                     "ordinal",
                     "slashed-zero"),

        "<font-variant-east-asian>":
        Matcher.oror(// <east-asian-variant-values>
                     "jis78 | jis83 | jis90 | jis04 | simplified | traditional",
                     // <east-asian-width-values>
                     "full-width | proportional-width",
                     "ruby"),

        "<font-shorthand>":
        Matcher.seq(Matcher.oror("<font-style>",
                                 "<font-variant-css21>",
                                 "<font-weight>",
                                 "<font-stretch>").question(),
                    "<font-size>",
                    Matcher.seq("/", "<line-height>").question(),
                    "<font-family>"),

        "<text-decoration>":
        // none | [ underline || overline || line-through || blink ]
        Matcher.alt("none", Matcher.oror("underline", "overline", "line-through", "blink")),

        "<will-change>":
        // auto | <animateable-feature>#
        Matcher.alt("auto", Matcher.cast("<animateable-feature>").hash())
    }
};

// Because this is defined relative to other complex validation types,
// we need to define it *after* the rest of the types are initialized.
ValidationTypes.complex["<font-variant>"] =
    Matcher.oror({ expand: "<font-variant-ligatures>" },
                 { expand: "<font-variant-alternates>" },
                 "<font-variant-caps>",
                 { expand: "<font-variant-numeric>" },
                 { expand: "<font-variant-east-asian>" });
