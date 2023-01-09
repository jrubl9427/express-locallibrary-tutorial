/*global document, window, alert, console, require*/
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var { DateTime } = require("luxon");

var AuthorSchema = new Schema ({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date},
    date_of_death: { type: Date},
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
    // To avoid errors in cases where an author does not have either a family namr or first name we want to make sure we handle the exception by returning an empty string for that case
    /*
    var fullname = "";
    if (this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }
    if (!this.first_name || !this.family_name) {
        fullname = "";
    }
    return fullname;
    */
    return this.family_name + ", " + this.first_name;
});

AuthorSchema.virtual("url").get(function () {
    // We don't use arrow function as we'll need the this object
    return `/catalog/author/${this._id}`;
});

// Virtual for formating date
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
});

// Virtual for formating date
AuthorSchema.virtual("date_of_death_formatted").get(function () {
    return DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
});

// Virtual for lifespan
AuthorSchema.virtual("lifespan").get(function () {
    var lifetime_string = "";
    if (this.date_of_birth) {
        lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    };
    
    lifetime_string += " - ";
    
    if (this.date_of_death) {
        lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    };
    return lifetime_string;
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);