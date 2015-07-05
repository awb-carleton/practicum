/**
 * Created by Varun on 4/28/2015.
 *
 * @whitab on 7/4/2015 --  I think we can get rid of this file and just use the bootstrap nav.
 *                         Keeping it around until everything shakes out with the nav.
 */
$(document).ready(function() {
     "use strict";
    var filepath = "../"
    $(".topnavContainer").append("<div id='cssmenu' class='container-fluid'>");
    $(".container-fluid").append("<ul id='navlinks' class='topnav'>");

    $("#navlinks").append("<li id='home_icon' class='active'>");
    $("#navlinks").append("<li id='expressions' class='active'>");
    $("#navlinks").append("<li id='ifelse' class='active'>");
    $("#navlinks").append("<li id='arraymystery' class='active'>");

    $("#home_icon").append("<a href='../index.html' class='topnav_home' title='Home'>&nbsp;</a>");

    $("#expressions").append("<a href='#' title='Expressions'>Expressions</a>");
    $("#ifelse").append("<a href='#' title='If/Else'>If/Else</a>");
    $("#arraymystery").append("<a href='#'  title='Array Mystery'>Array Mystery</a>");

    $("#expressions").append("<ul id='expressionproblems'>");
    $("#expressionproblems").append("<li><a class='topnav_expressions' title='Problem 1'>Problem 1</a></li>");
    $(".topnav_expressions").attr("href", filepath + "expressions/index.html");

    $("#ifelse").append("<ul id='ifelseproblems'>");
    $("#ifelseproblems").append("<li><a class='topnav_ifelse' title='Problem 1'>Problem 1</a></li>");
    $(".topnav_ifelse").attr("href", filepath + "if_else/index.html");

    $("#arraymystery").append("<ul id='arrayproblems'>");
    $("#arrayproblems").append("<li><a class='topnav_array' title='Problem 1'>Problem 1</a></li>");
    $(".topnav_array").attr("href", filepath + "arrayMystery/index.html");
});
(function($) {

    $.fn.menumaker = function(options) {

        var cssmenu = $(this), settings = $.extend({
            title: "Menu",
            format: "dropdown",
            sticky: false
        }, options);

        return this.each(function() {
            cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
            $(this).find("#menu-button").on('click', function(){
                $(this).toggleClass('menu-opened');
                var mainmenu = $(this).next('ul');
                if (mainmenu.hasClass('open')) {
                    mainmenu.hide().removeClass('open');
                }
                else {
                    mainmenu.show().addClass('open');
                    if (settings.format === "dropdown") {
                        mainmenu.find('ul').show();
                    }
                }
            });

            cssmenu.find('li ul').parent().addClass('has-sub');

            multiTg = function() {
                cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
                cssmenu.find('.submenu-button').on('click', function() {
                    $(this).toggleClass('submenu-opened');
                    if ($(this).siblings('ul').hasClass('open')) {
                        $(this).siblings('ul').removeClass('open').hide();
                    }
                    else {
                        $(this).siblings('ul').addClass('open').show();
                    }
                });
            };

            if (settings.format === 'multitoggle') multiTg();
            else cssmenu.addClass('dropdown');

            if (settings.sticky === true) cssmenu.css('position', 'fixed');

            resizeFix = function() {
                if ($( window ).width() > 768) {
                    cssmenu.find('ul').show();
                }

                if ($(window).width() <= 768) {
                    cssmenu.find('ul').hide().removeClass('open');
                }
            };
            resizeFix();
            return $(window).on('resize', resizeFix);

        });
    };
})(jQuery);

(function($){
    $(document).ready(function(){

        $("#cssmenu").menumaker({
            title: "Menu",
            format: "multitoggle"
        });

    });
})(jQuery);
