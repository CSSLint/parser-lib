//This file will likely change a lot! Very experimental!
/*global Properties, ValidationError, PropertyValueIterator */
var Validation = {

    validate: function(property, value){
    
        //normalize name
        var name        = property.toString().toLowerCase(),
            parts       = value.parts,
            expression  = new PropertyValueIterator(value),
            spec        = Properties[name],
            part,
            valid,            
            j, count,
            msg,
            types,
            last,
            literals,
            max, multi, group;
            
        if (!spec) {
            if (name.indexOf("-") !== 0){    //vendor prefixed are ok
                throw new ValidationError("Unknown property '" + property + "'.", property.line, property.col);
            }
        } else if (typeof spec != "number"){
        
            //initialization
            if (typeof spec == "string"){
                types = spec.split(/\s\|\s/g);
                max = 1;
            } else if (spec.multi) {
                types = spec.multi.split(/\s\|\s/g);
                max = spec.max;
            } else if (spec.single) {
                types = spec.single.split(/\s\|\s/g);
            } else if (spec.group){
                types = spec.group.split(/\s\|\|\s/g);
                group = { total: 0 };
            }

            //Start validation----        
            //TODO: Clean up once I figure out the best way to do this
            //Check for complex validations first
            if (spec.complex) {
                if (spec.multi) {
                    Validation.types.multiProperty(types[0], value);
                } else {
                    Validation.types.singleProperty(types[0], value);
                }
            } else if (spec.property) {
                Validation.properties[name](value);
            } else {

                //if there's a maximum set, use it (max can't be 0)
                if (max) {
                    if (parts.length > max){
                        throw new ValidationError("Expected a max of " + max + " property value(s) but found " + parts.length + ".", value.line, value.col);
                    }
                }                

                while (expression.hasNext()){
                    part = expression.peek();
                    msg = [];
                    valid = false;
                    
                    if (spec.separator && part.type == "operator"){
                        
                        //two operators in a row - not allowed?
                        if ((last && last.type == "operator")){
                            msg = msg.concat(types);
                        } else if (!expression.peek(1)){
                            msg = msg.concat("end of line");
                        } else if (part != spec.separator){
                            msg.push("'" + spec.separator + "'");
                        } else {
                            valid = true;
                            expression.next();
                            
                            //if it's a group, reset the tracker
                            if (group) {
                                group = { total: 0 };
                            }
                        }
                    } else {

                        literals = [];

                        for (j=0, count=types.length; j < count; j++){
                        
                            //if it's a group and one of the values has been found, skip it
                            if (group && group[types[j]]){
                                continue;
                            }                   
                            
                            expression.mark();
                            if (typeof Validation.types[types[j]] == "undefined"){
                                valid = Validation.types.literal(expression.next(), types[j]);
                                literals.push(types[j]);
                            } else {
                                valid = Validation.types[types[j]](expression.next());
                                msg.push(types[j]);
                            }

                            if (valid) {
                                if (group){
                                    group[types[j]] = 1;
                                    group.total++;
                                }
                                break;  
                            } else {
                                expression.restore();
                            }
                        }
                    }

                    
                    if (!valid) {
                        if (literals.length) {
                            msg.push("one of (" + literals.join(" | ") + ")");
                        }
                        throw new ValidationError("Expected " + msg.join(" or ") + " but found '" + part + "'.", value.line, value.col);
                    }
                    
                    
                    last = part;
                }                          
            }
            
            //for groups, make sure all items are there
            if (group && group.total != types.length){
                throw new ValidationError("Expected all of (" + types.join(", ") + ") but found '" + value + "'.", value.line, value.col);
            }
        }

    },

    types: {
    
        any: function(expression, spec) {
            var types   = spec.split(/\s\|\s/g),
                result  = false,
                value   = expression.value,
                i, len;
                
            for (i=0, len=types.length; i < len && !result; i++){
                if (this[types[i]]){
                    result = this.oneType(expression);
                } else {
                    result = this.oneLiteral(expression, types[i]);
                }
            }
            
            if (!result) {                
                throw new ValidationError("Expected " + spec + " but found '" + value + "'.", value.line, value.col);            
            }
            
            return result;
        },
        
        oneType: function(expression, type) {
            var part = expression.peek(),
                result = this[type](part);
                
            if (result) {
                expression.next();
            }
            
            return result;
        },
        
        oneLiteral: function(expression, spec) {
            var part = expression.peek(),
                result = this.literal(part, spec);
                
            if (result) {
                expression.next();
            }
            
            return result;
        },

        "<absolute-size>": function(part){
            return this.literal(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
        },
        
        "<attachment>": function(part){
            return this.literal(part, "scroll | fixed | local");
        },
        
        "<attr>": function(part){
            return part.type == "function" && part.name == "attr";
        },
                
        "<bg-image>": function(part){
            return this["<image>"](part) || part == "none";
        },        
        
        "<box>": function(part){
            return this.literal(part, "padding-box | border-box | content-box");
        },
        
        "<content>": function(part){
            return part.type == "function" && part.name == "content";
        },        
        
        "<relative-size>": function(part){
            return this.literal(part, "smaller | larger");
        },
        
        //any identifier
        "<ident>": function(part){
            return part.type == "identifier";
        },
        
        //specific identifiers
        literal: function(part, options){
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
        
        "<length>": function(part){
            return part.type == "length" || part.type == "number" || part.type == "integer" || part == "0";
        },
        
        "<color>": function(part){
            return part.type == "color" || part == "transparent";
        },
        
        "<number>": function(part){
            return part.type == "number" || this["<integer>"](part);
        },
        
        "<integer>": function(part){
            return part.type == "integer";
        },
        
        "<line>": function(part){
            return part.type == "integer";
        },
        
        "<angle>": function(part){
            return part.type == "angle";
        },        
        
        "<uri>": function(part){
            return part.type == "uri";
        },
        
        "<image>": function(part){
            return this["<uri>"](part);
        },
        
        "<percentage>": function(part){
            return part.type == "percentage" || part == "0";
        },

        "<border-width>": function(part){
            return this["<length>"](part) || this.literal(part, "thin | medium | thick");
        },
        
        "<border-style>": function(part){
            return this.literal(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
        },
        
        "<margin-width>": function(part){
            return this["<length>"](part) || this["<percentage>"](part) || this.literal(part, "auto");
        },
        
        "<padding-width>": function(part){
            return this["<length>"](part) || this["<percentage>"](part);
        },
        
        "<shape>": function(part){
            return part.type == "function" && (part.name == "rect" || part.name == "inset-rect");
        },

        //---------------------------------------------------------------------
        // Complex Types
        //---------------------------------------------------------------------        
    
        "<bg-position>": function(expression){
            var types   = this,
                result  = false,
                numeric = "<percentage> | <length>",
                xDir    = "left | center | right",
                yDir    = "top | center | bottom",
                part,
                i, len;
            
            if (expression.hasNext()){
            
                part = expression.next();
                
                if (types.literal(part, "top | bottom")) {
                    result = true;
                } else {
                    
                    //must be two-part
                    if (types.any(part, numeric)){
                        if (expression.hasNext()){
                            part = expression.next();                            
                            result = types.any(part, numeric + " | " + yDir);
                        }
                    } else if (types.any(part, xDir)){
                        if (expression.hasNext()){
                            part = expression.next();
                            
                            //two- or three-part
                            if (types.any(part, yDir)){
                                 result = true;
                          
                                if (expression.hasNext() && types.any(expression.peek(), numeric)) {
                                    expression.next();
                                } 

                            } else if (types.any(part, numeric)){
                            
                                //could also be two-part, so check the next part
                                if (expression.hasNext() && types.any(expression.peek(), yDir)){
                                        expression.next();  //skip, already tested
                                        part = expression.next();
                                        
                                        if (expression.hasNext() && types.any(expression.peek(), numeric)){
                                            expression.next();
                                            result = true;
                                        } else {
                                            result = true;
                                        }
                                   
                                } else {
                                    result = true;  //it's two-part
                                }
                            }
                        }
                    }                                 
                }            
            }
            
            return result;
        },

        "<bg-size>": function(expression){
            //<bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain
            var types   = this,
                result  = false,
                numeric = "<percentage> | <length> | auto",
                part,
                i, len;      
      
            if (expression.hasNext()){
                part = expression.next();
                
                if (types.literal(part, "cover | contain")) {
                    result = true;
                } else if (types.any(part, numeric)) {
                    result = true;
                    
                    if (expression.hasNext() && types.any(expression.peek(), numeric)) {
                        expression.next();
                    }
                }
            }          
            
            return result;
        },
        
        "<repeat-style>": function(expression){
            //repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}
            var result  = false,
                values  = "repeat | space | round | no-repeat",
                part;
            
            if (expression.hasNext()){
                part = expression.next();
                
                if (this.literal(part, "repeat-x | repeat-y")) {
                    result = true;                    
                } else if (this.literal(part, values)) {
                    result = true;

                    if (expression.hasNext() && this.literal(expression.peek(), values)) {
                        expression.next();
                    }
                }
            }
            
            return result;
            
        },
        
        "<shadow>": function(expression) {
            //inset? && [ <length>{2,4} && <color>? ]
            var result  = false,
                count   = 0,
                part;
                
            if (expression.hasNext()) {            
                part = expression.peek();
                
                if (this.literal(part, "inset")){
                    expression.next();
                    part = expression.peek();
                }
                
                while (part && this["<length>"](part) && count < 4) {
                    count++;
                    expression.next();                    
                    part = expression.peek();
                }
                
                
                if (part) {
                    if (this["<color>"](part)) {
                        expression.next();
                    }
                }
                
                result = (count >= 2 && count <= 4);
            
            }
            
            return result;
        },
        
        "<x-one-radius>": function(expression) {
            //[ <length> | <percentage> ] [ <length> | <percentage> ]?
            var result  = false,
                count   = 0,
                numeric = "<length> | <percentage>",
                part;
                
            if (expression.hasNext()) {            
                part = expression.peek();
                
                if (this.any(part, numeric)){
                    result = true;
                    expression.next();
                    part = expression.peek();
                    
                    if (part && this.any(part, numeric)){
                        expression.next();
                    }
                }                
            
            }
            
            return result;
        },        
        
        //---------------------------------------------------------------------
        // Properties
        //---------------------------------------------------------------------
        
        singleProperty: function ( types, value, expression, partial ) {
            //so ashamed...
            expression  = expression || new PropertyValueIterator(value);
            
            var result      = false,
                part;
                
            if (expression.hasNext()) {
                if ( this[type](expression) ) {
                    result = true;
                } 
            }
            
            if (!result) {
                throw new ValidationError("Expected " + type + " but found '" + value + "'.", value.line, value.col);
            } else if (expression.hasNext() && !partial) {
                part = expression.next();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            }             
        },
        
        multiProperty: function ( type, value, expression, partial ) {
        
            //so ashamed...
            expression  = expression || new PropertyValueIterator(value);
            
            var result      = false,
                part;
                
            while(expression.hasNext() && !result) {
                if ( this[type]( expression ) ) {
                    
                    if (!expression.hasNext()) {
                        result = true;
                    } else if (expression.peek() == ",") {
                        expression.next();
                    } else {
                        result = true;
                        break;
                    }
                } else {
                    break;
                }
            }
            
            if (!result) {
                throw new ValidationError("Expected " + type + " but found '" + value + "'.", value.line, value.col);
            } else if (expression.hasNext() && !partial) {
                part = expression.next();
                throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
            }           
        }
    
    
    },
    
    properties: {
    
        "box-shadow": function (value) {
            var expression  = new PropertyValueIterator(value),
                result      = false,
                part;
                
            if (expression.hasNext()){
                part = expression.peek();
                
                if (!Validation.types.literal(part, "none")) {
                    Validation.types.multiProperty("<shadow>", value, expression);                       
                } else {
                    expression.next();
                    if (expression.hasNext()) {
                        part = expression.next();
                        throw new ValidationError("Expected end of value but found '" + part + "'.", part.line, part.col);
                    }   
                }
            }
            
        },
        
        "border-one-radius": function (value) {
            this.singleProperty("<x-one-radius>", value);
        }
    
    
    }
    
    

};