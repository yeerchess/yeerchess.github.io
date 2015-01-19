class StatusBar
  constructor: () ->

  clear_class: () ->
    $("#status-bar").removeClass("alert-info")
    $("#status-bar").removeClass("alert-success")
    $("#status-bar").removeClass("alert-warning")
    $("#status-bar").removeClass("alert-danger")

  render: (text, klass) ->
    @clear_class()
    $("#status-bar").addClass("alert-" + klass)
    $("#status-bar").html(text)
