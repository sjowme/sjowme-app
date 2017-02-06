"use strict";

const schedule = require('node-schedule');

const SUBSCRIPTIONCHECK_SCHEDULE_2 = {hour: 15, minute: 30};
const SUBSCRIPTIONCHECK_SCHEDULE_7 = {hour: 15, minute: 31};

module.exports = (config, lib, database, subscriptions) => {

    function expiredSubscriptions(days_to_expire) {
        subscriptions.searchExpiredSubscriptions(new Date(), days_to_expire)
            .then(subscriptions => {
                console.log(`${subscriptions.length} subscriptions expiring in ${days_to_expire} days.`);
                let mails = [];
                if (subscriptions.length) {
                    mails = subscriptions.map(subscription => {
                        return lib.mailer.sendSubscriptionExpiring(subscription, days_to_expire);
                    });
                }
                return Promise.all(mails);
            })
            .then(results => {
                results.forEach(mail => {
                    console.log(`Expire mail ${days_to_expire} days sent:`, mail.envelope);
                });
            })
            .catch(err => console.error(err));

    }

    //setup schedules
    const subscriptionCheck2 = schedule.scheduleJob(SUBSCRIPTIONCHECK_SCHEDULE_2, () => expiredSubscriptions(2));
    const subscriptionCheck7 = schedule.scheduleJob(SUBSCRIPTIONCHECK_SCHEDULE_7, () => expiredSubscriptions(7));

    //return for later reference
    return {subscriptionCheck2, subscriptionCheck7};

};