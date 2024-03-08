let switchList = [".lg-logo-back", ".lg-logo", ".logo"];

switchList.forEach((s) => {
    $(s).on("click", (e) => {
        console.log("clicked");
        $(".lg-logo-back").toggleClass("disabled");
        $(".lg-logo").toggleClass("disabled");
    });
});

$(".drop-down").each(function (index, dropdown) {
    $(dropdown).find("label").each((Index, label) => {
        $(label).on("click", () => {
            $(dropdown).find("label").each((Index, label) => {
                $(label).removeClass("active");
            });
            $(label).addClass("active");
        });
    });

    $(dropdown).on("click", function (e) {
        $(".drop-down").each(function (Index, Dropdown) {
            if (index != Index) {
                $(Dropdown).removeClass("open");
            }
        });
        $(this).toggleClass("open");
    });
});
