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
      $("#userid").prop("disabled", true); //wyłączenie input field userid
      $("#btApp").css("pointer-events", "none"); //wyłączenie przycisku pena
      $("#new").css("display", "none"); //schowanie przycisku nowy pokój
      $(".list-group").css("display", "none"); //ukrycie pokoi
      $("#tictactoe-board").css("display", "block"); //wyświetlenie planszy
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
      $("#userid").prop("disabled", true); //wyłączenie input field userid
      $("#btApp").css("pointer-events", "none"); //wyłączenie przycisku pena
      $("#new").css("display", "none"); //schowanie przycisku nowy pokój
      $(".list-group").css("display", "none"); //ukrycie pokoi
      $("#tictactoe-board").css("display", "block"); //wyświetlenie planszy
    });

    socket.on("user has left", (roomID) => {
      socket.emit("leaveRoom", {
        roomID: roomID,
        player: sesID,
        forced: true,
      });
    });   

    socket.on("gameStarted", (data) => {
      console.log("game started" + data.you);
      player = data.you;
      myTurn = data.turn == player ? true : false;
      console.log(player + " my turn " + myTurn);
    });

    socket.on("illegalMove", () => {
      console.log("illegal move");
      myTurn = true;
    })

    socket.on("moveMade", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("teraz kolej " + data.turn);
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      myTurn = data.turn == player;
    })

    socket.on("gameEnded", (data) => {
      console.log("wykonał ruch na pos " + data.pos);
      console.log("gra zakończona");
      if(data.turn == 2){
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      </svg>`);
      }
      else{
        $(`#${data.pos}`).append(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`);
      }
      //$('#gameEndedModal').modal("show", {backdrop: 'static', keyboard: false});
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
