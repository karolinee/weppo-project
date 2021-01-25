(function () {
  var socket = io();

  console.log("started");

  $(document).ready(function () {
    var sesID = JSON.parse($("#sesid").text());
    var name = JSON.parse($("#nick").text());
    $("#new").on("click", function () {
      console.log("new room button");
      $("#variableJSON").remove();
      console.log(name);
      socket.emit("createRoom", { name: name, sesID: sesID });
    });
    $("button[data-roomID]").on("click", (event) => {
      console.log("joining room");
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: sesID,
        name: name,
      });
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
