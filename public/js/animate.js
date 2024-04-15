console.log("hello")
$(".edit").on({
    mouseenter: function () {
        $(".edit img").addClass("animate")
    },
    mouseleave: function () {
        $(".edit img").removeClass("animate")
    }
});