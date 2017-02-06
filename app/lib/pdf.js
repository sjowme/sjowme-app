const pdf = require('html-pdf');
const config = require('../config');
const path = require('path');
const ejs = require('ejs');
const phantomjs = require('phantomjs-prebuilt');

const pdf_config = {

    // Export options
    directory: "/tmp",       // The directory the file gets written into if not using .toFile(filename, callback). default: '/tmp'

    // Papersize Options: http://phantomjs.org/api/webpage/property/paper-size.html
    format: "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
    orientation: "portrait", // portrait or landscape

    // Page options
    border: "0",             // default is 0, units: mm, cm, in, px
    footer: {
        "height": "28mm",
        "contents": {
            first: `<div class="uk-text-center">
    <h2 class="uk-text-muted ">sjow<span class="uk-text-primary">.</span>me</h2>
    <h5>Bankrek. NL36 ABNA 04575 5885 84 | KvK 66984319 | BTW nr 856781629B01 | finance@sjow.me</h5>
</div>`,
          default: '<span class="uk-text-muted">{{page}}/{{pages}}</span>'
        }
    },
    base: `file:///${config.public()}`, // Base path that's used to load files (images, css, js) when they aren't referenced using a host

    // File options
    type: "pdf",             // allowed file types: png, jpeg, pdf
    quality: 75,           // only used for types png & jpeg

    // Script options
    phantomPath: phantomjs.path, // PhantomJS binary which should get downloaded automatically
    phantomArgs: [], // array of strings used as phantomjs args e.g. ["--ignore-ssl-errors=yes"]
    //"script": '/url',           // Absolute path to a custom phantomjs script, use the file in lib/scripts as example
    timeout: 30000,           // Timeout that will cancel phantomjs, in milliseconds

    // HTTP Headers that are used for requests
    httpHeaders: {
        // e.g.
        Authorization: "Bearer ACEFAD8C-4B4D-4042-AB30-6C735F5BAC8B"
    }

};

function invoiceHtml(invoice) {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(config.views(), 'pdf', 'invoice.ejs'), {
            invoice,
            locale_code: 'nl-NL',
            base_url: config.baseUrl('member')
        }, (err, body) => {
            if (err) {
                return reject(err);
            }
            resolve(body);
        });
    });

}

module.exports = {
    invoiceStream(invoice) {
        return invoiceHtml(invoice)
            .then(html => {
                return new Promise((resolve, reject) => {
                    pdf.create(html, pdf_config).toStream((err, stream) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(stream);
                    });
                });
            });

    }
};

