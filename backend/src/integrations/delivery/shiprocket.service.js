import axios from 'axios';
import DeliveryService from './delivery.service.interface.js';

/**
 * Shiprocket Delivery Adapter
 * Implements DeliveryService for Shiprocket API.
 * Can be easily swapped with Delhivery, DHL, or other providers.
 */
class ShiprocketService extends DeliveryService {
    constructor() {
        super();
        this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
        this.token = null;
    }

    /**
     * Authenticate with Shiprocket
     */
    async authenticate() {
        try {
            const response = await axios.post(`${this.baseUrl}/auth/login`, {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            });

            this.token = response.data.token;
            return this.token;
        } catch (error) {
            throw new Error(`Shiprocket authentication failed: ${error.message}`);
        }
    }

    /**
     * Get authorization headers
     */
    async getHeaders() {
        if (!this.token) {
            await this.authenticate();
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Create shipment in Shiprocket
     */
    async createShipment(shipmentData) {
        try {
            const headers = await this.getHeaders();
            const {
                orderId,
                orderDate,
                items,
                pickupAddress,
                deliveryAddress,
                weight,
                dimensions,
                paymentMethod,
                subtotal
            } = shipmentData;

            const payload = {
                order_id: orderId,
                order_date: orderDate,
                pickup_location: pickupAddress.locationName || 'Primary',
                billing_customer_name: deliveryAddress.name,
                billing_address: deliveryAddress.address,
                billing_city: deliveryAddress.city,
                billing_pincode: deliveryAddress.pincode,
                billing_state: deliveryAddress.state,
                billing_country: deliveryAddress.country || 'India',
                billing_email: deliveryAddress.email,
                billing_phone: deliveryAddress.phone,
                shipping_is_billing: true,
                order_items: items.map(item => ({
                    name: item.name,
                    sku: item.sku || item.id,
                    units: item.quantity,
                    selling_price: item.price
                })),
                payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                sub_total: subtotal,
                length: dimensions?.length || 10,
                breadth: dimensions?.breadth || 10,
                height: dimensions?.height || 10,
                weight: weight
            };

            const response = await axios.post(
                `${this.baseUrl}/orders/create/adhoc`,
                payload,
                { headers }
            );

            return {
                shipmentId: response.data.shipment_id,
                orderId: response.data.order_id,
                channelOrderId: response.data.channel_order_id,
                awb: response.data.awb_code,
                courierName: response.data.courier_name
            };
        } catch (error) {
            throw new Error(`Shipment creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Track shipment
     */
    async trackShipment(trackingNumber) {
        try {
            const headers = await this.getHeaders();

            const response = await axios.get(
                `${this.baseUrl}/courier/track/awb/${trackingNumber}`,
                { headers }
            );

            const tracking = response.data.tracking_data;

            return {
                status: tracking.track_status,
                currentLocation: tracking.current_status,
                estimatedDelivery: tracking.edd,
                history: tracking.shipment_track.map(t => ({
                    date: t.date,
                    status: t.status,
                    location: t.location,
                    activity: t.activity
                }))
            };
        } catch (error) {
            throw new Error(`Tracking failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Get shipping rates
     */
    async getShippingRates(rateData) {
        try {
            const headers = await this.getHeaders();
            const { weight, pickupPincode, deliveryPincode, codAmount = 0 } = rateData;

            const response = await axios.get(
                `${this.baseUrl}/courier/serviceability`,
                {
                    headers,
                    params: {
                        pickup_postcode: pickupPincode,
                        delivery_postcode: deliveryPincode,
                        weight: weight,
                        cod: codAmount > 0 ? 1 : 0
                    }
                }
            );

            return response.data.data.available_courier_companies.map(courier => ({
                courierId: courier.courier_company_id,
                courierName: courier.courier_name,
                rate: courier.rate,
                estimatedDays: courier.etd,
                codCharges: courier.cod_charges,
                isRecommended: courier.recommendation === 'Y'
            }));
        } catch (error) {
            throw new Error(`Rate fetch failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Cancel shipment
     */
    async cancelShipment(shipmentId) {
        try {
            const headers = await this.getHeaders();

            const response = await axios.post(
                `${this.baseUrl}/orders/cancel`,
                { ids: [shipmentId] },
                { headers }
            );

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            throw new Error(`Cancellation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Schedule pickup
     */
    async schedulePickup(pickupData) {
        try {
            const headers = await this.getHeaders();
            const { shipmentIds, pickupDate } = pickupData;

            const response = await axios.post(
                `${this.baseUrl}/courier/generate/pickup`,
                {
                    shipment_id: shipmentIds,
                    pickup_date: pickupDate
                },
                { headers }
            );

            return {
                pickupId: response.data.pickup_id,
                scheduledDate: pickupDate,
                message: response.data.message
            };
        } catch (error) {
            throw new Error(`Pickup scheduling failed: ${error.response?.data?.message || error.message}`);
        }
    }
}

// Export singleton
export default new ShiprocketService();
