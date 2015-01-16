class EventHandler
  constructor: (world) ->
    $("#chess-board").click (e) ->
      clicked_point = {x: e.offsetX, y:e.offsetY}
      pos = world.board.point2pos(clicked_point)
      world.select pos
