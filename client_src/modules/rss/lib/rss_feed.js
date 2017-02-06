"use strict";

const config = require('../../../../app/config');
const _ = require('lodash');
const feed = require("feed-read");
const striptags = require('striptags');
const crypto    = require('crypto');
const cache = {};
const ttl = ((config.rss.ttl || 5) * 60 * 1000);

function decodeHtmlEntity(str) {
    return str.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec);
    });
}

function getFeed(url, params) {
    return new Promise((resolve,  reject) => {
        feed(url, function(err, articles) {
            if (err) {
                reject(err);
            }
            resolve(articles.map(article => {
                article.content = striptags(article.content);
                if (params.max_length > 0) {
                    article.content = _.truncate(decodeHtmlEntity(article.content), {
                        'length': params.max_length,
                        'separator': ' '
                    });
                }
                return article;
            }));
        });

    });
}

module.exports = {
    getFeeds(providers, params) {
        let key  = crypto.createHash('md5')
            .update(JSON.stringify(providers) + params.max_length)
            .digest('hex');
        const limit = (params.count || 5), now = (new Date()).valueOf(), feeds = [];

        return new Promise((resolve,  reject) => {
            if (cache[key] && cache[key].time > (now - ttl)) {
                return resolve(cache[key].articles.slice(0, limit));
            }
            _.forIn(providers, provider => {
                if (provider.active && provider.url) {
                    feeds.push(getFeed(provider.url, params));
                }
            });
            Promise.all(feeds).then(results => {
                let articles = results.reduce((articles, result) => {
                    return articles.concat(result);
                }, []).sort((a, b) => {
                    if (a.published === b.published) {
                        return 0;
                    }
                    return a.published <= b.published ? 1 : -1;
                });
                cache[key] = {
                    time: now,
                    articles
                };
                resolve(articles.slice(0, limit));
            }, err => reject(err));
        });
    }
};

