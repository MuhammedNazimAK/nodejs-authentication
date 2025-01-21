const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRound = 10;

const renderWithMessage = (res, view, message = "", additionalData = {}) => {
  return res.render(view, { message, ...additionalData });
};

const adminHome = (req, res) => {
  try {
    renderWithMessage(res, "admin/home", req.session?.successMessage, {
      user: req.session.admin,
    });
  } catch (error) {
    console.log(error.message);
  }
}; 

const loadLogin = (req, res) => {
  try {
    if (req.session?.admin) {
      return res.redirect("/admin");
    }
    renderWithMessage(res, "admin/login", req.session.message);
  } catch (error) {
    console.log(error.message);
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.message = "Please provide both email and password";
      return res.redirect("/admin/login");
    }

    const adminData = await User.findOne({ email });

    if (!adminData || !adminData.is_admin) {
      req.session.message = "Invalid email or not an admin";
      return res.redirect("/admin/login");
    }

    const isMatch = await bcrypt.compare(password, adminData.password);

    if (!isMatch) {
      req.session.message = "Invalid password";
      return res.redirect("/admin/login");
    }

    req.session.admin = adminData;
    req.session.successMessage = "Login Success";
    res.redirect("/admin");
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
        res.redirect("/admin/login");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const users = await User.find();
    renderWithMessage(res, "admin/dashboard", req.session?.successMessage, {
      user: req.session.admin,
      users,
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    req.session.message = "An error occurred while loading the dashboard.";
    res.redirect("/admin");
  }
};

const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.session.message = "User not found";
      return res.redirect("/admin/dashboard");
    }
    res.render("admin/editUser", { user });
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, mobile, status } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      mobile,
      status,
      image:req?.file?.filename
    });
    res.redirect("/admin/dashboard");
    req.session.successMessage = "User updated successfully";
  } catch (error) {
    console.log(error.message);
    res.redirect(`/admin/getEditPage/${req.params.id}`);
    req.session.message = "Failed to update user";
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.session.successMessage = "User deleted successfully";
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
    req.session.message = "Failed to delete user";
    res.redirect("/admin/dashboard");
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.search || "";
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    renderWithMessage(res, "admin/dashboard", req.session?.successMessage, {
      user: req.session.admin,
      users,
    });
  } catch (error) {
    console.log(error.message);
    req.session.message = "An error occurred while searching users.";
    res.redirect("/admin/dashboard");
  }
};

module.exports = {
  adminHome,
  loadLogin,
  handleLogin,
  logout,
  loadDashboard,
  editUser,
  updateUser,
  deleteUser,
  searchUsers,
};
