// That logo biggering effect
let switchList = [".lg-logo-back", ".lg-logo", ".logo"];
switchList.forEach((s) => {
    $(s).on("click", (e) => {
        console.log("clicked");
        $(".lg-logo-back").toggleClass("disabled");
        $(".lg-logo").toggleClass("disabled");
    });
});

// Making drop down add adding its functinallity
$(".drop-down").each(function (index, dropdown) {
    $(dropdown)
        .find("label")
        .each((Index, label) => {
            $(label).on("click", () => {
                $(dropdown)
                    .find("label")
                    .each((Index, label) => {
                        $(label).removeClass("active");
                    });
                $(label).addClass("active");

                const radioId = $(label).attr("for");
                $("#" + radioId).prop("checked", true);
                if (!window.location.href == "/me") {
                    label.closest("form").submit();
                }
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

// Make page change option working
$(".page").on("click", function () {
    const page = $(this).text() - 1;
    console.log(page);

    const searchParams = new URLSearchParams(window.location.search);

    // Set or update the 'page' parameter
    searchParams.set("page", page);

    // Get the updated search string
    const updatedSearchString = searchParams.toString();

    // Update the window location with the new search string
    window.location.search = updatedSearchString;

    // Log the updated search string
    console.log(updatedSearchString);
});

$(".page").each((index, page) => {
    if ($(page).text() == 1) {
        if ($(page).hasClass("selected-page")) {
            $(".change-page .left").addClass("disabled");
        }
    }
    if (index == $(".page").length - 1) {
        if ($(page).hasClass("selected-page")) {
            $(".change-page .right").addClass("disabled");
            return false;
        }
    }
});

if ($(".page").length == 0) {
    $(".change-page .left").addClass("disabled");
    $(".change-page .right").addClass("disabled");
}

$(window).keydown(function (event) {
    if (event.keyCode == 13 && window.location.pathname !== "/") {
        event.preventDefault();
        return false;
    }
});
$(["#retype-password", "#password"]).each((index, password) => {
    $(password).on("keyup", (e) => {
        const retypeText = $("#retype-password").val();
        const password = $("#password").val();
        console.log(password, retypeText);
        console.log(retypeText);
        if (retypeText !== "" && password !== "") {
            if (retypeText === password) {
                $(".message").text("");
            } else {
                $(".message").text("Passowrd dosen't message");
            }
        }
    });
});

$(".close-button").on("click", (e) => {
    $(".notification").addClass("disabled");
});

$(".caret").each(async (Index, caret) => {
    $(caret).on("click", async () => {
        let page;
        console.log($(".selected-page").text());
        if ($(caret).hasClass("right")) {
            console.log("right");
            page = (await $(".selected-page").text()) - 1 + 1; // current page + 1 -1 +1(for next page)
        } else {
            page = (await $(".selected-page").text()) - 2; // page before previous page
        }

        console.log(page);
        const searchParams = new URLSearchParams(window.location.search);

        // Set or update the 'page' parameter
        searchParams.set("page", page);

        // Get the updated search string
        const updatedSearchString = searchParams.toString();

        // Update the window location with the new search string
        window.location.search = updatedSearchString;

        // Log the updated search string
        console.log(updatedSearchString);
    });
});

$(".edit").on("click", () => {
    $(".edit-box-wrapper").removeClass("disabled");
    $(".edit-box").removeClass("disabled");
});

$(".edit-box-wrapper-close").on("click", () => {
    $(".edit-box-wrapper").addClass("disabled");
    $(".edit-box").addClass("disabled");
});
