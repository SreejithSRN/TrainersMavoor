const verifyUser = (req, res, next) => {
    if (req.session.logged) {
      next();
    } else {
      res.redirect("/");
    }
  };
  
  const userExist = (req, res, next) => {
    if (req.session.logged) {
      res.redirect("/dashboard");
    } else {
      next();
    }
  };
  
  
  const verifyAdmin = (req, res, next) => {
    if (req.session.adLogged) {
      next();
    } else {
      res.redirect("/adminpanel");
    }
  };
  
  const adminExist = (req, res, next) => {
    if (req.session.adLogged) {
      res.redirect("/dashboard");
    } else {
      next();
    }
  };
  
  module.exports = {
    verifyUser,
    userExist,
    adminExist,
    verifyAdmin
  };
  