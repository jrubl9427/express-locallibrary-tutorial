/*global document, window, alert, console, require*/
const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const validator = require("express-validator");
const async = require("async");
const body = validator.body;
const validationResult = validator.validationResult;

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
    BookInstance.find()
        .populate("book")
        .exec(function (err, list_bookinstances) {
            if (err) {
                return next(err);
            }
            // Successful, so render
            res.render("bookinstance_list", {
                title: "Book Instance List",
                bookinstance_list: list_bookinstances,
            });
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No results.
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("bookinstance_detail", {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance,
      });
    });
}

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
    Book.find({}, "title").exec((err, books) => {
        if (err) {
            return next(err);
        }
        // Successful, so render.
        res.render("bookinstance_form", {
            title: "Create BookInstance",
            book_list: books,
        });
    });
}

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fiels.
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
    body("imprint", "Imprint must be specified").trim().isLength({ min: 1}).escape(),
    body("status").escape(),
    body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from the request.
        const errors = validationResult(req);
        
        // Create a BookInstance object with escaped and trimmed data.
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });
        
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, "title").exec(function (err, books) {
                if (err) {
                    return next(err);
                }
                // Successful, so render.
                res.render("bookinstance_form", {
                    title: "Create BookInstance",
                    book_list: books,
                    selected_book: bookinstance.book._id,
                    errors: errors.array(),
                    bookinstance,
                });
            });
            return;
        }
        
        // Data from form is valid.
        bookinstance.save((err) => {
            if (err) {
                return next(err);
            }
            // successful: redirect to new record.
            res.redirect(bookinstance.url);
        });
    },
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
    // get the book instance
    BookInstance.findById(req.params.id).populate("book").exec(function (err, bookinstance) {
        if (err) {
            return next(err);
        }
        if (bookinstance == null) {
            // No results.
            res.redirect("/catalog/authors");
        }
        // Successful, so render.
        console.log("BookInstance: ", bookinstance);
        res.render("bookinstance_delete", {
            title: "Delete Book Copy",
            bookinstance: bookinstance,
        });
    });
}

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
    // Assume the fields bookinstance id is valid.
    BookInstance.findByIdAndRemove(req.params.id,
        (err) => {
        if (err) {
            return next(err);
        }
        // successful, redirect back to the detail page.
        res.redirect("/catalog/bookinstances");
        }
    );
}

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
    // get the book instance and book for form.
    async.parallel(
        {
            bookinstance: function(callback) {
                BookInstance.findById(req.params.id).populate("book").exec(callback); 
            },
            
            books: function(callback) {
                Book.find(callback);
            },
        },
        
        // check for any error in getting the instance or the book
        function (err, results) {
            if (err) {
                return next(err);
            }
            
            // check to be sure there is an book instance in the results
            if (results.bookinstance == null) {
                // no results
                var err = new Error("Book copy not found");
                err.status = 404;
                return next(err);
            }
            // Successful, so render
            res.render("bookinstance_form", {
                title: "Update BookInstance",
                book_list: results.books,
                selected_book: results.bookinstance.book._id,
                bookinstance: results.bookinstance,
            });
        }
    );    
}

// Handle BookInstance update on POST.
exports.bookinstance_update_post = [
    // validate and sanitize the fields.
    body("book", "Book must be specified").trim().isLength({ min: 1}).escape(),
    body("imprint", "Imprint must be specified").trim().isLength({ min: 1}).escape(),
    body("status").escape(),
    body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),
    
    // process the request after validation and sanitization.
    (req, res, next) => {
        //extract validation errors from a request.
        const errors = validationResult(req);
        
        // create a BookInstance object with escaped/trimmed data and current id.
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });
    
        // check for validation/sanitization errors.
        if (!errors.isEmpty()) {
            
            // there are errors so render the form again, passing sanitized values and errors.
            Book.find({}, "title").exec(function (err, books) {
                if (err) {
                    return next(err);
                }
    
                // successful, so render.
                res.render("bookinstance_form", {
                    title: "Update BookInstance",
                    book_list: books,
                    selected_book: bookinstance.book._id,
                    errors: errors.array(),
                    bookinstance,
                });
            });
            return;
        } else {
    
            // data from form is valid.
            BookInstance.findByIdAndUpdate(
            
                req.params.id,
                bookinstance,
                {},
                function (err, thebookinstance) {
                    if (err) {
                        return next(err);
                    }

                    // successful, redirect back to the detail page.
                    res.redirect(thebookinstance.url);
                }
            );
        }
    },
]
