class Parser
  STATE_WAIT = 0
  STATE_READY = 1
  STATE_ILLEGAL_OPERATION = 2
  STATE_BOARD_UPDATED = 3
  STATE_OPPOENENT_ABORT = 4
  STATE_OPPOENENT_GIVEUP = 5
  STATE_GAMEOVER_WIN = 6
  STATE_GAMEOVER_LOSE = 7
  STATE_GAMEOVER_FOR_WATCHER = 8

  constructor: (world, status_bar) ->
    @world = world
    @status_bar = status_bar

  parse: (data) ->
    game_state = JSON.parse(data);
    console.log game_state.state
    if game_state.state == STATE_WAIT
      @status_bar.render("waiting for another player", "warning")
      return

    if game_state.state == STATE_READY
      @status_bar.render("opponent found, game start!", "info")
      @world.init_units(game_state.boardInfo)
      @world.render()
      return

    if game_state.state == STATE_BOARD_UPDATED
      @world.init_units(game_state.boardInfo)
      @world.render()
      if game_state.boardInfo.movable
        @status_bar.render("opponent moved, your turn now", "info")
      else
        @status_bar.render("you've moved, waiting opponent's move", "info")
      return

    if game_state.state == STATE_OPPOENENT_ABORT
      @status_bar.render("opponent leave suddenly, waiting for another player...", "warning")
      return

    if game_state.state == STATE_GAMEOVER_WIN
      @world.init_units(game_state.boardInfo)
      @world.render()
      @status_bar.render("congraturations, you win!", "success")
      return

    if game_state.state == STATE_GAMEOVER_LOSE
      @world.init_units(game_state.boardInfo)
      @world.render()
      @status_bar.render("oh, you lose...", "danger")
      return
