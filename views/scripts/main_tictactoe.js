(function () {
  var socket = io("/tictactoe");

  console.log("started");

  $(document).ready(function () {
    var sesID = JSON.parse($("#sesid").text());
    var name = JSON.parse($("#nick").text());
    var myRoom = sesID;
    var myTurn = false;
    var player;

    $("#new").on("click", () => {
      console.log("new tictactoe room");
      socket.emit("createRoom",{name: name, sesID: sesID} );
      $("#buttonsToHide").css("visibility", "hidden");
      $(".list-group").css("display", "none"); //ukrycie pokoi
      $("#buttonNickChange").css("visibility", "hidden");
      $("#tictactoe-board").css("display", "block"); //wyświetlenie planszy
      $("#upperLabel").text("Waiting for second player...");
    })

    $("button[data-roomID]").on("click", (event) => {
      console.log("joining room");
      socket.emit("joinRoom", {
        roomID: $(event.target).data("roomid"),
        player: sesID,
        name: name,
      });
      myRoom = $(event.target).data("roomid");
      $(".list-group").css("display", "none");
      $("#buttonNickChange").css("visibility", "hidden");
      $("#buttonsToHide").css("visibility", "hidden");
      $("#tictactoe-board").css("display", "block"); //wyświetlenie planszy

    });

    socket.on("user has left", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: sesID,
        forced: true,
      });
      if (!$('#gameEndedModal').hasClass('show')) {
        $('#gameEndedModal .modal-body').text("Oh no, your opponent has left the game!");
        $('#gameEndedModal').modal("show");
      }
      
    });   

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player = data.you;
      myTurn = data.turn == player ? true : false;
      console.log(player + " my turn " + myTurn);
      let text = "";
      if(myTurn) text = "Make your move";
      else text="Waiting for opponent move...";
      $("#upperLabel").text(text);
    });

    socket.on("illegalMove", () => {
      console.log("illegal move");
      myTurn = true;
    })

    socket.on("moveMade", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("teraz kolej " + data.turn);
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      $(`#${data.pos}`).removeClass("has-hover");
      myTurn = data.turn == player;
      if(myTurn) text = "Make your move";
      else text="Waiting for opponent move...";
      $("#upperLabel").text(text);
    })

    socket.on("gameEnded", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("gra zakończona");
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      $(`#${data.pos}`).removeClass("has-hover");
      console.log("end " + data.end);
      let text = "";
      if(data.won == 0) text="It's a draw!";
      else if(data.turn == player) text="Oh no, you've lost. Better luck next time!";
      else text = "Congratulations! You've won!"
      $('#gameEndedModal .modal-body').text(text);
      $('#gameEndedModal').modal("show");
    })


    $(".tictactoe-box").on("click", (event) => {
      if(myTurn){
        myTurn = false;
        socket.emit("madeTurn", {
          roomID: myRoom,
          pos: event.target.id,
        })
      }
    })

    
    
  });
})();
