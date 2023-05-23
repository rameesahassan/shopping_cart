const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET users listing. */
router.get("/", verifyLogin, function (req, res, next) {
  let admin = req.session.admin;

  productHelpers.getAllProducts().then((products) => {
    res.render("admin/view-products", {
      admin: true,
      adminLoggedIn: true,
      admin: req.session.admin,
      products,
    });
  });
});

//Admin login page
router.get("/login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      admin: true,
      loginErr: req.session.adminLoginErr,
    });
    req.session.adminLoginErr = false;
  }
});
// Admin login process
router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin/login");
    }
  });
});
// Admin signup page
router.get("/signup", (req, res) => {
  res.render("admin/signup", { admin: true });
});

// Admin signup process
router.post("/signup", (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    req.session.admin = response;
    req.session.adminLoggedIn = true;
    res.redirect("/admin");
  });
});

// Admin logout process
router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin/login");
});

router.get("/add-product", verifyLogin, function (req, res) {
  res.render("admin/add-product", {
    adminLoggedIn: true,
    admin: req.session.admin,
  });
});
router.post("/add-product", (req, res) => {
  productHelpers.addProduct(req.body, (insertedId) => {
    let image = req.files.Image;

    image.mv("./public/product-images/" + insertedId + ".png", (err, done) => {
      if (!err) {
        res.render("admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;

  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);

  res.render("admin/edit-product", { product });
});
router.post("/edit-product/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + req.params.id + ".png");
    }
  });
});
router.get("/view-all-orders", verifyLogin, async (req, res) => {
  let orders = await adminHelpers.getAllOrders();
  res.render("admin/view-all-orders", {
    orders,
    adminLoggedIn: true,
    admin: req.session.admin,
  });
});
router.get("/view-all-users", verifyLogin, async (req, res) => {
  let users = await adminHelpers.getAllUsers();
  res.render("admin/view-all-users", {
    users,
    adminLoggedIn: true,
    admin: req.session.admin,
  });
});

module.exports = router;
