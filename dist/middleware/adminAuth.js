// // const jwt = require("jsonwebtoken");
// // const config = require("../config/config");

// // const verifyAdminToken = (req, res, next) => {
// //     try {
// //         const authHeader = req.headers.authorization;
// //          console.log(res);

// //         if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //              console.log(res);
// //             return res.status(401).json({ message: "Unauthorized" });
           
// //         }

// //         const token = authHeader.split(" ")[1];
// //         const decoded = jwt.verify(token, config.jwtSecret);

// //         if (!decoded.isAdmin) {
// //              console.log(res);
// //             return res.status(403).json({ message: "Admin access required" });
// //         }

// //         req.admin = decoded;
// //         next();
// //     } catch (error) {
// //         return res.status(401).json({ message: "Invalid token" });
// //     }
// // };

// // module.exports = { verifyAdminToken };

// const jwt = require("jsonwebtoken");
// const config = require("../config/config");

// const verifyAdminToken = (req, res, next) => {
//   try {
//     // 🔴 ADD THIS CONSOLE LOG
//     console.log("AUTH HEADER:", req.headers.authorization);

//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     //const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, config.jwtSecret);

//     console.log("DECODED TOKEN:", decoded); // 🔴 OPTIONAL BUT VERY USEFUL

//    // Treat logged-in admin user as admin
// if (!decoded.userId) {
//   return res.status(403).json({ message: "Admin access required" });
// }


//     req.admin = decoded;
//     next();
//   } catch (err) {
//     console.error("ADMIN AUTH ERROR:", err.message);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = { verifyAdminToken };

