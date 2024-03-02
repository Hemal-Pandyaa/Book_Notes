let switchList = ['.lg-logo-back', '.lg-logo', '.logo']

switchList.forEach((s) => {
$(s).on('click', (e) => {
    console.log("clicked")
    $(".lg-logo-back").toggleClass('disabled');
    $(".lg-logo").toggleClass('disabled');
})
});

