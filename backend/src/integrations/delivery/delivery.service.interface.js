/**
 * Delivery Service Interface
 * Abstraction for delivery/shipping providers (Shiprocket, Delhivery, DHL, etc.)
 */

class DeliveryService {
    /**
     * Create a shipment
     * @param {Object} shipmentData - { orderId, items, pickupAddress, deliveryAddress, weight, dimensions }
     * @returns {Promise<Object>} - { shipmentId, awb, trackingUrl, estimatedDelivery }
     */
    async createShipment(shipmentData) {
        throw new Error('Method not implemented');
    }

    /**
     * Track shipment
     * @param {string} shipmentId or AWB number
     * @returns {Promise<Object>} - { status, currentLocation, estimatedDelivery, history }
     */
    async trackShipment(trackingNumber) {
        throw new Error('Method not implemented');
    }

    /**
     * Get shipping rates
     * @param {Object} rateData - { weight, pickupPincode, deliveryPincode, codAmount }
     * @returns {Promise<Array>} - [{ courierId, courierName, rate, estimatedDays }]
     */
    async getShippingRates(rateData) {
        throw new Error('Method not implemented');
    }

    /**
     * Cancel shipment
     * @param {string} shipmentId
     * @returns {Promise<Object>} - { success, message }
     */
    async cancelShipment(shipmentId) {
        throw new Error('Method not implemented');
    }

    /**
     * Schedule pickup
     * @param {Object} pickupData - { shipmentIds, pickupDate, pickupAddress }
     * @returns {Promise<Object>} - { pickupId, scheduledDate }
     */
    async schedulePickup(pickupData) {
        throw new Error('Method not implemented');
    }
}

export default DeliveryService;
