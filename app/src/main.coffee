WIDTH = 800.0
HEIGHT = 800.0
OFFSET = 200
getRatio = () ->
  width = WIDTH
  height = HEIGHT

  w  = window.innerWidth
  h = window.innerHeight - OFFSET

  ratiow = w/width
  ratioh = h/height
  if ratiow < ratioh
          ratio = ratiow
  else
          ratio = ratioh
  return ratio

setRatio = (width, height) ->
  c = document.getElementById("chess-board")
  c.width  = window.innerWidth
  c.height = window.innerHeight - OFFSET

  ratiow = c.width/width
  ratioh = c.height/height
  if ratiow < ratioh
          ratio = ratiow
          c.height = height * ratio
  else
          ratio = ratioh
          c.width = width * ratio
  return ratio

getCanvas = () ->
  width = WIDTH
  height = HEIGHT

  c = document.getElementById("chess-board")
  ctx = c.getContext("2d")
  ratio = setRatio(width, height)
  ctx.scale(ratio, ratio)

  return new Canvas(ctx, width, height)


main = () ->
  canvas = getCanvas()
  world = new World(canvas)

  status_bar = new StatusBar
  parser = new Parser(world, status_bar)
  ws = new Websocket(parser)
  ws.connect()
  world.ws = ws


$ ->
  main()
