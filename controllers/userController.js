const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRound = 10;

const home = (req, res) => {
  try {
    if (!req.session?.user) {
      res.redirect("/login");
    } else {
      res.render("users/home", { message: req.session?.successMessage });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = (req, res) => {
  try {
    if (req.session?.user) {
      res.redirect("/");
    } else {
      res.render("users/registration", { errors: [] });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = (req, res) => {
  try {
    if (req.session?.user) {
      res.redirect("/");
    } else {
      res.render("users/login", { message: req.session.message || "" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const validateRegistration = (data) => {
  const errors = [];

  const nameRegex = /^[a-zA-Z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  if (!nameRegex.test(data.name.trim())) {
    errors.push({
      context: { key: "name" },
      message: "Name is invalid. Only letters and spaces are allowed.",
    });
  }

  if (!emailRegex.test(data.email)) {
    errors.push({
      context: { key: "email" },
      message: "Invalid email format.",
    });
  }

  if (!mobileRegex.test(data.mobile)) {
    errors.push({
      context: { key: "mobile" },
      message: "Mobile number must be 10 digits.",
    });
  }

  if (!passwordRegex.test(data.password)) {
    errors.push({
      context: { key: "password" },
      message:
        "Password must be 6 to 20 characters, and include at least one numeric digit, one uppercase, and one lowercase letter.",
    });
  }

  return errors;
};

const insertUser = async (req, res) => {
  try {
    const errors = validateRegistration(req.body);

    if (errors.length > 0) {
      return res.render("users/registration", { errors, message: "" });
    }

    if (req.file) {
      const hash_password = bcrypt.hashSync(req.body.password, saltRound);
      const user = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        image: req.file.filename,
        password: hash_password,
        is_admin: false,
      };

      const userData = await User.create(user);

      if (userData) {
        res.redirect("/login");
      } else {
        res.render("users/registration", {
          errors: [],
          message: "Your registration has failed",
        });
      }
    } else {
      res.render("users/registration", {
        errors: [],
        message: "Image upload failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const HandleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.message = "Please provide both email and password";
      return res.redirect("/login");
    }

    const userData = await User.findOne({ email });

    if (userData) {
      if (userData.is_admin) {
        req.session.message = "Admins are not allowed to login";
        return res.redirect("/login");
      }

      const isMatch = await bcrypt.compare(password, userData.password);

      if (isMatch) {
        req.session.user = userData;
        req.session.successMessage = "Login Success";
        res.redirect("/");
      } else {
        req.session.message = "Invalid Password";
        res.render("users/login", { message: "Password is incorrect" });
      }
    } else {
      req.session.message = "Invalid Email";
      res.render("users/login", { message: "Invalid email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  home,
  loadLogin,
  HandleLogin,
  logout,
};
