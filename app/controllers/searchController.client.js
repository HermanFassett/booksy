(function () {
   var goingButton = $('.btn-going');
   var goingText = $('.txt-going');
   var goingHidden = $(".hidden-going");
   var apiUrl = window.location.href;

   function updateGoing(data) {
     var going = JSON.parse(data);
     if (going === "/login") window.location = going;
     else $(goingText[going.index]).text(going.amount + " people going");
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateGoing));
   if (goingButton) {
     for (var i = 0; i < goingButton.length; i++) {
       var button = goingButton[i] // Button, index, id
       $(button).attr("index", i);
       $(button).click(function() {
         var index = parseInt($(this).attr("index"));
         var id = $(goingHidden[index]).val();
         ajaxFunctions.ajaxRequest('POST', apiUrl + "/" + index + "/" + id, function () {
            ajaxFunctions.ajaxRequest('GET', apiUrl + "/" + index + "/" + id, updateGoing);
         });
       });
     }
   }
})();
