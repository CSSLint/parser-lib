//This file will likely change a lot! Very experimental!
/*global Properties, ValidationError*/
var Validation = {

    validate: function(property, value){
    
        //normalize name
        var name = property.toString().toLowerCase(),
            valid,
            spec    = Properties[name],
            i, len, j, count,
            msg,
            types,
            last,
            max, multi,
            parts   = value.parts;
            
        if (!spec) {
            if (name.indexOf("-") !== 0){    //vendor prefixed are ok
                throw new ValidationError("Unknown property '" + property + "'.", property.line, property.col);
            }        
        } else if (typeof spec != "number"){
        
            //initialization
            if (spec instanceof Array){
                types = spec;
                max = 1;
            } else if (spec.multi) {
                types = spec.multi;
                max = spec.max;
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
                    }
                } else {

                    for (j=0, count=types.length; j < count; j++){
                        if (typeof Validation.types[types[j]] == "undefined"){
                            if(Validation.types.identifier(parts[i], types[j])){
                                valid = true;
                                break;
                            }
                            msg.push("one of (" + types[j] + ")");
                        } else {
                            if (Validation.types[types[j]](parts[i])){
                                valid = true;
                                break;
                            }
                            msg.push(types[j]);
                        }                                   
                    }
                }

                
                if (!valid) {
                    throw new ValidationError("Expected " + msg.join(" or ") + " but found '" + parts[i] + "'.", value.line, value.col);
                }
                
                
                last = parts[i];
            }                          
            
            
        
        }
    },

    types: {

        "absolute-size": function(part){
            return this.identifier(part, "xx-small | x-small | small | medium | large | x-large | xx-large");
        },
        
        "attachment": function(part){
            return this.identifier(part, "scroll | fixed | local");
        },
        
        "box": function(part){
            return this.identifier(part, "padding-box | border-box | content-box");
        },
        
        "relative-size": function(part){
            return this.identifier(part, "smaller | larger");
        },
        
        "identifier": function(part, options){
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
        
        "length": function(part){
            return part.type == "length" || part.type == "number" || part.type == "integer" || part == "0";
        },
        
        "color": function(part){
            return part.type == "color" || part == "transparent";
        },
        
        "number": function(part){
            return part.type == "number" || this.integer(part);
        },
        
        "integer": function(part){
            return part.type == "integer";
        },
        
        "angle": function(part){
            return part.type == "angle";
        },        
        
        "uri": function(part){
            return part.type == "uri";
        },
        
        "image": function(part){
            return this.uri(part);
        },
        
        "bg-image": function(part){
            return this.image(part) || part == "none";
        },
        
        "percentage": function(part){
            return part.type == "percentage" || part == "0";
        },

        "border-width": function(part){
            return this.length(part) || this.identifier(part, "thin | medium | thick");
        },
        
        "border-style": function(part){
            return this.identifier(part, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
        },
        
        "margin-width": function(part){
            return this.length(part) || this.percentage(part) || this.identifier(part, "auto");
        },
        
        "padding-width": function(part){
            return this.length(part) || this.percentage(part);
        }
    }

};