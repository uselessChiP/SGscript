// ==UserScript==
// @name         SteamGift filter
// @namespace    http://your.homepage/
// @version      0.1
// @description  filter games that costs less or 10 points
// @author       You
// @match        http://www.steamgifts.com/
// @grant        GM_addStyle
// ==/UserScript==

var LAST_LOADED_PAGE = 1;

GM_addStyle('.giveaway__row-outer-wrap {\
position: relative;\
width: 274px;\
float: left;\
display: block;\
margin: 5px 10px;\
padding: 0;\
border: 0;\
border-radius: 0;\
border: 1px solid lightgrey !important;\
} \
.giveaway__summary {\
background-color: white;\
margin-right: -3px !important;\
z-index: 10;\
border: 1px solid lightgrey;\
border-right: 0;\
height: 79px;\
border-left: 0;\
} \
.giveaway__columns > div {\
padding: 0;\
border: 0;\
margin: 0 !important;\
} \
.giveaway__summary .giveaway__heading {\
display: block;\
text-align: center;\
width: 100%;\
padding: 7px 0 11px 0;\
} \
.giveaway__heading__thin {\
display: block;\
} \
.giveaway__columns > div {\
line-height: 1;\
text-align: center;\
} \
.giveaway__column--contributor-level {\
position: absolute;\
width: 30px;\
border-radius: 100%;\
height: 30px;\
top: -13px;\
left: 254px;\
border: 1px solid #C2DCA9 !important;\
text-align: center;\
line-height: 29px !important;\
} \
.giveaway__row-outer-wrap:not(:last-child) {\
border: 0 !important;\
} \
.effect {\
transition: all 0.1s ease-in-out;\
}\
.effect.up\
{\
box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23) !important;\
} \
.effect.down {\
box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24) !important;\
} \
.global__image-outer-wrap.global__image-outer-wrap--game-medium {\
border-radius: 0;\
border-right: 0;\
} \
.fadein, .fadeout {\
opacity: 0;\
transition: opacity .4s ease-in-out;\
} \
.fadein {\
opacity:1;\
}');

$('document').ready(function(){
    filterGas($( ".giveaway__row-outer-wrap" ));
    init();
    formatGAsList($( ".giveaway__row-outer-wrap" ));
});

function init() {
    //change the page selection links with a more button
    $('.pagination')
    .empty()
    .append('<a onClick="" id="moreBtn" class="page__heading__button page__heading__button--green" style="width: 90%; text-align: center; padding: 7px">More</a>')
    .append('<a class="page__heading__button page__heading__button--green" style="width: 10%; text-align: center; padding: 7px" href=#>up</a>').css('margin-top','15px');

    $('#moreBtn').on('click', loadGas).css( 'cursor', 'pointer' );
    $('.pagination').css({'float': 'left', 'width':'100%'});
    $('.giveaway__row-outer-wrap').parent().css({'float': 'left', 'width':'100%', 'margin-top':'15px'});
    $('.widget-container .widget-container--margin-top').css({'float': 'left', 'width':'100%'});

    $('.giveaway__row-outer-wrap').parent().addClass('gasList');
    $('.giveaway__row-outer-wrap').wrapAll('<div id="pg1" />');
}

function formatGAsList($list) {
    $.each($list, function() {
        var innerWrap =  $(this).children().eq(0); 
        var isFaded = innerWrap.hasClass('is-faded');

        $(this).find( ".giveaway__heading__name, .global__image-outer-wrap--avatar-small, .giveaway__links, .giveaway__column--width-fill, a.giveaway__column--group" ).hide();

        $(this).find('.giveaway__heading').each(function() {
            $(this).children().eq(1).appendTo($(this)); 
        });

        //remove the word Level from the contributor level tag
        $(this).find('.giveaway__column--contributor-level').html(function() {
            return $(this).html().match(/\d/g) + '+';
        })

        //add raise effect
        $(this).addClass('effect down');
        $(this).on('mouseenter', function() {
            $(this).removeClass('down').addClass('up'); 
        }).on('mouseleave', function() {
            $(this).removeClass('up').addClass('down'); 
        });

        //data below the GA card
        $(this).find('.giveaway__links').css({'width':'244px','display':'block','padding':'17px 15px', 'padding-bottom':'0', 'margin':'-1px','text-align':'center'});
        $(this).find('.giveaway__links').children('a').eq(0).css({'float':'left','margin':'0'});
        $(this).find('.giveaway__links').children('a').eq(1).css({'float':'right','margin':'0'});
        $(this).find('.giveaway__links').append('<div class="enterGA" style="width:50px;margin: 0 auto;"><i class="fa fa-' + (isFaded ? 'minus' : 'plus') + '-circle" style="color:' + (isFaded ? '#da5d88':'rgba(63,115,0,0.95)') + '; text-shadow:none;"></i></div>');
        $(this).css({'padding-bottom':'25px'});

        //enter GA
        var code =  $(this).find('a.global__image-outer-wrap--game-medium').attr('href').split('/')[2];
        var formData = {
            "code": code,
            //"do": isFaded ? "entry_delete" : "entry_insert",
            "xsrf_token": "2fae24d08363cc8da10dc6028eceb776"
        };
        $(this).find('.enterGA').on('click', function() {   
            var icon = $(this).find('i');
            isFaded = innerWrap.hasClass('is-faded');
            formData.do = isFaded ? "entry_delete" : "entry_insert",
                $.ajax({
                    url: "http://www.steamgifts.com/ajax.php",
                    type: "POST",
                    dataType: "json",
                    data: formData,
                }).done(function() {
                if(isFaded) {
                    innerWrap.removeClass('is-faded');
                    icon.removeClass('fa-minus-circle').addClass('fa-plus-circle').css('color', 'rgba(63,115,0,0.95)');
                } else {
                    innerWrap.addClass('is-faded');
                    icon.removeClass('fa-plus-circle').addClass('fa-minus-circle').css('color', '#da5d88');
                }
                isFaded = !isFaded;
            })
            .fail(function() {
                console.log('Error.');
            })
        });
    });
};

function loadGas() {
    $.ajax({
        url: 'http://www.steamgifts.com/giveaways/search?page=' + (++LAST_LOADED_PAGE),
        context: document.body
    }).done(function(data) {
        var $elems = filterGas($(data).find(".giveaway__row-outer-wrap" ).trigger('click'));
        addGas($elems);
        console.log(LAST_LOADED_PAGE);
    });
}

function filterGas($elements) {
    var gas = $elements;
    gas = $.grep(gas, function(elem) {
        var ptText =  $(elem).find('.giveaway__heading__thin').html();
        var pt = ptText.match(/\d/g).join("");
        if(pt <= 10) {
            $(elem).remove();
            return false;
        }
        return true;
    });
    return gas;
}

function addGas($elements) {
    $('.gasList').append('<div style="width:100%;padding:15px;float:left;">PAGE '+ (LAST_LOADED_PAGE) +'</div>').append('<div id="pg'+LAST_LOADED_PAGE+'" class="fadeout"></div>');
    $('#pg'+LAST_LOADED_PAGE).append($elements);
    formatGAsList($elements);

    $('#pg'+LAST_LOADED_PAGE).removeClass('fadeout').addClass('fadein');


    //I don't know...just rewriting this code so the filter popup opens when clicked...
    $(".giveaway__hide").click(function() {
        $(".popup--hide-games input[name=game_id]").val($(this).attr("data-game-id")), $(".popup--hide-games .popup__heading__bold").text($(this).closest("h2").find(".giveaway__heading__name").text())
    });
    $(".trigger-popup").click(function() {
        $("." + $(this).attr("data-popup")).bPopup({
            opacity: .85,
            fadeSpeed: 200,
            followSpeed: 500,
            modalColor: "#3c424d"
        })
    });
}

