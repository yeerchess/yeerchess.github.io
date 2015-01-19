class Websocket
  WS_HOST = "ws://localhost:3000"
  #WS_HOST = "ws://ec2-54-65-78-87.ap-northeast-1.compute.amazonaws.com:3000"
  constructor: (parser) ->
    @ws_conn = null
    @parser = parser

  connect: () ->
    if @ws_conn != null
      return

    _parser = @parser
    @ws_conn = new WebSocket(WS_HOST + "/ws");
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
