$(document).ready(function(){
    var $grid = $('.hero-grid').isotope({
        itemSelector: '.hero-wrap',
        getSortData: {
            name: '.hero-name',
            strong: '.votes',
            weak: '.votes',
            nameReverse: '.hero-name'
        },
        sortAscending: {
            name: true,
            strong: false,
            weak: true,
            nameReverse: false
        }
    });

    $('.sort-by-btn-group').on('click', 'button', function(){
        var sortValue = $(this).attr('data-sort-value');
        $grid.isotope({sortBy: sortValue});
    });

    $('.btn-group').each( function( i, buttonGroup){
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function() {
            $buttonGroup.find('.btn-primary').addClass('btn-default');
            $buttonGroup.find('.btn-primary').removeClass('btn-primary');
            $(this).addClass('btn-primary');
        });
    });
});