const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'materials', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["created", "paid", "delivered", "completed", "refunded", "cancelled"],
    default: "created"
  },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  paymentExpiresAt: { type: Date }, // 3 days for payment
  deliveryExpiresAt: { type: Date }, // 3 days for delivery
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);