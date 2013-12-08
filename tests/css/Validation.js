"use strict";
var YUITest = require("yuitest"),
    Assert = YUITest.Assert,
    parserlib = require("../../"),
    Parser = parserlib.css.Parser;

(function(){

    //-------------------------------------------------------------------------
    // New testcase type to make it easier to test patterns
    //-------------------------------------------------------------------------

    function ValidationTestCase(info){
        var i, len, prop, msg;

        YUITest.TestCase.call(this, info);
        // initial | inherit | unset are always valid property values.
        this.valid = [ 'initial', 'inherit', 'unset' ].concat(info.valid);
        this.invalid = info.invalid;
        this.property = info.property;
        this.name = "Tests for " + this.property;
        this._should.error = {};

        for (i=0, len=this.valid.length; i < len; i++){
            this["'" + this.valid[i] + "' is a valid value for '" + this.property + "'"] = function(value){
                return function(){
                    this._testValidValue(value);
                };
            }(this.valid[i]);
        }

        for (prop in this.invalid){
            if (this.invalid.hasOwnProperty(prop)){
                this["'" + prop + "' is an invalid value for '" + this.property + "'"] = function(value, message){
                    return function(){
                        this._testInvalidValue(value, message);
                    };
                }(prop, this.invalid[prop]);
            }
        }

        for (prop in this.error){
            if (this.error.hasOwnProperty(prop)){
                msg = "'" + prop + "' is an invalid value for '" + this.property + "'";
                this[msg] = function(value){
                    return function(){
                        this._testSyntaxError(value);
                    };
                }(prop);
                this._should.error[msg] = this.error[prop];
            }
        }
    }

    ValidationTestCase.prototype = new YUITest.TestCase();

    ValidationTestCase.prototype._testValidValue = function(value){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNull(event.invalid);
        });
        parser.parse(".foo { " + this.property + ":" + value + "}");
    };

    ValidationTestCase.prototype._testInvalidValue = function(value, message){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNotNull(event.invalid);
            Assert.areEqual(message, event.invalid.message);
        });
        parser.parse(".foo { " + this.property + ":" + value + "}");
    };

    ValidationTestCase.prototype._testSyntaxError = function(value){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.parse(".foo { " + this.property + ":" + value + "}");
    };


    //-------------------------------------------------------------------------
    // Validation Tests
    //-------------------------------------------------------------------------

    var suite = new YUITest.TestSuite("Validation Tests");

    suite.add(new ValidationTestCase({
        property: "alignment-baseline",

        valid: [
            "auto",
            "baseline",
            "use-script",
            "before-edge",
            "text-before-edge",
            "after-edge",
            "text-after-edge",
            "central",
            "middle",
            "ideographic",
            "alphabetic",
            "hanging",
            "mathematical"
        ],

        invalid: {
            "foo" : "Expected (auto | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-direction",

        valid: [
            "normal",
            "reverse",
            "alternate",
            "alternate-reverse",
            "alternate, reverse, normal",
        ],

        invalid: {
            "1px" : "Expected (<single-animation-direction>#) but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-fill-mode",

        valid: [
            "none",
            "forwards",
            "backwards",
            "both",
            "none, forwards"
        ],

        invalid: {
            "1px" : "Expected ([ none | forwards | backwards | both ]#) but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-name",

        valid: [
            "none",
            "foo",
            "red",
            "-red",
            "-specific",
            "sliding-vertically",
            "test1",
            "test1, animation4",
            "foo, bar",
            "none, none",
            "none, foo",
            "has_underscore",
            "none, -moz-specific, sliding"
        ],

        invalid: {
            "1px" : "Expected ([ none | <single-animation-name> ]#) but found '1px'.",
            "--invalid" : "Expected ([ none | <single-animation-name> ]#) but found '--invalid'."
        },

        error: {
            "-0num": "Unexpected token '0num' at line 1, col 24."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "animation-duration",

        valid: [
            "1s",
            "1s, 1s"
        ],

        invalid: {
            "0" : "Expected (<time>#) but found '0'.",
            "1px" : "Expected (<time>#) but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "azimuth",

        valid: [
            "behind",
            "250deg",
            "far-right behind",
            "behind far-right",
            "rightwards",
            "leftwards"
        ],

        invalid: {
            "behind behind" : "Expected end of value but found 'behind'.",
            "foo" : "Expected (<angle> | [ left-side | far-left | left | center-left | center | center-right | right | far-right | right-side ] || behind | leftwards | rightwards) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-attachment",

        valid: [
            "scroll",
            "fixed",
            "local"
        ],

        invalid: {
            "foo" : "Expected (<attachment>#) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-color",

        valid: [
            "red",
            "#f00",
            "transparent",
            "currentColor"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-image",

        valid: [
            "none",
            "url(foo.png)",
            "url(foo.png), none",
            "url(foo.png), url(bar.png)",
            "linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "radial-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "repeating-linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "repeating-radial-gradient(top, #f2f2f2 0%, #cbcbcb 100%)",
            "-ms-linear-gradient(top, #f2f2f2 0%, #cbcbcb 100%), url(foo.png)",
            "-webkit-gradient(linear, left bottom, left top, from(#f2f2f2), to(#cbcbcb))"
        ],

        invalid: {
            "foo" : "Expected (<bg-image>#) but found 'foo'.",
            "url(foo.png)," : "Expected end of value but found ','."
        }
    }));


    suite.add(new ValidationTestCase({
        property: "background-position",

        valid: [
            "top",
            "bottom",
            "center",
            "100%",
            "left center",
            "bottom left",
            "left 10px",
            "center bottom",
            "10% top",
            "left 10px bottom",
            "right top 5%",
            "top 3em center",
            "center top 3em",
            "right 3% center",
            "center right 3%",
            "top 3em right 10%",
            "top, bottom",
            "left 10px, left 10px",
            "right top 5%, left 10px bottom"
        ],

        invalid: {
            "foo"                 : "Expected (<position>#) but found 'foo'.",
            "10% left"            : "Expected end of value but found 'left'.",
            "left center right"   : "Expected end of value but found 'right'.",
            "center 3em right 10%": "Expected end of value but found 'right'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-size",

        valid: [
            "cover",
            "contain",
            "auto",
            "auto auto",
            "1em",
            "1px 1em",
            "1px auto",
            "auto 30%",
            "10% 50%",
            "cover, contain",
            "cover, auto auto",
            "1px, 20% 30%"
        ],

        invalid: {
            "foo"               : "Expected (<bg-size>#) but found 'foo'.",
            "1px 1px 1px"       : "Expected end of value but found '1px'."

        }
    }));

    suite.add(new ValidationTestCase({
        property: "background-repeat",

        valid: [
            "repeat-x",
            "repeat-y",
            "repeat",
            "space",
            "round",
            "no-repeat",
            "repeat repeat",
            "repeat space",
            "no-repeat round",
            "repeat-x, repeat-y, space", // PR #103
            "repeat space, no-repeat round"
        ],

        invalid: {
            "foo"               : "Expected (<repeat-style>#) but found 'foo'.",
            "repeat-x repeat-y" : "Expected end of value but found 'repeat-y'.",
            "no-repeat round 1px" : "Expected end of value but found '1px'."

        }
    }));

    suite.add(new ValidationTestCase({
        property: "baseline-shift",

        valid: [
            "baseline",
            "sub",
            "super",
            "5%",
            "2px"
        ],

        invalid: {
            "foo" : "Expected (baseline | sub | super | <percentage> | <length>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border",

        valid: [
            "1px solid black",
            "black 1px solid",
            "solid black 1px",
            "none",
            "1px solid",
            "solid black"
        ],

        invalid: {
            "foo" : "Expected (<border-width> || <border-style> || <color>) but found 'foo'.",
            "1px solid black 1px" : "Expected end of value but found '1px'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-color",

        valid: [
            "red",
            "#f00",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color>{1,4}) but found 'foo'.",
            "invert" : "Expected (<color>{1,4}) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-color",

        valid: [
            "red",
            "#f00",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-color",

        valid: [
            "red",
            "#f00",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-left-color",

        valid: [
            "red",
            "#f00",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-right-color",

        valid: [
            "red",
            "#f00",
            "transparent"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-left-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected ([ <length> | <percentage> ]{1,2}) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-right-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected ([ <length> | <percentage> ]{1,2}) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-image-slice",

        valid: [
            "5",
            "50% 60%",
            "10 15 20 23",
            "10 20 fill",
            "fill 25% 10",
            "10% fill 7 12"
        ],

        invalid: {
            "foo" : "Expected (<nonnegative-number-or-percentage> && <nonnegative-number-or-percentage>? && <nonnegative-number-or-percentage>? && <nonnegative-number-or-percentage>? && fill?) but found 'foo'.",
            "fill" : "Expected (<nonnegative-number-or-percentage> && <nonnegative-number-or-percentage>? && <nonnegative-number-or-percentage>? && <nonnegative-number-or-percentage>? && fill?) but found 'fill'.",
            "50% 75% 85% 95% 105%" : "Expected end of value but found '105%'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%",
            "5px / 25%",
            "5px 25% / 7px 27%",
            "1px 2px 3px 4px / 5px 6px 7px 8px"
        ],

        invalid: {
            "foo"   : "Expected (<nonnegative-length-or-percentage>{1,4} [ / <nonnegative-length-or-percentage>{1,4} ]?) but found 'foo'.",
            "5px x" : "Expected end of value but found 'x'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-spacing",

        valid: [
            "0",
            "3px",
            "2em",
            "0.4em 12px"
        ],

        invalid: {
            "1px 0.4em 1px" : "Expected end of value but found '1px'.",
            "foo" : "Expected (<length>{1,2}) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-left-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected ([ <length> | <percentage> ]{1,2}) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-top-right-radius",

        valid: [
            "5px",
            "25%",
            "5px 25%"
        ],

        invalid: {
            "foo"       : "Expected ([ <length> | <percentage> ]{1,2}) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-width",

        valid: [
            "1px",
            "1px 1px",
            "1px 1px 1px",
            "1px 1px 1px 1px",
        ],

        invalid: {
            "1px 1px 1px 1px 5px" : "Expected end of value but found '5px'.",
            "foo" : "Expected (<border-width>{1,4}) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-width",

        valid: [
            "1px",
            "1em"
        ],

        invalid: {
            "1px 1px 1px 1px 1px" : "Expected end of value but found '1px'.",
            "foo" : "Expected (<border-width>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-style",

        valid: [
            "solid",
            "none"
        ],

        invalid: {
            "1px" : "Expected (<border-style>) but found '1px'.",
            "foo" : "Expected (<border-style>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-width",

        valid: [
            "1px",
            "1em"
        ],

        invalid: {
            "1px 5px 1px 1px 1px" : "Expected end of value but found '5px'.",
            "foo" : "Expected (<border-width>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "border-bottom-style",

        valid: [
            "solid",
            "none"
        ],

        invalid: {
            "1px" : "Expected (<border-style>) but found '1px'.",
            "foo" : "Expected (<border-style>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "box-shadow",

        valid: [
            "none",
            "5px 5px 5px #ccc",
            "0 0 10px #000000",
            "10px 10px",
            "inset 2px 2px 2px 2px black",
            "2px 2px 2px 2px black inset",
            "#ccc 3px 3px 3px inset",
            "10px 10px #888, -10px -10px #f4f4f4, 0px 0px 5px 5px #cc6600"
        ],

        invalid: {
            "foo"           : "Expected (none | <shadow>#) but found 'foo'.",
            "1px"           : "Expected (none | <shadow>#) but found '1px'.",
            "1em red"       : "Expected (none | <shadow>#) but found '1em red'.",
            "1px 1px redd"  : "Expected end of value but found 'redd'.",
            "none 1px"      : "Expected end of value but found '1px'.",
            "inset 2px 2px 2px 2px black inset" : "Expected end of value but found 'inset'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip",

        valid: [
            "rect(10%, 85%, 90%, 15%)",
            'auto'
        ],

        invalid: {
            "foo" : "Expected (<shape> | auto) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip-path",

        valid: [
            "inset(10% 15% 10% 15%)",
            "circle(30% at 85% 15%)",
            "url('#myPath')",
            "ellipse(40% 40%)",
            "margin-box",
            "ellipse(40% 40%) content-box",
            "stroke-box ellipse(40% 40%)",
            "none"
        ],

        invalid: {
            "stroke-box ellipse(40% 40%) 40%" : "Expected end of value but found '40%'.",
            "x-box" : "Expected (<clip-source> | <clip-path> | none) but found 'x-box'.",
            "foo" : "Expected (<clip-source> | <clip-path> | none) but found 'foo'.",
            "invert(40% 40%)" : "Expected (<clip-source> | <clip-path> | none) but found 'invert(40% 40%)'.",
            "40%" : "Expected (<clip-source> | <clip-path> | none) but found '40%'.",
            "0.4" : "Expected (<clip-source> | <clip-path> | none) but found '0.4'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "clip-rule",

        valid: [
            "nonzero",
            "evenodd"
        ],

        invalid: {
            "foo" : "Expected (nonzero | evenodd) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "color",

        valid: [
            "red",
            "#f00",
            "transparent",
            "currentColor"
        ],

        invalid: {
            "foo" : "Expected (<color>) but found 'foo'.",
            "invert" : "Expected (<color>) but found 'invert'.",
        }
    }));

    suite.add(new ValidationTestCase({
        property: "color-interpolation",

        valid: [
            "auto",
            "sRGB",
            "linearRGB"
        ],

        invalid: {
            "foo" : "Expected (auto | sRGB | linearRGB) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "color-interpolation-filters",

        valid: [
            "auto",
            "sRGB",
            "linearRGB"
        ],

        invalid: {
            "foo" : "Expected (auto | sRGB | linearRGB) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "color-rendering",

        valid: [
            "auto",
            "optimizeSpeed",
            "optimizeQuality"
        ],

        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | optimizeQuality) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "display",

        valid: [
            "inline",
            "block",
            "list-item",
            "inline-block",
            "table",
            "inline-table",
            "table-row-group",
            "table-header-group",
            "table-footer-group",
            "table-row",
            "table-column-group",
            "table-column",
            "table-cell",
            "table-caption",
            "grid",
            "inline-grid",
            "run-in",
            "ruby",
            "ruby-base",
            "ruby-text",
            "ruby-base-container",
            "ruby-text-container",
            "contents",
            "none",
            "-moz-box",
            "-moz-inline-block",
            "-moz-inline-box",
            "-moz-inline-grid",
            "-moz-inline-stack",
            "-moz-inline-table",
            "-moz-grid",
            "-moz-grid-group",
            "-moz-grid-line",
            "-moz-groupbox",
            "-moz-deck",
            "-moz-popup",
            "-moz-stack",
            "-moz-marker",
            "-webkit-box",
            "-webkit-inline-box",
            "-ms-flexbox",
            "-ms-inline-flexbox",
            "flex",
            "-webkit-flex",
            "inline-flex",
            "-webkit-inline-flex"

        ],

        invalid: {
            "foo" : "Expected (inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "dominant-baseline",

        valid: [
            "auto",
            "use-script",
            "no-change",
            "reset-size",
            "ideographic",
            "alphabetic",
            "hanging",
            "mathematical",
            "central",
            "middle",
            "text-after-edge",
            "text-before-edge"
        ],

        invalid: {
            "foo" : "Expected (auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "fill-opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "-0.75" : "Expected (<opacity-value>) but found '-0.75'.",
            "12" : "Expected (<opacity-value>) but found '12'.",
            "foo" : "Expected (<opacity-value>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "flood-opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "-0.75" : "Expected (<opacity-value>) but found '-0.75'.",
            "12" : "Expected (<opacity-value>) but found '12'.",
            "foo" : "Expected (<opacity-value>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "font",

        valid: [
            "italic small-caps 300 1.3em/10% Genova, 'Comic Sans', sans-serif",
            "1.3em Shorties, sans-serif",
            "12px monospace",
            "caption",
            "status-bar",
            "12pt/14pt sans-serif",
            "80% sans-serif",
            "condensed 80% sans-serif",
            "x-large/110% \"new century schoolbook\", serif",
            "bold italic large Palatino, serif",
            "normal small-caps 120%/120% fantasy",
            "normal normal normal normal 12pt cursive",
            "normal bold small-caps italic 18px 'font'",
            "condensed oblique 12pt \"Helvetica Neue\", serif"
        ],

        invalid: {
            "italic oblique bold 1.3em/10% Genova, 'Comic Sans', sans-serif" : "Expected (<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar) but found 'italic oblique bold 1.3em / 10% Genova , 'Comic Sans' , sans-serif'.",
            "0.9em Nirwana, 'Comic Sans', sans-serif bold" : "Expected end of value but found 'bold'.",
            "'Helvetica Neue', sans-serif 1.2em" : "Expected (<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar) but found ''Helvetica Neue' , sans-serif 1.2em'.",
            "1.3em" : "Expected (<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar) but found '1.3em'.",
            "cursive;" : "Expected (<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar) but found 'cursive'.",
            "'Dormant', sans-serif;" : "Expected (<font-shorthand> | caption | icon | menu | message-box | small-caption | status-bar) but found ''Dormant' , sans-serif'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "font-family",

        valid: [
            "Futura, sans-serif",
            "-Futura, sans-serif",
            '"New Century Schoolbook", serif',
            "'21st Century', fantasy",
            "serif",
            "sans-serif",
            "cursive",
            "fantasy",
            "monospace",
            // solve problem by quoting
            "'Red/Black', sans-serif",
            '"Lucida\\", Grande", sans-serif',
            "'Ahem!}', sans-serif",
            '"test@foo", sans-serif',
            "'#POUND', sans-serif",
            "'Hawaii 5-0', sans-serif",
            // solve problem by escaping
            "Red\\/Black, sans-serif",
            '\\"Lucida\\", Grande, sans-serif',
            "Ahem\\!, sans-serif",
            "test\\@foo, sans-serif",
            "\\#POUND, sans-serif",
            "Hawaii\\ 5\\-0, sans-serif",
            "yellowgreen"
        ],

        invalid: {
            "--Futura, sans-serif"   : "Expected ([ <generic-family> | <family-name> ]#) but found '--Futura , sans-serif'.",
            "Red/Black, sans-serif"  : "Expected end of value but found '/'.",
            "'Lucida' Grande, sans-serif" : "Expected end of value but found 'Grande'.",
            "Hawaii 5-0, sans-serif" : "Expected end of value but found '5'."
        },

        error: {
            "47Futura, sans-serif" : "Unexpected token '47Futura' at line 1, col 20.",
            "-7Futura, sans-serif" : "Unexpected token '7Futura' at line 1, col 21.",
            "Ahem!, sans-serif"    : "Expected RBRACE at line 1, col 24.",
            "test@foo, sans-serif" : "Expected RBRACE at line 1, col 24.",
            "#POUND, sans-serif"   : "Expected a hex color but found '#POUND' at line 1, col 20."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "font-style",

        valid: [
            "normal", "italic", "oblique"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant",

        valid: [
            "normal", "none", "small-caps", "common-ligatures small-caps"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant-alternates",

        valid: [
            "normal", "historical-forms",
            "stylistic(salt) styleset(ss01, ss02)",
            "character-variant(cv03, cv04, cv05) swash(swsh)",
            "ornaments(ornm2) annotation(nalt2)"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant-caps",

        valid: [
            "normal", "small-caps", "all-small-caps", "petite-caps",
            "all-petite-caps", "unicase", "titling-caps"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant-east-asian",

        valid: [
            "normal", "ruby", "jis78", "jis83", "jis90", "jis04",
            "simplified", "traditional", "full-width", "proportional-width",
            "ruby full-width jis83"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant-ligatures",

        valid: [
            "normal", "none",
            "common-ligatures discretionary-ligatures historical-ligatures contextual",
            "no-common-ligatures no-discretionary-ligatures no-historical-ligatures no-contextual"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "font-variant-numeric",

        valid: [
            "normal", "ordinal", "slashed-zero", "lining-nums",
            "lining-nums proportional-nums diagonal-fractions ordinal",
            "oldstyle-nums tabular-nums stacked-fractions slashed-zero"
        ]
    }));

    suite.add(new ValidationTestCase({
        property: "image-rendering",

        valid: [
            "auto",
            "optimizeSpeed",
            "optimizeQuality"
        ],

        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | optimizeQuality) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "kerning",

        valid: [
            "auto",
            "0.1em",
            "1px"
        ],

        invalid: {
            "5%" : "Expected (auto | <length>) but found '5%'.",
            "foo" : "Expected (auto | <length>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "min-height",

        valid: [
            "1px",
            "1%",
            "calc(100% - 5px)",
            "calc(100% + 1em)",
            "calc(100%/6)",
            "calc(10%*6)",
            "calc((5em - 100%) / -2)",
            "calc(((100% - 15%) / 3 - 1px) * 3 + 10%)",
            "min-content",
            "-moz-fit-content",
            "-moz-available",
            "-webkit-fill-available",
            "contain-floats"
        ],

        invalid: {
            "foo" : "Expected (<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats) but found 'foo'."
        }
    }));

    // test <paint>
    suite.add(new ValidationTestCase({
        property: "fill",

        valid: [
            "url('myGradient')",
            "url('myGradient') darkred",
            "url('myGradient') darkred icc-color(myCmykDarkRed)",
            "currentColor",
            "darkred icc-color(myCmykDarkRed)",
            "none"
        ],

        invalid: {
            "url('myGradient') inherit" : "Expected end of value but found 'inherit'.",
            "url('myGradient') icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "currentColor icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "icc-color(myCmykDarkRed) darkred" : "Expected (<paint-basic> | <uri> <paint-basic>?) but found 'icc-color(myCmykDarkRed) darkred'.",
            "icc-color(myCmykDarkRed)" : "Expected (<paint-basic> | <uri> <paint-basic>?) but found 'icc-color(myCmykDarkRed)'.",
            "icc-color(myCmykDarkRed) inherit" : "Expected (<paint-basic> | <uri> <paint-basic>?) but found 'icc-color(myCmykDarkRed) inherit'.",
            "inherit icc-color(myCmykDarkRed)" : "Expected end of value but found 'icc-color(myCmykDarkRed)'.",
            "none inherit" : "Expected end of value but found 'inherit'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "fill-rule",

        valid: [
            "nonzero",
            "evenodd"
        ],

        invalid: {
            "foo" : "Expected (nonzero | evenodd) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "filter",

        valid: [
            "custom(url(vertexshader.vert) mix(url(fragment.frag) normal source-atop), 4 5, time 0)",
            "blur(30px 30px)",
            "url('#svgFilter')",
            "hue-rotate(10deg)",
            "brightness(0.3) contrast(30)",
            "brightness(0.3) contrast(30) url(commonfilters.svg#filter)",
            "none"
        ],

        invalid: {
            "circle(50% at 0 0)" : "Expected (<filter-function-list> | none) but found 'circle(50% at 0 0)'.",
            "foo" :                "Expected (<filter-function-list> | none) but found 'foo'.",
            "blur(30px 30px) none" : "Expected end of value but found 'none'."
        }
    }));

    ["flex", "-ms-flex", "-webkit-flex"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "1",
                // From http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-common
                "0 auto",
                "0 1 auto",
                "auto",
                "none",
                "1 1 0%"
            ],

            invalid: {
                "foo": "Expected (none | <flex-grow> <flex-shrink>? || <flex-basis>) but found 'foo'."
            }
        }));
    });

    ["flex-basis", "-webkit-flex-basis"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "auto",
                "12px",
                "3em",
                "0"
            ],

            invalid: {
                "foo": "Expected (<width>) but found 'foo'."
            }
        }));
    });

    ["flex-direction", "-ms-flex-direction", "-webkit-flex-direction"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "row",
                "row-reverse",
                "column",
                "column-reverse"
            ],

            invalid: {
                "foo": "Expected (row | row-reverse | column | column-reverse) but found 'foo'."
            }
        }));
    });

    ["flex-flow", "-webkit-flex-flow"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                // from http://www.w3.org/TR/2014/WD-css-flexbox-1-20140325/#flex-flow-property
                "row",
                "column wrap",
                "row-reverse wrap-reverse",
                "wrap"
            ],

            invalid: {
                "foo": "Expected (<flex-direction> || <flex-wrap>) but found 'foo'."
            }
        }));
    });

    ["flex-grow", "-webkit-flex-grow"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "0",
                "1",
                "1.5"
            ],

            invalid: {
                "foo": "Expected (<number>) but found 'foo'."
            }
        }));
    });

    ["flex-shrink", "-webkit-flex-shrink"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "0",
                "1",
                "1.5"
            ],

            invalid: {
                "foo": "Expected (<number>) but found 'foo'."
            }
        }));
    });

    ["flex-wrap", "-ms-flex-wrap", "-webkit-flex-wrap"].forEach(function(prop_name) {
        suite.add(new ValidationTestCase({
            property: prop_name,

            valid: [
                "nowrap",
                "wrap",
                "wrap-reverse"
            ],

            invalid: {
                "foo": "Expected (nowrap | wrap | wrap-reverse) but found 'foo'."
            }
        }));
    });

    suite.add(new ValidationTestCase({
        property: "glyph-orientation-horizontal",

        valid: [
            "-43deg",
            ".7deg",
            "90deg",
            "521deg"
        ],

        invalid: {
            "auto" : "Expected (<glyph-angle>) but found 'auto'.",
            "70rad" : "Expected (<glyph-angle>) but found '70rad'.",
            "4grad" : "Expected (<glyph-angle>) but found '4grad'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "glyph-orientation-vertical",

        valid: [
            "auto",
            "-43deg",
            ".7deg",
            "90deg",
            "521deg"
        ],

        invalid: {
            "70rad" : "Expected (auto | <glyph-angle>) but found '70rad'.",
            "4grad" : "Expected (auto | <glyph-angle>) but found '4grad'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "shape-rendering",

        valid: [
            "auto",
            "optimizeSpeed",
            "crispEdges",
            "geometricPrecision"
        ],

        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | crispEdges | geometricPrecision) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stop-opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "foo" : "Expected (<opacity-value>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "foo" : "Expected (<opacity-value>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-width",

        valid: [
            "5%",
            "2px"
        ],

        invalid: {
            "foo" : "Expected (<percentage> | <length>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-anchor",

        valid: [
            "start",
            "middle",
            "end"
        ],

        invalid: {
            "foo" : "Expected (start | middle | end) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-align",

        valid: [
            "left",
            "right",
            "center",
            "justify",
            "match-parent",
            "start",
            "end"
        ],

        invalid: {
            "foo" : "Expected (left | right | center | justify | match-parent | start | end) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-decoration",

        valid: [
            "none",
            "underline",
            "underline overline line-through blink"
        ],

        invalid: {
            "none underline" : "Expected end of value but found 'underline'.",
            "line-through none" : "Expected end of value but found 'none'.",
            "inherit blink" : "Expected end of value but found 'blink'.",
            "overline inherit" : "Expected end of value but found 'inherit'.",
            "foo" : "Expected (none | underline || overline || line-through || blink) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "text-rendering",

        valid: [
            "auto",
            "optimizeSpeed",
            "optimizeLegibility",
            "geometricPrecision"
        ],

        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | optimizeLegibility | geometricPrecision) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "object-fit",

        valid: [
            "fill",
            "contain",
            "cover",
            "none",
            "scale-down"
        ],

        invalid: {
            "foo" : "Expected (fill | contain | cover | none | scale-down) but found 'foo'.",
            "fill cover" : "Expected end of value but found 'cover'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "object-position",

        valid: [
            "top",
            "bottom",
            "center",
            "100%",
            "left center",
            "bottom left",
            "left 10px",
            "center bottom",
            "10% top",
            "left 10px bottom",
            "right top 5%",
            "top 3em center",
            "center top 3em",
            "top 3em right 10%",
        ],

        invalid: {
            "foo"                 : "Expected ([ center | [ left | right ] [ <percentage> | <length> ]? ] && [ center | [ top | bottom ] [ <percentage> | <length> ]? ] | [ left | center | right | <percentage> | <length> ] [ top | center | bottom | <percentage> | <length> ] | left | center | right | top | bottom | <percentage> | <length>) but found 'foo'.",
            "10% left"            : "Expected end of value but found 'left'.",
            "left center right"   : "Expected end of value but found 'right'.",
            "center 3em right 10%": "Expected end of value but found 'right'.",
            "top, bottom"         : "Expected end of value but found ','."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "opacity",

        valid: [
            "0",
            "0.5",
            "1"
        ],

        invalid: {
            "-0.75" : "Expected (<opacity-value>) but found '-0.75'.",
            "12" : "Expected (<opacity-value>) but found '12'.",
            "foo" : "Expected (<opacity-value>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "pointer-events",

        valid: [
            "auto",
            "none",
            "visiblePainted",
            "visibleFill",
            "visibleStroke",
            "visible",
            "painted",
            "fill",
            "stroke",
            "all"
        ],

        invalid: {
            "foo" : "Expected (auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-dasharray",

        valid: [
            "0",
            "4",
            "20px",
            "20px 40px 30px",
            "20px, 40px, 30px",
            "calc(1px + 2px) calc(3px + 1em)",
            "none"
        ],

        invalid: {
            "-20px" : "Expected (none | <dasharray>) but found '-20px'.",
            "20px," : "Expected end of value but found ','.",
            "20px, -20px": "Expected end of value but found ','.",
            "auto"  : "Expected (none | <dasharray>) but found 'auto'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-linecap",

        valid: [
            "butt",
            "round",
            "square"
        ],

        invalid: {
            "auto" : "Expected (butt | round | square) but found 'auto'.",
            "none" : "Expected (butt | round | square) but found 'none'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-linejoin",

        valid: [
            "miter",
            "round",
            "bevel"
        ],

        invalid: {
            "auto" : "Expected (miter | round | bevel) but found 'auto'.",
            "none" : "Expected (miter | round | bevel) but found 'none'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "stroke-miterlimit",

        valid: [
            "1",
            "1.4",
            "20",
            "10"
        ],

        invalid: {
            "-10" : "Expected (<miterlimit>) but found '-10'.",
            "0.5" : "Expected (<miterlimit>) but found '0.5'.",
            "foo" : "Expected (<miterlimit>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "-ms-touch-action",

        valid: [
            "auto",
            "none",
            "pan-x",
            "pan-y",
            "pan-left",
            "pan-right",
            "pan-up",
            "pan-down",
            "manipulation"
        ],

        invalid: {
            "foo" : "Expected (auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "touch-action",

        valid: [
            "auto",
            "none",
            "pan-x",
            "pan-y",
            "pan-left",
            "pan-right",
            "pan-up",
            "pan-down",
            "manipulation"
        ],

        invalid: {
            "foo" : "Expected (auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "vertical-align",

        valid: [
            "baseline",
            "sub",
            "super",
            "top",
            "text-top",
            "middle",
            "bottom",
            "text-bottom",
            "25%",
            "-1px"
        ],

        invalid: {
            "foo" : "Expected (auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length>) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "z-index",

        valid: [
            "1",
            "auto"
        ],

        invalid: {
            "foo" : "Expected (<integer> | auto) but found 'foo'."
        }
    }));

    // Test star hack
    suite.add(new ValidationTestCase({
        property: "*z-index",

        valid: [
            "1",
            "auto"
        ],

        invalid: {
            "foo" : "Expected (<integer> | auto) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "writing-mode",

        valid: [
            "horizontal-tb",
            "vertical-rl",
            "vertical-lr",
            "lr-tb",
            "rl-tb",
            "tb-rl",
            "bt-rl",
            "tb-lr",
            "bt-lr",
            "lr-bt",
            "rl-bt",
            "lr",
            "rl",
            "tb"
        ],

        invalid: {
            "foo" : "Expected (horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "overflow-wrap",

        valid: [
            "normal",
            "break-word"
        ],

        invalid: {
            "foo" : "Expected (normal | break-word) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "padding-left",

        valid: [
            "0",
            "6px",
            "3%",
            "1em",
            "calc(100% - 80px)"
        ],

        invalid: {
            "-10px" : "Expected (<padding-width>) but found '-10px'.",
            "-3%"   : "Expected (<padding-width>) but found '-3%'.",
            "auto"   : "Expected (<padding-width>) but found 'auto'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "will-change",

        valid: [
            "auto",
            "scroll-position",
            "contents",
            "opacity",
            "transform",
            "opacity, transform",
            "left, top",
            "height, opacity, transform, width"
        ],

        invalid: {
            "2px"               : "Expected (auto | <animateable-feature>#) but found '2px'.",
            "opacity transform" : "Expected end of value but found 'transform'.",
            "will-change"       : "Expected (auto | <animateable-feature>#) but found 'will-change'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "word-wrap",

        valid: [
            "normal",
            "break-word"
        ],

        invalid: {
            "foo" : "Expected (normal | break-word) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "unicode-bidi",

        valid: [
            "normal",
            "embed",
            "isolate",
            "bidi-override",
            "isolate-override",
            "plaintext"
        ],

        invalid: {
            "foo" : "Expected (normal | embed | isolate | bidi-override | isolate-override | plaintext) but found 'foo'."
        }
    }));

    YUITest.TestRunner.add(suite);

})();
