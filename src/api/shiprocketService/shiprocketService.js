const axios = require('axios');

const shiprocketService = {
    generateToken: async (email, password) => {
        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data.token;
        } catch (error) {
            throw new Error('Error generating Shiprocket token');
        }
    },

    createOrder: async (orderData) => {

        console.log("ShiprocketShiprocket:")
        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new Error('Error creating Shiprocket order');
        }
    },

    generateLabel: async (orderId) => {
        try {
            const response = await axios.post(`https://apiv2.shiprocket.in/v1/external/courier/generate/label/${orderId}`, null, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new Error('Error generating Shiprocket label');
        }
    },

    trackOrderByOrderId: async (orderId) => {
        try {
            const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new Error('Error tracking Shiprocket order');
        }
    },

    trackOrderByShipment_id: async (shipment_id) => {
        try {
            const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new Error('Error tracking Shiprocket order');
        }
    },

    calculateShippingCost: async (shippingData) => {
        try {
            const { pickup_postcode, delivery_postcode, weight, cod } = shippingData;
            const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new Error('Error during Services calculateShippingCost ');
        }
    },


    cancelOrder: async (order_id) => {
        try {
            const ids = [order_id];
            const response = await axios.post(
                'https://apiv2.shiprocket.in/v1/external/orders/cancel',
                { ids },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Shiprocket API Error: Authentication failed. Check your credentials.');
                throw new Error('Authentication failed. Check your credentials.');
            } else {
                throw error;
            }
        }
    },

    updateCustomerAddress: async (orderData) => {
        try {
            const {
                order_id,
                shipping_customer_name,
                shipping_phone,
                shipping_address,
                shipping_address_2 = '',
                shipping_city,
                shipping_state,
                shipping_country,
                shipping_pincode,
                email = '',
                billing_alternate_phone = '',
            } = orderData;

            const response = await axios.post(
                'https://apiv2.shiprocket.in/v1/external/orders/address/update',
                {
                    order_id,
                    shipping_customer_name,
                    shipping_phone,
                    shipping_address,
                    shipping_address_2,
                    shipping_city,
                    shipping_state,
                    shipping_country,
                    shipping_pincode,
                    shipping_email: email,
                    billing_alternate_phone,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            );

            console.log('Shiprocket API Response:', response.data);
            // Handle the response as per your application's requirements

            return response.data;
        } catch (error) {
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                throw shiprocketError;
            } else {
                throw error;
            }
        }
    },

    returnShiprocketOrder: async (orderData) => {
        try {
            const response = await axios.post(
                'https://apiv2.shiprocket.in/v1/external/orders/create/return',
                {
                    orderData
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            );

            // Send response to client
            res.status(200).json({ success: true, response });
        } catch (error) {
            // Check if the error is from Shiprocket API
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                res.status(422).json({ success: false, error: shiprocketError });
            } else {
                // Pass other errors to the next middleware function
                next(error);
            }
        }
    },

    getShiprocketOrders: async () => {
        try {
            const response = await axios.get(
                'https://apiv2.shiprocket.in/v1/external/orders',
                { maxBodyLength: Infinity },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            );
            if (response.status !== 200) {
                const error = response;
                console.error('Shiprocket API Error:', error);
                return res.status(422).json({ success: false, error });
            }
            return res.status(200).json({ success: true, response });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },

    returnAllShiprocketOrder: async () => {
        try {
            const response = await axios.post(
                'https://apiv2.shiprocket.in/v1/external/orders/processing/return',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`,
                    },
                }
            );
            // Send response to client
            res.status(200).json({ success: true, response });
        } catch (error) {
            // Check if the error is from Shiprocket API
            if (error.response) {
                const shiprocketError = error.response.data;
                console.error('Shiprocket API Error:', shiprocketError);
                res.status(422).json({ success: false, error: shiprocketError });
            } else {
                // Pass other errors to the next middleware function
                next(error);
            }
        }
    },

};


module.exports = shiprocketService;
