var _ = require('lodash');
var default_description = require('../database/defaults').subscription;

module.exports = (config, lib, database) => {

    function searchExpiredSubscriptions(now, days_offset) {
        const check_start = new Date(), check_end = new Date();
        check_start.setDate(now.getDate() + days_offset - 1);
        check_end.setDate(now.getDate() + (days_offset));
        return database.subscription.getExpiringSubscriptions(check_start, check_end);
    }

    function calculateExpireDate(subscription, abonnemment) {
        var expire = new Date(subscription.starts_at.valueOf());

        switch (abonnemment.period) {
            case 'day':
                expire.setDate(expire.getDate() + abonnemment.duration);
                break;
            case 'week':
                expire.setDate(expire.getDate() + (abonnemment.duration * 7));
                break;
            case 'month':
                expire.setMonth(expire.getMonth() + abonnemment.duration);
                break;
            case 'year':
                expire.setFullYear(expire.getFullYear() + abonnemment.duration);
                break;
            default:
                break;
        }

        return expire;
    }

    function addMemberSubscription(member_id, abonnement) {
        var subscription = _.defaults({
            name: abonnement.label,
            data: abonnement,
            owner: member_id
        }, default_description);
        return new Promise((resolve) => {
            database.subscription.getLastSubscription(member_id).then(subscr => {
                if (subscr === false || subscr.expires_at < new Date()) {
                    //first subscription or already expired
                    var starts_at = new Date();
                    starts_at.setMinutes(starts_at.getMinutes() - 1);
                    subscription.starts_at = starts_at;
                } else {
                    subscription.starts_at = subscr.expires_at;
                }
                subscription.expires_at = calculateExpireDate(subscription, abonnement);
                subscription.price = abonnement.price;
                if (abonnement.price === 0) {
                    subscription.payed = true;
                }
                database.subscription.save(subscription).then(res => resolve(res));
            });
        });
    }

    function checkSubscription(user) {
        return new Promise((resolve, reject) => {
            database.subscription.getValidSubscription(user.id)
                .then(valid_sub => {
                        if (valid_sub) {
                            return resolve(valid_sub);
                        }
                        //check if user had sub before
                        return database.subscription.getLastSubscription(user.id);
                })
                .then(last_sub => {
                    if (last_sub === false) {
                        //user heeft nog geen subscriptions gehad, voeg standaard toe.
                        database.config.load('abonnementen').then(data => {
                            var abonnement = _.find(data.abonnementen, {default: true});
                            console.log(`Adding default subscription ${abonnement.label} to user ${user.name || user.email}`);
                            addMemberSubscription(user.id, abonnement).then(new_sub => resolve(new_sub));
                        });
                    } else {
                        resolve(last_sub);
                    }
                })
                .catch(err => reject(err));

    });

    }

    function setPaymentStatus(transaction, cb) {
        return database.subscription.findByTransaction(transaction.id)
            .then(subscription => {
                if (subscription === false) {
                    return cb(`Transaction not found`);
                }
                subscription.payed = transaction.isPaid();
                subscription.data.transaction = {
                    id: transaction.id,
                    status: transaction.status,
                    amount: transaction.amount,
                    method: transaction.method,
                    mode: transaction.mode,
                    invoice_id: transaction.invoice_id,
                    invoice_number: transaction.invoice_number,
                    datetime: transaction.createdDatetime,
                };

                return database.subscription.save(subscription);

            });
    }

    function calculateTotal(subscription) {
        var price_calculation = {
            vat_perc: 0,
            net_price: 0,
            vat_amount: 0,
            total_price: 0
        };
        return new Promise((resolve, reject) => {
            database.config.load('general').then(general_config => {
                price_calculation.vat_perc = general_config.vat_perc;
                price_calculation.net_price = Number(subscription.price);
                price_calculation.vat_amount = Math.round((price_calculation.vat_perc / 100) * (price_calculation.net_price * 100)) / 100;
                price_calculation.total_price = price_calculation.net_price + price_calculation.vat_amount;
                resolve(price_calculation);
            }).catch(err => reject(err));
        });
    }

    return {
        searchExpiredSubscriptions,
        checkSubscription,
        addMemberSubscription,
        setPaymentStatus,
        calculateTotal,
        getMemberSubscriptions: database.subscription.findByOwner

    };

};
