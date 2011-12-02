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
        var parser = new Parser({ strict: true});
        parser.addListener("property", function(event){
            Assert.isNull(event.invalid);
        });
        var result = parser.parse(".foo { " + this.property + ":" + value + "}");          
    };

    ValidationTestCase.prototype._testInvalidValue = function(value, message){
        var parser = new Parser({ strict: true});
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
            "1px" : "Expected <ident> or one of (none) but found '1px'."
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
            "foo" : "Expected <attachment> but found 'foo'."
        }   
    }));    
    
    suite.add(new ValidationTestCase({
        property: "background-image",
        
        valid: [
            "none",
            "url(foo.png)",
            "url(foo.png), none",
            "url(foo.png), url(bar.png)"
        ],
        
        invalid: {
            "foo" : "Expected <bg-image> but found 'foo'.",
            "url(foo.png)," : "Expected end of line but found ','."
        }  
    }));   
    
    suite.add(new ValidationTestCase({
        property: "background-position",
        
        valid: [
            "top",
            "bottom",
            "left center",
            "left 10px",
            "center bottom",
            "10% top",
            "left 10px bottom",
            "right top 5%",
            "center 3em center 10%",
            "top, bottom",
            "left 10px, left 10px",
            "right top 5%, left 10px bottom"
        ],
        
        invalid: {
            "foo"               : "Expected <bg-position> but found 'foo'.",
            "left center right" : "Expected end of value but found 'right'."
            
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
            "foo"               : "Expected <bg-size> but found 'foo'.",
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
            "foo"               : "Expected <repeat-style> but found 'foo'.",
            "no-repeat round 1px" : "Expected end of value but found '1px'."
            
        }  
    }));   

    suite.add(new ValidationTestCase({
        property: "border",
        
        valid: [
            "1px solid black",
            "black 1px solid",
            "solid black 1px"
        ],
        
        invalid: {
            "1px" : "Expected all of (<border-width>, <border-style>, <color>) but found '1px'.",
            "1px solid" : "Expected all of (<border-width>, <border-style>, <color>) but found '1px solid'."
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
            "foo" : "Expected <color> or one of (inherit) but found 'foo'.",
            "invert" : "Expected <color> or one of (inherit) but found 'invert'.",
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
            "foo"       : "Expected <x-one-radius> but found 'foo'.",
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
            "foo"       : "Expected <x-one-radius> but found 'foo'.",
            "5px 5px 7px" : "Expected end of value but found '7px'.",
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
            "foo"       : "Expected <x-one-radius> but found 'foo'.",
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
            "foo"       : "Expected <x-one-radius> but found 'foo'.",
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
            "1px 1px 1px 1px 1px" : "Expected a max of 4 property value(s) but found 5.",
            "foo" : "Expected <border-width> but found 'foo'."
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
            "10px 10px #888, -10px -10px #f4f4f4, 0px 0px 5px 5px #cc6600"
        ],
        
        invalid: {
            "foo"           : "Expected <shadow> but found 'foo'.",
            "1px"           : "Expected <shadow> but found '1px'.",
            "1em red"       : "Expected <shadow> but found '1em red'.",
            "1px 1px redd"  : "Expected end of value but found 'redd'.",
            "none 1px"      : "Expected end of value but found '1px'."
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
            "foo" : "Expected <color> or one of (inherit) but found 'foo'.",
            "invert" : "Expected <color> or one of (inherit) but found 'invert'.",
        }  
    }));

    suite.add(new ValidationTestCase({
        property: "min-height",
        
        valid: [
            "1px",
            "1%",
            "inherit"
        ],
        
        invalid: {
            "foo" : "Expected <length> or <percentage> or one of (inherit) but found 'foo'."
        }  
    }));

    suite.add(new ValidationTestCase({
        property: "opacity",
        
        valid: [
            "1"
        ],
        
        invalid: {
            "foo" : "Expected <number> or one of (inherit) but found 'foo'."
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
            "foo" : "Expected <integer> or one of (auto | inherit) but found 'foo'."
        }
    }));



    YUITest.TestRunner.add(suite);

})();
