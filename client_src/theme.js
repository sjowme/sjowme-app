jQuery($ => {
    $('[href="http://www.bixie.nl"]').bind("contextmenu", function () {
        (function () {
            var s = document.createElement('style');
            s.innerHTML = '@-webkit-keyframes roll {from { -webkit-transform: rotate(0deg) } to { -webkit-transform: rotate(360deg) }}' +
                ' @-moz-keyframes roll { from { -moz-transform: rotate(0deg) } to { -moz-transform: rotate(360deg) }}' +
                ' @keyframes roll {from { transform: rotate(0deg) } to { transform: rotate(360deg) }}' +
                ' body { -moz-animation-name: roll; -moz-animation-duration: 4s; -moz-animation-iteration-count: 1; ' +
                '-webkit-animation-name: roll; -webkit-animation-duration: 4s; -webkit-animation-iteration-count: 1;}';
            document.getElementsByTagName('head')[0].appendChild(s);
        }());
        return false;
    });
});
