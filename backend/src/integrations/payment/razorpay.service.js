import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentService from './payment.service.interface.js';

/**
 * Razorpay Payment Adapter
 * Implements PaymentService interface for Razorpay payment gateway.
 * To switch to another provider (Stripe, PayPal), create a new adapter.
 */
class RazorpayService extends PaymentService {
    constructor() {
        super();

        // Initialize Razorpay with credentials from environment
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }

    /**
     * Create Razorpay order
     */
    async createPaymentOrder(orderData) {
        try {
            const { amount, currency = 'INR', orderId, customerInfo } = orderData;

            const razorpayOrder = await this.razorpay.orders.create({
                amount: amount * 100, // Razorpay expects amount in paise
                currency,
                receipt: orderId,
                notes: {
                    customer_name: customerInfo?.name,
                    customer_email: customerInfo?.email
                }
            });

            return {
                paymentId: razorpayOrder.id,
                status: razorpayOrder.status,
                providerOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount / 100,
                currency: razorpayOrder.currency
            };
        } catch (error) {
            throw new Error(`Razorpay order creation failed: ${error.message}`);
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    async verifyPayment(paymentData) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

            // Generate expected signature
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            // Compare signatures
            const isValid = expectedSignature === razorpay_signature;

            if (isValid) {
                // Fetch payment details for confirmation
                const payment = await this.razorpay.payments.fetch(razorpay_payment_id);
                return {
                    verified: true,
                    paymentId: razorpay_payment_id,
                    status: payment.status,
                    method: payment.method,
                    amount: payment.amount / 100
                };
            }

            return { verified: false };
        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }

    /**
     * Process refund via Razorpay
     */
    async processRefund(refundData) {
        try {
            const { paymentId, amount, reason } = refundData;

            const refund = await this.razorpay.payments.refund(paymentId, {
                amount: amount * 100, // Convert to paise
                notes: { reason }
            });

            return {
                refundId: refund.id,
                status: refund.status,
                amount: refund.amount / 100
            };
        } catch (error) {
            throw new Error(`Refund processing failed: ${error.message}`);
        }
    }

    /**
     * Get payment status from Razorpay
     */
    async getPaymentStatus(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);

            return {
                status: payment.status,
                amount: payment.amount / 100,
                method: payment.method,
                email: payment.email,
                contact: payment.contact
            };
        } catch (error) {
            throw new Error(`Failed to fetch payment status: ${error.message}`);
        }
    }
}

// Export singleton instance
export default new RazorpayService();
