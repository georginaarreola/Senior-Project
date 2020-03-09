/**
 * File: user.js
 * Author: Jacob Beneski
 * Last Edit Date: 9-18-19 
 * Description: Mongoose Schema for defining the User schema
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Define the schema
let userSchema = new Schema({
    customerName: {
        type:String,
        required: true,
        trim: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    contactEmail: String

});

//Register the schema with mongoose
let Customer = mongoose.model('User', userSchema);
