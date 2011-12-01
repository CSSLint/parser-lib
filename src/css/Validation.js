//This file will likely change a lot! Very experimental!
/*global Properties, ValidationError*/
var Validation = {

    validate: function(property, value){
    
        //normalize name
        var name    = property.toString().toLowerCase(),
            parts   = value.parts,
            spec    = Properties[name],
            valid,            
            i, len, j, count,
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
            } else if (spec.group){
                types = spec.group.split(/\s\|\|\s/g);
                group = { total: 0 };
            }

            //Start validation----

            //if there's a maximum set, use it (max can't be 0)
            if (max) {
                if (parts.length > max){
                    throw new ValidationError("Expected a max of " + max + " property value(s) but found " + parts.length + ".", value.line, value.col);
                }
            }            

            for (i=0, len=parts.length; i < len; i++){
                msg = [];
                valid = false;
                
                if (spec.separator && parts[i].type == "operator"){
                    
                    //two operators in a row - not allowed?
                    if ((last && last.type == "operator")){
                        msg = msg.concat(types);
                    } else if (i == len-1){
                        msg = msg.concat("end of line");
                    } else if (parts[i] != spec.separator){
                        msg.push("'" + spec.separator + "'");
                    } else {
                        valid = true;
                        
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
                    
                        if (typeof Validation.types[types[j]] == "undefined"){
                            valid = Validation.types.literal(parts[i], types[j]);
                            literals.push(types[j]);
                        } else {
                            valid = Validation.types[types[j]](parts[i]);
                            msg.push(types[j]);
                        }

                        if (valid) {
                            if (group){
                                group[types[j]] = 1;
                                group.total++;
                            }
                            break;  
                        }
                    }
                }

                
                if (!valid) {
                    if (literals.length) {
                        msg.push("one of (" + literals.join(" | ") + ")");
                    }
                    throw new ValidationError("Expected " + msg.join(" or ") + " but found '" + parts[i] + "'.", value.line, value.col);
                }
                
                
                last = parts[i];
            }                          
            
            //for groups, make sure all items are there
            if (group && group.total != types.length){
                throw new ValidationError("Expected all of (" + types.join(", ") + ") but found '" + value + "'.", value.line, value.col);
            }
        
        }
    },

    types: {

        "<absolute-size>": function(part){
            return this.literal(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
        },
        
        "<attachment>": function(part){
            return this.literal(part, "scroll | fixed | local");
        },
        
        "<attr>": function(part){
            return part.type == "function" && part.name == "attr";
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
        "literal": function(part, options){
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
        
        "<bg-image>": function(part){
            return this["<image>"](part) || part == "none";
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
        }
    }

};