/*global document, window, alert, console, require*/
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var GenreSchema = new Schema({
    name: { type: String, required: true }
})

// Virtual for book's URL
GenreSchema.virtual("url").get(function () {
    // We don't use arrow function as we'll need the this object
    return `/catalog/genre/${this._id}`;
});

// Export model
module.exports = mongoose.model("Genre", GenreSchema);