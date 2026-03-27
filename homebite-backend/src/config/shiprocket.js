/**
 * Shiprocket configuration stub.
 * Authentication token is fetched dynamically via API.
 * Replace stub methods with real Shiprocket API calls when integrating.
 */
module.exports = {
  baseUrl: 'https://apiv2.shiprocket.in/v1/external',
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,
};
