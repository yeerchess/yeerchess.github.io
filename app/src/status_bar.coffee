class StatusBar
  constructor: () ->
    console.log "super"

  render: (text) ->
    $("#status-bar").html(text)
