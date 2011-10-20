var Validation = {

    isColor: function(part, other){
        var text = part.text.toString().toLowerCase(),
            pattern = "^(?:inherit" + (other ? "|" + other : "") + ")$";
        
        if (part.type != "color"){
            if (part.type != "identifier" || !(new RegExp(pattern)).test(text)){
                return false;
            }
        }
        
        return true;
    },
    
    isIdentifier: function(part, options){
        var text = part.text.toString().toLowerCase(),
            args = options.split(" | "),
            i, len, found = false;

        
        for (i=0,len=args.length; i < len && !found; i++){
            if (text == args[i]){
                found = true;
            }
        }
        
        return found;
    },
    
    isLength: function(part){
        return part.type == "length" || part.type == "number" || part.type == "integer" || part == "0";
    },
    
    isInteger: function(part){
        return part.type == "integer";
    },
    
    isURI: function(part){
        return part.type == "uri";
    },
    
    isPercentage: function(part){
        return part.type == "percentage" || part == "0";
    },
    
    isMeasurement: function(part){
        return Validation.isLength(part) || Validation.isPercentage(part) || Validation.isIdentifier(part, "auto | inherit");
    },
    
    isBorderWidth: function(part){
        return Validation.isLength(part) || Validation.isIdentifier(part, "thin | medium | thick");
    },
    
    isBorderStyle: function(part){
        return Validation.isIdentifier(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
    },
    
    isBorderSideRadius: function(part){
        return Validation.isLength(part) || Validation.isPercentage(part);
    },
    
    oneValue: function(value){
        var parts = value.parts;
        if (parts.length != 1){
            throw new ValidationError("Expected one property value but found " + parts.length + ".", value.line, value.col);
        }
    },
    
    maxValues: function(value, max){
        var parts = value.parts;
        if (parts.length > max){
            throw new ValidationError("Expected a max of " + max + " property values but found " + parts.length + ".", value.line, value.col);
        }
    },
    
    oneColor: function(value, other){
        var part = value.parts[0],
            text = part.text.toString().toLowerCase();
            
        Validation.oneValue(value);
        
        if (!Validation.isColor(part, other)){
            throw new ValidationError("Expected a color but found '" + part + "'.", value.line, value.col);            
        }
    },
    
    oneColorOrTransparent: function(value){
        Validation.oneColor(value, "transparent");
    },
    
    oneIdentifier: function(value, options){
            
        Validation.oneValue(value);
        
        if (!Validation.isIdentifier.call(Validation, value.parts[0], options)){
            throw new ValidationError("Expected one of (" + options + ") but found '" + value.parts[0] + "'.", value.line, value.col);            
        }
    },
    
    oneMeasurement: function(value){
        Validation.oneValue(value);
        if (!Validation.isMeasurement(value.parts[0])){
            throw new ValidationError("Expected a measurement but found '" + value + "'.", value.line, value.col);
        }
    },
    
    oneBorderWidth: function(value){
        Validation.oneValue(value);
        if (!Validation.isBorderWidth(value.parts[0])){
            throw new ValidationError("Expected a border width but found '" + value + "'.", value.line, value.col);
        }
    },
    
    oneBorderStyle: function(value){
        Validation.oneValue(value);
        if (!Validation.isBorderStyle(value.parts[0])){
            throw new ValidationError("Expected a border style but found '" + value + "'.", value.line, value.col);
        }
    },
    
    oneBorderSideRadius: function(value){
        Validation.maxValues(value, 2);
        for (var i=0, len= value.parts.length; i < len; i++){
            if (!Validation.isBorderSideRadius(value.parts[i])){
                throw new ValidationError("Expected a border radius but found '" + value + "'.", value.line, value.col);
            }
        }
    }
};

var ValidationType = {

    "absolute-size": function(part){
        return this.identifier(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
    },
    
    "relative-size": function(part){
        return this.identifier(part, "smaller | larger");
    },
    
    "identifier": function(part, options){
        var text = part.text.toString().toLowerCase(),
            args = options.split(" | "),
            i, len, found = false;

        
        for (i=0,len=args.length; i < len && !found; i++){
            if (text == args[i]){
                found = true;
            }
        }
        
        return found;
    },
    
    "length": function(part){
        return part.type == "length" || part.type == "number" || part.type == "integer" || part == "0";
    },
    
    "color": function(part){
        return part.type == "color" || part == "transparent";
    },
    
    "integer": function(part){
        return part.type == "integer";
    },
    
    "angle": function(part){
        return part.type == "angle";
    },        
    
    "uri": function(part){
        return part.type == "uri";
    },
    
    "image": function(part){
        return this.uri(part);
    },
    
    "percentage": function(part){
        return part.type == "percentage" || part == "0";
    },

    "border-width": function(part){
        return Validation.isLength(part) || Validation.isIdentifier(part, "thin | medium | thick");
    },
    
    "border-style": function(part){
        return Validation.isIdentifier(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
    },
    
    "margin-width": function(part){
        return this.length(part) || this.percentage(part) || this.identifier(part, "auto");
    },
    
    "padding-width": function(part){
        return this.length(part) || this.percentage(part);
    }
};

    
       




var Properties = {

    //A
    "alignment-adjust": 1,
    "alignment-baseline": 1,
    "animation": 1,
    "animation-delay": 1,
    "animation-direction": 1,
    "animation-duration": 1,
    "animation-fill-mode": 1,
    "animation-iteration-count": 1,
    "animation-name": 1,
    "animation-play-state": 1,
    "animation-timing-function": 1,
    "appearance": 1,
    "azimuth": 1,
    
    //B
    "backface-visibility": 1,
    "background": 1,
    "background-attachment":        [ "scroll | fixed | inherit" ],
    "background-break": 1,
    "background-clip": 1,
    "background-color":             [ "color", "inherit" ],
    "background-image": 1,
    "background-origin": 1,
    "background-position": 1,
    "background-repeat":            [ "repeat | repeat-x | repeat-y | no-repeat | inherit" ],
    "background-size": 1,
    "baseline-shift": 1,
    "binding": 1,
    "bleed": 1,
    "bookmark-label": 1,
    "bookmark-level": 1,
    "bookmark-state": 1,
    "bookmark-target": 1,
    "border": 1,
    "border-bottom": 1,
    "border-bottom-color": 1,
    "border-bottom-left-radius":    Validation.oneBorderSideRadius,
    "border-bottom-right-radius":   Validation.oneBorderSideRadius,
    "border-bottom-style":          [ "border-style" ],
    "border-bottom-width":          [ "border-width" ],
    "border-collapse":              [ "collapse | separate | inherit" ],
    "border-color":                 [ "color", "inherit" ],
    "border-image": 1,
    "border-image-outset": 1,
    "border-image-repeat": 1,
    "border-image-slice": 1,
    "border-image-source":          [ "image", "none" ],
    "border-image-width": 1,
    "border-left": 1,
    "border-left-color":            [ "color", "inherit" ],
    "border-left-style":            [ "border-style" ],
    "border-left-width":            [ "border-width" ],
    "border-radius": 1,
    "border-right": 1,
    "border-right-color":           [ "color", "inherit" ],
    "border-right-style":           [ "border-style" ],
    "border-right-width":           [ "border-width" ],
    "border-spacing": 1,
    "border-style": function(value){
        Validation.maxValues(value, 4);
        for (var i=0, len=Math.min(4,value.parts.length); i < len; i++){
            if (!Validation.isBorderStyle(value.parts[i])){
                throw new ValidationError("Expected a border style but found '" + value.parts[i] + "'.", value.parts[i].line, value.parts[i].col);
            }
        }        
    },
    "border-top": 1,
    "border-top-color":             [ "color", "inherit" ],
    "border-top-left-radius":       Validation.oneBorderSideRadius,
    "border-top-right-radius":      Validation.oneBorderSideRadius,
    "border-top-style":             [ "border-style" ],
    "border-top-width":             [ "border-width" ],
    "border-width": function(value){
        Validation.maxValues(value, 4);
        for (var i=0, len=Math.min(4,value.parts.length); i < len; i++){
            if (!Validation.isBorderWidth(value.parts[i])){
                throw new ValidationError("Expected a border width but found '" + value.parts[i] + "'.", value.parts[i].line, value.parts[i].col);
            }
        }        
    },
    "bottom":                       [ "margin-width", "inherit" ], 
    "box-align":                    [ "start | end | center | baseline | stretch" ],        //http://www.w3.org/TR/2009/WD-css3-flexbox-20090723/
    "box-decoration-break":         [ "slice |clone" ],
    "box-direction":                [ "normal | reverse | inherit" ],
    "box-flex":                     [ "number" ],
    "box-flex-group":               [ "integer" ],
    "box-lines":                    [ "single | multiple" ],
    "box-ordinal-group":            [ "integer" ],
    "box-orient":                   [ "horizontal | vertical | inline-axis | block-axis | inherit" ],
    "box-pack":                     [ "start | end | center | justify" ],
    "box-shadow": 1,
    "box-sizing":                   [ "content-box | border-box | inherit" ],
    "break-after":                  [ "auto | always | avoid | left | right | page | column | avoid-page | avoid-column" ],
    "break-before":                 [ "auto | always | avoid | left | right | page | column | avoid-page | avoid-column" ],
    "break-inside":                 [ "auto | avoid | avoid-page | avoid-column" ],
    
    //C
    "caption-side":                 [ "top | bottom | inherit" ],
    "clear":                        [ "none | right | left | both | inherit" ],
    "clip": 1,
    "color":                        [ "color", "inherit" ],
    "color-profile": 1,
    "column-count":                 [ "integer", "auto" ],                      //http://www.w3.org/TR/css3-multicol/
    "column-fill":                  [ "auto | balance" ],
    "column-gap":                   [ "length", "normal" ],
    "column-rule": 1,
    "column-rule-color":            [ "color" ],
    "column-rule-style":            [ "border-style" ],
    "column-rule-width":            [ "border-width" ],
    "column-span":                  [ "none | all" ],
    "column-width":                 [ "length", "auto" ],
    "columns": 1,
    "content": 1,
    "counter-increment": 1,
    "counter-reset": 1,
    "crop": 1,
    "cue":                          [ "cue-after | cue-before | inherit" ],
    "cue-after": 1,
    "cue-before": 1,
    "cursor": 1,
    
    //D
    "direction":                    [ "ltr | rtl | inherit" ],
    "display":                      [ "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | box | inline-box | grid | inline-grid", "none | inherit" ],
    "dominant-baseline": 1,
    "drop-initial-after-adjust": 1,
    "drop-initial-after-align": 1,
    "drop-initial-before-adjust": 1,
    "drop-initial-before-align": 1,
    "drop-initial-size": 1,
    "drop-initial-value": 1,
    
    //E
    "elevation": 1,
    "empty-cells":                  [ "show | hide | inherit" ],
    
    //F
    "filter": 1,
    "fit":                          [ "fill | hidden | meet | slice" ],
    "fit-position": 1,
    "float":                        [ "left | right | none | inherit" ],    
    "float-offset": 1,
    "font": 1,
    "font-family": 1,
    "font-size":                    [ "absolute-size", "relative-size", "length", "percentage", "inherit" ],
    "font-size-adjust": 1,
    "font-stretch": 1,
    "font-style":                   [ "normal | italic | oblique | inherit" ],
    "font-variant":                 [ "normal | small-caps | inherit" ],
    "font-weight":                  [ "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit" ],
    
    //G
    "grid-cell-stacking":           [ "columns | rows | layer" ],
    "grid-column": 1,
    "grid-columns": 1,
    "grid-column-align":            [ "start | end | center | stretch" ],
    "grid-column-sizing": 1,
    "grid-column-span":             [ "integer" ],
    "grid-flow":                    [ "none | rows | columns" ],
    "grid-layer":                   [ "integer" ],
    "grid-row": 1,
    "grid-rows": 1,
    "grid-row-align":               [ "start | end | center | stretch" ],
    "grid-row-span":                [ "integer" ],
    "grid-row-sizing": 1,
    
    //H
    "hanging-punctuation": 1,
    "height":                       [ "margin-width", "inherit" ],
    "hyphenate-after": 1,
    "hyphenate-before": 1,
    "hyphenate-character": 1,
    "hyphenate-lines": 1,
    "hyphenate-resource": 1,
    "hyphens": 1,
    
    //I
    "icon": 1,
    "image-orientation":            [ "angle", "auto" ],
    "image-rendering": 1,
    "image-resolution": 1,
    "inline-box-align": 1,
    
    //L
    "left":                         [ "margin-width", "inherit" ],
    "letter-spacing":               [ "length", "normal | inherit" ],
    "line-height":                  [ "number", "length", "percentage", "normal | inherit"],
    "line-stacking": 1,
    "line-stacking-ruby": 1,
    "line-stacking-shift": 1,
    "line-stacking-strategy": 1,
    "list-style": 1,
    "list-style-image":             [ "uri", "none | inherit" ],
    "list-style-position":          [ "inside | outsider | inherit" ],
    "list-style-type":              [ "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit" ],
    
    //M
    "margin": 1,
    "margin-bottom":                [ "margin-width", "inherit" ],
    "margin-left":                  [ "margin-width", "inherit" ],
    "margin-right":                 [ "margin-width", "inherit" ],
    "margin-top":                   [ "margin-width", "inherit" ],
    "mark": 1,
    "mark-after": 1,
    "mark-before": 1,
    "marks": 1,
    "marquee-direction": 1,
    "marquee-play-count": 1,
    "marquee-speed": 1,
    "marquee-style": 1,
    "max-height":                   [ "length", "percentage", "none | inherit" ],
    "max-width":                    [ "length", "percentage", "none | inherit" ],
    "min-height":                   [ "length", "percentage", "inherit" ],
    "min-width":                    [ "length", "percentage", "inherit" ],
    "move-to": 1,
    
    //N
    "nav-down": 1,
    "nav-index": 1,
    "nav-left": 1,
    "nav-right": 1,
    "nav-up": 1,
    
    //O
    "opacity":                      [ "number", "inherit" ],
    "orphans":                      [ "integer", "inherit" ],
    "outline": 1,
    "outline-color":                [ "color", "invert | inherit" ],
    "outline-offset": 1,
    "outline-style":                [ "border-style", "inherit" ],
    "outline-width":                [ "border-width", "inherit" ],
    "overflow":                     [ "visible | hidden | scroll | auto | inherit" ],
    "overflow-style": 1,
    "overflow-x": 1,
    "overflow-y": 1,
    
    //P
    "padding": 1,
    "padding-bottom":               [ "padding-width", "inherit" ],
    "padding-left":                 [ "padding-width", "inherit" ],
    "padding-right":                [ "padding-width", "inherit" ],
    "padding-top":                  [ "padding-width", "inherit" ],
    "page": 1,
    "page-break-after":             [ "auto | always | avoid | left | right | inherit" ],
    "page-break-before":            [ "auto | always | avoid | left | right | inherit" ],
    "page-break-inside":            [ "auto | avoid | inherit" ],
    "page-policy": 1,
    "pause": 1,
    "pause-after": 1,
    "pause-before": 1,
    "perspective": 1,
    "perspective-origin": 1,
    "phonemes": 1,
    "pitch": 1,
    "pitch-range": 1,
    "play-during": 1,
    "position":                     [ "static | relative | absolute | fixed | inherit" ],
    "presentation-level": 1,
    "punctuation-trim": 1,
    
    //Q
    "quotes": 1,
    
    //R
    "rendering-intent": 1,
    "resize": 1,
    "rest": 1,
    "rest-after": 1,
    "rest-before": 1,
    "richness": 1,
    "right":                        [ "margin-width", "inherit" ],
    "rotation": 1,
    "rotation-point": 1,
    "ruby-align": 1,
    "ruby-overhang": 1,
    "ruby-position": 1,
    "ruby-span": 1,
    
    //S
    "size": 1,
    "speak":                        [ "normal | none | spell-out | inherit" ],
    "speak-header":                 [ "once | always | inherit" ],
    "speak-numeral":                [ "digits | continuous | inherit" ],
    "speak-punctuation":            [ "code | none | inherit" ],
    "speech-rate": 1,
    "src" : 1,
    "stress": 1,
    "string-set": 1,
    
    "table-layout":                 [ "auto | fixed | inherit" ],
    "target": 1,
    "target-name": 1,
    "target-new": 1,
    "target-position": 1,
    "text-align":                   [ "left | right | center | justify | inherit" ],
    "text-align-last": 1,
    "text-decoration": 1,
    "text-emphasis": 1,
    "text-height": 1,
    "text-indent":                  [ "length", "percentage", "inherit" ],
    "text-justify": 1,
    "text-outline": 1,
    "text-shadow": 1,
    "text-transform":               [ "capitalize | uppercase | lowercase | none | inherit" ],
    "text-wrap": 1,
    "top":                          [ "margin-width", "inherit" ],
    "transform": 1,
    "transform-origin": 1,
    "transform-style": 1,
    "transition": 1,
    "transition-delay": 1,
    "transition-duration": 1,
    "transition-property": 1,
    "transition-timing-function": 1,
    
    //U
    "unicode-bidi":                 [ "normal | embed | bidi-override | inherit" ],
    "user-modify":                  [ "read-only | read-write | write-only | inherit" ],
    "user-select":                  [ "none | text | toggle | element | elements | all | inherit" ],
    
    //V
    "vertical-align":               [ "percentage", "length", "baseline | sub | super | top | text-top | middle | bottom | text-bottom | inherit" ],
    "visibility":                   [ "visible | hidden | collapse | inherit" ],
    "voice-balance": 1,
    "voice-duration": 1,
    "voice-family": 1,
    "voice-pitch": 1,
    "voice-pitch-range": 1,
    "voice-rate": 1,
    "voice-stress": 1,
    "voice-volume": 1,
    "volume": 1,
    
    //W
    "white-space":                  [ "normal | pre | nowrap | pre-wrap | pre-line | inherit" ],
    "white-space-collapse": 1,
    "widows":                       [ "integer", "inherit" ],
    "width":                        [ "length", "percentage", "auto", "inherit" ],
    "word-break": 1,
    "word-spacing":                 [ "length", "normal | inherit" ],
    "word-wrap": 1,
    
    //Z
    "z-index":                      [ "integer", "auto | inherit" ],
    "zoom": 1
};

//Create validation functions for strings
(function(){
    var prop;
    for (prop in Properties){
        if (Properties.hasOwnProperty(prop)){
            if (Properties[prop] instanceof Array){
                Properties[prop] = (function(values){
                    return function(value){
                        var valid   = false,
                            msg     = [],
                            part    = value.parts[0];
                        
                        Validation.oneValue(value);
                        
                        for (var i=0, len=values.length; i < len && !valid; i++){
                            if (typeof ValidationType[values[i]] == "undefined"){
                                valid = valid || ValidationType.identifier(part, values[i]);
                                msg.push("one of (" + values[i] + ")");
                            } else {
                                valid = valid || ValidationType[values[i]](part);
                                msg.push(values[i]);
                            }
                        }
                        
                        if (!valid){
                            throw new ValidationError("Expected " + msg.join(" or ") + " but found '" + value + "'.", value.line, value.col);
                        }
                    };
                })(Properties[prop]);
            }
        }
    }
})();