var _shift = false;
_text1 = "text1";
_text2 = "text2";
_up = "up";
_down = "down";
var _target = _text1;
let process = function (e) {
    var id= e.target.id;
    var code = e.keyCode ? e.keyCode : e.which;
    var IS_ENTER_KEY = _shift && code === 13;
    console.log(`code: ${code}`);
    if (IS_ENTER_KEY || id === _up || id === _down) {
        translate(e,id);
    } else if (code === 16) {
        // up on shift
        _shift = false;
    }
};
let shiftFunc = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 16) {
        // down on shift
        _shift = true;
    }
};
let tabFunc = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    console.log(`tabFunc code: ${code}`);
    let tag = e.target.tagName;
    let id = e.target.id;
    if (code === 9) {
        e.preventDefault();
        if (_target === _text1) {
            _target = _text2;
        } else {
            _target = _text1;
        }
        $(`#${_target}`).focus();
        return true;
    }
};
$(document).ready(function() {
    $('textarea').keydown(shiftFunc);
    $('textarea').keyup(process);
    $(window).keyup(tabFunc);
    $('button').on('click',process);
    $(`#${_text1}`).focus();
    _target = _text1;
});
function translate(e, input) {
    e.preventDefault();
    console.log(`id: ${input}`);
    // shift + etner

    // get text
    var notButton = false;
    var from = "#";
    if (input === _up || input === _text2) {
        from += _text2;
    } else if (input === _down || input === _text1) {
        from += _text1;
    } else {
        from += _text1;
        notButton = true;
    }

    console.log(`from: ${from}`);
    let text = $(from).val() || "${empty}";
    if (text === "${empty}") {
        console.log(`was empty`);
        return;
    }
    if (notButton) {
        // chop off unwanted new line character user typed in
        $(this).val(text.substring(0,text.length - 1));
    }
    // set target to translate to
    var target = '#';
    if (from.indexOf(_text1) === 1) {
        target += _text2;
    } else {
        target += _text1;
    }

    console.log(`target: ${target}`);
    let data = {"words": text};
    $.ajax({
        url: "/",
        dataType: "text",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(data),
        processData: false,
        success: (response, textStatus, jQxhr) => {
            console.log(response,textStatus,jQxhr);
            $(target).val(response);
        },
        error: (jqXhr, textStatus, errorThrown) => {
            console.error(jqXhr, textStatus, errorThrown);
            $(target).val("error: ", errorThrown);
        }
    });
    return false;
}