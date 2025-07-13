const Razorpay = require('razorpay');
const Order = require('./orderModel');
const Material = require('../material/materialModel');
const User = require('../user/userModel');
const { sendOTPEmail } = require('../../utilities/mailer');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const cron = require('node-cron');

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Initialize Payment (Hold Funds)
const createPayment = async (req, res) => {
  try {
    const { materialId, buyerId, sellerId } = req.body;
    const errMsgs = [];

    if (!materialId) errMsgs.push("materialId is required");
    if (!buyerId) errMsgs.push("buyerId is required");
    if (!sellerId) errMsgs.push("sellerId is required");

    const material = await Material.findById(materialId);
    if (!material) errMsgs.push("Material not found");

    const buyer = await User.findById(buyerId);
    if (!buyer) errMsgs.push("Buyer not found");

    const amount = material?.price || 0;
    if (amount <= 0) errMsgs.push("This material is not for sale");

    if (errMsgs.length > 0) {
      return res.status(422).json({ success: false, message: errMsgs });
    }

    // Create Razorpay Order with 3-day capture window
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (multiply by 100 for INR)
      currency: "INR",
      payment_capture: 0, // Set to 0 for manual capture (1 for automatic)
      notes: {
        payment_expiry: "3 days" // You can store this as metadata
      }
    });

    // Save to DB with expiration time
    const newOrder = new Order({
      razorpayOrderId: razorpayOrder.id,
      materialId,
      sellerId,
      buyerId,
      amount,
      status: "created",
      paymentExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment initialized. Complete payment within 3 days",
      data: razorpayOrder
    });

  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: err.error?.description || err.message
    });
  }
};

// Webhook for payment verification
const handleWebhook = async (req, res) => {
  const crypto = require('crypto');
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== req.headers['x-razorpay-signature']) {
    return res.status(400).json({ status: 'invalid signature' });
  }

  const { event, payload } = req.body;

  try {
    if (event === 'payment.captured') {
      const order = await Order.findOne({
        razorpayOrderId: payload.payment.entity.order_id
      });

      if (order && order.status === "created") {
        order.status = "paid";
        order.razorpayPaymentId = payload.payment.entity.id;
        order.deliveryExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await order.save();
      }
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ status: 'error' });
  }
};

// Mark as delivered (seller action)
const markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('buyerId');

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: `Order must be in paid status. Current status: ${order.status}`
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    order.otp = otp;
    order.otpExpiresAt = otpExpiresAt;
    order.status = "delivered";
    await order.save();

    // Send OTP via email
    await sendOTPEmail(order.buyerId.email, otp, otpExpiresAt);

    res.json({
      success: true,
      message: "Delivery marked. OTP sent to buyer",
      otpExpiresAt
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delivery marking failed",
      error: err.message
    });
  }
};

// Confirm delivery with OTP (buyer action)
const confirmDelivery = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: `Order not ready for confirmation. Status: ${order.status}`
      });
    }

    // Check OTP validity
    if (order.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (new Date() > order.otpExpiresAt) {
      await razorpay.payments.refund(order.razorpayPaymentId);
      order.status = "refunded";
      await order.save();
      return res.json({
        success: false,
        message: "OTP expired. Refund initiated"
      });
    }

    // Finalize payment
    await razorpay.payments.capture(order.razorpayPaymentId, order.amount * 100);
    order.status = "completed";
    await order.save();

    res.json({
      success: true,
      message: "Delivery confirmed! Payment released to seller"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delivery confirmation failed",
      error: err.message
    });
  }
};

// Scheduled tasks
cron.schedule('0 * * * *', async () => { // Run hourly
  try {
    const now = new Date();

    // Cancel unpaid orders
    const unpaidOrders = await Order.find({
      status: "created",
      paymentExpiresAt: { $lt: now }
    });

    for (const order of unpaidOrders) {
      order.status = "cancelled";
      await order.save();
    }

    // Refund undelivered orders
    const undeliveredOrders = await Order.find({
      status: "paid",
      deliveryExpiresAt: { $lt: now }
    });

    for (const order of undeliveredOrders) {
      if (order.razorpayPaymentId) {
        await razorpay.payments.refund(order.razorpayPaymentId);
      }
      order.status = "refunded";
      await order.save();
    }

    // Refund unconfirmed deliveries
    const unconfirmedDeliveries = await Order.find({
      status: "delivered",
      otpExpiresAt: { $lt: now }
    });

    for (const order of unconfirmedDeliveries) {
      if (order.razorpayPaymentId) {
        await razorpay.payments.refund(order.razorpayPaymentId);
      }
      order.status = "refunded";
      await order.save();
    }

    console.log(`Cron job executed: ${unpaidOrders.length} cancelled, ${undeliveredOrders.length} refunded for non-delivery, ${unconfirmedDeliveries.length} refunded for non-confirmation`);

  } catch (err) {
    console.error("Cron job error:", err);
  }
});

module.exports = {
  createPayment,
  handleWebhook,
  markAsDelivered,
  confirmDelivery
};