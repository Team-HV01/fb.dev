

const upload = require("../middleware/multer");

//const upload = multer({ storage: multer.memoryStorage() });

module.exports = (router) => {
  const ctrl = require("../controller/bulkVendor.controller.js");
  const { verifyAdminToken } = require("../middleware/auth.js");

  router.get("/bulkorder/vendors", verifyAdminToken, ctrl.getVendors);
  router.post("/bulkorder/vendors", verifyAdminToken, ctrl.createVendor);
  router.put("/bulkorder/vendors/:id", verifyAdminToken, ctrl.updateVendor);
  router.delete("/bulkorder/vendors/:id", verifyAdminToken, ctrl.deleteVendor);

  // ✅ ONLY ONE upload route
  router.post(
    "/bulkorder/vendors/upload",
    verifyAdminToken,
    // upload.single("file"), 
  upload.any(), 
    ctrl.uploadVendors
  );
};
