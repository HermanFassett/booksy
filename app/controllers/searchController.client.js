(function () {
   var goingButton = $('.btn-going');
   var goingText = $('.txt-going');
   var goingHidden = $(".hidden-going");
   var apiUrl = window.location.href;
   $("#spinner").hide();
   function updateGoing(data) {
     console.log(data);
     var going = JSON.parse(data);
     console.log(going);
     if (going === "/login") window.location = going;
     else $(goingText[going.index]).text(going.amount + " people going");
     $.getJSON("/active/" + going.index + "/" + $(goingHidden[going.index]).val(), function(data) {
       $("#spinner").show();
       if (data.result) {
         $(goingButton[going.index]).val("I'm NOT going");
         $(goingButton[going.index]).removeClass("btn-default").addClass("btn-warning");
       }
       else {
         $(goingButton[going.index]).val("I'm Going!");
         $(goingButton[going.index]).removeClass("btn-warning").addClass("btn-default");
       }
       $("#spinner").hide();
     });
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateGoing));
   if (goingButton.length > 0) {
     $("#spinner").show();
     for (var i = 0; i < goingButton.length; i++) {
       var button = goingButton[i] // Button, index, id
       $.getJSON("/active/" + i + "/" + $(goingHidden[i]).val(), function(data) {
         $("#spinner").show();
         if (data.result) {
            $(goingButton[data.index]).val("I'm NOT going");
            $(goingButton[data.index]).removeClass("btn-default").addClass("btn-warning");
          }
          $("#spinner").hide();
       });
       $(button).attr("index", i);
       $(button).click(function() {
         $("#spinner").show();
         var index = parseInt($(this).attr("index"));
         var id = $(goingHidden[index]).val(), amount = ($(goingButton[index]).val().match(/not/i)) ? -1 : 1;
         ajaxFunctions.ajaxRequest('POST', apiUrl + "/" + index + "/" + id + "/" + amount, function () {
            ajaxFunctions.ajaxRequest('GET', apiUrl + "/" + index + "/" + id, updateGoing);
         });
       });
     }
   }
})();
