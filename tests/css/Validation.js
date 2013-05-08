(function(){

    var Assert = YUITest.Assert,    
        Parser = parserlib.css.Parser;

    //-------------------------------------------------------------------------
    // New testcase type to make it easier to test patterns
    //-------------------------------------------------------------------------
    
    function ValidationTestCase(info){    
        var i, len, prop;
        
        YUITest.TestCase.call(this, info);
        this.valid = info.valid;    
        this.invalid = info.invalid;
        this.property = info.property;
        this.name = "Tests for " + this.property;
        
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
    }
    
    ValidationTestCase.prototype = new YUITest.TestCase();
    
    ValidationTestCase.prototype._testValidValue = function(value){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNull(event.invalid);
        });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");          
    };

    ValidationTestCase.prototype._testInvalidValue = function(value, message){
        var parser = new Parser({ strict: true, starHack: true, underscoreHack: true });
        parser.addListener("property", function(event){
            Assert.isNotNull(event.invalid);
            Assert.areEqual(message, event.invalid.message);
        });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");          
    };

    
    //-------------------------------------------------------------------------
    // Validation Tests
    //-------------------------------------------------------------------------
    
    var suite = new YUITest.TestSuite("Validation Tests");
    
    suite.add(new ValidationTestCase({
        property: "animation-name",
        
        valid: [
            "none",
            "foo",
            "foo, bar",
            "none, none",
            "none, foo"
        ],
        
        invalid: {
            "1px" : "Expected (none | <ident>) but found '1px'."
        }   
    }));    
    
    suite.add(new ValidationTestCase({
        property: "animation-duration",
        
        valid: [
            "1s",
            "1s, 1s"
        ],
        
        invalid: {        
            "0" : "Expected (<time>) but found '0'.",
            "1px" : "Expected (<time>) but found '1px'."
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
            "foo" : "Expected (<'azimuth'>) but found 'foo'."
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
            "foo" : "Expected (<attachment>) but found 'foo'."
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
            "foo" : "Expected (<bg-image>) but found 'foo'.",
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
            "top 3em right 10%",
            "top, bottom",
            "left 10px, left 10px",
            "right top 5%, left 10px bottom"
        ],
        
        invalid: {
            "foo"                 : "Expected (<bg-position>) but found 'foo'.",
            "10% left"            : "Expected end of value but found 'left'.",
            "left center right"   : "Expected end of value but found 'center'.",
            "center 3em right 10%": "Expected end of value but found '3em'.",
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
            "foo"               : "Expected (<bg-size>) but found 'foo'.",
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
            "no-repeat round"
        ],
        
        invalid: {
            "foo"               : "Expected (<repeat-style>) but found 'foo'.",
            "no-repeat round 1px" : "Expected (<repeat-style>) but found 'no-repeat round 1px'."
            
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
            "inherit",
            "transparent"
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));
   
    suite.add(new ValidationTestCase({
        property: "border-bottom-color",
        
        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));
   
    suite.add(new ValidationTestCase({
        property: "border-top-color",
        
        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));
   
    suite.add(new ValidationTestCase({
        property: "border-left-color",
        
        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
        }
    }));
   
    suite.add(new ValidationTestCase({
        property: "border-right-color",
        
        valid: [
            "red",
            "#f00",
            "inherit",
            "transparent"
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
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
            "foo"       : "Expected (<x-one-radius>) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));    

    suite.add(new ValidationTestCase({
        property: "border-bottom-right-radius",
        
        valid: [
            "5px",
            "25%",
            "5px 25%",
            "inherit"
        ],
        
        invalid: {
            "foo"       : "Expected (<x-one-radius>) but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
        }
    }));    
    
    suite.add(new ValidationTestCase({
        property: "border-image-slice",
        
        valid: [
            "5",
            "50% 60%",
            "10 15 20 23",
            "fill",
            "10 20 fill",
            "fill 25% 10"
        ],
        
        invalid: {
            "foo" : "Expected ([<number> | <percentage>]{1,4} && fill?) but found 'foo'.",
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
            "1px 2px 3px 4px / 5px 6px 7px 8px",
            "inherit"
        ],
        
        invalid: {
            "foo"   : "Expected (<'border-radius'>) but found 'foo'.",
            "5px x" : "Expected (<'border-radius'>) but found 'x'.",
        }
    }));
    
    suite.add(new ValidationTestCase({
        property: "border-spacing",
        
        valid: [
            "0",
            "3px",
            "2em",
            "0.4em 12px",
            "inherit"            
        ],
        
        invalid: {
            "1px 0.4em 1px" : "Expected end of value but found '1px'.",
            "foo" : "Expected (<length> | inherit) but found 'foo'."
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
            "foo"       : "Expected (<x-one-radius>) but found 'foo'.",
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
            "foo"       : "Expected (<x-one-radius>) but found 'foo'.",
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
            "foo" : "Expected (<border-width>) but found 'foo'."
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
            "foo"           : "Expected (<shadow>) but found 'foo'.",
            "1px"           : "Expected (<shadow>) but found '1px'.",
            "1em red"       : "Expected (<shadow>) but found '1em red'.",
            "1px 1px redd"  : "Expected end of value but found 'redd'.",
            "none 1px"      : "Expected end of value but found '1px'.",
            "inset 2px 2px 2px 2px black inset" : "Expected end of value but found 'inset'."
        }  
    }));    
    
    suite.add(new ValidationTestCase({
        property: "color",
        
        valid: [
            "red",
            "#f00",
            "inherit",
            
        ],
        
        invalid: {
            "foo" : "Expected (<color> | inherit) but found 'foo'.",
            "invert" : "Expected (<color> | inherit) but found 'invert'.",
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
            "box",
            "inline-box",
            "grid",
            "inline-grid",
            "none",
            "inherit",
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
            "-webkit-inline-box"
            
        ],
        
        invalid: {
            "foo" : "Expected (inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | box | inline-box | grid | inline-grid | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box) but found 'foo'."
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
            "inherit"
        ],
        
        invalid: {
            "foo" : "Expected (<length> | <percentage> | inherit) but found 'foo'."
        }  
    }));
    
    suite.add(new ValidationTestCase({
        property: "text-rendering",
        
        valid: [
            "auto",
            "optimizeSpeed",
            "optimizeLegibility",
            "geometricPrecision",
            "inherit"
        ],
        
        invalid: {
            "foo" : "Expected (auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit) but found 'foo'."
        }  
    }));

    suite.add(new ValidationTestCase({
        property: "opacity",
        
        valid: [
            "1"
        ],
        
        invalid: {
            "foo" : "Expected (<number> | inherit) but found 'foo'."
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
            "all",
            "inherit"
        ],

        invalid: {
            "foo" : "Expected (auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit) but found 'foo'."
        }
    }));

    suite.add(new ValidationTestCase({
        property: "z-index",
        
        valid: [
            "1",
            "auto",
            "inherit"
        ],
        
        invalid: {
            "foo" : "Expected (<integer> | auto | inherit) but found 'foo'."
        }
    }));

    // Test star hack
    suite.add(new ValidationTestCase({
        property: "*z-index",
        
        valid: [
            "1",
            "auto",
            "inherit"
        ],
        
        invalid: {
            "foo" : "Expected (<integer> | auto | inherit) but found 'foo'."
        }
    }));



    YUITest.TestRunner.add(suite);

})();
