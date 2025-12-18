

const BulkVendor = require("../models/bulkVendor.model");
const XLSX = require("xlsx");

const bulkVendorController = {};

/* =========================
   GET ALL VENDORS
========================= */
bulkVendorController.getVendors = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const [vendors, totalData] = await Promise.all([
      BulkVendor.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      BulkVendor.countDocuments()
    ]);

    res.json({
      status: true,
      data: vendors,
      totalData
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};

/* =========================
   CREATE VENDOR
========================= */
bulkVendorController.createVendor = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        status: false,
        message: "All fields are required"
      });
    }

    const vendor = await BulkVendor.create({ name, phone, email });

    res.status(201).json({
      status: true,
      message: "Vendor created",
      data: vendor
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Create failed" });
  }
};

/* =========================
   UPDATE VENDOR
========================= */
bulkVendorController.updateVendor = async (req, res) => {
  try {
    const vendor = await BulkVendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      status: true,
      message: "Vendor updated",
      data: vendor
    });
  } catch {
    res.status(500).json({ status: false, message: "Update failed" });
  }
};

/* =========================
   DELETE VENDOR
========================= */
bulkVendorController.deleteVendor = async (req, res) => {
  try {
    await BulkVendor.findByIdAndDelete(req.params.id);

    res.json({
      status: true,
      message: "Vendor deleted"
    });
  } catch {
    res.status(500).json({ status: false, message: "Delete failed" });
  }
};
/* =========================
   bulkVendor
========================= */

bulkVendorController.uploadVendors = async (req, res) => {
  try {
    console.log("FILES:", req.files);

    if (!req.files || !req.files.length) {
      return res.status(400).json({
        status: false,
        message: "No file received"
      });
    }

    const file = req.files[0]; // 🔥 IMPORTANT

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log("ROWS FROM EXCEL:", rows);

    const vendors = rows
      .map(r => ({
        name: String(r.Name || "").trim(),
        phone: String(r.Phone || "").trim(),
        email: String(r.Email || "").trim(),
      }))
      .filter(v => v.name && v.phone && v.email);

    console.log("VENDORS TO INSERT:", vendors);

    await BulkVendor.insertMany(vendors);

    res.json({
      status: true,
      message: "Vendors uploaded successfully",
      insertedCount: vendors.length
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
};



module.exports = bulkVendorController;
