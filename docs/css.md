CSS Parser
==========

Introduction
------------

The ParserLib CSS parser is a CSS3 SAX-inspired parser written in JavaScript. By default, the parser only deals with standard CSS syntax and doesn't do validation (checking of property names and values).

Adding to your page
-------------------

To use the CSS parser, you can either include the entire library on your page:

    <script src="parserlib.js"></script>
    
Or include it as its component parts, the ParserLib core and the CSS parser:

    <script src="parserlib-core.js"></script>
    <script src="parserlib-css.js"></script>

All of these files are located in the `build` directory.

Basic usage
-----------

You can create a new instance of the parser by using the following code:

    var parser = new parserlib.css.Parser();
    
The constructor accepts an options object that specifies additional features the parser should use. The available options are:

* `starHack` - set to true to treat properties with a leading asterisk as if the asterisk wasn't there. Default is false.
* `underscoreHack` - set to true to treat properties with a leading underscore as if the underscore wasn't there. Default is false.
* `ieFilters` - set to true to accept IE < 8 style `filter` properties. Default is false.
* `strict` - set to true to disable error recovery and stop on the first syntax error. Default is false.

Here's an example with some options set:

    var parser = new parserlib.css.Parser({ starHack: true, underscoreHack: true });

You can then parse a string of CSS code by passing into the `parse()` method:

    parser.parse(someCSSText);
    
The `parse()` method throws an error if a non-recoverable syntax error occurs, otherwise it finishes silently. This method does not return a value nor does it build up an abstract syntax tree (AST) for you, it simply parses the CSS text and fires events at important moments along the parse.

Note: The `parseStyleSheet()` method is provided for compatibility with SAC-based APIs but does the exact same thing as `parse()`.

Using events
------------

The CSS parser fires events as it parses text. The events correspond to important parts of the parsing algorithm and are designed to provide developers with all of the information necessary to create lint checkers, ASTs, and other data structures.

### `startstylesheet` and `endstylesheet` events

The `startstylesheet` event fires just before parsing of the CSS text begins and the `endstylesheet` event fires just after all of the CSS text has been parsed. There is no additional information provided for these events. Example usage:

    parser.addListener("startstylesheet", function(){
        console.log("Starting to parse style sheet");
    });

    parser.addListener("endstylesheet", function(){
        console.log("Finished parsing style sheet");
    });

### `charset` event

The `charset` event fires when the `@charset` directive is found in a style sheet. Since `@charset` is required to appear first in a style sheet, any other occurances cause a syntax error. The `charset` event provides an `event` object with a property called `charset`, which contains the name of the character set for the style sheet. Example:

    parser.addListener("charset", function(event){
        console.log("Character set is " + event.charset);
    });

### `namespace` event

The `namespace` event fires when the `@namespace` directive is found in a style sheet. The `namespace` event provides an `event` object with two properties: `prefix`, which is the namespace prefix, and `uri`, which is the namespace URI. Example:

    parser.addListener("namespace", function(event){
        log("Namespace with prefix=" + event.prefix + " and URI=" + event.uri);
    });
    

