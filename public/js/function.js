// That logo biggering effect
let switchList = [".lg-logo-back", ".lg-logo", ".logo"];
switchList.forEach((s) => {
    $(s).on("click", (e) => {
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
                if (window.location.href != "/me") {
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

    const searchParams = new URLSearchParams(window.location.search);

    // Set or update the 'page' parameter
    searchParams.set("page", page);

    // Get the updated search string
    const updatedSearchString = searchParams.toString();

    // Update the window location with the new search string
    window.location.search = updatedSearchString;
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

        if ($(caret).hasClass("right")) {
            page = (await $(".selected-page").text()) - 1 + 1; // current page + 1 -1 +1(for next page)
        } else {
            page = (await $(".selected-page").text()) - 2; // page before previous page
        }

        const searchParams = new URLSearchParams(window.location.search);

        // Set or update the 'page' parameter
        searchParams.set("page", page);

        // Get the updated search string
        const updatedSearchString = searchParams.toString();

        // Update the window location with the new search string
        window.location.search = updatedSearchString;
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

$(".star").hover(
    function () {
        let id = $(this).attr("id"); // Get the ID of the hovered element
        id = id.slice(1);
        //  
        for (let i = 1; i <= id; i++) {
            const element = `#s${i}.star`;
            //  
            if (
                $(element).length > 0 &&
                !$(element + " label").hasClass("fas")
            ) {
                //  
                //  
                $(element + " label").addClass("fas checked");
            }
        }
    },
    function () {
        let id = $(this).attr("id"); // Get the ID of the hovered element
        id = id.slice(1);
        //  
        for (let i = 1; i <= id; i++) {
            const element = `#s${i}.star`;
            //  
            if (
                $(element).length > 0 &&
                $(element + " label").hasClass("fas")
            ) {
                //  
                //  
                if (!$(element + " label").hasClass("selected")) {
                     
                    $(element + " label").removeClass("fas checked");
                }
            }
        }
    }
);

$(".star").on("click", function () {
    let id = $(this).attr("id"); // Get the ID of the hovered element
    id = id.slice(1);
    for (let i = 1; i <= id; i++) {
        const element = `#s${i}.star`;
        if ($(element).length > 0) {
            $(element + " label").addClass("fas selected");
        }
    }
     
    for(let i = parseInt(id) + 1; i <= 5; i++){
         
        const element = `#s${i}.star`;
        $(element + " label").removeClass("fas selected");
    }
});


$(".arrow").on("click", () => {
    parent.history.back()
})