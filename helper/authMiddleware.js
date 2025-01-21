const isAuthenticated = (req, res, next) => {
  if (req.session.admin) {
    return next();
  } else {
    res.redirect("/admin/login");
  }
};

module.exports = isAuthenticated;
