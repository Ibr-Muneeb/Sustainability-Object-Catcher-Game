$(document).ready(function () {

    var pane = $('#pane'),
        box = $('#catcher'),
        w = pane.width() - box.width(),
        d = {},
        x = 5;

    function newv(v, a, b) {
        var n = parseInt(v, 10) - (d[a] ? x : 0) + (d[b] ? x : 0);
        return n < 0 ? 0 : n > w ? w : n;
    }

    $(window).keydown(function (e) {
        d[e.which] = true;
    });

    $(window).keyup(function (e) {
        d[e.which] = false;
    });

    setInterval(function () {
        box.css({
            left: function (i, v) {
                return newv(v, 37, 39);
            }
        });
    }, 20);

});
