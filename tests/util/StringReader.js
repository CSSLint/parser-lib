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
