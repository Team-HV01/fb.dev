// const Order = require('../models/orderModels')
// const Payment = require('../models/paymentModels')
// const Product = require('../models/productModels')
// const Customer = require('../models/customerModels')
// const { v4: uuidv4 } = require('uuid');
// const Cart = require('../models/cartModels');

// const orderController = {};

// orderController.create = async (req, res) => {
//     try {
//         const { paymentMethod } = req.body;
//         console.log(paymentMethod)

//         if (!paymentMethod) {
//             return res.status(400).send({ status: false, msg: 'Please Select a Payment Method' });
//         }


//         const customer = await Customer.findById(req.user._id)
//             .populate({
//                 path: "address",
//                 select: "savedAddresses"
//             })

//         let address = customer.address.savedAddresses.filter(addr => addr.selected === true);
//         if (address.length === 0) {
//             return res.status(400).json({ error: 'Please Add an address' });
//         }

//         const shippingAddress = {
//             address: address[0].address,
//             city: address[0].city,
//             state: address[0].state,
//             pinCode: address[0].pinCode,
//             phone: address[0].alternativePhoneNumber,
//             fullName: address[0]?.name || customer.name
//         }

//         if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pinCode || !shippingAddress.phone || !shippingAddress.fullName) {
//             return res.status(400).json({ error: 'Please Add an address' });
//         }

//         const userCart = await Cart.findById(req.user.cart);
//         const transactionId = `TXN_${uuidv4().substring(0, 8)}`;
//         const orderId = `ORD_${uuidv4().substring(0, 8)}`;

//         if (userCart.products.length === 0) {
//             return res.status(400).send({ status: false, message: 'Please Add Products to Cart' });
//         }

//         const items = userCart.products.map(product => ({
//             product: product.productId,
//             color: product.productColor,
//             quantity: product.quantity,
//             price: product.couponDiscountedPrice === 0 ? product.itemPrice : product.couponDiscountedPrice
//         }));
//         // console.log(items);

//         const productIds = items.map(item => item.product);

//         const products = await Product.find({ _id: { $in: productIds } });

//         let failedBuyProduct = false;
//         let failedBuyProductId = [];

//         for (let i = 0; i < products.length; i++) {
//             const product = products[i];
//             const orderItem = items.find(item => item.product.toString() === product._id.toString());

//             const colorVariant = product.productVarieties.find(c => c.color === orderItem.color);
//             if (colorVariant && colorVariant.stock >= orderItem.quantity) {
//                 colorVariant.stock -= orderItem.quantity;
//                 await product.save();
//             } else if (colorVariant && colorVariant.stock < orderItem.quantity) {
//                 failedBuyProductId.push({
//                     productID: product._id,
//                     requestedQuantity: orderItem.quantity,
//                     availableQuantity: colorVariant ? colorVariant.stock : 0
//                 });
//                 failedBuyProduct = true;
//             }
//         }

//         if (failedBuyProduct) {
//             return res.status(400).send({ status: false, message: 'Some Products are out of stock', failedBuyProductId });
//         }

//         // const trackingDetails = {
//         //     status: "Ordered Placed",
//         //     type: "update",
//         //     time: new Date(),
//         //     message: "Your order has been placed successfully."
//         // }
         
//         const trackingDetails = [{
//     status: "Ordered Placed",
//     type: "system",
//     time: new Date(),
//     message: "Your order has been placed successfully.",
//     isError: false
// }];

//         const newOrder = new Order({
//             user: req.user._id,
//             items,
//             orderId,
//             transactionId,
//             totalAmount: userCart.totalPrice,
//             shippingAddress,
//             trackingDetails
//         });

//         let newPayment;
//         if (newOrder) {
//             newPayment = new Payment({
//                 orderId: orderId,
//                 user: req.user._id,
//                 amountPaid: userCart.totalPrice,
//                 paymentMethod,
//                 transactionId
//             });
//         }
//         newOrder.payment = newPayment._id;

//         if (!newPayment) {
//             return res.status(400).send({ status: false, message: 'Please Add Payment Method' });
//         }

//         await newPayment.save();



//         const savedOrder = await newOrder.save();

//         if (savedOrder) {
//             userCart.products = [];
//             userCart.totalPrice = 0;
//             await userCart.save();
//             customer.orderHistory.push(savedOrder._id);
//             await customer.save();
//         }

//         res.status(201).send({
//             status: true,
//             message: "Order Placed",
//             orderId: orderId,
//             data: savedOrder

//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ status: false, message: 'Internal Server Error', meta: error });
//     }
// };

const Order = require("../models/orderModels");
const Payment = require("../models/paymentModels");
const Product = require("../models/productModels");
const Customer = require("../models/customerModels");
const Cart = require("../models/cartModels");
const { v4: uuidv4 } = require("uuid");

const orderController = {};

/* ======================================================
   CREATE ORDER (USER)
====================================================== */
orderController.create = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        status: false,
        message: "Please select a payment method"
      });
    }

    const customer = await Customer.findById(req.user._id).populate({
      path: "address",
      select: "savedAddresses"
    });

    const selectedAddress = customer.address?.savedAddresses?.find(
      a => a.selected === true
    );

    if (!selectedAddress) {
      return res.status(400).json({
        status: false,
        message: "Please add or select an address"
      });
    }

    const shippingAddress = {
      fullName: selectedAddress.name || customer.name,
      address: selectedAddress.address,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pinCode: selectedAddress.pinCode,
      phone: selectedAddress.alternativePhoneNumber
    };

    const userCart = await Cart.findById(req.user.cart);

    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Cart is empty"
      });
    }

    const orderId = `ORD_${uuidv4().slice(0, 8)}`;
    const transactionId = `TXN_${uuidv4().slice(0, 8)}`;

    const items = userCart.products.map(p => ({
      product: p.productId,
      color: p.productColor,
      quantity: p.quantity,
      price: p.couponDiscountedPrice === 0
        ? p.itemPrice
        : p.couponDiscountedPrice
    }));

    /* ===== STOCK CHECK ===== */
    const products = await Product.find({
      _id: { $in: items.map(i => i.product) }
    });

    for (const product of products) {
      const item = items.find(
        i => i.product.toString() === product._id.toString()
      );

      const variant = product.productVarieties.find(
        v => v.color === item.color
      );

      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          status: false,
          message: "Product out of stock"
        });
      }

      variant.stock -= item.quantity;
      await product.save();
    }

    /* ===== TRACKING ===== */
    const trackingDetails = [{
      status: "Ordered Placed",
      type: "update",
      time: new Date(),
      message: "Your order has been placed successfully",
      isError: false
    }];

    /* ===== CREATE ORDER ===== */
    const newOrder = new Order({
      orderId,
      transactionId,
      user: req.user._id,
      items,
      totalAmount: userCart.totalPrice,
      shippingAddress,
      trackingDetails
    });

    const payment = new Payment({
      orderId,
      transactionId,
      user: req.user._id,
      amountPaid: userCart.totalPrice,
      paymentMethod
    });

    newOrder.payment = payment._id;

    await payment.save();
    const savedOrder = await newOrder.save();

    /* ===== CLEAR CART ===== */
    userCart.products = [];
    userCart.totalPrice = 0;
    await userCart.save();

    customer.orderHistory.push(savedOrder._id);
    await customer.save();

    return res.status(201).json({
      status: true,
      message: "Order placed successfully",
      data: savedOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

/* ======================================================
   USER ORDER HISTORY
====================================================== */
orderController.getUserOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name description productVarieties")
      .populate("payment", "paymentMethod paymentStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

/* ======================================================
   ADMIN: GET ALL ORDERS
====================================================== */
orderController.getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name productVarieties")
      .populate("payment", "paymentMethod paymentStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

/* ======================================================
   USER: CANCEL ORDER
====================================================== */
orderController.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found"
      });
    }

    if (["Shipped", "Delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        status: false,
        message: "Order cannot be cancelled"
      });
    }

    // order.orderStatus = "Cancelled";

    // order.trackingDetails.push({
    //   status: "Custom",
    //   type: "custom",
    //   time: new Date(),
    //   message: "Order cancelled by user",
    //   isError: true
    // });

    order.orderStatus = "Cancelled";

order.trackingDetails.push({
  status: "Cancelled",
  type: "update", // ✅ FIXED (must match enum)
  time: new Date(),
  message: req.body.message || "Order cancelled by user",
  isError: true
});




    await order.save();

    res.status(200).json({
      status: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};

/* ======================================================
   ADMIN: UPDATE ORDER STATUS
====================================================== */
// orderController.changeStatus = async (req, res) => {
//   try {
//     const { status, message } = req.body;

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         status: false,
//         message: "Order not found"
//       });
//     }

//     order.orderStatus = status;

//     order.trackingDetails.push({
//       status: ["Ordered Placed", "Ongoing", "Shipped", "Delivered"].includes(status)
//         ? status
//         : "Custom",
//       type: "update",
//       time: new Date(),
//       message: message || `Order status updated to ${status}`,
//       isError: false
//     });

//     await order.save();

//     res.status(200).json({
//       status: true,
//       message: "Order status updated",
//       order
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       status: false,
//       message: "Internal Server Error"
//     });
//   }
// };


orderController.changeStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found"
      });
    }

    // ❌ BLOCK admin update if already cancelled
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        status: false,
        message: "Cancelled order cannot be updated"
      });
    }

    // ✅ Update main status
    order.orderStatus = status;

    // ✅ SAFE enum value
    order.trackingDetails.push({
      status,
      type: "update", // ✅ FIXED
      time: new Date(),
      message: message || `Order updated to ${status}`,
      isError: false
    });

    await order.save();

    res.status(200).json({
      status: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("ADMIN UPDATE ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });
  }
};


module.exports = orderController;
