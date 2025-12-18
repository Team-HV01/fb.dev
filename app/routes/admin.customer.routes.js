// const adminCustomerController = require("../controller/admin.customer.controller");
// const adminAuth = require("../middleware/auth");

// module.exports = (router) => {
//     router.get(
//         "/admin/customer/:customerId",
//         adminAuth.verifyAdminToken,
//         adminCustomerController.getCustomerFullDetails
//     );

// };
// const adminCustomerController = require("../controller/admin.customer.controller");
// const { verifyAdminToken } = require("../middleware/auth");

// module.exports = (router) => {
//     console.log("✅ admin.customer.routes.js loaded");

//     router.get(
//         "/admin/customer-by-email/:email",
//         verifyAdminToken,
//         adminCustomerController.getCustomerDetailsByEmail
//     );
// };
const adminCustomerController = require("../controller/admin.customer.controller");
const { verifyAdminToken } = require("../middleware/auth");

module.exports = (router) => {
  router.get(
    "/admin/customer/:customerId",
    verifyAdminToken,
    adminCustomerController.getCustomerFullDetails
  );
};
