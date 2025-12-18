// const Customer = require("../models/customerModels");
// const Order = require("../models/orderModels");
// const Product = require("../models/productModels");


// const adminCustomerController = {};

// adminCustomerController.getCustomerFullDetails = async (req, res) => {
//     try {
//         const { customerId } = req.params;

//          const customer = await Customer.findOne({
//             $or: [
//                 { customerId: customerId },
//                 { _id: customerId }
//             ]
//         })
//             .populate("address")
//             .populate({
//                 path: "wishlist",
//                 populate: {
//                     path: "products.productId",
//                     model: "Product"
//                 }
//             });

//         if (!customer) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Customer not found"
//             });
//         }

// // adminCustomerController.getCustomerFullDetails = async (req, res) => {
// //     try {
// //         const { customerId } = req.params;

// //         console.log("Requested customerId:", customerId);

// //         const customer = await Customer.findOne({ customerId });

// //         console.log("Customer found:", customer);

// //         if (!customer) {
// //             return res.status(404).json({
// //                 status: false,
// //                 message: "Customer not found"
// //             });
// //         }

// // adminCustomerController.getCustomerDetailsByEmail = async (req, res) => {
// //     try {
// //         //const { email } = req.params;

// //        const email = decodeURIComponent(req.params.email);

// //         console.log("Admin fetching customer by email:", email);
// //         const customer = await Customer.findOne({ email })
// //             .populate("address")
// //             .populate({
// //                 path: "wishlist",
// //                 populate: {
// //                     path: "products.productId",
// //                     model: "Product",
// //                 },
// //             });

// //         if (!customer) {
// //             return res.status(404).json({
// //                 status: false,
// //                 message: "Customer not found with this email",
// //             });
// //         }
    


//         const orders = await Order.find({ user: customer._id })
//             .populate("items.product", "name price images")
//             .populate("payment")
//             .sort({ createdAt: -1 });

//         const cancelledOrders = orders.filter(
//             order => order.orderStatus === "Cancelled"
//         );

//         res.status(200).json({
//             status: true,
//             data: {
//                 customerProfile: {
//                     customerId: customer.customerId,
//                     name: customer.name,
//                     email: customer.email,
//                     phone: customer.phone,
//                     profile_pic: customer.profile_pic,
//                     createdAt: customer.createdAt,
//                     isActive: customer.isActive
//                 },
//                 address: customer.address,
//                 wishlist: customer.wishlist?.products || [],
//                 orders,
//                 cancelledOrders
//             }
//         });

//     } catch (error) {
//         console.error("ADMIN CUSTOMER DETAILS ERROR:", error);
//         res.status(500).json({
//             status: false,
//             message: "Internal server error"
//         });
//     }
// };

// module.exports = adminCustomerController;

// const Customer = require("../models/customerModels");
// const Order = require("../models/orderModels");

// const adminCustomerController = {};

// adminCustomerController.getCustomerFullDetails = async (req, res) => {
//   try {
//     const { customerId } = req.params;

//     console.log("➡️ CUSTOMER ID RECEIVED:", customerId);

//     const customer = await Customer.findOne({ customerId })
//       .populate("address")
//       .populate({
//         path: "wishlist",
//         populate: {
//           path: "products.productId",
//           model: "Product",
//         },
//       });

//     if (!customer) {
//       return res.status(404).json({
//         status: false,
//         message: "Customer not found",
//       });
//     }

//     const orders = await Order.find({ user: customer._id })
//       .populate("items.product", "name price images")
//       .populate("payment")
//       .sort({ createdAt: -1 });

//     const cancelledOrders = orders.filter(
//       (o) => o.orderStatus === "Cancelled"
//     );

//     res.status(200).json({
//       status: true,
//       data: {
//         customerProfile: {
//           customerId: customer.customerId,
//           name: customer.name,
//           email: customer.email,
//           phone: customer.phone,
//           profile_pic: customer.profile_pic,
//           createdAt: customer.createdAt,
//           isActive: customer.isActive,
//         },
//         address: customer.address,
//         wishlist: customer.wishlist?.products || [],
//         orders,
//         cancelledOrders,
//       },
//     });
//   } catch (error) {
//     console.error("ADMIN CUSTOMER DETAILS ERROR:", error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//     });
//   }
// };

// module.exports = adminCustomerController;


const Customer = require("../models/customerModels");
const Order = require("../models/orderModels");
const Product = require("../models/productModels");

const adminCustomerController = {};

adminCustomerController.getCustomerFullDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log("➡️ CUSTOMER ID RECEIVED:", customerId);

    let customer = await Customer.findOne({ customerId })
      .populate("address")
      .populate({
        path: "wishlist",
        populate: {
          path: "products.productId",
          model: "Product",
        },
      });

    /* ======================================================
       🔥 AUTO-BACKFILL FIX (FOR OLD CUSTOMERS)
       If customerId not found, try matching by _id fallback
    ====================================================== */
    if (!customer && customerId?.startsWith("FBCUS")) {
      console.log("⚠️ Customer not found by customerId, trying fallback...");

      customer = await Customer.findOne({ _id: customerId })
        .populate("address")
        .populate({
          path: "wishlist",
          populate: {
            path: "products.productId",
            model: "Product",
          },
        });
    }
//     if (!customer) {
//   console.log("Trying fallback by _id");
//   customer = await Customer.findById(customerId)
//     .populate("address")
//     .populate({
//       path: "wishlist",
//       populate: {
//         path: "products.productId",
//         model: "Product",
//       },
//     });
// }


    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
      });
    }

    /* ======================================================
       🔥 AUTO-GENERATE customerId IF MISSING
    ====================================================== */
    if (!customer.customerId) {
      const count = await Customer.countDocuments({
        customerId: { $exists: true },
      });

      customer.customerId = `FBCUS${String(count + 1).padStart(4, "0")}`;
      await customer.save();

      console.log("✅ customerId auto-generated:", customer.customerId);
    }

    const orders = await Order.find({ user: customer._id })
      .populate("items.product", "name price images")
      .populate("payment")
      .sort({ createdAt: -1 });

    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === "Cancelled"
    );

    return res.status(200).json({
      status: true,
      data: {
        customerProfile: {
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          profile_pic: customer.profile_pic,
          createdAt: customer.createdAt,
          isActive: customer.isActive,
        },
        address: customer.address,
        wishlist: customer.wishlist?.products || [],
        orders,
        cancelledOrders,
      },
    });
  } catch (error) {
    console.error("ADMIN CUSTOMER DETAILS ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = adminCustomerController;
