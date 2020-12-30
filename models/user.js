var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator=require('mongoose-unique-validator');
var UserSchema = new mongoose.Schema({
    name:{
        type:String
    },
    password: String,
    email: {
        type:String,
        unique:true,
        required:true
    },
    phoneNo: String,
    usn:String,
    createdEvent:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
         }
    ],
    joinedEvent:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
         }
    ]
});

UserSchema.plugin(uniqueValidator);
 UserSchema.plugin(passportLocalMongoose);
//UserSchema.plugin(passportLocalMongoose, { usernameField : 'username'});
module.exports = mongoose.model("User", UserSchema);