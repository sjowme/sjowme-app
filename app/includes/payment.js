
var Mollie = require("mollie-api-node");

var mollie = new Mollie.API.Client();
mollie.setApiKey(process.env.SJ_MOLLIE_API_KEY);

module.exports = (config) => {

    function setupTransaction(amount, description, cb) {
        mollie.payments.create({
            amount: amount,
            description: description,
            redirectUrl: `${config.baseUrl('member')}/profiel`,
            webhookUrl: `${config.baseUrl('member')}/payment/webhook`
        }, payment => {
            if (payment.error) {
                return cb(payment.error);
            }
            cb(null, payment);
        });
    }

    function getTransaction(transaction_id, cb) {
        mollie.payments.get(transaction_id, payment => {
            if (payment.error) {
                return cb(payment.error);
            }
            cb(null, payment);
        });
    }

    return {
        setupTransaction,
        getTransaction
    };

};
