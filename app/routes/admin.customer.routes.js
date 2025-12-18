
const adminCustomerController = require("../controller/admin.customer.controller");
const { verifyAdminToken } = require("../middleware/auth");

module.exports = (router) => {
  router.get(
    "/admin/customer/:customerId",
    verifyAdminToken,
    adminCustomerController.getCustomerFullDetails
  );
};
