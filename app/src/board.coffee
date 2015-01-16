class Board
  WIDTH = 600
  HEIGHT = 600
  COLOR_BORDER = 'RGB(100, 0, 240)'
  COLOR_LINE = 'RGB(100, 0, 240)'

  COLOR_ATTACK = 'RGBA(264, 224, 126, 0.4)'

  constructor: (size) ->
    @size = size

  radius: ->
    WIDTH/@size/2.0 - 3

  point2pos: (point) ->
    ratio = getRatio()

    w = $("#chess-board").width()
    h = $("#chess-board").height()

    base_x = w/2 - WIDTH/2*ratio
    base_y = h/2- HEIGHT/2*ratio

    x = point.x - base_x - WIDTH/2*ratio
    y = point.y - base_y - HEIGHT/2*ratio

    if x < -WIDTH/2*ratio or x > WIDTH/2*ratio
      return {x:-1, y:-1}
    if y < -HEIGHT/2*ratio or y > HEIGHT/2*ratio
      return {x:-1, y:-1}

    widthUnit = WIDTH*ratio/@size
    heightUnit = HEIGHT*ratio/@size

    xx = x / widthUnit + @size/2
    yy = -(y / heightUnit) + @size/2
    return {x: Math.floor(xx), y: Math.floor(yy)}


  position2point: (pos) ->
    if pos.x < 0 or pos.x >= @size or pos.y < 0 or pos.y >= @size
      return {x: -1, y: -1}

    widthUnit = WIDTH/@size
    heightUnit = HEIGHT/@size
    x = -WIDTH/2 + pos.x*widthUnit + widthUnit/2
    y = -HEIGHT/2 + pos.y*heightUnit + heightUnit/2
    return {x: x, y: -y}

  hight_light_attckable_points: (ps, canvas) ->
    widthUnit = WIDTH/@size
    heightUnit = HEIGHT/@size

    for pos in ps
      point = @position2point pos
      field =
        x: point.x - widthUnit/2
        y: point.y - heightUnit/2
        w: widthUnit
        h: heightUnit
      canvas.fillRect(COLOR_ATTACK, field)


  render: (canvas) ->
    # boarder rectangle
    canvas.drawRect(COLOR_BORDER, {
      x:-WIDTH/2,
      y:-HEIGHT/2,
      w:WIDTH,
      h:HEIGHT
    })

    # inside lines
    widthUnit = WIDTH/@size
    heightUnit = HEIGHT/@size
    for i in [1...@size]
      i = i-(@size)/2
      x1 = i*widthUnit
      y1 = i*heightUnit
      canvas.drawLine(COLOR_BORDER, x1, -HEIGHT/2, x1, HEIGHT/2)
      canvas.drawLine(COLOR_BORDER, -HEIGHT/2, y1, HEIGHT/2, y1)
