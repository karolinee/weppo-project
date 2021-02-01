(function () {
  var socket = io();

  $(document).ready(function () {
    var sesID = JSON.parse($("#sesid").text());
    var name = JSON.parse($("#nick").text());
    $("#new").on("click", function () {
      $("#variableJSON").remove();
      socket.emit("createRoom", { name: name, sesID: sesID });
    });
    $("button[data-roomID]").on("click", (event) => {
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: sesID,
        name: name,
      });
      $(".list-group").css("display", "none");
    });

    socket.on("user has left", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: sesID,
        forced: true,
      });
    });
  });
})();
