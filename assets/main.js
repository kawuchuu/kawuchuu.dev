---
---
$(function($) {
    var smoothstate = $('#smoothstate').smoothState({
        onStart: {
            duration: 250,
            render: function() {
                if (isNavOpen == true) {
                    navClose();
                    setTimeout(() => {
                        $('#smoothstate').removeClass('loader-out');
                        $('#smoothstate').addClass('loader-in');    
                    }, 150);
                } else {
                    $('#smoothstate').removeClass('loader-out');
                    $('#smoothstate').addClass('loader-in');    
                }
            }
        },
        onReady: {
            duration: 250,
            render: function(i, $newContent) {
                $('#smoothstate').html($newContent)
                $('#smoothstate').removeClass('loader-in');
                $('#smoothstate').addClass('loader-out');
            }
        },
        prefetch: true,
        blacklist: '.no-smoothstate'
    })
});