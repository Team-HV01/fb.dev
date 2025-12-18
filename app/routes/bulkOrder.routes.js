// // const bulkOrderController = require("../controller/bulkOrder.controller");

// // const { verifyAdminToken, verifyUserToken } = require('../middleware/auth');
// // const upload = require("../middleware/multer");


// const bulkOrderController = require("../controller/bulkOrder.controller");
// const { verifyAdminToken, verifyUserToken } = require("../middleware/auth");
// const upload = require("../middleware/multer");

// module.exports = (router) => {
//     router.post('/bulkorder', verifyUserToken, bulkOrderController.newOrder);
//     router.get('/bulkorders', verifyAdminToken, bulkOrderController.getAllOrders);
//    router.post(
//     '/bulkorders/upload',
//     verifyAdminToken,
//     upload.any(), // TEMP for local testing
//     bulkOrderController.uploadBulkOrders // ✅ CORRECT NAME
//   );
//   router.delete(
//   "/bulkorders/:id",
//   verifyAdminToken,
//   bulkOrderControllers.deleteOrder
// );

// }

const bulkOrderControllers = require("../controller/bulkOrder.controller");
const { verifyAdminToken, verifyUserToken } = require("../middleware/auth");
const upload = require("../middleware/multer");

module.exports = (router) => {

  // create single bulk order
  router.post(
    "/bulkorder",
    verifyUserToken,
    bulkOrderControllers.newOrder
  );

  // get all bulk orders
  router.get(
    "/bulkorders",
    verifyAdminToken,
    bulkOrderControllers.getAllOrders
  );

  // bulk upload orders
  router.post(
    "/bulkorders/upload",
    verifyAdminToken,
    upload.any(), // TEMP for local testing
    bulkOrderControllers.uploadBulkOrders
  );

  // delete order ✅ FIXED
  router.delete(
    "/bulkorders/:id",
    verifyAdminToken,
    bulkOrderControllers.deleteOrder
  );
};
