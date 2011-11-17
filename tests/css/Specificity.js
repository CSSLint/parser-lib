(function(){

    var Assert = YUITest.Assert, 
        Parser = parserlib.css.Parser,
        Specificity = parserlib.css.Specificity;
        
    YUITest.TestRunner.add(new YUITest.TestCase({
    
        name: "Specificity Tests",
        
        testSpecificity1: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("*"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(0, specificity.valueOf());
            Assert.areEqual("0,0,0,0", specificity.toString());
        },
        
        testSpecificity2: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("li"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(1, specificity.valueOf());
            Assert.areEqual("0,0,0,1", specificity.toString());
        },
        
        testSpecificity3: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("li:first-line"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(2, specificity.valueOf());
            Assert.areEqual("0,0,0,2", specificity.toString());
        },
        
        testSpecificity4: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("ul li"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(2, specificity.valueOf());
            Assert.areEqual("0,0,0,2", specificity.toString());
        
        },
        
        testSpecificity5: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("ul ol+li"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(3, specificity.valueOf());
            Assert.areEqual("0,0,0,3", specificity.toString());
        
        },
        
        testSpecificity6: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("h1 + *[rel=up]"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(11, specificity.valueOf());
            Assert.areEqual("0,0,1,1", specificity.toString());
        
        },
        
        testSpecificity7: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("ul ol li.red"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(13, specificity.valueOf());
            Assert.areEqual("0,0,1,3", specificity.toString());
        
        },
        
        testSpecificity8: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("li.red.level"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(21, specificity.valueOf());
            Assert.areEqual("0,0,2,1", specificity.toString());
        
        },
        
        testSpecificity9: function(){
            var parser = new Parser(),
                selector = parser.parseSelector(".f00"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(10, specificity.valueOf());
            Assert.areEqual("0,0,1,0", specificity.toString());
        
        },
        
        testSpecificity10: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("div p.foo"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(12, specificity.valueOf());
            Assert.areEqual("0,0,1,2", specificity.toString());
        
        },
        
        testSpecificity11: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("#foo"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(100, specificity.valueOf());
            Assert.areEqual("0,1,0,0", specificity.toString());
        
        },
        
        testSpecificity12: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("body #foo .foo p"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(112, specificity.valueOf());
            Assert.areEqual("0,1,1,2", specificity.toString());
        
        },
        
        testSpecificity13: function(){
            var parser = new Parser(),
                selector = parser.parseSelector("#s12:not(FOO)"),
                specificity = Specificity.calculate(selector);
                
            Assert.areEqual(101, specificity.valueOf());
            Assert.areEqual("0,1,0,1", specificity.toString());
        
        }        
        
    
    }));


})();