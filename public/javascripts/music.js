/**
 * Created by nicksempere on 11/28/16.
 */

SC.initialize({
    client_id: "CLIENT_ID_HERE"
});

SC.oEmbed('https://soundcloud.com/username/shincks', {maxheight: 200, auto_play: false}, function(res) {
    $("#player").html(res.html);
});