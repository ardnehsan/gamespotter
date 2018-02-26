$(document).ready(function(){

// Grab the articles as a json
$("#scraper").off().on("click", function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function(info){
    console.log(info);
    alert("RECOMPILING");
    location.reload();
  })
})

  //Displays articles from JSON data
  $.getJSON("/articles", function (data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<button class='ArticleRes btn btn-primary' data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</button>");
  }
});

//Onclick event for article
$(document).on("click", ".ArticleRes", function() {
  $("#articleDelete").empty();
  $("#Comments").empty();
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    //This will add the Comment info to the specified article
    .then(function(data) {
      console.log(data);
      $("#Comments").append("<h2>" + data.title + "</h2>");
      $("#Comments").append("<input id='titleinput' name='title' >");
      $("#Comments").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#Comments").append("<button data-id='" + data._id + "' id='saveComment'>Save Comment</button>");
      $("#Comments").append("<button data-id='" + data._id + "' id='deleteComment'>Delete Comment</button>");
      $("#articleDelete").append("<button data-id='" + data._id + "'id='deleteArticle'>Delete Article</button>")



      if (data.Comment) {
        $("#titleinput").val(data.Comment.title);
        $("#bodyinput").val(data.Comment.body);
      }
    });
});


function clearContents() {
  $("#titleinput").val("");
  $("#bodyinput").val("");
  location.reload();
}

$(document).on("click", "#deleteArticle", function(){
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the Comment, using what's entered in the inputs
    $.ajax({
      method: "DELETE",
      url: "/articles/remove/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function (data) {
     clearContents();
      });
  });

// When you click the saveComment button
$(document).on("click", "#saveComment", function() {
  var thisId = $(this).attr("data-id");

  // Run a POST request to update the comments
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function(data) {
      console.log(data);
      $("#Comments").empty();
    });

    clearContents();
});

$(document).on("click", "#deleteComment", function () {
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the Comment
  $.ajax({
    method: "DELETE",
    url: "/articles/removeComment/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function (data) {
      $("#Comments").empty();
    });

    clearContents();
});

});