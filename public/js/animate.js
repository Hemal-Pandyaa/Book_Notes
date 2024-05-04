$(".edit").on({
    mouseenter: function () {
        $(".edit img").addClass("animate")
    },
    mouseleave: function () {
        $(".edit img").removeClass("animate")
    }
});

let lastScroll = $(window).scrollTop()
;
$(window).on("scroll", () => {
    const currentScroll = $(window).scrollTop();

    if(currentScroll > lastScroll && !$("header").hasClass("hide") && (currentScroll - lastScroll) > 30){
        $("header").addClass("hide");
    }
    if(currentScroll < lastScroll && $("header").hasClass("hide")){
        $("header").removeClass("hide");
    }

    lastScroll = currentScroll
})