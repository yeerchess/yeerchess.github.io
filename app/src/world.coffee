class World

  constructor: (canvas) ->
    @canvas = canvas
    @objects = []
    @board = new Board(6)
    @units = []
    @attack_points = []
    @ws = null
    new EventHandler this

  init_units: (board_info) ->
    @units = []
    @movable = board_info.movable
    @my_side = board_info.side
    for unit in board_info.Units
      @units.push new Unit(
        @board,
        unit.side,
        unit.value,
        {
          x: unit.pos.x,
          y: unit.pos.y
        }
      )

  select: (pos) ->
    @hight_light(pos)

  hight_light: (pos) ->
    @unit_selected = false
    @render()
    for unit in @units
      if unit.pos.x == pos.x and unit.pos.y == pos.y and unit.side == @my_side and @movable
        unit.hight_light @canvas
        attack_points = @_find_attack_points(unit)
        @board.hight_light_attckable_points attack_points, @canvas
        @attack_points = attack_points
        @from_pos = pos
        return
    if @_included(@attack_points, pos)
      move =
        from_pos:
          @from_pos
        to_pos:
          pos
      json_str = JSON.stringify(move);
      @ws.send json_str
      @attack_points = []
      @from_pos = null


  move_to: (point) ->
    return

  render: () ->
    @canvas.clear()
    @board.render(@canvas)
    for unit in @units
      unit.render(@canvas)


  _find_attack_points: (unit) ->
    attack_points = []
    ps = @_inside_reach_range(unit.pos, unit.value, @board.size)
    for p in ps
      u = @_find_unit(p)
      if u and u.side == unit.side
        continue
      if not @_reachable(unit, unit.pos, p)
        continue
      attack_points.push p
    return attack_points


  _remove: (ps, pos) ->
    new_ps = []
    for p in ps
      if p.x== pos.x and p.y == pos.y
        continue
      new_ps.push p
    return new_ps

  _match = (seen, obj) ->
    for other in seen
      match = true
      for key, val of obj
        match = false unless other[key] == val
      return true if match
    false

  _uniq: (ps) ->
    new_ps = []
    for p in ps
      found = false
      for np in new_ps
        if np.x == p.x and np.y == p.y
          found = true
          break
      if found
        continue
      new_ps.push p
    return new_ps

  _included: (ps, pos) ->
    for p in ps
      if p.x == pos.x and p.y == pos.y
        return true
    return false

  _move: (pos, delta) ->
    return {
      x: pos.x + delta.x,
      y: pos.y + delta.y
    }

  _reach_range: (pos, steps) ->
    if steps < 1
      return []
    if steps == 1
      return [
        @_move(pos, {x:-1, y:0}),
        @_move(pos, {x:0, y:1}),
        @_move(pos, {x:1, y:0}),
        @_move(pos, {x:0, y:-1})
      ]
    if steps == 2
      return [
        @_move(pos, {x:-1, y:-1}),
        @_move(pos, {x:-2, y:0}),
        @_move(pos, {x:-1, y:1}),
        @_move(pos, {x:0, y:2}),
        @_move(pos, {x:1, y:1}),
        @_move(pos, {x:2, y:0}),
        @_move(pos, {x:1, y:-1}),
        @_move(pos, {x:0, y:-2}),
      ]

    ps = @_reach_range(pos, steps - 2)
    new_ps = []
    for p in ps
      new_ps.push p
      new_ps = new_ps.concat @_reach_range(p, 2)
    ps = @_uniq(new_ps)
    ps = @_remove(ps, pos)
    return ps

  _inside_reach_range: (pos, steps, length) ->
    new_ps = []
    full_range = @_reach_range(pos, steps)
    for p in full_range
      if p.x < 0 or p.x > length - 1 or p.y < 0 or p.y > length - 1
        continue
      new_ps.push p
    return new_ps

  _distance: (p1, p2) ->
    return Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y)

  _normalize_x: (p1, p2) ->
    return @_normalize(p1.x, p2.x)

  _normalize_y: (p1, p2) ->
    return @_normalize(p1.y, p2.y)

  _normalize: (x1, x2) ->
    a = x2 - x1
    b = Math.abs(a)
    if b == 0
      return 0
    return a/b

  _single_line_path: (a, b, d, f) ->
    r = []
    x = a
    while x != b
      x += d
      r.push f(x)
    return r

  _single_line_path_x: (p1, p2) ->
    direction = @_normalize_x(p1, p2)
    f = (v) ->
      return {x: v, y: p1.y}
    return @_single_line_path(p1.x, p2.x, direction, f)

  _single_line_path_y: (p1, p2) ->
    direction = @_normalize_y(p1, p2)
    f = (v) ->
      return {x: p1.x, y: v}
    return @_single_line_path(p1.y, p2.y, direction, f)



  _shortest_paths: (p1, p2) ->
    if p1.x == p2.x and p1.y == p2.y
      return []

    r = []
    if p1.x == p2.x
      r.push @_single_line_path_y(p1, p2)
      return r

    if p1.y == p2.y
      r.push @_single_line_path_x(p1, p2)
      return r

    step_x = @_normalize_x(p1, p2)
    step_y = @_normalize_y(p1, p2)
    path_x = @_shortest_paths(p1, @_move(p2, {x: -step_x, y: 0}))
    for px in path_x
      px.push p2
    path_y = @_shortest_paths(p1, @_move(p2, {x: 0, y: -step_y}))
    for py in path_y
      py.push p2
    return path_x.concat path_y

  _paths_from_next_step: (p1, p2, steps, next_move) ->
    p = next_move(p1)
    if p.x == p2.x and p.y == p2.y
      return []

    new_paths = []
    paths = @_reachable_paths(p, p2, steps - 1)
    for path in paths
      if @_included(path, p1)
        continue

      path = [p].concat path
      new_paths.push path
    return new_paths


  _reachable_paths: (p1, p2, steps) ->
    if p1.x == p2.x and p1.y == p2.y
      return []
    if @_distance(p1, p2) > steps
      return []

    if @_distance(p1, p2) == steps
      return @_shortest_paths(p1, p2)

    r = []
    _move = @_move

    f = (old_pos, pos) ->
      return _move(old_pos, {x:-1, y:0})
    paths = @_paths_from_next_step(p1, p2, steps, f)
    r = r.concat paths

    f = (old_pos, pos) ->
      return _move(old_pos, {x:1, y:0})
    paths = @_paths_from_next_step(p1, p2, steps, f)
    r = r.concat paths

    f = (old_pos, pos) ->
      return _move(old_pos, {x:0, y:-1})
    paths = @_paths_from_next_step(p1, p2, steps, f)
    r = r.concat paths

    f = (old_pos, pos) ->
      return _move(old_pos, {x:0, y:1})
    paths = @_paths_from_next_step(p1, p2, steps, f)
    r = r.concat paths
    return r



  _find_unit: (pos) ->
    for u in @units
      if u.pos.x == pos.x and u.pos.y == pos.y
        return u
    return null


  _reachable: (u, from_pos, to_pos) ->
    paths = @_reachable_paths(from_pos, to_pos, u.value)
    bad_path_count = 0
    length = @board.size
    for path in paths
      for p, i in path
        if p.x < 0 or p.x > length - 1 or p.y < 0 or p.y > length - 1
          bad_path_count += 1
          break
        uu = @_find_unit(p)
        if !!uu
          if (i+1 == path.length) and uu.side != u.side
            break
          bad_path_count += 1
          break
    return bad_path_count < paths.length
