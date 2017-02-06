var path = require('path');
var server = require('markdown-serve');
var config = require('../config');

exports.handler = (req, res, next) => {
    if (req.method !== 'GET' || req.path.substr(0, 9) !== '/helpdesk') {
        next();
    }

    var markdownServer = new server.MarkdownServer(path.resolve(config.root(), '..', 'content', 'helpdesk'));
    var file_path = req.path.replace(/helpdesk\/?/, '');
    console.log(`markdown parser ${file_path}`);

    markdownServer.get(file_path, function(err, markdownFile) {
        if (err) {
            console.log(err);
            next();   // just log error & pass it to next middleware
            return;
        }

        // limit access based on draft variable in front-matter
        if (markdownFile.meta.draft && !(req.isAuthenticated && req.user.isAdmin)) {
            next();
            return;
        }

        if (markdownFile.meta) {

            var view = markdownFile.meta.layout || 'member/helpdesk';
            res.render(view, {
                layout: 'layouts/member',
                title: config.site_title + ' - ' + markdownFile.meta.title,
                page: 'Helpdesk',
                home_url: config.baseUrl(),
                admin_url: config.baseUrl('admin'),
                data: {
                    member_id: req.user.id,
                    socket_token: '',
                    user: req.user
                },
                scripts: [],
                content: markdownFile.parseContent()
            });
        } else {
            // treat files with no front-matter / draft mode as non-existant
            next();
        }
    });
};