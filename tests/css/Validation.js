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
            "center 3em center 10%"
        ],
        
        invalid: {
            "foo"               : "Expected <bg-position> but found 'foo'.",
            "left center right" : "Expected <bg-position> but found 'left center right'."
            
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
