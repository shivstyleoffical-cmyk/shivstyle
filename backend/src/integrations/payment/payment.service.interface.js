/**
 * Payment Service Interface
 * This abstraction allows you to switch payment providers (Razorpay → Stripe → PayPal)
 * without changing your business logic.
 */

class PaymentService {
    /**
     * Create a payment order
     * @param {Object} orderData - { amount, currency, orderId, customerInfo }
     * @returns {Promise<Object>} - { paymentId, status, providerOrderId }
     */
    async createPaymentOrder(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Verify payment signature/callback
     * @param {Object} paymentData - Provider-specific verification data
     * @returns {Promise<boolean>} - true if payment is verified
     */
    async verifyPayment(paymentData) {
        throw new Error('Method not implemented');
    }

    /**
     * Process refund
     * @param {Object} refundData - { paymentId, amount, reason }
     * @returns {Promise<Object>} - { refundId, status }
     */
    async processRefund(refundData) {
        throw new Error('Method not implemented');
    }

    /**
     * Get payment status
     * @param {string} paymentId
     * @returns {Promise<Object>} - { status, amount, method }
     */
    async getPaymentStatus(paymentId) {
        throw new Error('Method not implemented');
    }
}

export default PaymentService;
