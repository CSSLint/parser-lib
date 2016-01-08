/*global Validation, ValidationTypes, ValidationError*/
var Properties = {

    //A
    "align-items"                   : "flex-start | flex-end | center | baseline | stretch | initial",
    "align-content"                 : "flex-start | flex-end | center | space-between | space-around | stretch | initial",
    "align-self"                    : "auto | flex-start | flex-end | center | baseline | stretch | initial",
    "-webkit-align-items"           : "flex-start | flex-end | center | baseline | stretch | initial",
    "-webkit-align-content"         : "flex-start | flex-end | center | space-between | space-around | stretch | initial",
    "-webkit-align-self"            : "auto | flex-start | flex-end | center | baseline | stretch | initial",
    "alignment-adjust"              : "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length> | initial",
    "alignment-baseline"            : "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical | initial",
    "animation"                     : 1,
    "animation-delay"               : { multi: "<time> | initial", comma: true },
    "animation-direction"           : { multi: "normal | alternate | initial", comma: true },
    "animation-duration"            : { multi: "<time> | initial", comma: true },
    "animation-fill-mode"           : { multi: "none | forwards | backwards | both | initial", comma: true },
    "animation-iteration-count"     : { multi: "<number> | infinite | initial", comma: true },
    "animation-name"                : { multi: "none | <ident> | initial", comma: true },
    "animation-play-state"          : { multi: "running | paused | initial", comma: true },
    "animation-timing-function"     : 1,

    //vendor prefixed
    "-moz-animation-delay"               : { multi: "<time> | initial", comma: true },
    "-moz-animation-direction"           : { multi: "normal | alternate | initial", comma: true },
    "-moz-animation-duration"            : { multi: "<time> | initial", comma: true },
    "-moz-animation-iteration-count"     : { multi: "<number> | infinite | initial", comma: true },
    "-moz-animation-name"                : { multi: "none | <ident> | initial", comma: true },
    "-moz-animation-play-state"          : { multi: "running | paused | initial", comma: true },

    "-ms-animation-delay"               : { multi: "<time> | initial", comma: true },
    "-ms-animation-direction"           : { multi: "normal | alternate | initial", comma: true },
    "-ms-animation-duration"            : { multi: "<time> | initial", comma: true },
    "-ms-animation-iteration-count"     : { multi: "<number> | infinite | initial", comma: true },
    "-ms-animation-name"                : { multi: "none | <ident> | initial", comma: true },
    "-ms-animation-play-state"          : { multi: "running | paused | initial", comma: true },

    "-webkit-animation-delay"               : { multi: "<time> | initial", comma: true },
    "-webkit-animation-direction"           : { multi: "normal | alternate | initial", comma: true },
    "-webkit-animation-duration"            : { multi: "<time> | initial", comma: true },
    "-webkit-animation-fill-mode"           : { multi: "none | forwards | backwards | both | initial", comma: true },
    "-webkit-animation-iteration-count"     : { multi: "<number> | infinite | initial", comma: true },
    "-webkit-animation-name"                : { multi: "none | <ident> | initial", comma: true },
    "-webkit-animation-play-state"          : { multi: "running | paused | initial", comma: true },

    "-o-animation-delay"               : { multi: "<time> | initial", comma: true },
    "-o-animation-direction"           : { multi: "normal | alternate | initial", comma: true },
    "-o-animation-duration"            : { multi: "<time> | initial", comma: true },
    "-o-animation-iteration-count"     : { multi: "<number> | infinite | initial", comma: true },
    "-o-animation-name"                : { multi: "none | <ident> | initial", comma: true },
    "-o-animation-play-state"          : { multi: "running | paused | initial", comma: true },

    "appearance"                    : "icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal | none | inherit | initial",
    "azimuth"                       : function (expression) {
        var simple      = "<angle> | leftwards | rightwards | inherit | initial",
            direction   = "left-side | far-left | left | center-left | center | center-right | right | far-right | right-side | initial",
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
    "backface-visibility"           : "visible | hidden | initial",
    "background"                    : 1,
    "background-attachment"         : { multi: "<attachment> | initial", comma: true },
    "background-clip"               : { multi: "<box> | initial", comma: true },
    "background-color"              : "<color> | inherit | initial",
    "background-image"              : { multi: "<bg-image> | initial", comma: true },
    "background-origin"             : { multi: "<box> | initial", comma: true },
    "background-position"           : { multi: "<bg-position> | initial", comma: true },
    "background-repeat"             : { multi: "<repeat-style> | initial" },
    "background-size"               : { multi: "<bg-size> | initial", comma: true },
    "baseline-shift"                : "baseline | sub | super | <percentage> | <length> | initial",
    "behavior"                      : 1,
    "binding"                       : 1,
    "bleed"                         : "<length> | initial",
    "bookmark-label"                : "<content> | <attr> | <string> | initial",
    "bookmark-level"                : "none | <integer> | initial",
    "bookmark-state"                : "open | closed | initial",
    "bookmark-target"               : "none | <uri> | <attr> | initial",
    "border"                        : "<border-width> || <border-style> || <color> | initial",
    "border-bottom"                 : "<border-width> || <border-style> || <color> | initial",
    "border-bottom-color"           : "<color> | inherit | initial",
    "border-bottom-left-radius"     :  "<x-one-radius> | initial",
    "border-bottom-right-radius"    :  "<x-one-radius> | initial",
    "border-bottom-style"           : "<border-style> | initial",
    "border-bottom-width"           : "<border-width> | initial",
    "border-collapse"               : "collapse | separate | inherit | initial",
    "border-color"                  : { multi: "<color> | inherit | initial", max: 4 },
    "border-image"                  : 1,
    "border-image-outset"           : { multi: "<length> | <number> | initial", max: 4 },
    "border-image-repeat"           : { multi: "stretch | repeat | round | initial", max: 2 },
    "border-image-slice"            : function(expression) {

        var valid   = false,
            numeric = "<number> | <percentage> | initial",
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
    "border-image-source"           : "<image> | none | initial",
    "border-image-width"            : { multi: "<length> | <percentage> | <number> | auto | initial", max: 4 },
    "border-left"                   : "<border-width> || <border-style> || <color> | initial",
    "border-left-color"             : "<color> | inherit | initial",
    "border-left-style"             : "<border-style> | initial",
    "border-left-width"             : "<border-width> | initial",
    "border-radius"                 : function(expression) {

        var valid   = false,
            simple = "<length> | <percentage> | inherit | initial",
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
    "border-right"                  : "<border-width> || <border-style> || <color> | initial",
    "border-right-color"            : "<color> | inherit | initial",
    "border-right-style"            : "<border-style> | initial",
    "border-right-width"            : "<border-width> | initial",
    "border-spacing"                : { multi: "<length> | inherit | initial", max: 2 },
    "border-style"                  : { multi: "<border-style> | initial", max: 4 },
    "border-top"                    : "<border-width> || <border-style> || <color> | initial",
    "border-top-color"              : "<color> | inherit | initial",
    "border-top-left-radius"        : "<x-one-radius> | initial",
    "border-top-right-radius"       : "<x-one-radius> | initial",
    "border-top-style"              : "<border-style> | initial",
    "border-top-width"              : "<border-width> | initial",
    "border-width"                  : { multi: "<border-width> | initial", max: 4 },
    "bottom"                        : "<margin-width> | inherit | initial",
    "-moz-box-align"                : "start | end | center | baseline | stretch | initial",
    "-moz-box-decoration-break"     : "slice |clone | initial",
    "-moz-box-direction"            : "normal | reverse | inherit | initial",
    "-moz-box-flex"                 : "<number> | initial",
    "-moz-box-flex-group"           : "<integer> | initial",
    "-moz-box-lines"                : "single | multiple | initial",
    "-moz-box-ordinal-group"        : "<integer> | initial",
    "-moz-box-orient"               : "horizontal | vertical | inline-axis | block-axis | inherit | initial",
    "-moz-box-pack"                 : "start | end | center | justify | initial",
    "-o-box-decoration-break"       : "slice | clone | initial",
    "-webkit-box-align"             : "start | end | center | baseline | stretch | initial",
    "-webkit-box-decoration-break"  : "slice |clone | initial",
    "-webkit-box-direction"         : "normal | reverse | inherit | initial",
    "-webkit-box-flex"              : "<number> | initial",
    "-webkit-box-flex-group"        : "<integer> | initial",
    "-webkit-box-lines"             : "single | multiple | initial",
    "-webkit-box-ordinal-group"     : "<integer> | initial",
    "-webkit-box-orient"            : "horizontal | vertical | inline-axis | block-axis | inherit | initial",
    "-webkit-box-pack"              : "start | end | center | justify | initial",
    "box-decoration-break"          : "slice | clone | initial",
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
    "box-sizing"                    : "content-box | border-box | inherit | initial",
    "break-after"                   : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column | initial",
    "break-before"                  : "auto | always | avoid | left | right | page | column | avoid-page | avoid-column | initial",
    "break-inside"                  : "auto | avoid | avoid-page | avoid-column | initial",

    //C
    "caption-side"                  : "top | bottom | inherit | initial",
    "clear"                         : "none | right | left | both | inherit | initial",
    "clip"                          : 1,
    "color"                         : "<color> | inherit | initial",
    "color-profile"                 : 1,
    "column-count"                  : "<integer> | auto | initial",                      //http://www.w3.org/TR/css3-multicol/
    "column-fill"                   : "auto | balance | initial",
    "column-gap"                    : "<length> | normal | initial",
    "column-rule"                   : "<border-width> || <border-style> || <color> | initial",
    "column-rule-color"             : "<color> | initial",
    "column-rule-style"             : "<border-style> | initial",
    "column-rule-width"             : "<border-width> | initial",
    "column-span"                   : "none | all | initial",
    "column-width"                  : "<length> | auto | initial",
    "columns"                       : 1,
    "content"                       : 1,
    "counter-increment"             : 1,
    "counter-reset"                 : 1,
    "crop"                          : "<shape> | auto | initial",
    "cue"                           : "cue-after | cue-before | inherit | initial",
    "cue-after"                     : 1,
    "cue-before"                    : 1,
    "cursor"                        : 1,

    //D
    "direction"                     : "ltr | rtl | inherit | initial",
    "display"                       : "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex | initial",
    "dominant-baseline"             : 1,
    "drop-initial-after-adjust"     : "central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length> | initial",
    "drop-initial-after-align"      : "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical | initial",
    "drop-initial-before-adjust"    : "before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length> | initial",
    "drop-initial-before-align"     : "caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical | initial",
    "drop-initial-size"             : "auto | line | <length> | <percentage> | initial",
    "drop-initial-value"            : "initial | <integer> | initial",

    //E
    "elevation"                     : "<angle> | below | level | above | higher | lower | inherit | initial",
    "empty-cells"                   : "show | hide | inherit | initial",

    //F
    "filter"                        : 1,
    "fit"                           : "fill | hidden | meet | slice | initial",
    "fit-position"                  : 1,
    "flex"                          : "<flex> | initial",
    "flex-basis"                    : "<width> | initial",
    "flex-direction"                : "row | row-reverse | column | column-reverse | initial",
    "flex-flow"                     : "<flex-direction> || <flex-wrap> | initial",
    "flex-grow"                     : "<number> | initial",
    "flex-shrink"                   : "<number> | initial",
    "flex-wrap"                     : "nowrap | wrap | wrap-reverse | initial",
    "-webkit-flex"                  : "<flex> | initial",
    "-webkit-flex-basis"            : "<width> | initial",
    "-webkit-flex-direction"        : "row | row-reverse | column | column-reverse | initial",
    "-webkit-flex-flow"             : "<flex-direction> || <flex-wrap> | initial",
    "-webkit-flex-grow"             : "<number> | initial",
    "-webkit-flex-shrink"           : "<number> | initial",
    "-webkit-flex-wrap"             : "nowrap | wrap | wrap-reverse | initial",
    "-ms-flex"                      : "<flex> | initial",
    "-ms-flex-align"                : "start | end | center | stretch | baseline | initial",
    "-ms-flex-direction"            : "row | row-reverse | column | column-reverse | inherit | initial",
    "-ms-flex-order"                : "<number> | initial",
    "-ms-flex-pack"                 : "start | end | center | justify | initial",
    "-ms-flex-wrap"                 : "nowrap | wrap | wrap-reverse | initial",
    "float"                         : "left | right | none | inherit | initial",
    "float-offset"                  : 1,
    "font"                          : 1,
    "font-family"                   : 1,
    "font-feature-settings"         : "<feature-tag-value> | normal | inherit | initial",
    "font-kerning"                  : "auto | normal | none | initial | inherit | unset | initial",
    "font-size"                     : "<absolute-size> | <relative-size> | <length> | <percentage> | inherit | initial",
    "font-size-adjust"              : "<number> | none | inherit | initial",
    "font-stretch"                  : "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit | initial",
    "font-style"                    : "normal | italic | oblique | inherit | initial",
    "font-variant"                  : "normal | small-caps | inherit | initial",
    "font-variant-caps"             : "normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps | initial",
    "font-variant-position"         : "normal | sub | super | inherit | initial | unset | initial",
    "font-weight"                   : "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit | initial",

    //G
    "grid"                          : 1,
    "grid-area"                     : 1,
    "grid-auto-columns"             : 1,
    "grid-auto-flow"                : 1,
    "grid-auto-position"            : 1,
    "grid-auto-rows"                : 1,
    "grid-cell-stacking"            : "columns | rows | layer | initial",
    "grid-column"                   : 1,
    "grid-columns"                  : 1,
    "grid-column-align"             : "start | end | center | stretch | initial",
    "grid-column-sizing"            : 1,
    "grid-column-start"             : 1,
    "grid-column-end"               : 1,
    "grid-column-span"              : "<integer> | initial",
    "grid-flow"                     : "none | rows | columns | initial",
    "grid-layer"                    : "<integer> | initial",
    "grid-row"                      : 1,
    "grid-rows"                     : 1,
    "grid-row-align"                : "start | end | center | stretch | initial",
    "grid-row-start"                : 1,
    "grid-row-end"                  : 1,
    "grid-row-span"                 : "<integer> | initial",
    "grid-row-sizing"               : 1,
    "grid-template"                 : 1,
    "grid-template-areas"           : 1,
    "grid-template-columns"         : 1,
    "grid-template-rows"            : 1,

    //H
    "hanging-punctuation"           : 1,
    "height"                        : "<margin-width> | <content-sizing> | inherit | initial",
    "hyphenate-after"               : "<integer> | auto | initial",
    "hyphenate-before"              : "<integer> | auto | initial",
    "hyphenate-character"           : "<string> | auto | initial",
    "hyphenate-lines"               : "no-limit | <integer> | initial",
    "hyphenate-resource"            : 1,
    "hyphens"                       : "none | manual | auto | initial",

    //I
    "icon"                          : 1,
    "image-orientation"             : "angle | auto | initial",
    "image-rendering"               : 1,
    "image-resolution"              : 1,
    "ime-mode"                      : "auto | normal | active | inactive | disabled | inherit | initial",
    "inline-box-align"              : "initial | last | <integer> | initial",

    //J
    "justify-content"               : "flex-start | flex-end | center | space-between | space-around | initial",
    "-webkit-justify-content"       : "flex-start | flex-end | center | space-between | space-around | initial",

    //L
    "left"                          : "<margin-width> | inherit | initial",
    "letter-spacing"                : "<length> | normal | inherit | initial",
    "line-height"                   : "<number> | <length> | <percentage> | normal | inherit | initial",
    "line-break"                    : "auto | loose | normal | strict | initial",
    "line-stacking"                 : 1,
    "line-stacking-ruby"            : "exclude-ruby | include-ruby | initial",
    "line-stacking-shift"           : "consider-shifts | disregard-shifts | initial",
    "line-stacking-strategy"        : "inline-line-height | block-line-height | max-height | grid-height | initial",
    "list-style"                    : 1,
    "list-style-image"              : "<uri> | none | inherit | initial",
    "list-style-position"           : "inside | outside | inherit | initial",
    "list-style-type"               : "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit | initial",

    //M
    "margin"                        : { multi: "<margin-width> | inherit | initial", max: 4 },
    "margin-bottom"                 : "<margin-width> | inherit | initial",
    "margin-left"                   : "<margin-width> | inherit | initial",
    "margin-right"                  : "<margin-width> | inherit | initial",
    "margin-top"                    : "<margin-width> | inherit | initial",
    "mark"                          : 1,
    "mark-after"                    : 1,
    "mark-before"                   : 1,
    "marks"                         : 1,
    "marquee-direction"             : 1,
    "marquee-play-count"            : 1,
    "marquee-speed"                 : 1,
    "marquee-style"                 : 1,
    "max-height"                    : "<length> | <percentage> | <content-sizing> | none | inherit | initial",
    "max-width"                     : "<length> | <percentage> | <content-sizing> | none | inherit | initial",
    "min-height"                    : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit | initial",
    "min-width"                     : "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit | initial",
    "move-to"                       : 1,

    //N
    "nav-down"                      : 1,
    "nav-index"                     : 1,
    "nav-left"                      : 1,
    "nav-right"                     : 1,
    "nav-up"                        : 1,

    //O
    "object-fit"                    : "fill | contain | cover | none | scale-down | initial",
    "object-position"               : "<bg-position> | initial",
    "opacity"                       : "<number> | inherit | initial",
    "order"                         : "<integer> | initial",
    "-webkit-order"                 : "<integer> | initial",
    "orphans"                       : "<integer> | inherit | initial",
    "outline"                       : 1,
    "outline-color"                 : "<color> | invert | inherit | initial",
    "outline-offset"                : 1,
    "outline-style"                 : "<border-style> | inherit | initial",
    "outline-width"                 : "<border-width> | inherit | initial",
    "overflow"                      : "visible | hidden | scroll | auto | inherit | initial",
    "overflow-style"                : 1,
    "overflow-wrap"                 : "normal | break-word | initial",
    "overflow-x"                    : 1,
    "overflow-y"                    : 1,

    //P
    "padding"                       : { multi: "<padding-width> | inherit | initial", max: 4 },
    "padding-bottom"                : "<padding-width> | inherit | initial",
    "padding-left"                  : "<padding-width> | inherit | initial",
    "padding-right"                 : "<padding-width> | inherit | initial",
    "padding-top"                   : "<padding-width> | inherit | initial",
    "page"                          : 1,
    "page-break-after"              : "auto | always | avoid | left | right | inherit | initial",
    "page-break-before"             : "auto | always | avoid | left | right | inherit | initial",
    "page-break-inside"             : "auto | avoid | inherit | initial",
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
    "pointer-events"                : "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit | initial",
    "position"                      : "static | relative | absolute | fixed | inherit | initial",
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
    "right"                         : "<margin-width> | inherit | initial",
    "rotation"                      : 1,
    "rotation-point"                : 1,
    "ruby-align"                    : 1,
    "ruby-overhang"                 : 1,
    "ruby-position"                 : 1,
    "ruby-span"                     : 1,

    //S
    "size"                          : 1,
    "speak"                         : "normal | none | spell-out | inherit | initial",
    "speak-header"                  : "once | always | inherit | initial",
    "speak-numeral"                 : "digits | continuous | inherit | initial",
    "speak-punctuation"             : "code | none | inherit | initial",
    "speech-rate"                   : 1,
    "src"                           : 1,
    "stress"                        : 1,
    "string-set"                    : 1,

    "table-layout"                  : "auto | fixed | inherit | initial",
    "tab-size"                      : "<integer> | <length> | initial",
    "target"                        : 1,
    "target-name"                   : 1,
    "target-new"                    : 1,
    "target-position"               : 1,
    "text-align"                    : "left | right | center | justify | match-parent | start | end | inherit | initial",
    "text-align-last"               : 1,
    "text-decoration"               : 1,
    "text-emphasis"                 : 1,
    "text-height"                   : 1,
    "text-indent"                   : "<length> | <percentage> | inherit | initial",
    "text-justify"                  : "auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida | initial",
    "text-outline"                  : 1,
    "text-overflow"                 : 1,
    "text-rendering"                : "auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit | initial",
    "text-shadow"                   : 1,
    "text-transform"                : "capitalize | uppercase | lowercase | none | inherit | initial",
    "text-wrap"                     : "normal | none | avoid | initial",
    "top"                           : "<margin-width> | inherit | initial",
    "-ms-touch-action"              : "auto | none | pan-x | pan-y | initial",
    "touch-action"                  : "auto | none | pan-x | pan-y | initial",
    "transform"                     : 1,
    "transform-origin"              : 1,
    "transform-style"               : 1,
    "transition"                    : 1,
    "transition-delay"              : 1,
    "transition-duration"           : 1,
    "transition-property"           : 1,
    "transition-timing-function"    : 1,

    //U
    "unicode-bidi"                  : "normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit | initial",
    "user-modify"                   : "read-only | read-write | write-only | inherit | initial",
    "user-select"                   : "none | text | toggle | element | elements | all | inherit | initial",

    //V
    "vertical-align"                : "auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length> | inherit | initial",
    "visibility"                    : "visible | hidden | collapse | inherit | initial",
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
    "white-space"                   : "normal | pre | nowrap | pre-wrap | pre-line | inherit | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap | initial", //http://perishablepress.com/wrapping-content/
    "white-space-collapse"          : 1,
    "widows"                        : "<integer> | inherit | initial",
    "width"                         : "<length> | <percentage> | <content-sizing> | auto | inherit | initial",
    "will-change"                   : { multi: "<ident> | initial", comma: true },
    "word-break"                    : "normal | keep-all | break-all | initial",
    "word-spacing"                  : "<length> | normal | inherit | initial",
    "word-wrap"                     : "normal | break-word | initial",
    "writing-mode"                  : "horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit | initial",

    //Z
    "z-index"                       : "<integer> | auto | inherit | initial",
    "zoom"                          : "<number> | <percentage> | normal"
};
