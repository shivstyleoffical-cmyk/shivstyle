import express from 'express';
import * as checkoutController from './checkout.controller.js';

const router = express.Router();

// Initiate checkout (creates local pending order and initiates Razorpay)
router.post('/initiate', checkoutController.initiateCheckout);

// Fetch session order details for checkout portal
router.get('/order/:id', checkoutController.getCheckoutOrder);

// Complete checkout session details inside portal
router.post('/complete', checkoutController.completeCheckout);

// Verify Razorpay payment signature
router.post('/verify', checkoutController.verifyPayment);

// Public webhook endpoint for payment captures from Razorpay
router.post('/webhook', checkoutController.handleWebhook);

export default router;
