"use strict";

var YUITest = require("yuitest"),
    Assert = YUITest.Assert,
    parserlib = require("../../"),
    MediaQuery = parserlib.css.MediaQuery,
    Selector = parserlib.css.Selector,
    Combinator = parserlib.css.Combinator,
    SelectorPart = parserlib.css.SelectorPart,
    Parser = parserlib.css.Parser;

(function() {

    //-------------------------------------------------------------------------
    // Base Test Suite
    //-------------------------------------------------------------------------

    var suite = new YUITest.TestSuite("Selector Parsing");

    suite.add(new YUITest.TestCase({

        name: "Type Selector Tests",

        testSimpleTypeSelector: function() {
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

        testSimpleTypeSelectorPlusNamespace: function() {
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

        testSimpleTypeSelectorPlusBlankNamespace: function() {
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

        testSimpleTypeSelectorPlusUniversalNamespace: function() {
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

        testSimpleUniversalSelector: function() {
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

        testSimpleUniversalSelectorPlusNamespace: function() {
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

        testSimpleUniversalSelectorPlusBlankNamespace: function() {
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

        testSimpleUniversalSelectorPlusUniversalNamespace: function() {
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

        testAttributePresenceSelector: function() {
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

        testAttributeEquivalenceSelector: function() {
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

        testAttributeEquivalenceSelectorNoString: function() {
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

        testAttributeContainsSelector: function() {
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

        testAttributeDashMatchSelector: function() {
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

        testAttributeStartMatchSelector: function() {
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

        testAttributeEndMatchSelector: function() {
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

        testAttributeContainsMatchSelector: function() {
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

        testAttributeEquivalenceSelectorNamespace: function() {
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

        testAttributeEquivalenceSelectorUniversalNamespace: function() {
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

        testAttributeEquivalenceSelectorDefaultNamespace: function() {
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

        testSimpleClassSelector: function() {
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

        testCompoundClassSelector: function() {
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

        testSimpleClassSelectorWithElementName: function() {
            var parser = new Parser();
            var result = parser.parseSelector("li.selected");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Selector should have one parts.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("li", result.parts[0].elementName, "Element name should be null.");
            Assert.areEqual(1, result.parts[0].modifiers.length, "Element should have one modifier.");
            Assert.areEqual("class", result.parts[0].modifiers[0].type, "Modifier type should be 'class'.");
            Assert.areEqual(".selected", result.parts[0].modifiers[0].text, "Modifier text should be '.selected'.");
            Assert.areEqual(1, result.parts[0].modifiers[0].line, "Line start should be 1");
            Assert.areEqual(3, result.parts[0].modifiers[0].col, "Column start should be 3");

        },

        testCompoundClassSelectorWithElementName: function() {
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

        testSimpleIDSelector: function() {
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

        testSimpleIDSelectorWithElementName: function() {
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

        _should: {
            error: {
                testInvalidPseudoClassSelector: "Expected a `FUNCTION` or `IDENT` after colon at line 1, col 2."
            }
        },

        testInvalidPseudoClassSelector: function() {
            var parser = new Parser();
            parser.parseSelector("a:");
        },

        testSimplePseudoClassSelector: function() {
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

        testMultiplePseudoClassSelectors: function() {
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

        testPseudoClassFunctionSelector: function() {
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

        testPseudoClassNthSelector: function() {
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

        testPseudoClassNthSelector2: function() {
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

        testPseudoClassNthSelector3: function() {
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

        testPseudoClassNthSelector4: function() {
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

        testPseudoClassLastChildSelector: function() {
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

        testPseudoClassNotSelector: function() {
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

        testPseudoClassNotSelector2: function() {
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

        testSimplePseudoElementSelector: function() {
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


        testChildCombinator: function() {
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

        testChildCombinatorNoSpaces: function() {
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

        testChildCombinatorOneSpaceBefore: function() {
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

        testChildCombinatorOneSpaceAfter: function() {
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

        testAdjacentSiblingCombinator: function() {
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

        testGeneralSiblingCombinator: function() {
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

        testDescendantCombinator: function() {
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

        testDescendantCombinatorWithTrailingWhitespace: function() {
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

        testWithCombinator: function() {
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

        testWithNthChild: function() {
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

        testWithComplexSelector: function() {
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

        testWithComplexSelector2: function() {
            var parser = new Parser();
            var result = parser.parseSelector("body > h2:not(:first-of-type):not(:last-of-type)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(3, result.parts.length, "Should be three parts.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
        },

        testWithComplexSelector3: function() {
            var parser = new Parser();
            var result = parser.parseSelector("html|*:not(:link):not(:visited)");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.areEqual(1, result.parts.length, "Should be one part.");

            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            //Assert.isInstanceOf(Combinator, result.parts[1], "Second part should be a Combinator.");
            //Assert.isInstanceOf(SelectorPart, result.parts[2], "Third part should be a SelectorPart.");
        },

        testWithMultipartSelector: function() {
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


        testSimpleMediaQuery: function() {
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

        testSimpleMediaQueryNot: function() {
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

        testSimpleMediaQueryOnly: function() {
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

        testComplexMediaQuery: function() {
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

        testComplexMediaQuery2: function() {
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

        testComplexMediaQueryWithDevicePixelRatioAsFraction: function() {
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

        testIdentifierValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("foo");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("identifier", result.parts[0].type);
        },

        testIdentifierValue2: function() {
            var parser = new Parser();
            // Identifiers can even start with digits, iff they are escaped.
            var result = parser.parsePropertyValue("\\30 \\0000307");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("007", result.parts[0].text);
            Assert.areEqual(true, result.parts[0].wasIdent);
        },

        testDimensionValuePx: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("1px");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(1, result.parts[0].value);
            Assert.areEqual("px", result.parts[0].units);
        },

        testDimensionValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("1ch");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(1, result.parts[0].value);
            Assert.areEqual("ch", result.parts[0].units);
        },

        testViewportRelativeHeightValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vh");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vh", result.parts[0].units);
        },

        testViewportRelativeWidthValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vw");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vw", result.parts[0].units);
        },

        testViewportRelativeMaxValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vmax");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vmax", result.parts[0].units);
        },

        testViewportRelativeMinValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("50vmin");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("length", result.parts[0].type);
            Assert.areEqual(50, result.parts[0].value);
            Assert.areEqual("vmin", result.parts[0].units);
        },

        testPercentageValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("25.4%");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("percentage", result.parts[0].type);
            Assert.areEqual(25.4, result.parts[0].value);
        },

        testIntegerValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("25");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("integer", result.parts[0].type);
            Assert.areEqual(25, result.parts[0].value);
        },

        testNumberValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("25.0");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("number", result.parts[0].type);
            Assert.areEqual(25, result.parts[0].value);
        },

        testHexColorValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("#ffeedd");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(238, result.parts[0].green);
            Assert.areEqual(221, result.parts[0].blue);
        },

        testRGBColorValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgb(255, 238 , 221)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(238, result.parts[0].green);
            Assert.areEqual(221, result.parts[0].blue);
        },

        testRGBColorValue2: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("rgb(100%,50%, 75%)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(127.5, result.parts[0].green);
            Assert.areEqual(191.25, result.parts[0].blue);
        },

        testRGBAColorValue: function() {
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

        testRGBAColorValue2: function() {
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

        testHSLColorValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("hsl(100,50%, 75%)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(100, result.parts[0].hue);
            Assert.areEqual(0.5, result.parts[0].saturation);
            Assert.areEqual(0.75, result.parts[0].lightness);
        },

        testHSLAColorValue: function() {
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

        testColorValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("red");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(0, result.parts[0].green);
            Assert.areEqual(0, result.parts[0].blue);
        },

        testColorValue2: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("\\r\\45 d");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
            Assert.areEqual(255, result.parts[0].red);
            Assert.areEqual(0, result.parts[0].green);
            Assert.areEqual(0, result.parts[0].blue);
        },

        testCSS2SystemColorValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("InfoText");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("color", result.parts[0].type);
        },

        testURIValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("url(https://yahoo.com)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("https://yahoo.com", result.parts[0].uri);
        },

        testURIValue2: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("url('https://yahoo.com')");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("https://yahoo.com", result.parts[0].uri);
        },

        testURIValue3: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("url(\"https://yahoo.com\")");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("https://yahoo.com", result.parts[0].uri);
        },

        testURIValue4: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("url(https\\03a\r\n//yahoo.com)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("uri", result.parts[0].type);
            Assert.areEqual("https://yahoo.com", result.parts[0].uri);
        },

        testStringValue: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("'Hello world!'");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Hello world!", result.parts[0].value);
        },

        testStringValue2: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("\"Hello world!\"");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Hello world!", result.parts[0].value);
        },

        testStringValue3: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("\"Chapter\\A \\0a\t\\00A\r\\000a\n\\0000A\f\\00000a\r\n\\00000AFour\\\"'\\\n\\\r\n\\\r\\\f\\41\"");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Chapter\n\n\n\n\n\n\nFour\"'A", result.parts[0].value);
        },

        testStringValue4: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("'Chapter\\A \\0a\t\\00A\r\\000a\n\\0000A\f\\00000a\r\n\\00000AFour\"\\'\\\n\\\r\n\\\r\\\f\\41'");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("string", result.parts[0].type);
            Assert.areEqual("Chapter\n\n\n\n\n\n\nFour\"'A", result.parts[0].value);
        },

        testValueWithOperators: function() {
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

        testValueWithOperators2: function() {
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

        testRuleWithOnePartSelector: function() {
            var parser = new Parser();
            var result = parser.parseRule("p { color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithTwoPartSelector: function() {
            var parser = new Parser();
            var result = parser.parseRule("p li { color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithThreePartSelector: function() {
            var parser = new Parser();
            var result = parser.parseRule("p li a{ color: red; }");

            Assert.isObject(result, "Parse should have completed.");
        },

        testRuleWithFourPartSelector: function() {
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

        testWithCommentAndSpaces: function() {
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

        testWithCommentAndTrailingSpace: function() {
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

        testWithCommentAndLeadingSpace: function() {
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

        testIEFilter: function() {
            var parser = new Parser({ ieFilters:true });
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.Wave(strength=100)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);
        },

        testIEFilter2: function() {
            var parser = new Parser({ ieFilters:true });
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, src=http://l.yimg.com/ne/home/metro/pa/map/gugimap_btn_mapview.png, sizingMethod=image)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);

        },

        testIEFilter3: function() {
            var parser = new Parser({ ieFilters:true });
            var result = parser.parsePropertyValue("progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', src='http://l.yimg.com/ne/home/metro/pa/map/gugimap_btn_mapview.png', sizingMethod='image')");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("function", result.parts[0].type);

        },

        testIEFilter4: function() {
            var parser = new Parser({ ieFilters:true });
            var result = parser.parsePropertyValue("alpha(opacity=10)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
            Assert.areEqual(1, result.parts.length);
            Assert.areEqual("alpha(opacity=10)", result.text);
            Assert.areEqual("function", result.parts[0].type);
        },

        testIEFilter5: function() {
            var parser = new Parser();
            var result = parser.parsePropertyValue("alpha(opacity=10)");

            Assert.isInstanceOf(parserlib.css.PropertyValue, result);
        }


    }));

    suite.add(new YUITest.TestCase({

        name: "Animation Parsing Tests",

        testWebKitKeyFrames: function() {
            var parser = new Parser({ strict:true }),
                called = false;

            parser.addListener("startkeyframes", function(event) {
                Assert.areEqual("webkit", event.prefix);
                Assert.areEqual("movingbox", event.name);
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(1, event.col, "Column should be 1");
                called = true;
            });
            parser.parse("@-webkit-keyframes movingbox{0%{left:90%;}}");
            Assert.isTrue(called);  //just don't want an error
        },

        testMozKeyFrames: function() {
            var parser = new Parser({ strict:true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@-moz-keyframes movingbox{0%{left:90%;}50%{left:10%;}100%{left:90%;}}");
            Assert.isTrue(valid);
        },

        testKeyFrames: function() {
            var parser = new Parser({ strict:true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@keyframes movingbox{0%{left:90%;}50%{left:10%;}100%{left:90%;}}");
            Assert.isTrue(valid);
        },

        testKeyFramesFromTo: function() {
            var parser = new Parser({ strict:true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@keyframes movingbox{from{left:90%;-webkit-transform: rotate(0deg);}to{left:10%;-webkit-transform: rotate(360deg);}}");
            Assert.isTrue(valid);
        },

        testKeyFramesWithWhitespace: function() {
            var parser = new Parser({ strict:true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@keyframes 'diagonal-slide' {  from { left: 0; top: 0; } to { left: 100px; top: 100px; } }");
            Assert.isTrue(valid);
        }

    }));

    suite.add(new YUITest.TestCase({

        name: "General Parsing Tests",

        testMediaWithPage: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media { @page {} }");
            Assert.isTrue(valid);
        },

        testMediaWithFontFace: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media { @font-face {} }");
            Assert.isTrue(valid);
        },

        testMediaWithViewport: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media { @viewport {} }");
            Assert.isTrue(valid);
        },

        testMediaWithSupports: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media { @supports (display: table-cell) {} }");
            Assert.isTrue(valid);
        },

        testMediaWithTypeOnly: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media print { }");
            Assert.isTrue(valid);
        },

        testMediaWithTypesOnly: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media print, screen { }");
            Assert.isTrue(valid);
        },

        testMediaWithSimpleExpression: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media (max-width:400px) { }");
            Assert.isTrue(valid);
        },

        testMediaWithComplexExpression: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media all and (max-width:400px) { }");
            Assert.isTrue(valid);
        },

        testMediaWithSimpleExpressionWithSpaces: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media ( max-width:400px ) { }");
            Assert.isTrue(valid);
        },

        testMediaWithComplexExpressionWithSpaces: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media all and ( max-width:400px ) { }");
            Assert.isTrue(valid);
        },

        testMediaWithNestedMedia: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@media print { #navigation { display: none } @media (max-width: 12cm) { .note { float: none } } }");
            Assert.isTrue(valid);
        },

        testViewport: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@viewport { width: 397px; }");
            Assert.isTrue(valid);
        },

        testMSViewport: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@-ms-viewport { width: 397px; }");
            Assert.isTrue(valid);
        },

        testMSViewportInsideDeviceWidth: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@-ms-viewport { width: device-width; }");
            Assert.isTrue(valid);
        },

        testMSViewportInsideDeviceHeight: function() {
            var parser = new Parser({ strict: true });
            var valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@-ms-viewport { width: device-height; }");
            Assert.isTrue(valid);
        },

        testViewportEventFires: function() {
            var parser = new Parser({ strict:true }),
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

            parser.parse("@viewport { width: 397px; }");
            Assert.isTrue(calledStart);  //just don't want an error
            Assert.isTrue(calledEnd);  //just don't want an error
        },

        testDocumentUrl: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url(https://www.w3.org/) { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentUrlPrefix: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix(https://www.w3.org/) { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentDomain: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document domain(w3.org) { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentRegexp: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document regexp('https:.*') { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentMultipleFunctions: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix(https://www.w3.org/), domain(w3.org) { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testMozDocument: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@-moz-document url-prefix() { p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentWithPage: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix() { @page {} p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentWithMedia: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix() { @media {} p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentWithFontFace: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix() { @font-face {} p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentWithViewport: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix() { @viewport {} p { color: red; } }");
            Assert.isTrue(valid);
        },

        testDocumentWithKeyframes: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@document url-prefix() { @keyframes 'diagonal-slide' {  from { left: 0; top: 0; } to { left: 100px; top: 100px; } } }");
            Assert.isTrue(valid);
        },

        testDocumentEventFires: function() {
            var parser = new Parser({ strict:true }),
                calledStart = false,
                calledEnd = false;

            parser.addListener("startdocument", function(event) {
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(1, event.col, "Column should be 1");
                calledStart = true;
            });

            parser.addListener("enddocument", function(event) {
                Assert.areEqual(1, event.line, "Line should be 1");
                Assert.areEqual(25, event.col, "Column should be 25");
                calledEnd = true;
            });

            parser.parse("@document url-prefix() {}");
            Assert.isTrue(calledStart);  //just don't want an error
            Assert.isTrue(calledEnd);  //just don't want an error
        },

        testClassesWithEscapes: function() {
            var parser = new Parser({ strict:true });
            var result = parser.parseSelector("#\\31 a2b3c");

            Assert.isInstanceOf(Selector, result, "Result should be an instance of Selector.");
            Assert.isInstanceOf(SelectorPart, result.parts[0], "First part should be a SelectorPart.");
            Assert.areEqual("#1a2b3c", result.parts[0].toString(), "Selector should be correct.");
            Assert.areEqual(1, result.parts.length, "Should be one part.");
        },

        testSupportsWithSingleCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsWithSingleNotCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports not ( display: table-cell) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsWithNestedNotCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports not (not (not (display: table-cell) )) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsAndCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) and (display: flex) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsAndFollowedByNotCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) and (not (display: flex)) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsNotFollowedByAndCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (not (display: table-cell)) and (display: flex) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsAndAndAndCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) and (display: flex) and (display: flex) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsOrCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) or (display: flex) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsOrFollowedByNotCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) or (not (display: flex)) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsNotFollowedByOrCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (not (display: table-cell)) or (display: flex) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsAndWithNestedOrCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) and ((display: flex) or (display: table)) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        },

        testSupportsAndWithNestedComplexOrCondition: function() {
            var parser = new Parser({ strict: true }),
                valid = true;

            parser.addListener("error", function() {
                valid = false;
            });

            parser.parse("@supports (display: table-cell) and ((display: flex) or ((display: table) and (not (position: absolute)))) {}");
            parser._verifyEnd();
            Assert.isTrue(valid);
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Rule Parsing Tests",

        "Test parsing property-value pair": function() {
            var parser = new Parser({ strict: true });
            var result = parser.parsePropertyValue("#fff");

            Assert.areEqual("#fff", result.toString());
            Assert.areEqual(1, result.col);
            Assert.areEqual(1, result.line);
            Assert.areEqual("#fff", result.parts[0].toString());
            Assert.areEqual(1, result.parts[0].col);
            Assert.areEqual(1, result.parts[0].line);
            Assert.areEqual("color", result.parts[0].type);
        },

        "Test rule with one property": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(12, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            parser.parse(".foo {\n    color: #fff;\n}");
        },

        "Test rule with custom property": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
                Assert.areEqual("--color-Foo_BAR", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(3, event.property.col, "Property column should be 3.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(3, event.col, "Event column should be 3.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(20, event.value.parts[0].col, "First part column should be 20.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            parser.parse(".foo {\n  --color-Foo_BAR: #fff;\n}");
        },

        "Test rule with star hack property": function() {
            var parser = new Parser({
                strict: true,
                starHack: true
            });
            parser.addListener("property", function(event) {
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
            parser.parse(".foo {\n    *color: #fff;\n}");
        },

        "Test rule with underscore hack property": function() {
            var parser = new Parser({
                strict: true,
                underscoreHack: true
            });
            parser.addListener("property", function(event) {
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
            parser.parse(".foo {\n    _color: #fff;\n}");
        },

        "Test rule with space after property name": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(13, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            parser.parse(".foo {\n    color : #fff;\n}");
        },

        "Test rule with one property and !important": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
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
            parser.parse(".foo {\n    color: #fff !important;\n}");
        },

        "Test rule with leading semicolon": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
                Assert.areEqual("color", event.property.toString());
                Assert.areEqual("#fff", event.value.toString());
                Assert.areEqual(5, event.property.col, "Property column should be 5.");
                Assert.areEqual(2, event.property.line, "Property line should be 2.");
                Assert.areEqual(5, event.col, "Event column should be 5.");
                Assert.areEqual(2, event.line, "Event line should be 2.");
                Assert.areEqual(12, event.value.parts[0].col, "First part column should be 12.");
                Assert.areEqual(2, event.value.parts[0].line, "First part line should be 2.");
            });
            parser.parse(".foo {\n;   color: #fff;\n}");
        },

        "Test rule vendor prefix value": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
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
            parser.parse(".foo {\n;   white-space: -moz-pre-wrap;\n}");
        },

        "Test display -moz-inline-stack": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("property", function(event) {
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
            parser.parse(".foo {\n    display: -moz-inline-stack;\n}");
        },

        "Test @import uri without quotes": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("import", function(event) {
                Assert.areEqual("import", event.type);
                Assert.areEqual("https://yahoo.com", event.uri);
            });
            parser.parse("@import url(https://yahoo.com);");
        },


        "Test @import uri with quotes": function() {
            var parser = new Parser({ strict: true });
            parser.addListener("import", function(event) {
                Assert.areEqual("import", event.type);
                Assert.areEqual("https://yahoo.com", event.uri);
            });
            parser.parse("@import url('https://yahoo.com');");
        },

        "Test @import address": function() {
            var parser = new Parser();
            parser.addListener("import", function(event) {
                Assert.areEqual("import", event.type);
                Assert.areEqual("https://yahoo.com", event.uri);
            });
            parser.parse("@import 'https://yahoo.com';");
        }
    }));

    suite.add(new YUITest.TestCase({

        name: "Invalid CSS Parsing Tests",

        "Test parsing custom property typo": function() {
            var error;
            var parser = new Parser();
            parser.addListener("error", function(e) {
                error = e;
            });
            parser.parse("a:hover{\ncolor:red;\n==myFont:Helvetica;/*dropped*/;\nborder:0\n}");

            Assert.areEqual("error", error.type);
            Assert.areEqual(3, error.line);
            Assert.areEqual(1, error.col);
        },

        "Test parsing invalid property": function() {
            var error;
            var parser = new Parser();
            parser.addListener("error", function(e) {
                error = e;
            });
            parser.parse("a:hover{\ncolor:red;\nfont::Helvetica;/*dropped*/;\nborder:0\n}");

            Assert.areEqual("error", error.type);
            Assert.areEqual(3, error.line);
            Assert.areEqual(6, error.col);
        },

        "Test parsing invalid selector": function() {
            var error;
            var parser = new Parser();
            parser.addListener("error", function(e) {
                error = e;
            });
            parser.parse("c++{}");

            Assert.areEqual("error", error.type);
            Assert.areEqual(1, error.line);
            Assert.areEqual(3, error.col);
        }
    }));


    YUITest.TestRunner.add(suite);

})();
