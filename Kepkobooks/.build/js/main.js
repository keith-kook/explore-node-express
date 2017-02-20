$(document).ready(function() {
    $('.removeBook').click(function(e){
        deleteId = $(this).data('id');
        $.ajax({
            url:'/manage/books/delete/'+deleteId,
            type: 'DELETE',
            success: function() {

            }
        });
        window.location = 'books';
    });
    
    $('.removeCategory').click(function(e){
        deleteId = $(this).data('id');
        $.ajax({
            url:'/manage/categories/delete/'+deleteId,
            type: 'DELETE',
            success: function() {

            }
        });
        window.location = 'categories';
    });
});
