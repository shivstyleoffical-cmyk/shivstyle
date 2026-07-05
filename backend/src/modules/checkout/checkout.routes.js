import express from 'express';
import * as checkoutController from './checkout.controller.js';

const router = express.Router();

// Initiate checkout (creates local pending order and initiates Razorpay)
router.post('/initiate', checkoutController.initiateCheckout);

// Cancel checkout session (deletes/cancels the order if payment not made and restores stock)
router.post('/cancel', checkoutController.cancelCheckout);

// Fetch session order details for checkout portal
router.get('/order/:id', checkoutController.getCheckoutOrder);

// Complete checkout session details inside portal
router.post('/complete', checkoutController.completeCheckout);

// Verify Razorpay payment signature
router.post('/verify', checkoutController.verifyPayment);

// Public webhook endpoint for payment captures from Razorpay
router.post('/webhook', checkoutController.handleWebhook);

// Public webhook endpoint for shipment tracking updates from Shiprocket
router.post('/delivery-webhook', checkoutController.handleShiprocketWebhook);

// Magic Checkout specific endpoints called by Razorpay servers
router.post('/shipping-info', checkoutController.getMagicShippingInfo);
router.get('/shipping-info', checkoutController.getMagicShippingInfo);
router.post('/shipping_info', checkoutController.getMagicShippingInfo);
router.get('/shipping_info', checkoutController.getMagicShippingInfo);

router.post('/promotions', checkoutController.getMagicPromotions);
router.get('/promotions', checkoutController.getMagicPromotions);

router.post('/apply-promotion', checkoutController.applyMagicPromotion);
router.get('/apply-promotion', checkoutController.applyMagicPromotion);
router.post('/apply_promotion', checkoutController.applyMagicPromotion);
router.get('/apply_promotion', checkoutController.applyMagicPromotion);

export default router;
