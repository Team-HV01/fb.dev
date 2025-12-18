// const mongoose = require("mongoose");
// const BulkOrder = require("../models/bulkOrderModels");
// const Customer = require("../models/customerModels");
// const Product = require("../models/productModels");

// const bulkOrderControllers = {};

// bulkOrderControllers.newOrder = async (req, res) => {
//     try {
//         const { productId, quantity, note } = req.body;

//         const userId = req.user._id;

//         // Validate customer
//         const existingCustomer = await Customer.findById(userId);
//         if (!existingCustomer) {
//             return res.status(404).send({ status: false, msg: "Customer not found." });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send({ status: false, msg: "Product not found." });
//         }

//         // Create a new bulk order
//         const newBulkOrder = await BulkOrder.create({
//             userId,
//             productId,
//             note,
//             quantity,
//         });

//         return res.status(200).send({ status: true, msg: "Bulk order created successfully.", data: newBulkOrder });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ status: false, msg: error.message, meta: error });
//     }
// };

// bulkOrderControllers.getAllOrders = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const skip = (page - 1) * limit;

//         const orders = await BulkOrder.find()
//             .skip(skip)
//             .limit(limit)
//             .populate({
//                 path: "userId",
//                 select: "name email phone profile_pic address",
//             })
//             .populate({
//                 path: "productId",
//                 select: "name productVarieties fabricType"
//             });

//         orders.forEach(order => {
//             if (order.userId && order.userId.address) {
//                 order.userId.address = order.userId.address.filter(addr => addr.isDefault === true);
//             }
//         });

//         const totalDataCount = await BulkOrder.countDocuments();

//         return res.status(200).send({
//             status: true,
//             msg: "Bulk order Request Fetched successfully.",
//             totalData: totalDataCount,
//             totalPage: Math.ceil(totalDataCount / limit),
//             currentPage: page,
//             data: orders
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ status: false, msg: error.message, meta: error });
//     }
// }

// module.exports = bulkOrderControllers; 

// const mongoose = require("mongoose");
// const XLSX = require("xlsx");

// const BulkOrder = require("../models/bulkOrderModels");
// const Customer = require("../models/customerModels");
// const Product = require("../models/productModels");

// exports.newOrder = async (req, res) => {
//   try {
//     const { productId, quantity, note } = req.body;
//     const userId = req.user._id;

//     const existingCustomer = await Customer.findById(userId);
//     if (!existingCustomer) {
//       return res.status(404).send({ status: false, msg: "Customer not found." });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).send({ status: false, msg: "Product not found." });
//     }

//     const newBulkOrder = await BulkOrder.create({
//       userId,
//       productId,
//       quantity,
//       note,
//     });

//     res.status(200).send({
//       status: true,
//       msg: "Bulk order created successfully.",
//       data: newBulkOrder,
//     });
//   } catch (error) {
//     res.status(500).send({ status: false, msg: error.message });
//   }
// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const page = +req.query.page || 1;
//     const limit = +req.query.limit || 10;
//     const skip = (page - 1) * limit;

//     const orders = await BulkOrder.find()
//       .skip(skip)
//       .limit(limit)
//       .populate("userId", "name email phone profile_pic address")
//       .populate("productId", "name productVarieties fabricType");

//     const totalData = await BulkOrder.countDocuments();

//     res.status(200).json({
//       status: true,
//       totalData,
//       totalPage: Math.ceil(totalData / limit),
//       currentPage: page,
//       data: orders,
//     });
//   } catch (error) {
//     res.status(500).json({ status: false, msg: error.message });
//   }
// };

// exports.uploadBulkOrders = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ status: false, message: "No file received" });
//     }

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     const orders = [];

//     for (const row of rows) {
//       const customer = await Customer.findOne({ email: row.Email });
//       const product = await Product.findOne({ name: row.Product });

//       if (!customer || !product || row.Quantity <= 0) continue;

//       orders.push({
//         userId: customer._id,
//         productId: product._id,
//         quantity: row.Quantity,
//         note: "Uploaded via Excel",
//       });
//     }

//     if (!orders.length) {
//       return res.status(400).json({ status: false, message: "No valid rows" });
//     }

//     const inserted = await BulkOrder.insertMany(orders, { ordered: false });

//     res.json({
//       status: true,
//       message: "Bulk orders uploaded",
//       insertedCount: inserted.length,
//     });
//   } catch (error) {
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

// exports.deleteOrder = async (req, res) => {
//   try {
//     await BulkOrder.findByIdAndDelete(req.params.id);
//     res.json({ status: true, message: "Bulk order deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ status: false, message: "Delete failed" });
//   }
// };


const mongoose = require("mongoose");
const XLSX = require("xlsx");

const BulkOrder = require("../models/bulkOrderModels");
const Customer = require("../models/customerModels");
const Product = require("../models/productModels");

/* =========================
   CREATE SINGLE BULK ORDER
   (UNCHANGED)
========================= */
exports.newOrder = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    const userId = req.user._id;

    const existingCustomer = await Customer.findById(userId);
    if (!existingCustomer) {
      return res.status(404).send({ status: false, msg: "Customer not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ status: false, msg: "Product not found." });
    }

    const newBulkOrder = await BulkOrder.create({
      userId,
      productId,
      quantity,
      note,
    });

    res.status(200).send({
      status: true,
      msg: "Bulk order created successfully.",
      data: newBulkOrder,
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

/* =========================
   GET ALL BULK ORDERS
   (UNCHANGED)
========================= */
exports.getAllOrders = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    const orders = await BulkOrder.find()
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email phone profile_pic address")
      .populate("productId", "name productVarieties fabricType");

    const totalData = await BulkOrder.countDocuments();

    res.status(200).json({
      status: true,
      totalData,
      totalPage: Math.ceil(totalData / limit),
      currentPage: page,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};

/* =========================
   BULK ORDER EXCEL UPLOAD
   ✅ FIXED FOR upload.any()
========================= */
exports.uploadBulkOrders = async (req, res) => {
  try {
    console.log("FILES:", req.files);

    // 1️⃣ File validation
    if (!req.files || !req.files.length) {
      return res.status(400).json({
        status: false,
        message: "No file received",
      });
    }

    const file = req.files[0]; // because upload.any()

    // 2️⃣ Read Excel
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log("ROWS FROM EXCEL:", rows);

    if (!rows.length) {
      return res.status(400).json({
        status: false,
        message: "Excel file is empty",
      });
    }

    const ordersToInsert = [];

    // 3️⃣ Process rows
    for (const row of rows) {
      const email = String(row.Email || "").trim();
      const phone = String(row.Phone || "").trim();
      const productName = String(row.Product || "").trim();
      const quantity = Number(row.Quantity);

      console.log({ email, phone, productName, quantity });

      // Basic validation
      if (!email && !phone) continue;
      if (!productName) continue;
      if (!quantity || quantity <= 0) continue;

      // 4️⃣ Find customer (email OR phone)
      const customer = await Customer.findOne({
        $or: [
          email ? { email } : null,
          phone ? { phone: Number(phone) } : null,
        ].filter(Boolean),
      });

      if (!customer) {
        console.log("❌ Customer not found:", email || phone);
        continue;
      }

      // 5️⃣ Find product (case-insensitive exact match)
      const product = await Product.findOne({
        name: { $regex: `^${productName}$`, $options: "i" },
      });

      if (!product) {
        console.log("❌ Product not found:", productName);
        continue;
      }

      // 6️⃣ Push valid order
      ordersToInsert.push({
        userId: customer._id,
        productId: product._id,
        quantity,
        note: "Uploaded via Excel",
        status: "Requested",
      });
    }

    // 7️⃣ Final validation
    if (!ordersToInsert.length) {
      return res.status(400).json({
        status: false,
        message: "No valid rows found in Excel",
      });
    }

    // 8️⃣ Insert
    const inserted = await BulkOrder.insertMany(ordersToInsert, {
      ordered: false,
    });

    res.json({
      status: true,
      message: "Bulk orders uploaded successfully",
      insertedCount: inserted.length,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE BULK ORDER
   (UNCHANGED)
========================= */
exports.deleteOrder = async (req, res) => {
  try {
    await BulkOrder.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: "Bulk order deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Delete failed" });
  }
};
