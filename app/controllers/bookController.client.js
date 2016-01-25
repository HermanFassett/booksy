(function () {
  var apiUrl = window.location.href;
  $("#spinner").hide();
  function update(data) {
    var going = JSON.parse(data);
    if (going === "/login") window.location = going;
  }
  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, update));
})();
