// controller file where the logic lives

// models import
const Library = require("../models/libraries");
// import flash for alert messages
const flashMessage = require("../utils/flashMessage");

module.exports.index = async function (req, res) {
  const result = await Library.find({});
  res.render("libraries/index", { result, req });
};

module.exports.newForm = function (req, res) {
  res.render("libraries/new", { req });
};

module.exports.details = async function (req, res) {
  const { id } = req.params; //destructure req.params to get id
  const result = await Library.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
        model: "User",
      },
    })
    .populate("owner");
  // if (!result) { // does not work, mongo error id invalid
  //   flashMessage(req, "error", "no libraries found matching that id");
  //   return res.redirect("libraries");
  // }
  // console.log(result.reviews);
  // console.log(result);
  res.render("libraries/details", { result, req });
};

module.exports.editForm = async function (req, res) {
  const { id } = req.params;
  const result = await Library.findById(id);
  res.render("libraries/edit", { result, req });
};

module.exports.newLibrary = async function (req, res) {
  // the error wrapper is used to wrap this function in a try catch to catch any async errors
  // res.send(req.body); //by default, req.body is empty, it needs to be parsed
  // if (!req.body.lib) throw new ExpressError("Form data is unavailable", 400); //if body.lib does not exist, throw this error // replaced with joi
  const lib = new Library(req.body.lib);
  lib.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  })); // associate multer data into lib object
  lib.owner = req.user._id; // assigns the current logged in user as the owner of the new lib
  await lib.save();
  // console.log(lib);
  flashMessage(req, "success", "successfully created new library");
  res.redirect(`/libraries/${lib._id}`);
};

module.exports.updateLibrary = async function (req, res) {
  console.log("HERE");
  const { id } = req.params;
  const lib = await Library.findByIdAndUpdate(id, { ...req.body.lib }); //spread operator pass all elements of iterable lib
  // const lib = await Library.findById(id);
  // let reviews = lib.reviews; // keep reviews
  // lib.overwrite({ ...req.body.lib }, { runValidators: true });
  lib.owner = req.user._id;
  const imgArray = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  })); // associate multer data into lib object
  lib.images.push(...imgArray);
  // lib.reviews = reviews;
  await lib.save();
  flashMessage(req, "success", "successfully updated library");
  res.redirect(`/libraries/${id}`);
};
module.exports.deleteLibrary = async function (req, res) {
  const { id } = req.params;
  await Library.findByIdAndDelete(id);
  flashMessage(req, "success", "successfully deleted library");
  res.redirect("/libraries");
};
