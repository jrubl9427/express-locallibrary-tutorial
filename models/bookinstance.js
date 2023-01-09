/*global document, window, alert, console, require*/
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var { DateTime } = require("luxon");

var BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    imprint: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ["Available", "Maintenance", "Loaned", "Reserved"], 
        default: "Maintenance",
    },
    due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual("url").get(function () {
    // We don't use arrow function as we'll need the this object
    return `/catalog/bookinstance/${this._id}`;
});

// Virtual for formating date
BookInstanceSchema.virtual("due_back_formatted").get(function () {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// Export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);