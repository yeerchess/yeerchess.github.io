class Websocket
  WS_HOST = "ws://localhost:3000"
  #WS_HOST = "ws://ec2-54-65-78-87.ap-northeast-1.compute.amazonaws.com:3000"
  constructor: (parser) ->
    @set_slug_and_url()
    @ws_conn = null
    @parser = parser

  random_slug: () ->
    (Math.floor(Math.random()*1000) + 1000).toString()

  set_slug_and_url: () ->
    currentUrl = window.location.href
    array = currentUrl.split "?room="
    if array.length < 2
      @slug = @random_slug()
      currentUrl += "?room=" + @slug
    else
      @slug = array[1]
    window.history.pushState({},0,currentUrl);


  connect: () ->
    if @ws_conn != null
      return

    _parser = @parser
    @ws_conn = new WebSocket(WS_HOST + "/ws/" + @slug);
    @ws_conn.onopen = (data) ->
      console.log data

    @ws_conn.onmessage = (msg_event) ->
      data = msg_event.data
      _parser.parse data

    @ws_conn.onclose = (data) ->
      alert("close")

    @ws_conn.onerror = (data) ->
      alert "error"

  send: (data) ->
    @ws_conn.send(data)
