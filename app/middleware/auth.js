const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/UserModels")
const Customer = require("../models/customerModels")

const verifyUserToken = async (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    if (!token) return res.status(403).send({ message: "No token provided.", status: false });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const userId = decoded.userId;

        // Check if the user exists in the database
        const user = await Customer.findById(userId);
        if (!user) return res.status(404).send({ message: "Customer not found.", status: false });

        // Save user to request for use in other routes
        req.user = user;
        req.type = "Customer";
        next();
    } catch (err) {
        return res.status(500).send({ message: "Failed to authenticate token.", status: false });
    }
};

// const verifyAdminToken = async (req, res, next) => {
//     const token = req.headers["x-access-token"] || req.headers["authorization"];
//     if (!token) return res.status(403).send({ message: "No token provided.", status: false });

//     try {
//         const decoded = jwt.verify(token, config.jwtSecret);
//         const userId = decoded.userId;

//         // Check if the user exists in the database
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).send({ message: "Admin not found.", status: false });

//         // Save user to request for use in other routes
//         req.admin = user;
//         req.type = "Admin";
//         next();
//     } catch (err) {
//         return res.status(500).send({ message: "Failed to authenticate token.", status: false });
//     }
// };

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers["x-access-token"];

    if (!authHeader) {
      return res.status(403).json({ message: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, config.jwtSecret);

    const admin = await User.findById(decoded.userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

const verifySuperAdminToken = async (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    if (!token) return res.status(403).send({ message: "No token provided.", status: false });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const userId = decoded.userId;

        // Check if the user exists in the database
        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ message: "SuperAdmin not found.", status: false });
        if (user.role !== "superadmin") return res.status(404).send({ message: "SuperAdmin not found.", status: false });

        // Save user to request for use in other routes
        req.admin = user;
        req.type = "SuperAdmin";
        next();
    } catch (err) {
        return res.status(500).send({ message: "Failed to authenticate token.", status: false });
    }
};

module.exports = { verifyUserToken, verifyAdminToken, verifySuperAdminToken };