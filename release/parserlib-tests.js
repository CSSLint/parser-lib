(function(){

    var Assert = YUITest.Assert,
        MediaQuery = parserlib.css.MediaQuery,
        Selector = parserlib.css.Selector,
        Combinator = parserlib.css.Combinator,
        SelectorPart = parserlib.css.SelectorPart,
        Parser = parserlib.css.Parser;

    //-------------------------------------------------------------------------
    // Base Test Suite
    //-------------------------------------------------------------------------

    var suite = new YUITest.TestSuite("Selector Parsing");

    suite.add(new YUITest.TestCase({

        name: "Type Selector Tests",

        testSimpleTypeSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(Parser.SELECTOR_TYPE, result.type);
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual(Parser.SELECTOR_PART_TYPE, result.parts[0].type);
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(0, result.parts[0].modifiers, "Element should have zero modifiers.");
            Assert.areEqual(1, result.specificity.valueOf());
        },

        testSimpleTypeSelectorPlusNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("svg|rect");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(Parser.SELECTOR_TYPE, result.type);
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("svg|rect", result.parts[0].elementName, "Element name should be 'svg|rect'.");
            Assert.areEqual(0, result.parts[0].modifiers, "Element should have zero modifiers.");
            Assert.areEqual(1, result.specificity.valueOf());
        },

        testSimpleTypeSelectorPlusBlankNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("|rect");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("|rect", result.parts[0].elementName, "Element name should be '|rect'.");
            Assert.areEqual(0, result.parts[0].modifiers, "Element should have zero modifiers.");
            Assert.areEqual(1, result.specificity.valueOf());
        },

        testSimpleTypeSelectorPlusUniversalNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("*|rect");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("*|rect", result.parts[0].elementName, "Element name should be '*|rect'.");
            Assert.areEqual(0, result.parts[0].modifiers, "Element should have zero modifiers.");
            Assert.areEqual(1, result.specificity.valueOf());
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Universal Selector Tests",

        testSimpleUniversalSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("*");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("*", result.parts[0].elementName, "Element name should be '*'.");
            Assert.areEqual(0, result.parts[0].modifiers.length, "Element should have zero modifiers.");
            Assert.areEqual(0, result.specificity.valueOf());
        },

        testSimpleUniversalSelectorPlusNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("svg|*");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("svg|*", result.parts[0].elementName, "Element name should be 'svg|*'.");
            Assert.areEqual(0, result.parts[0].modifiers.length, "Element should have zero modifiers.");
            Assert.areEqual(0, result.specificity.valueOf());
        },

        testSimpleUniversalSelectorPlusBlankNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("|*");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("|*", result.parts[0].elementName, "Element name should be '|*'.");
            Assert.areEqual(0, result.parts[0].modifiers.length, "Element should have zero modifiers.");
            Assert.areEqual(0, result.specificity.valueOf());
        },

        testSimpleUniversalSelectorPlusUniversalNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("*|*");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("*|*", result.parts[0].elementName, "Element name should be '*|*'.");
            Assert.areEqual(0, result.parts[0].modifiers.length, "Element should have zero modifiers.");
            Assert.areEqual(0, result.specificity.valueOf());
        }

    }));

    suite.add(new YUITest.TestCase({

        name: "Attribute Selector Tests",

        testAttributePresenceSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[class]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[class]", result.parts[0].modifiers[0].text, "Modifier text should be '[class]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeEquivalenceSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[class=\"selected\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[class=\"selected\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[class=\"selected\"]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());
        },

        testAttributeEquivalenceSelectorNoString: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[class=selected]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[class=selected]", result.parts[0].modifiers[0].text, "Modifier text should be '[class=selected]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeContainsSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[class~=\"selected\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[class~=\"selected\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[class~=\"selected\"]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeDashMatchSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[class|=\"selected\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[class|=\"selected\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[class|=\"selected\"]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeStartMatchSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("object[type^=\"image/\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("object", result.parts[0].elementName, "Element name should be 'object'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[type^=\"image/\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[type^=\"image/\"]'.");
            Assert.areEqual(7, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());
        },

        testAttributeEndMatchSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("a[href$=\".html\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("a", result.parts[0].elementName, "Element name should be 'a'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[href$=\".html\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[href$=\".html\"]'.");
            Assert.areEqual(2, result.parts[0].modifiers[0].col, "Modifier column should be 2.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());
        },

        testAttributeContainsMatchSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("p[title*=\"hello\"]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[0].elementName, "Element name should be 'p'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[title*=\"hello\"]", result.parts[0].modifiers[0].text, "Modifier text should be '[title*=\"hello\"]'.");
            Assert.areEqual(2, result.parts[0].modifiers[0].col, "Modifier column should be 2.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());
        },

        testAttributeEquivalenceSelectorNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[html|class=selected]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[html|class=selected]", result.parts[0].modifiers[0].text, "Modifier text should be '[html|class=selected]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeEquivalenceSelectorUniversalNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[*|class=selected]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[*|class=selected]", result.parts[0].modifiers[0].text, "Modifier text should be '[*|class=selected]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        },

        testAttributeEquivalenceSelectorDefaultNamespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li[|class=selected]");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be 'li'.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("attribute", result.parts[0].modifiers[0].type, "Modifier type should be 'attribute'.");
            Assert.areEqual("[|class=selected]", result.parts[0].modifiers[0].text, "Modifier text should be '[|class=selected]'.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Modifier column should be 3.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line should be 1.");
            Assert.areEqual(11, result.specificity.valueOf());

        }
    }));


    suite.add(new YUITest.TestCase({

        name: "Class Selector Tests",

        testSimpleClassSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector(".selected");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual(1, result.parts[0].line, "Line start should be 1");
            Assert.areEqual(1, result.parts[0].col, "Column start should be 1");
            Assert.isNull(result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("class", result.parts[0].modifiers[0].type, "Modifier type should be 'class'.");
            Assert.areEqual(".selected", result.parts[0].modifiers[0].text, "Modifier text should be '.selected'.");

        },

        testCompoundClassSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector(".selected.foo");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.line, "Line start should be 1");
            Assert.areEqual(1, result.col, "Column start should be 1");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isNull(result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(2, result.parts[0].modifiers.length, "Element should have two modifiers.");
            Assert.areEqual("class", result.parts[0].modifiers[0].type, "Modifier type should be 'class'.");
            Assert.areEqual(".selected", result.parts[0].modifiers[0].text, "Modifier text should be '.selected'.");
            Assert.areEqual("class", result.parts[0].modifiers[1].type, "Modifier type should be 'class'.");
            Assert.areEqual(".foo", result.parts[0].modifiers[1].text, "Modifier text should be '.foo'.");
        },

        testSimpleClassSelectorWithElementName: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.selected");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li",result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("class", result.parts[0].modifiers[0].type, "Modifier type should be 'class'.");
            Assert.areEqual(".selected", result.parts[0].modifiers[0].text, "Modifier text should be '.selected'.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line start should be 1");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Column start should be 3");

        },

        testCompoundClassSelectorWithElementName: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.selected.foo");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(2, result.parts[0].modifiers.length, "Element should have two modifiers.");
            Assert.areEqual("class", result.parts[0].modifiers[0].type, "Modifier type should be 'class'.");
            Assert.areEqual(".selected", result.parts[0].modifiers[0].text, "Modifier text should be '.selected'.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line start should be 1");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Column start should be 3");
            Assert.areEqual("class", result.parts[0].modifiers[1].type, "Modifier type should be 'class'.");
            Assert.areEqual(".foo", result.parts[0].modifiers[1].text, "Modifier text should be '.foo'.");
            Assert.areEqual(1, result.parts[0].modifiers[1].line, "Line start should be 1");
            Assert.areEqual(12, result.parts[0].modifiers[1].col, "Column start should be 12");
        }

    }));

    suite.add(new YUITest.TestCase({

        name: "ID Selector Tests",

        testSimpleIDSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("#header");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isNull(result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("id", result.parts[0].modifiers[0].type, "Modifier type should be 'id'.");
            Assert.areEqual("#header", result.parts[0].modifiers[0].text, "Modifier text should be '#header'.");
        },

        testSimpleIDSelectorWithElementName: function(){
            var parser = new Parser();
            var result = parser.parseSelector("div#header");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("div", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("id", result.parts[0].modifiers[0].type, "Modifier type should be 'id'.");
            Assert.areEqual("#header", result.parts[0].modifiers[0].text, "Modifier text should be '#header'.");
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Pseudo Class Selector Tests",

        testSimplePseudoClassSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("a:hover");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("a", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":hover", result.parts[0].modifiers[0].text, "Modifier text should be ':hover'.");
        },

        testMultiplePseudoClassSelectors: function(){
            var parser = new Parser();
            var result = parser.parseSelector("a:focus:hover");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("a", result.parts[0].elementName);
            Assert.areEqual(2, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":focus", result.parts[0].modifiers[0].text, "Modifier text should be ':focus'.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text, "Modifier text should be ':hover'.");
        },

        testPseudoClassFunctionSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("html:lang(fr-be)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("html", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":lang(fr-be)", result.parts[0].modifiers[0].text, "Modifier text should be ':lang(fr-be)'.");
        },

        testPseudoClassNthSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:nth-child(2n+1)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("tr", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":nth-child(2n+1)", result.parts[0].modifiers[0].text, "Modifier text should be ':nth-child(2n+1)'.");
        },

        testPseudoClassNthSelector2: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:nth-child(even)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("tr", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":nth-child(even)", result.parts[0].modifiers[0].text, "Modifier text should be ':nth-child(even)'.");
        },

        testPseudoClassNthSelector3: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:nth-child(5)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("tr", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":nth-child(5)", result.parts[0].modifiers[0].text, "Modifier text should be ':nth-child(5)'.");
        },

        testPseudoClassNthSelector4: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:nth-of-type(5)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("tr", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":nth-of-type(5)", result.parts[0].modifiers[0].text, "Modifier text should be ':nth-of-type(5)'.");
        },

        testPseudoClassLastChildSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:last-child");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("tr", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":last-child", result.parts[0].modifiers[0].text, "Modifier text should be ':last-child'.");
        },

        testPseudoClassNotSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("button:not([DISABLED])");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("button", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("not", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":not([DISABLED])", result.parts[0].modifiers[0].text, "Modifier text should be ':not([DISABLED])'.");
            Assert.areEqual(1, result.parts[0].modifiers[0].args.length, "Modifier should have one argument.");

            var arg = result.parts[0].modifiers[0].args[0];

            Assert.isInstanceOf(SelectorPart, arg, "Result should be an instance of Selector.");
            Assert.areEqual("[DISABLED]", arg.toString());
            Assert.isNull(arg.elementName);
            Assert.areEqual(1, arg.modifiers.length);
            Assert.areEqual("attribute", arg.modifiers[0].type);
        },

        testPseudoClassNotSelector2: function(){
            var parser = new Parser();
            var result = parser.parseSelector("button:not(foo)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("button", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("not", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual(":not(foo)", result.parts[0].modifiers[0].text, "Modifier text should be ':not(foo)'.");
            Assert.areEqual(1, result.parts[0].modifiers[0].args.length, "Modifier should have one argument.");


            var arg = result.parts[0].modifiers[0].args[0];

            Assert.isInstanceOf(SelectorPart, arg, "Result should be an instance of Selector.");
            Assert.areEqual("foo", arg.toString());
            Assert.areEqual("foo", arg.elementName, "Element name should be 'foo'.");
            Assert.areEqual(0, arg.modifiers.length);

        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Pseudo Element Selector Tests",

        testSimplePseudoElementSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("p::first-line");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[0].elementName);
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("pseudo", result.parts[0].modifiers[0].type, "Modifier type should be 'pseudo'.");
            Assert.areEqual("::first-line", result.parts[0].modifiers[0].text, "Modifier text should be '::first-line'.");
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Combinators",


        testChildCombinator: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover > p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(">", result.parts[1].text);
            Assert.areEqual("child", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testChildCombinatorNoSpaces: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover>p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(">", result.parts[1].text);
            Assert.areEqual("child", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testChildCombinatorOneSpaceBefore: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover >p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(">", result.parts[1].text);
            Assert.areEqual("child", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testChildCombinatorOneSpaceAfter: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover> p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(">", result.parts[1].text);
            Assert.areEqual("child", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testAdjacentSiblingCombinator: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover + p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual("+", result.parts[1].text);
            Assert.areEqual("adjacent-sibling", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testGeneralSiblingCombinator: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover ~ p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual("~", result.parts[1].text);
            Assert.areEqual("sibling", result.parts[1].type);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testDescendantCombinator: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "The line should be 1.");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "The column should be 3.");
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.areEqual(1, result.parts[0].modifiers[1].line, "The line should be 1.");
            Assert.areEqual(10, result.parts[0].modifiers[1].col, "The column should be 10.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(" ", result.parts[1].text);
            Assert.areEqual("descendant", result.parts[1].type);
            Assert.areEqual(1, result.parts[1].line, "Line should be 1.");
            Assert.areEqual(16, result.parts[1].col, "Column should be 16.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
            Assert.areEqual(1, result.parts[2].elementName.line, "Line should be 1.");
            Assert.areEqual(17, result.parts[2].elementName.col, "Column should be 17.");
        },

        testDescendantCombinatorWithTrailingWhitespace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover p ");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName);
            Assert.areEqual(".inline", result.parts[0].modifiers[0].text);
            Assert.areEqual("class", result.parts[0].modifiers[0].type);
            Assert.areEqual(":hover", result.parts[0].modifiers[1].text);
            Assert.areEqual("pseudo", result.parts[0].modifiers[1].type);
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(" ", result.parts[1].text);
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].elementName);
        },

        testWithCombinator: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li.inline:hover > p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(1, result.parts[1].line, "Line should be 1.");
            Assert.areEqual(17, result.parts[1].col, "Column should be 17.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
        },

        testWithNthChild: function(){
            var parser = new Parser();
            var result = parser.parseSelector("tr:nth-child(2n+1) a");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");

        }


        //body > h2:nth-of-type(n+2):nth-last-of-type(n+2)
        //body > h2:not(:first-of-type):not(:last-of-type)
        //html|*:not(:link):not(:visited)
    }));

    suite.add(new YUITest.TestCase({

        name: "Complex Cases",

        testWithComplexSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("body > h2:nth-of-type(n+2):nth-last-of-type(n+2)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual(1, result.parts[1].line, "Line should be 1.");
            Assert.areEqual(6, result.parts[1].col, "Column should be 6.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual(1, result.parts[2].line, "Line should be 1.");
            Assert.areEqual(8, result.parts[2].col, "Column should be 8.");
        },

        testWithComplexSelector2: function(){
            var parser = new Parser();
            var result = parser.parseSelector("body > h2:not(:first-of-type):not(:last-of-type)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
        },

        testWithComplexSelector3: function(){
            var parser = new Parser();
            var result = parser.parseSelector("html|*:not(:link):not(:visited)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Should be one part.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            //Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            //Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
        },

        testWithMultipartSelector: function(){
            var parser = new Parser();
            var result = parser.parseSelector("ul li a span");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(7, result.parts.length, "Should be four parts.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "Part should be a SelectorPart.");
            Assert.areEqual("ul", result.parts[0].elementName);

            Assert.isInstanceOf(SelectorPart, result.parts[2], "Part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[2].elementName);

            Assert.isInstanceOf(SelectorPart, result.parts[4], "Part should be a SelectorPart.");
            Assert.areEqual("a", result.parts[4].elementName);

            Assert.isInstanceOf(SelectorPart, result.parts[6], "Part should be a SelectorPart.");
            Assert.areEqual("span", result.parts[6].elementName);

        }



    }));


    suite.add(new YUITest.TestCase({

        name: "Media Queries",


        testSimpleMediaQuery: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("print");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.isNull(result.modifier);
            Assert.areEqual("print", result.mediaType);
            Assert.areEqual(0, result.features.length, "Should be zero parts.");
            Assert.areEqual("print", result.text);
        },

        testSimpleMediaQueryNot: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("not print");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.areEqual("not", result.modifier);
            Assert.areEqual("print", result.mediaType);
            Assert.areEqual(0, result.features.length, "Should be zero parts.");
            Assert.areEqual("not print", result.text);
        },

        testSimpleMediaQueryOnly: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("only print");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.areEqual("only", result.modifier);
            Assert.areEqual("print", result.mediaType);
            Assert.areEqual(0, result.features.length, "Should be zero parts.");
            Assert.areEqual("only print", result.text);
        },

        testComplexMediaQuery: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("screen and (max-weight: 3kg) and (color)");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.isNull(result.modifier);
            Assert.areEqual("screen", result.mediaType);
            Assert.areEqual(2, result.features.length, "Should be two features.");
            Assert.areEqual("max-weight", result.features[0].name);
            Assert.areEqual(25, result.features[0].value.col);
            Assert.areEqual("3kg", result.features[0].value);
            Assert.areEqual("color", result.features[1].name);
            Assert.isNull(result.features[1].value);
            Assert.areEqual(35, result.features[1].name.col);
            Assert.areEqual("screen and (max-weight:3kg) and (color)", result.text);

        },

        testComplexMediaQuery2: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("only screen and (max-device-width: 768px) and (orientation:portrait)");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.areEqual("only", result.modifier);
            Assert.areEqual("screen", result.mediaType);
            Assert.areEqual(2, result.features.length, "Should be two features.");
            Assert.areEqual("max-device-width", result.features[0].name);
            Assert.areEqual("768px", result.features[0].value);
            Assert.areEqual("orientation", result.features[1].name);
            Assert.areEqual("portrait", result.features[1].value);
            Assert.areEqual("only screen and (max-device-width:768px) and (orientation:portrait)", result.text);
        },

        testComplexMediaQueryWithDevicePixelRatioAsFraction: function(){
            var parser = new Parser();
            var result = parser.parseMediaQuery("only screen and (-o-device-pixel-ratio: 3/2) and (-webkit-device-pixel-ratio: 1.5)");

            Assert.isInstanceOf(MediaQuery, result, "Result should be an instance of MediaQuery.");
            Assert.areEqual(1, result.line, "Line should be 1");
            Assert.areEqual(1, result.col, "Column should be 1");
            Assert.areEqual("only", result.modifier);
            Assert.areEqual("screen", result.mediaType);
            Assert.areEqual(2, result.features.length, "Should be two features.");
            Assert.areEqual("-o-device-pixel-ratio", result.features[0].name);
            Assert.areEqual("3/2", result.features[0].value);
            Assert.areEqual("-webkit-device-pixel-ratio", result.features[1].name);
            Assert.areEqual("1.5", result.features[1].value);
        }


    }));


    suite.add(new YUITest.TestCase({

        name: "Property Values",

        testDimensionValuePx: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("1px");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(1, result.parts[0].value);
            Assert.areEqual("px", result.parts[0].units);
        },

        testDimensionValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("1ch");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(1, result.parts[0].value);
            Assert.areEqual("ch", result.parts[0].units);
        },

        testViewportRelativeHeightValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vh");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vh", result.parts[0].units);
        },

        testViewportRelativeWidthValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vw");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vw", result.parts[0].units);
        },

        testViewportRelativeMinValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vm");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vm", result.parts[0].units);
        },

        testPercentageValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("25.4%");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("percentage", result.parts[0].type);
            Assert.areEqual(25.4, result.parts[0].value);
        },

        testIntegerValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("25");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("integer", result.parts[0].type);
            Assert.areEqual(25, result.parts[0].value);
        },

        testNumberValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("25.0");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("number", result.parts[0].type);
            Assert.areEqual(25, result.parts[0].value);
        },

        testHexColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("#ffeedd");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(238, result.parts[0].green);
            Assert.areEqual(221, result.parts[0].blue);
        },

        testRGBColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgb(255, 238 , 221)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(238, result.parts[0].green);
            Assert.areEqual(221, result.parts[0].blue);
        },

        testRGBColorValue2: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgb(100%,50%, 75%)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(127.5, result.parts[0].green);
            Assert.areEqual(191.25, result.parts[0].blue);
        },

        testRGBAColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgba(255, 238 , 221, 0.3)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(238, result.parts[0].green);
            Assert.areEqual(221, result.parts[0].blue);
            Assert.areEqual(0.3, result.parts[0].alpha);
        },

        testRGBAColorValue2: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgba(100%,50%, 75%, 0.5)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(127.5, result.parts[0].green);
            Assert.areEqual(191.25, result.parts[0].blue);
            Assert.areEqual(0.5, result.parts[0].alpha);
        },

        testHSLColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("hsl(100,50%, 75%)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(100, result.parts[0].hue);
            Assert.areEqual(0.5, result.parts[0].saturation);
            Assert.areEqual(0.75, result.parts[0].lightness);
        },

        testHSLAColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("hsla(100,50%, 75%, 0.5)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(100, result.parts[0].hue);
            Assert.areEqual(0.5, result.parts[0].saturation);
            Assert.areEqual(0.75, result.parts[0].lightness);
            Assert.areEqual(0.5, result.parts[0].alpha);
        },

        testColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("red");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(0, result.parts[0].green);
            Assert.areEqual(0, result.parts[0].blue);
        },

        testCSS2SystemColorValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("InfoText");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
        },

        testURIValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("url(http://www.yahoo.com)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("http://www.yahoo.com", result.parts[0].uri);
        },

        testURIValue2: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("url('http://www.yahoo.com')");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("http://www.yahoo.com", result.parts[0].uri);
        },

        testURIValue3: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("url(\"http://www.yahoo.com\")");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("http://www.yahoo.com", result.parts[0].uri);
        },

        testStringValue: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("'Hello world!'");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Hello world!", result.parts[0].value);
        },

        testStringValue2: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("\"Hello world!\"");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Hello world!", result.parts[0].value);
        },

        testValueWithOperators: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("10px / 1em");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(3, result.parts.length);
            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[0]);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(10, result.parts[0].value);
            Assert.areEqual("px", result.parts[0].units);
            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[1]);
            Assert.areEqual("operator", result.parts[1].type);
            Assert.areEqual("/", result.parts[1].text);
            Assert.areEqual(1, result.parts[1].line, "Line should be 1.");
            Assert.areEqual(6, result.parts[1].col, "Column should be 6.");
            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[2]);
            Assert.areEqual("length", result.parts[2].type);
            Assert.areEqual(1, result.parts[2].value);
            Assert.areEqual("em", result.parts[2].units);
        },

        testValueWithOperators2: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("1em/1.5em \"Times New Roman\", Times, serif");
            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(8, result.parts.length);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[0]);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(1, result.parts[0].value);
            Assert.areEqual("em", result.parts[0].units);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[1]);
            Assert.areEqual("operator", result.parts[1].type);
            Assert.areEqual("/", result.parts[1].value);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[2]);
            Assert.areEqual("length", result.parts[2].type);
            Assert.areEqual(1.5, result.parts[2].value);
            Assert.areEqual("em", result.parts[2].units);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[3]);
            Assert.areEqual("string", result.parts[3].type);
            Assert.areEqual("Times New Roman", result.parts[3].value);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[4]);
            Assert.areEqual("operator", result.parts[4].type);
            Assert.areEqual(",", result.parts[4].value);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[5]);
            Assert.areEqual("identifier", result.parts[5].type);
            Assert.areEqual("Times", result.parts[5].value);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[6]);
            Assert.areEqual("operator", result.parts[6].type);
            Assert.areEqual(",", result.parts[6].value);

            Assert.isInstanceOf(parserlib.css.PropertyValuePart, result.parts[7]);
            Assert.areEqual("identifier", result.parts[7].type);
            Assert.areEqual("serif", result.parts[7].value);
        }



    }));

    suite.add(new YUITest.TestCase({

        name: "Rules",

        testRuleWithOnePartSelector: function(){
            var parser = new Parser();
            var result = parser.parseRule("p { color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithTwoPartSelector: function(){
            var parser = new Parser();
            var result = parser.parseRule("p li { color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithThreePartSelector: function(){
            var parser = new Parser();
            var result = parser.parseRule("p li a{ color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithFourPartSelector: function(){
            var parser = new Parser();
            var result = parser.parseRule("p li a span { color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Special Cases",

        _should: {
            error: {
                testIEFilter5: "Unexpected token '=' at line 1, col 14."
            }
        },

        testWithCommentAndSpaces: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li /*booya*/ p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].toString(), "First part should be 'li'");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual("descendant", result.parts[1].type, "Second part should be a 'descendant'");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].toString(), "First part should be 'p'");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
        },

        testWithCommentAndTrailingSpace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li/*booya*/ p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].toString(), "First part should be 'li'");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual("descendant", result.parts[1].type, "Second part should be a 'descendant'");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].toString(), "First part should be 'p'");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
        },

        testWithCommentAndLeadingSpace: function(){
            var parser = new Parser();
            var result = parser.parseSelector("li /*booya*/p");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].toString(), "First part should be 'li'");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.areEqual("descendant", result.parts[1].type, "Second part should be a 'descendant'");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
            Assert.areEqual("p", result.parts[2].toString(), "First part should be 'p'");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");
        },

        testIEFilter: function(){
            var parser = new Parser({ieFilters:true});
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.Wave(strength=100)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);
        },

        testIEFilter2: function(){
            var parser = new Parser({ieFilters:true});
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, src=http://l.yimg.com/ne/home/metro/pa/map/gugimap_btn_mapview.png, sizingMethod=image)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);

        },

        testIEFilter3: function(){
            var parser = new Parser({ieFilters:true});
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', src='http://l.yimg.com/ne/home/metro/pa/map/gugimap_btn_mapview.png', sizingMethod='image')");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);

        },

        testIEFilter4: function(){
            var parser = new Parser({ieFilters:true});
            var result = parser.parsePropertyValue("alpha(opacity=10)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("alpha(opacity=10)", result.text);
            Assert.areEqual("function", result.parts[0].type);
        },

        testIEFilter5: function(){
            var parser = new Parser();
            var result = parser.parsePropertyValue("alpha(opacity=10)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
        }




    }));

    suite.add(new YUITest.TestCase({

        name: "Animation Parsing Tests",

        testWebKitKeyFrames: function(){
            var parser = new Parser({strict:true}),
                called = false;

            parser.addListener("startkeyframes", function(event) {
                Assert.areEqual("webkit", event.prefix);
                Assert.areEqual("movingbox", event.name);
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(1, event.col, "Column should be 1");
                called = true;
            });
            var result = parser.parse("@-webkit-keyframes movingbox{0%{left:90%;}}");
            Assert.isTrue(called);  //just don't want an error
        },

        testMozKeyFrames: function(){
            var parser = new Parser({strict:true});
            var result = parser.parse("@-moz-keyframes movingbox{0%{left:90%;}50%{left:10%;}100%{left:90%;}}");
            Assert.isTrue(true);  //just don't want an error
        },

        testKeyFrames: function(){
            var parser = new Parser({strict:true});
            var result = parser.parse("@keyframes movingbox{0%{left:90%;}50%{left:10%;}100%{left:90%;}}");
            Assert.isTrue(true);  //just don't want an error
        },

        testKeyFramesFromTo: function(){
            var parser = new Parser({strict:true});
            var result = parser.parse("@keyframes movingbox{from{left:90%;-webkit-transform: rotate(0deg);}to{left:10%;-webkit-transform: rotate(360deg);}}");
            Assert.isTrue(true);  //just don't want an error
        },

        testKeyFramesWithWhitespace: function(){
            var parser = new Parser({strict:true});
            var result = parser.parse("@keyframes 'diagonal-slide' {  from { left: 0; top: 0; } to { left: 100px; top: 100px; } }");
            Assert.isTrue(true);
        }

    }));

    suite.add(new YUITest.TestCase({

        name: "General Parsing Tests",

        testMediaWithPage: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media { @page {} }");
            Assert.isTrue(true);  //just don't want an error
        },

        testMediaWithFontFace: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media { @font-face {} }");
            Assert.isTrue(true);  //just don't want an error
        },

        testMediaWithTypeOnly: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media print { }");
            Assert.isTrue(true);  //just don't want an error
        },

        testMediaWithTypesOnly: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media print, screen { }");
            Assert.isTrue(true);  //just don't want an error
        },

        testMediaWithSimpleExpression: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media (max-width:400px) { }");
            Assert.isTrue(true);  //just don't want an error
        },

        testMediaWithComplexExpression: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@media all and (max-width:400px) { }");
            Assert.isTrue(true);  //just don't want an error
        },

        testViewport: function(){
            var parser = new Parser({ strict: true});
            var result = parser.parse("@viewport { width: 397px; }");
            Assert.isTrue(true);  //just don't want an error
        },

        testViewportEventFires: function(){
            var parser = new Parser({ strict:true}),
                calledStart = false,
                calledEnd = false;

            parser.addListener("startviewport", function(event) {
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(1, event.col, "Column should be 1");
                calledStart = true;
            });

            parser.addListener("endviewport", function(event) {
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(1, event.col, "Column should be 1");
                calledEnd = true;
            });

            var result = parser.parse("@viewport { width: 397px; }");
            Assert.isTrue(calledStart);  //just don't want an error
            Assert.isTrue(calledEnd);  //just don't want an error
        },

        testClassesWithEscapes: function(){
            var parser = new Parser({strict:true});
            var result = parser.parseSelector("#\\31 a2b3c");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("#\\31 a2b3c", result.parts[0].toString(), "Selector should be correct.");
            Assert.areEqual(1, result.parts.length, "Should be one part.");
        }

    }));

    suite.add(new YUITest.TestCase({

        name: "Rule Parsing Tests",

        "Test parsing property-value pair": function(){
            var parser = new Parser({ strict: true});
            var result = parser.parsePropertyValue("#fff");

            Assert.areEqual("#fff", result.toString());
            Assert.areEqual(1, result.col);
            Assert.areEqual(1, result.line);
            Assert.areEqual("#fff", result.parts[0].toString());
            Assert.areEqual(1, result.parts[0].col);
            Assert.areEqual(1, result.parts[0].line);
            Assert.areEqual("color", result.parts[0].type);
        },

        "Test rule with one property": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(12, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            var result = parser.parse(".foo {\n    color: #fff;\n}");
        },

       "Test rule with star hack property": function(){
            var parser = new Parser({ strict: true, starHack: true});
            parser.addListener("property", function(event){
                Assert.areEqual("*color", event.property.toString());
                Assert.areEqual("color", event.property.text);
                Assert.areEqual("*", event.property.hack.toString(), "Property should be marked as with star hack");
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(13, event.value.parts[0].col, "First part column should be 13.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            var result = parser.parse(".foo {\n    *color: #fff;\n}");
        },

       "Test rule with underscore hack property": function(){
            var parser = new Parser({ strict: true, underscoreHack: true});
            parser.addListener("property", function(event){
                Assert.areEqual("_color", event.property.toString());
                Assert.areEqual("color", event.property.text);
                Assert.areEqual("_", event.property.hack.toString(), "Property should be marked as with underscore hack");
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(13, event.value.parts[0].col, "First part column should be 13.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            var result = parser.parse(".foo {\n    _color: #fff;\n}");
        },

        "Test rule with space after property name": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(13, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            var result = parser.parse(".foo {\n    color : #fff;\n}");
        },

        "Test rule with one property and !important": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(12, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
                Assert.isTrue(event.important, "Important should be true.");
            });
            var result = parser.parse(".foo {\n    color: #fff !important;\n}");
        },

        "Test rule with leading semicolon": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(12, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            var result = parser.parse(".foo {\n;   color: #fff;\n}");
        },

        "Test rule vendor prefix value": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("white-space", event.property.toString());
                Assert.areEqual("-moz-pre-wrap", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(18, event.value.parts[0].col, "First part column should be 18.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
                Assert.areEqual("-moz-pre-wrap", event.value.parts[0].text, "The vendor prefixed value should be intact.");
            });
            var result = parser.parse(".foo {\n;   white-space: -moz-pre-wrap;\n}");
        },

        "Test display -moz-inline-stack": function(){
            var parser = new Parser({ strict: true});
            parser.addListener("property", function(event){
                Assert.areEqual("display", event.property.toString());
                Assert.areEqual("-moz-inline-stack", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(14, event.value.parts[0].col, "First part column should be 14.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
                Assert.areEqual("-moz-inline-stack", event.value.parts[0].text, "Vendor prefixed value -moz-inline-stack is intact.");
            });
            var result = parser.parse(".foo {\n    display: -moz-inline-stack;\n}");
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Invalid CSS Parsing Tests",

        "Test parsing invalid celector": function(){
            var error;
            var parser = new Parser();
            parser.addListener("error", function(e){error = e;});
            parser.parse("c++{}");

            Assert.areEqual("error", error.type);
            Assert.areEqual(1, error.line);
            Assert.areEqual(3, error.col);
        }
    }));


    YUITest.TestRunner.add(suite);

})();

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
(function(){

    var Assert = YUITest.Assert,    
        TokenStream = parserlib.css.TokenStream,
        CSSTokens = parserlib.css.Tokens;

    //-------------------------------------------------------------------------
    // New testcase type to make it easier to test patterns
    //-------------------------------------------------------------------------
    
    function CSSTokenTestCase(info){    
    
        YUITest.TestCase.call(this, info);
        this.patterns = info.patterns;    
        
        for (var prop in this.patterns){
            if (this.patterns.hasOwnProperty(prop)){
                this["testPattern: " + prop] = function(prop){
                    return function(){
                        this._testPattern(prop, this.patterns[prop]);
                    };
                }(prop);
            }
        }
    }
    
    CSSTokenTestCase.prototype = new YUITest.TestCase();
    
    CSSTokenTestCase.prototype._testPattern = function(pattern, outputs){
        var tokenStream = new TokenStream(pattern, CSSTokens);
        var tt;
    
        for (var i=0, len=outputs.length; i < len; i++){
            tt = tokenStream.get((outputs[i] > -1 ? CSSTokens[outputs[i]].channel : undefined));
            Assert.areEqual(outputs[i], tt, "Token type should be " + CSSTokens.name(outputs[i]) + " but was " + CSSTokens.name(tt) + " (" + ( tokenStream.token() ? tokenStream.token().value : "unknown") + ").");           
        }

        //if there was an invalid token, stop here
        if (tt > -1){
            tt = tokenStream.get();
            Assert.areEqual(CSSTokens.EOF, tt, "Expected end of input but found token " + CSSTokens.name(tt) + " (" + ( tokenStream.token() ? tokenStream.token().value : "unknown") + ").");
        }
    };



    
    
    //-------------------------------------------------------------------------
    // Simple CSS token tests
    //-------------------------------------------------------------------------
    
    var suite = new YUITest.TestSuite("CSS Tokens");
   
   
    //note: \r\n is normalized to just \n by StringReader
    suite.add(new CSSTokenTestCase({
        name : "Tests for Whitespace",
        
        patterns: {
            " "     : [CSSTokens.S],
            "\n"    : [CSSTokens.S],
            "\n \t" : [CSSTokens.S],
            "\f \n" : [CSSTokens.S]        
        }        
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for comments",
        
        patterns: {
            //"/* booya */"     : [],
            //"/*\n booya */"   : [],
            //"/*\n booya \n*/" : [],
            //"/*/*/"           : [],
            "/*/hello*/abc"   : [CSSTokens.IDENT]
        }        
    }));
    
    suite.add(new CSSTokenTestCase({
        name: "Test for comparison operators",        
        
        patterns: {
            "~=":   [CSSTokens.INCLUDES],
            "|=":   [CSSTokens.DASHMATCH],
            "^=":   [CSSTokens.PREFIXMATCH],
            "$=":   [CSSTokens.SUFFIXMATCH],
            "*=":   [CSSTokens.SUBSTRINGMATCH]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name: "Test for identifiers",        
        
        patterns: {
            "a":        [CSSTokens.IDENT],
            "ab":       [CSSTokens.IDENT],
            "a1":       [CSSTokens.IDENT],
            "a_c":      [CSSTokens.IDENT],
            "a-c":      [CSSTokens.IDENT],
            "a90":      [CSSTokens.IDENT],
            "a\\09":    [CSSTokens.IDENT],
            "\\sa":     [CSSTokens.IDENT],
            
            //not identifiers
            "9a":       [CSSTokens.DIMENSION]
        }
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for strings",
        
        patterns: {
            "'hello'"       : [CSSTokens.STRING],
            "\"hello\""     : [CSSTokens.STRING],
            "''"            : [CSSTokens.STRING],
            "\"\""          : [CSSTokens.STRING],
            "'hello\""      : [CSSTokens.INVALID],
            "\"hello'"      : [CSSTokens.INVALID],
            "'hello"        : [CSSTokens.INVALID],
            "'hel\\\'lo'"   : [CSSTokens.STRING],
            "\"hel\\\"lo\"" : [CSSTokens.STRING]
        }        
    }));

    
    suite.add(new CSSTokenTestCase({
        name : "Tests for hashes",
        
        // need to use double \\ to represent a single \ due to escaping
        patterns: {
            "#identifier"       : [CSSTokens.HASH],
            "#_identifer"       : [CSSTokens.HASH],
            "#0-9_"             : [CSSTokens.HASH],
            "#name'"            : [CSSTokens.HASH, CSSTokens.INVALID],
            "#h\\0fllo"         : [CSSTokens.HASH],
            "#ffeeff"           : [CSSTokens.HASH],
            "#\\31 a2b3c"        : [CSSTokens.HASH],
            "#r0\\.5"            : [CSSTokens.HASH]
        }        
    }));
    
    //-------------------------------------------------------------------------
    // Tests for at-rules
    //-------------------------------------------------------------------------
    
    (function(){
    
        var atRules = {
            "@charset"      : CSSTokens.CHARSET_SYM,
            "@import"       : CSSTokens.IMPORT_SYM,
            "@page"         : CSSTokens.PAGE_SYM,
            "@media"        : CSSTokens.MEDIA_SYM,
            "@font-face"    : CSSTokens.FONT_FACE_SYM,
            "@namespace"    : CSSTokens.NAMESPACE_SYM,
            "@top-left-corner"  : CSSTokens.TOPLEFTCORNER_SYM,
            "@top-left"     : CSSTokens.TOPLEFT_SYM,
            "@top-right-corner" : CSSTokens.TOPRIGHTCORNER_SYM,
            "@top-right"    : CSSTokens.TOPRIGHT_SYM,
            "@bottom-left-corner"   : CSSTokens.BOTTOMLEFTCORNER_SYM,
            "@bottom-left" : CSSTokens.BOTTOMLEFT_SYM,
            "@bottom-right-corner"  : CSSTokens.BOTTOMRIGHTCORNER_SYM,
            "@bottom-right" : CSSTokens.BOTTOMRIGHT_SYM,
            "@left-top"     : CSSTokens.LEFTTOP_SYM,
            "@left-middle"  : CSSTokens.LEFTMIDDLE_SYM,
            "@left-bottom"  : CSSTokens.LEFTBOTTOM_SYM,
            "@right-top"    : CSSTokens.RIGHTTOP_SYM,
            "@right-middle" : CSSTokens.RIGHTMIDDLE_SYM,
            "@right-bottom" : CSSTokens.RIGHTBOTTOM_SYM,
            
            //animation
            "@-webkit-keyframes":   CSSTokens.KEYFRAMES_SYM,
            "@-moz-keyframes"   : CSSTokens.KEYFRAMES_SYM,
            "@keyframes"        : CSSTokens.KEYFRAMES_SYM,
            
            //errors
            "@foo"              : CSSTokens.UNKNOWN_SYM,
            "@bar"              : CSSTokens.UNKNOWN_SYM
        };
        
        var patterns;
        
        for (var prop in atRules){
            patterns = {};
            
            patterns[prop] = [atRules[prop]];
            patterns[prop + " "] = [atRules[prop], CSSTokens.S];
            patterns[prop.toUpperCase()] = [atRules[prop]];
            patterns[prop.toUpperCase() + " "] = [atRules[prop], CSSTokens.S];
            
            suite.add(new CSSTokenTestCase({
                name: "Tests for " + prop,                
                patterns: patterns            
            }));
        }
    })();
    
    
    suite.add(new CSSTokenTestCase({
        name : "Tests for !important",
        
        patterns: {
            "!important"        : [CSSTokens.IMPORTANT_SYM],
            "!IMPORTANT"        : [CSSTokens.IMPORTANT_SYM],
            "!  important"      : [CSSTokens.IMPORTANT_SYM],
            "!  IMPORTANT"      : [CSSTokens.IMPORTANT_SYM],
            "!/*booya*/important"       : [CSSTokens.IMPORTANT_SYM],
            "!/*booya*/IMPORTANT"       : [CSSTokens.IMPORTANT_SYM],
            "! /*booya*/ important"     : [CSSTokens.IMPORTANT_SYM],
            "! /*booya*/ IMPORTANT"     : [CSSTokens.IMPORTANT_SYM],

            //bogus symbols            
            "! /*IMPORTANT"     : [CSSTokens.CHAR, CSSTokens.S, CSSTokens.EOF],            
            "! / important"     : [CSSTokens.CHAR, CSSTokens.S, CSSTokens.SLASH, CSSTokens.S, CSSTokens.IDENT],            
            "!IMPO RTANT"       : [CSSTokens.CHAR, CSSTokens.IDENT, CSSTokens.S, CSSTokens.IDENT]            
        }        
    }));    
    
    suite.add(new CSSTokenTestCase({
        name : "Tests for HTML-style comments",
        
        patterns: {
            "<!--"  : [CSSTokens.CDO],
            "<!-- " : [CSSTokens.CDO, CSSTokens.S],
            "-->"   : [CSSTokens.CDC],
            "--> "  : [CSSTokens.CDC, CSSTokens.S]
        }        
    }));    
    
    suite.add(new CSSTokenTestCase({
        name : "Tests for Unicode ranges",
        
        patterns: {
            "U+A5"          : [CSSTokens.UNICODE_RANGE],
            "U+0-7F"        : [CSSTokens.UNICODE_RANGE],
            "U+590-5ff"     : [CSSTokens.UNICODE_RANGE],
            "U+AB-BC"       : [CSSTokens.UNICODE_RANGE],
            "U+4E00-9FFF"   : [CSSTokens.UNICODE_RANGE],
            "U+30??"        : [CSSTokens.UNICODE_RANGE],
            "U+00-FF"       : [CSSTokens.UNICODE_RANGE],
            "U+??????"      : [CSSTokens.UNICODE_RANGE],
            "U+0??????"     : [CSSTokens.UNICODE_RANGE, CSSTokens.CHAR],
            "U+00-??"       : [CSSTokens.UNICODE_RANGE, CSSTokens.MINUS, CSSTokens.CHAR, CSSTokens.CHAR],
            "U+?1"          : [CSSTokens.UNICODE_RANGE, CSSTokens.NUMBER],
            "U+"            : [CSSTokens.CHAR, CSSTokens.PLUS],
            "U+00-J"        : [CSSTokens.UNICODE_RANGE, CSSTokens.IDENT]
        }        
    }));    
    
    suite.add(new CSSTokenTestCase({
        name : "Tests for :not",
        
        patterns: {
            ":not("   : [CSSTokens.NOT],
            ":noT("   : [CSSTokens.NOT],
            ":nOT("   : [CSSTokens.NOT],
            ":NOT("   : [CSSTokens.NOT],
            ":not "   : [CSSTokens.COLON, CSSTokens.IDENT, CSSTokens.S],
            "button:not([DISABLED])": [CSSTokens.IDENT, CSSTokens.NOT, CSSTokens.LBRACKET, CSSTokens.IDENT, CSSTokens.RBRACKET, CSSTokens.RPAREN]
        }        
    }));
   
    suite.add(new CSSTokenTestCase({
        name : "Tests for Media Queries",
        
        patterns: {
            "not"   : [CSSTokens.IDENT],
            "and"   : [CSSTokens.IDENT],
            "only"  : [CSSTokens.IDENT],
            "5dpi"  : [CSSTokens.RESOLUTION],
            "5.2dPi": [CSSTokens.RESOLUTION],
            ".5DPI" : [CSSTokens.RESOLUTION]
        }        
    }));
   
    suite.add(new CSSTokenTestCase({
        name : "Tests for Numbers",
        
        patterns: {
        
            
            //pixels
            "4px"       : [CSSTokens.LENGTH],
            "50.0PX"    : [CSSTokens.LENGTH],
            ".6Px"      : [CSSTokens.LENGTH],
            
            
            "7cm"       : [CSSTokens.LENGTH],
            "7CM"       : [CSSTokens.LENGTH],
            "7cM"       : [CSSTokens.LENGTH],
            "8.0mm"     : [CSSTokens.LENGTH],
            ".9in"      : [CSSTokens.LENGTH],
            "7pc"       : [CSSTokens.LENGTH],
            "8.0pt"     : [CSSTokens.LENGTH],
            
            "5em"       : [CSSTokens.LENGTH],
            "50.0EM"    : [CSSTokens.LENGTH],
            ".5eM"      : [CSSTokens.LENGTH],
            
            "5ex"       : [CSSTokens.LENGTH],
            "50.0EX"    : [CSSTokens.LENGTH],
            ".5eX"      : [CSSTokens.LENGTH],

            "5vw"       : [CSSTokens.LENGTH],
            "50.0VW"    : [CSSTokens.LENGTH],
            ".5vW"      : [CSSTokens.LENGTH],

            "5vh"       : [CSSTokens.LENGTH],
            "50.0VH"    : [CSSTokens.LENGTH],
            ".5vH"      : [CSSTokens.LENGTH],

            "5rem"       : [CSSTokens.LENGTH],
            "50.0REM"    : [CSSTokens.LENGTH],
            ".5rEm"      : [CSSTokens.LENGTH],

            "5vm"       : [CSSTokens.LENGTH],
            "50.0VM"    : [CSSTokens.LENGTH],
            ".5vM"      : [CSSTokens.LENGTH],

            "5ch"       : [CSSTokens.LENGTH],
            "50.0CH"    : [CSSTokens.LENGTH],
            ".5cH"      : [CSSTokens.LENGTH],



            "5deg"       : [CSSTokens.ANGLE],
            "50.0DEG"    : [CSSTokens.ANGLE],
            ".5Deg"      : [CSSTokens.ANGLE],
            
            "5rad"       : [CSSTokens.ANGLE],
            "50.0RAD"    : [CSSTokens.ANGLE],
            ".5Rad"      : [CSSTokens.ANGLE],
            
            "5grad"      : [CSSTokens.ANGLE],
            "50.0GRAD"   : [CSSTokens.ANGLE],
            ".5Grad"     : [CSSTokens.ANGLE],
            
            "5ms"           : [CSSTokens.TIME],
            "50.0MS"        : [CSSTokens.TIME],
            ".5Ms"          : [CSSTokens.TIME],
  
            "5s"            : [CSSTokens.TIME],
            "50.0S"         : [CSSTokens.TIME],
            
            "5hz"           : [CSSTokens.FREQ],
            "50.0HZ"        : [CSSTokens.FREQ],
            ".5Hz"          : [CSSTokens.FREQ],
  
            "5khz"          : [CSSTokens.FREQ],
            "50.0KHZ"       : [CSSTokens.FREQ],
            ".5kHz"         : [CSSTokens.FREQ],
  
            "5ncz"          : [CSSTokens.DIMENSION],
            "50.0NCZ"       : [CSSTokens.DIMENSION],
            ".5nCz"         : [CSSTokens.DIMENSION],
  
            "3%"        : [CSSTokens.PERCENTAGE],
            "45.05%"    : [CSSTokens.PERCENTAGE],
            ".9%"       : [CSSTokens.PERCENTAGE],
            
            //regular numbers
            "1"         : [CSSTokens.NUMBER],
            "20.0"      : [CSSTokens.NUMBER],
            ".3"        : [CSSTokens.NUMBER],  
            
            //invalid numbers
            "-.3"       : [CSSTokens.MINUS, CSSTokens.NUMBER],
            "+0"        : [CSSTokens.PLUS, CSSTokens.NUMBER],
            "-name"     : [CSSTokens.IDENT],
            "+name"     : [CSSTokens.PLUS, CSSTokens.IDENT]
  
        }        
    }));   
   
    suite.add(new CSSTokenTestCase({
        name : "Tests for URLs",
        
        patterns: {
            "url(foo.jpg)"      : [CSSTokens.URI],
            "url( foo.jpg)"     : [CSSTokens.URI],
            "url(foo.jpg )"     : [CSSTokens.URI],
            "url( foo.jpg )"    : [CSSTokens.URI],
            "url('foo.jpg')"    : [CSSTokens.URI],
            "url(\"foo.jpg\")"  : [CSSTokens.URI],

            "url(http://www.nczonline.net/favicon.ico)":    [CSSTokens.URI],
            "url('http://www.nczonline.net/favicon.ico')":  [CSSTokens.URI],
            "url(\"http://www.nczonline.net/favicon.ico\")":[CSSTokens.URI],
            
            "url(http://www.nczonline.net/favicon.ico?a=b&c=d)":    [CSSTokens.URI],
            "url('http://www.nczonline.net/favicon.ico?a=b&c=d')":  [CSSTokens.URI],
            "url(\"http://www.nczonline.net/favicon.ico?a=b&c=d\")":[CSSTokens.URI],
            
            //invalid URLs
            "url('booya\")"     : [CSSTokens.FUNCTION, CSSTokens.INVALID],
            "url('booya'"       : [CSSTokens.FUNCTION, CSSTokens.STRING]
        }        
    }));   

    suite.add(new CSSTokenTestCase({
        name : "Tests for Functions",
        
        patterns: {
        
            //regular CSS functions
            "rgb(255,0,1)"      : [CSSTokens.FUNCTION, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.NUMBER, CSSTokens.RPAREN],
            "counter(par-num,upper-roman)" : [CSSTokens.FUNCTION, CSSTokens.IDENT, CSSTokens.COMMA, CSSTokens.IDENT, CSSTokens.RPAREN],
            "calc(100% - 5px)"      : [CSSTokens.FUNCTION, CSSTokens.PERCENTAGE, CSSTokens.S, CSSTokens.MINUS, CSSTokens.S, CSSTokens.LENGTH, CSSTokens.RPAREN],

            //old-style IE filters - interpreted as bunch of tokens
            "alpha(opacity=50)" : [CSSTokens.FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN],

            //IE filters - not sure how to handle these yet
            "progid:DXImageTransform.Microsoft.Wave(strength=100)"                  : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN],
            "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)"    : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.COMMA, CSSTokens.S, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER,CSSTokens.RPAREN],
            "progid:DXImageTransform.Microsoft.Iris(irisstyle='STAR', duration=4)"   : [CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.STRING, CSSTokens.COMMA, CSSTokens.S, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER,CSSTokens.RPAREN]
        }        
    }));    

    suite.add(new CSSTokenTestCase({
        name: "Test for single-character tokens",
        
        patterns: {
            
            //single characters with defined tokens
            "/"     : [CSSTokens.SLASH],
            "-"     : [CSSTokens.MINUS],
            "+"     : [CSSTokens.PLUS],
            "*"     : [CSSTokens.STAR],
            ">"     : [CSSTokens.GREATER],
            "{"     : [CSSTokens.LBRACE],
            "}"     : [CSSTokens.RBRACE],
            "["     : [CSSTokens.LBRACKET],
            "]"     : [CSSTokens.RBRACKET],
            "="     : [CSSTokens.EQUALS],
            ":"     : [CSSTokens.COLON],
            ";"     : [CSSTokens.SEMICOLON],
            "("     : [CSSTokens.LPAREN],
            ")"     : [CSSTokens.RPAREN],
            "."     : [CSSTokens.DOT],
            ","     : [CSSTokens.COMMA],
            
            //single characters without tokens
            "@"     : [CSSTokens.CHAR]
        }
    }));
    
    //-------------------------------------------------------------------------
    // More complex testing patterns
    //-------------------------------------------------------------------------

    suite.add(new CSSTokenTestCase({
        name : "Tests for Properties",
        
        patterns: {
        
            //regular CSS functions
            "background: red;"       : [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IDENT, CSSTokens.SEMICOLON],
            "background-color: red;" : [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IDENT, CSSTokens.SEMICOLON],
            
            "filter: progid:DXImageTransform.Microsoft.Wave(strength=100);": [CSSTokens.IDENT, CSSTokens.COLON, CSSTokens.S, CSSTokens.IE_FUNCTION, CSSTokens.IDENT, CSSTokens.EQUALS, CSSTokens.NUMBER, CSSTokens.RPAREN, CSSTokens.SEMICOLON]
 
        }        
    }));

    suite.add(new CSSTokenTestCase({
        name : "Tests for odd cases",
        
        patterns: {
        
            //regular CSS functions
            ".name"       : [CSSTokens.DOT, CSSTokens.IDENT],
            "-name"       : [CSSTokens.IDENT]
            
        }        
    }));
    
    //-------------------------------------------------------------------------
    // Test line/column numbers
    //-------------------------------------------------------------------------
    var newSuite = new YUITest.TestSuite("Interface Tests");
    newSuite.add(new YUITest.TestCase({
    
        name: "Test line/column numbers",
        
        "Two identifiers in a row should have correct line and column numbers": function() {
            var tokenStream = new TokenStream("foo bar", CSSTokens),
                tt,
                token;
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(1, token.startCol);
            Assert.areEqual(4, token.endCol);
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.S, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(4, token.startCol);
            Assert.areEqual(5, token.endCol);
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(5, token.startCol);
            Assert.areEqual(8, token.endCol);            
        },
        
        "An identifier followed by a dot and ident should have correct line and column numbers": function() {
            var tokenStream = new TokenStream("foo .bar", CSSTokens),
                tt,
                token;
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(1, token.startCol);
            Assert.areEqual(4, token.endCol);
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.S, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(4, token.startCol);
            Assert.areEqual(5, token.endCol);
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.DOT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(5, token.startCol);
            Assert.areEqual(6, token.endCol);
            
            tt = tokenStream.get();
            token = tokenStream.token();
            Assert.areEqual(CSSTokens.IDENT, tt);
            Assert.areEqual(1, token.startLine);
            Assert.areEqual(1, token.endLine);
            Assert.areEqual(6, token.startCol);
            Assert.areEqual(9, token.endCol);            
        }        
    
    }));
    

    YUITest.TestRunner.add(suite);
    YUITest.TestRunner.add(newSuite);

})();

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

(function(){
    
    var Assert = YUITest.Assert
        StringReader = parserlib.util.StringReader;
    
    //-------------------------------------------------------------------------
    // Base Test Suite
    //-------------------------------------------------------------------------
    
    var suite = new YUITest.TestSuite("StringReader");
    
    //-------------------------------------------------------------------------
    // Test Case for adding
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "read() Tests",

        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that reading a string with no new lines works.
         */
        testLinearReadWithOneLine: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString),
                i = 0,
                c;
                
            Assert.areEqual(1, reader.getCol(), "Column should be 1.");
            c = reader.read();
            
            while(c){
                Assert.areEqual(testString.charAt(i), c, "Character at position " + i + " is incorrect.");  
                Assert.areEqual(i+2, reader.getCol(), "Column should be " + (i+2) + ".");
                c = reader.read();
                i++;
            }
            
            Assert.areEqual(testString.length, i, "All characters should be read.");
            Assert.isNull(c, "Last character read should be null.");                 
        },
        
        /*
         * Tests that reading a multi-line string works.
         */
        testLinearReadWithTwoLines: function(){
            var testString = "Hello world!\nNice day, isn't it?",
                reader = new StringReader(testString),
                i = 0,
                c = reader.read();
                
            while(c){
                Assert.areEqual(testString.charAt(i), c, "Character at position " + i + " is incorrect."); 
                if (c == "\n"){
                    Assert.areEqual(2, reader.getLine(), "Should now be on second row.");
                    Assert.areEqual(1, reader.getCol(), "The new line should cause you to go to first char in second row.");
                } 
                c = reader.read();
                i++;
            }
            
            Assert.isNull(c, "Last character read should be null.");                 
        },

        
        /*
         * Tests that reading a multi-line string properly tracks rows and cols.
         */
        testLinearReadWithTwoLinesTrackCols: function(){
            var testString = "Hello world!\nNice day, isn't it?",
                reader = new StringReader(testString);
                
            reader.readTo("!");
            reader.read();
            
            Assert.areEqual(1, reader.getCol());
            Assert.areEqual(2, reader.getLine());
            
        },
        
        /*
         * Tests that reading a multi-line string works when the last character is a new-line.
         */
        testLinearReadWithTwoLinesAndDanglingNewLine: function(){
            var testString = "Hello world!\nNice day, isn't it?\n",
                reader = new StringReader(testString),
                i = 0,
                c = reader.read();
                
            while(c){
                Assert.areEqual(testString.charAt(i), c, "Character at position " + i + " is incorrect.");  
                c = reader.read();
                i++;
            }
            
            Assert.isNull(c, "Last character read should be null.");                 
        }        
        
        
        
        
    }));

    //-------------------------------------------------------------------------
    // Test Case for readTo
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "readTo() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that reading a string with no new lines works.
         */
        testLinearReadToWithOneLine: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
                
            Assert.areEqual("Hello ", reader.readTo(" "));    
            Assert.areEqual("w", reader.read());
        },
        
        /*
         * Tests that reading a multi-line string works.
         */
        testLinearReadToWithTwoLines: function(){
            var testString = "Hello world!\nNice day, isn't it?",
                reader = new StringReader(testString);
                
                
            Assert.areEqual("Hello world!\nN", reader.readTo("N"));  
            Assert.areEqual(2, reader.getLine());
            Assert.areEqual(2, reader.getCol());
        }
                
    }));    
    
    //-------------------------------------------------------------------------
    // Test Case for readWhile()
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "readWhile() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that the entire string can be read..
         */
        testReadWhileSimple: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            var result = reader.readWhile(function(){
                return true;
            });

            Assert.areEqual(testString, result);
            Assert.areEqual(1, reader.getLine());
            Assert.areEqual(13, reader.getCol());
        }
    }));      
    
    //-------------------------------------------------------------------------
    // Test Case for readCount()
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "readCount() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that a set number of characters are read correctly.
         */
        testReadCountSimple: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            var result = reader.readCount(6);

            Assert.areEqual("Hello ", result);
            
            result = reader.readCount(2);
            Assert.areEqual("wo", result);
        }
    }));      
    
    //-------------------------------------------------------------------------
    // Test Case for readMatch()
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "readMatch() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that a text pattern is read correctly.
         */
        testReadMatchSimple: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            var result = reader.readMatch("Hello");

            Assert.areEqual("Hello", result);
        },
        
        /*
         * Tests that a regex pattern is read correctly.
         */
        testReadMatchRegEx: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            var result = reader.readMatch(/^Hello/);

            Assert.areEqual("Hello", result);
        }
        
        
    }));      
    
     
    
    //-------------------------------------------------------------------------
    // Test Case for eof()
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "eof() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that eof() works after reading to end of string.
         */
        testTestEofSimple: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            reader.readTo("!");
            Assert.isTrue(reader.eof());
        }     
        
        
    }));         
    
    //-------------------------------------------------------------------------
    // Test Case for mark() and reset()
    //-------------------------------------------------------------------------
    
    suite.add(new YUITest.TestCase({
    
        name : "mark() and reset() Tests",


        //---------------------------------------------------------------------
        // Tests
        //---------------------------------------------------------------------
    
        /*
         * Tests that mark() and reset() preserve lines/cols correctly.
         */
        testMarkResetSimple: function(){
            var testString = "Hello world!",
                reader = new StringReader(testString);
                
            reader.mark();
            reader.readTo("!");
            reader.reset();
            
            Assert.areEqual(1, reader.getLine(), "Row should be 1");
            Assert.areEqual(1, reader.getCol(), "Column should be 1");
        }     
        
        
    }));         
    
    YUITest.TestRunner.add(suite);

})();

