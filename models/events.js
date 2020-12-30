var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var EventSchema = new mongoose.Schema({
    name:{
        type:String
    },
    date:{
        type:Date
    },
    time:{
        type:String
    },
    
    venue:String,
    description:String,
    image:String,
    createdBy:{
        id:String,      
        name: String
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    users:[{     
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"    
    }]
});

EventSchema.plugin(passportLocalMongoose);
// EventSchema.plugin(passportLocalMongoose, { usernameField : 'name' });

module.exports = mongoose.model("Event", EventSchema);