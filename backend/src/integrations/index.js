/**
 * Integration Services Index
 * Central export point for all third-party integrations.
 * Makes it easy to switch providers by changing a single import.
 */

// Payment Services
import razorpayService from './payment/razorpay.service.js';

// Delivery Services  
import shiprocketService from './delivery/shiprocket.service.js';

// Storage Services
import cloudinaryService from './storage/cloudinary.service.js';

/**
 * Active Provider Configuration
 * To switch providers, just change these exports
 */
export const paymentService = razorpayService;
export const deliveryService = shiprocketService;
export const storageService = cloudinaryService;

// Named exports if you need specific providers
export {
    razorpayService,
    shiprocketService,
    cloudinaryService
};

export default {
    payment: paymentService,
    delivery: deliveryService,
    storage: storageService
};
