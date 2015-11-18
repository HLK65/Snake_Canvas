var konami = [38,38,40,40,37,39,37,39,66,65]; //up, up, down, down, left, right, left, right, b, a
var input = [];
$(document).on('keydown', function(e) {
    var key = e.which;
    input.push(key);
    if (input.toString() === konami.toString()) {
        startSnake(); //start snake game
        input = [];
    } else if (input.length >= konami.length) {
        input.splice(0,1);
    }
});