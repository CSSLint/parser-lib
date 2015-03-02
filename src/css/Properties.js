/*global Validation, ValidationTypes, ValidationError*/
var Properties = {

    //A
    "align-items"                   : "flex-start | flex-end | center | baseline | stretch",
    "align-content"                 : "flex-start | flex-end | center | space-between | space-around | stretch",
    "align-self"                    : "auto | flex-start | flex-end | center | baseline | stretch",
    "-webkit-align-items"           : "flex-start | flex-end | center | baseline | stretch",
    "-webkit-align-content"         : "flex-start | flex-end | center | space-between | space-around | stretch",
    "-webkit-align-self"            : "auto | flex-start | flex-end | center | baseline | stretch",
    "alignment-adjust"              : "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length>",
    "alignment-baseline"            : "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "animation"                     : 1,
    "animation-delay"               : { multi: "<time>", comma: true },
    "animation-direction"           : { multi: "normal | alternate", comma: true },
    "animation-duration"            : { multi: "<time>", comma: true },
    "animation-fill-mode"           : { multi: "none | forwards | backwards | both", comma: true },
    "animation-iteration-count"     : { multi: "<number> | infinite", comma: true },
    "animation-name"                : { multi: "none | <ident>", comma: true },
    "animation-play-state"          : { multi: "running | paused", comma: true },
    "animation-timing-function"     : 1,

    //vendor prefixed
    "-moz-animation-delay"               : { multi: "<time>", comma: true },
    "-moz-animation-direction"           : { multi: "normal | alternate", comma: true },
    "-moz-animation-duration"            : { multi: "<time>", comma: true },
    "-moz-animation-iteration-count"     : { multi: "<number> | infinite", comma: true },
    "-moz-animation-name"                : { multi: "none | <ident>", comma: true },
    "-moz-animation-play-state"          : { multi: "running | paused", comma: true },

    "-ms-animation-delay"               : { multi: "<time>", comma: true },
    "-ms-animation-direction"           : { multi: "normal | alternate", comma: true },
    "-ms-animation-duration"            : { multi: "<time>", comma: true },
    "-ms-animation-iteration-count"     : { multi: "<number> | infinite", comma: true },
    "-ms-animation-name"                : { multi: "none | <ident>", comma: true },
    "-ms-animation-play-state"          : { multi: "running | paused", comma: true },

    "-webkit-animation-delay"               : { multi: "<time>", comma: true },
    "-webkit-animation-direction"           : { multi: "normal | alternate", comma: true },
    "-webkit-animation-duration"            : { multi: "<time>", comma: true },
    "-webkit-animation-fill-mode"           : { multi: "none | forwards | backwards | both", comma: true },
    "-webkit-animation-iteration-count"     : { multi: "<number> | infinite", comma: true },
    "-webkit-animation-name"                : { multi: "none | <ident>", comma: true },
    "-webkit-animation-play-state"          : { multi: "running | paused", comma: true },

    "-o-animation-delay"               : { multi: "<time>", comma: true },
    "-o-animation-direction"           : { multi: "normal | alternate", comma: true },
    "-o-animation-duration"            : { multi: "<time>", comma: true },
    "-o-animation-iteration-count"     : { multi: "<number> | infinite", comma: true },
    "-o-animation-name"                : { multi: "none | <ident>", comma: true },
    "-o-animation-play-state"          : { multi: "running | paused", comma: true },

    "appearance"                    : "icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal | none | inherit",
    "azimuth"                       : function (expression) {
        var simple      = "<angle> | leftwards | rightwards | inherit",
            direction   = "left-side | far-left | left | center-left | center | center-right | right | far-right | right-side",
            behind      = false,
            valid       = false,
            part;

        if (!ValidationTypes.isAny(expression, simple)) {
            if (ValidationTypes.isAny(expression, "behind")) {
                behind = true;
                valid = true;
            }

            if (ValidationTypes.isAny(expression, direction)) {
                valid = true;
                if (!behind) {
                    ValidationTypes.isAny(expression, "behind");
                }
            }
        }

        if (expression.hasNext()) {
            part = expression.next();
            if (valid) {
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected (<'azimuth'>) but found '" + part + "'.", part.line, part.col);
            }
        }
    },

    //B
    "backface-visibility"           : "visible | hidden",
    "background"                    : 1,
    "background-attachment"         : { multi: "<attachment>", comma: true },
    "background-clip"               : { multi: "<box>", comma: true },
    "background-color"              : "<color> | inherit",
    "background-image"              : { multi: "<bg-image>", comma: true },
    "background-origin"             : { multi: "<box>", comma: true },
    "background-position"           : { multi: "<bg-position>", comma: true },
    "background-repeat"             : { multi: "<repeat-style>" },
    "background-size"               : { multi: "<bg-size>", comma: true },
    "baseline-shift"                : "baseline | sub | super | <percentage> | <length>",
    "behavior"                      : 1,
    "binding"                       : 1,
    "bleed"                         : "<length>",
    "bookmark-label"                : "<content> | <attr> | <string>",
    "bookmark-level"                : "none | <integer>",
    "bookmark-state"                : "open | closed",
    "bookmark-target"               : "none | <uri> | <attr>",
    "border"                        : "<border-width> || <border-style> || <color>",
    "border-bottom"                 : "<border-width> || <border-style> || <color>",
    "border-bottom-color"           : "<color> | inherit",
    "border-bottom-left-radius"     :  "<x-one-radius>",
    "border-bottom-right-radius"    :  "<x-one-radius>",
    "border-bottom-style"           : "<border-style>",
    "border-bottom-width"           : "<border-width>",
    "border-collapse"               : "collapse | separate | inherit",
    "border-color"                  : { multi: "<color> | inherit", max: 4 },
    "border-image"                  : 1,
    "border-image-outset"           : { multi: "<length> | <number>", max: 4 },
    "border-image-repeat"           : { multi: "stretch | repeat | round", max: 2 },
    "border-image-slice"            : function(expression) {

        var valid   = false,
            numeric = "<number> | <percentage>",
            fill    = false,
            count   = 0,
            max     = 4,
            part;

        if (ValidationTypes.isAny(expression, "fill")) {
            fill = true;
            valid = true;
        }

        while (expression.hasNext() && count < max) {
            valid = ValidationTypes.isAny(expression, numeric);
            if (!valid) {
                break;
            }
            count++;
        }


        if (!fill) {
            ValidationTypes.isAny(expression, "fill");
        } else {
            valid = true;
        }

        if (expression.hasNext()) {
            part = expression.next();
            if (valid) {
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected ([<number> | <percentage>]{1,4} && fill?) but found '" + part + "'.", part.line, part.col);
            }
        }
    },
    "border-image-source"           : "<image> | none",
    "border-image-width"            : { multi: "<length> | <percentage> | <number> | auto", max: 4 },
    "border-left"                   : "<border-width> || <border-style> || <color>",
    "border-left-color"             : "<color> | inherit",
    "border-left-style"             : "<border-style>",
    "border-left-width"             : "<border-width>",
    "border-radius"                 : function(expression) {

        var valid   = false,
            simple = "<length> | <percentage> | inherit",
            slash   = false,
            fill    = false,
            count   = 0,
            max     = 8,
            part;

        while (expression.hasNext() && count < max) {
            valid = ValidationTypes.isAny(expression, simple);
            if (!valid) {

                if (expression.peek() == "/" && count > 0 && !slash) {
                    slash = true;
                    max = count + 5;
                    expression.next();
                } else {
                    break;
                }
            }
            count++;
        }

        if (expression.hasNext()) {
            part = expression.next();
            if (valid) {
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            } else {
                throw new ValidationError("Expected (<'border-radius'>) but found '" + part + "'.", part.line, part.col);
            }
        }
    },
    "border-right"                  : "<border-width> || <border-style> || <color>",
    "border-right-color"            : "<color> | inherit",
    "border-right-style"            : "<border-style>",
    "border-right-width"            : "<border-width>",
    "border-spacing"                : { multi: "<length> | inherit", max: 2 },
    "border-style"                  : { multi: "<border-style>", max: 4 },
    "border-top"                    : "<border-width> || <border-style> || <color>",
    "border-top-color"              : "<color> | inherit",
    "border-top-left-radius"        : "<x-one-radius>",
    "border-top-right-radius"       : "<x-one-radius>",
    "border-top-style"              : "<border-style>",
    "border-top-width"              : "<border-width>",
    "border-width"                  : { multi: "<border-width>", max: 4 },
    "bottom"                        : "<margin-width> | inherit",
    "-moz-box-align"                : "start | end | center | baseline | stretch",
    "-moz-box-decoration-break"     : "slice |clone",
    "-moz-box-direction"            : "normal | reverse | inherit",
    "-moz-box-flex"                 : "<number>",
    "-moz-box-flex-group"           : "<integer>",
    "-moz-box-lines"                : "single | multiple",
    "-moz-box-ordinal-group"        : "<integer>",
    "-moz-box-orient"               : "horizontal | vertical | inline-axis | block-axis | inherit",
    "-moz-box-pack"                 : "start | end | center | justify",
    "-o-box-decoration-break"       : "slice | clone",
    "-webkit-box-align"             : "start | end | center | baseline | stretch",
    "-webkit-box-decoration-break"  : "slice |clone",
    "-webkit-box-direction"         : "normal | reverse | inherit",
    "-webkit-box-flex"              : "<number>",
    "-webkit-box-flex-group"        : "<integer>",
    "-webkit-box-lines"             : "single | multiple",
    "-webkit-box-ordinal-group"     : "<integer>",
    "-webkit-box-orient"            : "horizontal | vertical | inline-axis | block-axis | inherit",
    "-webkit-box-pack"              : "start | end | center | justify",
    "box-decoration-break"          : "slice | clone",
    "box-shadow"                    : function (expression) {
        var result      = false,
            part;

        if (!ValidationTypes.isAny(expression, "none")) {
            Validation.multiProperty("<shadow>", expression, true, Infinity);
        } else {
            if (expression.hasNext()) {
                part = expression.next();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            }
        }
    },
    "box-sizing"                    : "content-box | border-box | inherit",
    "break-after"                   : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
    "break-before"                  : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column",
    "break-inside"                  : "auto | avoid | avoid-page | avoid-column",

    //C
    "caption-side"                  : "top | bottom | inherit",
    "clear"                         : "none | right | left | both | inherit",
    "clip"                          : 1,
    "color"                         : "<color> | inherit",
    "color-profile"                 : 1,
    "column-count"                  : "<integer> | auto",                      //http://www.w3.org/TR/css3-multicol/
    "column-fill"                   : "auto | balance",
    "column-gap"                    : "<length> | normal",
    "column-rule"                   : "<border-width> || <border-style> || <color>",
    "column-rule-color"             : "<color>",
    "column-rule-style"             : "<border-style>",
    "column-rule-width"             : "<border-width>",
    "column-span"                   : "none | all",
    "column-width"                  : "<length> | auto",
    "columns"                       : 1,
    "content"                       : 1,
    "counter-increment"             : 1,
    "counter-reset"                 : 1,
    "crop"                          : "<shape> | auto",
    "cue"                           : "cue-after | cue-before | inherit",
    "cue-after"                     : 1,
    "cue-before"                    : 1,
    "cursor"                        : 1,

    //D
    "direction"                     : "ltr | rtl | inherit",
    "display"                       : "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex",
    "dominant-baseline"             : 1,
    "drop-initial-after-adjust"     : "central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length>",
    "drop-initial-after-align"      : "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "drop-initial-before-adjust"    : "before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length>",
    "drop-initial-before-align"     : "caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical",
    "drop-initial-size"             : "auto | line | <length> | <percentage>",
    "drop-initial-value"            : "initial | <integer>",

    //E
    "elevation"                     : "<angle> | below | level | above | higher | lower | inherit",
    "empty-cells"                   : "show | hide | inherit",

    //F
    "filter"                        : 1,
    "fit"                           : "fill | hidden | meet | slice",
    "fit-position"                  : 1,
    "flex"                          : "<flex>",
    "flex-basis"                    : "<width>",
    "flex-direction"                : "row | row-reverse | column | column-reverse",
    "flex-flow"                     : "<flex-direction> || <flex-wrap>",
    "flex-grow"                     : "<number>",
    "flex-shrink"                   : "<number>",
    "flex-wrap"                     : "nowrap | wrap | wrap-reverse",
    "-webkit-flex"                  : "<flex>",
    "-webkit-flex-basis"            : "<width>",
    "-webkit-flex-direction"        : "row | row-reverse | column | column-reverse",
    "-webkit-flex-flow"             : "<flex-direction> || <flex-wrap>",
    "-webkit-flex-grow"             : "<number>",
    "-webkit-flex-shrink"           : "<number>",
    "-webkit-flex-wrap"             : "nowrap | wrap | wrap-reverse",
    "-ms-flex"                      : "<flex>",
    "-ms-flex-align"                : "start | end | center | stretch | baseline",
    "-ms-flex-direction"            : "row | row-reverse | column | column-reverse | inherit",
    "-ms-flex-order"                : "<number>",
    "-ms-flex-pack"                 : "start | end | center | justify",
    "-ms-flex-wrap"                 : "nowrap | wrap | wrap-reverse",
    "float"                         : "left | right | none | inherit",
    "float-offset"                  : 1,
    "font"                          : 1,
    "font-family"                   : 1,
    "font-size"                     : "<absolute-size> | <relative-size> | <length> | <percentage> | inherit",
    "font-size-adjust"              : "<number> | none | inherit",
    "font-stretch"                  : "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit",
    "font-style"                    : "normal | italic | oblique | inherit",
    "font-variant"                  : "normal | small-caps | inherit",
    "font-weight"                   : "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit",

    //G
    "grid-cell-stacking"            : "columns | rows | layer",
    "grid-column"                   : 1,
    "grid-columns"                  : 1,
    "grid-column-align"             : "start | end | center | stretch",
    "grid-column-sizing"            : 1,
    "grid-column-span"              : "<integer>",
    "grid-flow"                     : "none | rows | columns",
    "grid-layer"                    : "<integer>",
    "grid-row"                      : 1,
    "grid-rows"                     : 1,
    "grid-row-align"                : "start | end | center | stretch",
    "grid-row-span"                 : "<integer>",
    "grid-row-sizing"               : 1,

    //H
    "hanging-punctuation"           : 1,
    "height"                        : "<margin-width> | <content-sizing> | inherit",
    "hyphenate-after"               : "<integer> | auto",
    "hyphenate-before"              : "<integer> | auto",
    "hyphenate-character"           : "<string> | auto",
    "hyphenate-lines"               : "no-limit | <integer>",
    "hyphenate-resource"            : 1,
    "hyphens"                       : "none | manual | auto",

    //I
    "icon"                          : 1,
    "image-orientation"             : "angle | auto",
    "image-rendering"               : 1,
    "image-resolution"              : 1,
    "inline-box-align"              : "initial | last | <integer>",

    //J
    "justify-content"               : "flex-start | flex-end | center | space-between | space-around",
    "-webkit-justify-content"       : "flex-start | flex-end | center | space-between | space-around",

    //L
    "left"                          : "<margin-width> | inherit",
    "letter-spacing"                : "<length> | normal | inherit",
    "line-height"                   : "<number> | <length> | <percentage> | normal | inherit",
    "line-break"                    : "auto | loose | normal | strict",
    "line-stacking"                 : 1,
    "line-stacking-ruby"            : "exclude-ruby | include-ruby",
    "line-stacking-shift"           : "consider-shifts | disregard-shifts",
    "line-stacking-strategy"        : "inline-line-height | block-line-height | max-height | grid-height",
    "list-style"                    : 1,
    "list-style-image"              : "<uri> | none | inherit",
    "list-style-position"           : "inside | outside | inherit",
    "list-style-type"               : "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit",

    //M
    "margin"                        : { multi: "<margin-width> | inherit", max: 4 },
    "margin-bottom"                 : "<margin-width> | inherit",
    "margin-left"                   : "<margin-width> | inherit",
    "margin-right"                  : "<margin-width> | inherit",
    "margin-top"                    : "<margin-width> | inherit",
    "mark"                          : 1,
    "mark-after"                    : 1,
    "mark-before"                   : 1,
    "marks"                         : 1,
    "marquee-direction"             : 1,
    "marquee-play-count"            : 1,
    "marquee-speed"                 : 1,
    "marquee-style"                 : 1,
    "max-height"                    : "<length> | <percentage> | <content-sizing> | none | inherit",
    "max-width"                     : "<length> | <percentage> | <content-sizing> | none | inherit",
    "min-height"                    : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit",
    "min-width"                     : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit",
    "move-to"                       : 1,

    //N
    "nav-down"                      : 1,
    "nav-index"                     : 1,
    "nav-left"                      : 1,
    "nav-right"                     : 1,
    "nav-up"                        : 1,

    //O
    "object-fit"                    : "fill | contain | cover | none | scale-down",
    "object-position"               : "<bg-position>",
    "opacity"                       : "<number> | inherit",
    "order"                         : "<integer>",
    "-webkit-order"                 : "<integer>",
    "orphans"                       : "<integer> | inherit",
    "outline"                       : 1,
    "outline-color"                 : "<color> | invert | inherit",
    "outline-offset"                : 1,
    "outline-style"                 : "<border-style> | inherit",
    "outline-width"                 : "<border-width> | inherit",
    "overflow"                      : "visible | hidden | scroll | auto | inherit",
    "overflow-style"                : 1,
    "overflow-wrap"                 : "normal | break-word",
    "overflow-x"                    : 1,
    "overflow-y"                    : 1,

    //P
    "padding"                       : { multi: "<padding-width> | inherit", max: 4 },
    "padding-bottom"                : "<padding-width> | inherit",
    "padding-left"                  : "<padding-width> | inherit",
    "padding-right"                 : "<padding-width> | inherit",
    "padding-top"                   : "<padding-width> | inherit",
    "page"                          : 1,
    "page-break-after"              : "auto | always | avoid | left | right | inherit",
    "page-break-before"             : "auto | always | avoid | left | right | inherit",
    "page-break-inside"             : "auto | avoid | inherit",
    "page-policy"                   : 1,
    "pause"                         : 1,
    "pause-after"                   : 1,
    "pause-before"                  : 1,
    "perspective"                   : 1,
    "perspective-origin"            : 1,
    "phonemes"                      : 1,
    "pitch"                         : 1,
    "pitch-range"                   : 1,
    "play-during"                   : 1,
    "pointer-events"                : "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit",
    "position"                      : "static | relative | absolute | fixed | inherit",
    "presentation-level"            : 1,
    "punctuation-trim"              : 1,

    //Q
    "quotes"                        : 1,

    //R
    "rendering-intent"              : 1,
    "resize"                        : 1,
    "rest"                          : 1,
    "rest-after"                    : 1,
    "rest-before"                   : 1,
    "richness"                      : 1,
    "right"                         : "<margin-width> | inherit",
    "rotation"                      : 1,
    "rotation-point"                : 1,
    "ruby-align"                    : 1,
    "ruby-overhang"                 : 1,
    "ruby-position"                 : 1,
    "ruby-span"                     : 1,

    //S
    "size"                          : 1,
    "speak"                         : "normal | none | spell-out | inherit",
    "speak-header"                  : "once | always | inherit",
    "speak-numeral"                 : "digits | continuous | inherit",
    "speak-punctuation"             : "code | none | inherit",
    "speech-rate"                   : 1,
    "src"                           : 1,
    "stress"                        : 1,
    "string-set"                    : 1,

    "table-layout"                  : "auto | fixed | inherit",
    "tab-size"                      : "<integer> | <length>",
    "target"                        : 1,
    "target-name"                   : 1,
    "target-new"                    : 1,
    "target-position"               : 1,
    "text-align"                    : "left | right | center | justify | match-parent | start | end | inherit" ,
    "text-align-last"               : 1,
    "text-decoration"               : 1,
    "text-emphasis"                 : 1,
    "text-height"                   : 1,
    "text-indent"                   : "<length> | <percentage> | inherit",
    "text-justify"                  : "auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida",
    "text-outline"                  : 1,
    "text-overflow"                 : 1,
    "text-rendering"                : "auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit",
    "text-shadow"                   : 1,
    "text-transform"                : "capitalize | uppercase | lowercase | none | inherit",
    "text-wrap"                     : "normal | none | avoid",
    "top"                           : "<margin-width> | inherit",
    "-ms-touch-action"              : "auto | none | pan-x | pan-y",
    "touch-action"                  : "auto | none | pan-x | pan-y",
    "transform"                     : 1,
    "transform-origin"              : 1,
    "transform-style"               : 1,
    "transition"                    : 1,
    "transition-delay"              : 1,
    "transition-duration"           : 1,
    "transition-property"           : 1,
    "transition-timing-function"    : 1,

    //U
    "unicode-bidi"                  : "normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit",
    "user-modify"                   : "read-only | read-write | write-only | inherit",
    "user-select"                   : "none | text | toggle | element | elements | all | inherit",

    //V
    "vertical-align"                : "auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length>",
    "visibility"                    : "visible | hidden | collapse | inherit",
    "voice-balance"                 : 1,
    "voice-duration"                : 1,
    "voice-family"                  : 1,
    "voice-pitch"                   : 1,
    "voice-pitch-range"             : 1,
    "voice-rate"                    : 1,
    "voice-stress"                  : 1,
    "voice-volume"                  : 1,
    "volume"                        : 1,

    //W
    "white-space"                   : "normal | pre | nowrap | pre-wrap | pre-line | inherit | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap", //http://perishablepress.com/wrapping-content/
    "white-space-collapse"          : 1,
    "widows"                        : "<integer> | inherit",
    "width"                         : "<length> | <percentage> | <content-sizing> | auto | inherit",
    "will-change"                   : { multi: "<ident>", comma: true },
    "word-break"                    : "normal | keep-all | break-all",
    "word-spacing"                  : "<length> | normal | inherit",
    "word-wrap"                     : "normal | break-word",
    "writing-mode"                  : "horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit",

    //Z
    "z-index"                       : "<integer> | auto | inherit",
    "zoom"                          : "<number> | <percentage> | normal"
};
