// Generated by CoffeeScript 1.6.3
(function() {
  var Board, Canvas, EventHandler, HEIGHT, OFFSET, Parser, StatusBar, Unit, WIDTH, Websocket, World, getCanvas, getRatio, main, setRatio;

  Board = (function() {
    var COLOR_ATTACK, COLOR_BORDER, COLOR_LINE, HEIGHT, WIDTH;

    WIDTH = 600;

    HEIGHT = 600;

    COLOR_BORDER = 'RGB(100, 0, 240)';

    COLOR_LINE = 'RGB(100, 0, 240)';

    COLOR_ATTACK = 'RGBA(264, 224, 126, 0.4)';

    function Board(size) {
      this.size = size;
    }

    Board.prototype.radius = function() {
      return WIDTH / this.size / 2.0 - 3;
    };

    Board.prototype.point2pos = function(point) {
      var base_x, base_y, h, heightUnit, ratio, w, widthUnit, x, xx, y, yy;
      ratio = getRatio();
      w = $("#chess-board").width();
      h = $("#chess-board").height();
      base_x = w / 2 - WIDTH / 2 * ratio;
      base_y = h / 2 - HEIGHT / 2 * ratio;
      x = point.x - base_x - WIDTH / 2 * ratio;
      y = point.y - base_y - HEIGHT / 2 * ratio;
      if (x < -WIDTH / 2 * ratio || x > WIDTH / 2 * ratio) {
        return {
          x: -1,
          y: -1
        };
      }
      if (y < -HEIGHT / 2 * ratio || y > HEIGHT / 2 * ratio) {
        return {
          x: -1,
          y: -1
        };
      }
      widthUnit = WIDTH * ratio / this.size;
      heightUnit = HEIGHT * ratio / this.size;
      xx = x / widthUnit + this.size / 2;
      yy = -(y / heightUnit) + this.size / 2;
      return {
        x: Math.floor(xx),
        y: Math.floor(yy)
      };
    };

    Board.prototype.position2point = function(pos) {
      var heightUnit, widthUnit, x, y;
      if (pos.x < 0 || pos.x >= this.size || pos.y < 0 || pos.y >= this.size) {
        return {
          x: -1,
          y: -1
        };
      }
      widthUnit = WIDTH / this.size;
      heightUnit = HEIGHT / this.size;
      x = -WIDTH / 2 + pos.x * widthUnit + widthUnit / 2;
      y = -HEIGHT / 2 + pos.y * heightUnit + heightUnit / 2;
      return {
        x: x,
        y: -y
      };
    };

    Board.prototype.hight_light_attckable_points = function(ps, canvas) {
      var field, heightUnit, point, pos, widthUnit, _i, _len, _results;
      widthUnit = WIDTH / this.size;
      heightUnit = HEIGHT / this.size;
      _results = [];
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        pos = ps[_i];
        point = this.position2point(pos);
        field = {
          x: point.x - widthUnit / 2,
          y: point.y - heightUnit / 2,
          w: widthUnit,
          h: heightUnit
        };
        _results.push(canvas.fillRect(COLOR_ATTACK, field));
      }
      return _results;
    };

    Board.prototype.render = function(canvas) {
      var heightUnit, i, widthUnit, x1, y1, _i, _ref, _results;
      canvas.drawRect(COLOR_BORDER, {
        x: -WIDTH / 2,
        y: -HEIGHT / 2,
        w: WIDTH,
        h: HEIGHT
      });
      widthUnit = WIDTH / this.size;
      heightUnit = HEIGHT / this.size;
      _results = [];
      for (i = _i = 1, _ref = this.size; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        i = i - this.size / 2;
        x1 = i * widthUnit;
        y1 = i * heightUnit;
        canvas.drawLine(COLOR_BORDER, x1, -HEIGHT / 2, x1, HEIGHT / 2);
        _results.push(canvas.drawLine(COLOR_BORDER, -HEIGHT / 2, y1, HEIGHT / 2, y1));
      }
      return _results;
    };

    return Board;

  })();

  Canvas = function(ctx, w, h) {
    this.ctx = ctx;
    this.w = w;
    return this.h = h;
  };

  Canvas.prototype.fillRect = function(color, rect) {
    this.ctx.fillStyle = color;
    return this.ctx.fillRect(this.xscreen(rect.x), this.yscreen(rect.y), rect.w, rect.h);
  };

  Canvas.prototype.drawRect = function(color, rect) {
    this.ctx.strokeStyle = color;
    return this.ctx.strokeRect(this.xscreen(rect.x), this.yscreen(rect.y), rect.w, rect.h);
  };

  Canvas.prototype.drawLine = function(color, sx, sy, ex, ey) {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.xscreen(sx), this.yscreen(sy));
    this.ctx.lineTo(this.xscreen(ex), this.yscreen(ey));
    return this.ctx.stroke();
  };

  Canvas.prototype.drawArc = function(color, x, y, r, sAngle, eAngle) {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(this.xscreen(x), this.yscreen(y), r, sAngle, eAngle);
    return this.ctx.stroke();
  };

  Canvas.prototype.fillArc = function(color, x, y, r, sAngle, eAngle) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(this.xscreen(x), this.yscreen(y), r, sAngle, eAngle);
    return this.ctx.fill();
  };

  Canvas.prototype.drawCircle = function(color, x, y, r) {
    return this.drawArc(color, x, y, r, 0, 2 * Math.PI);
  };

  Canvas.prototype.fillCircle = function(color, x, y, r) {
    return this.fillArc(color, x, y, r, 0, 2 * Math.PI);
  };

  Canvas.prototype.drawText = function(color, font, text, x, y) {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    x = x - this.ctx.measureText(text).width / 2;
    return this.ctx.fillText(text, this.xscreen(x), this.yscreen(y));
  };

  Canvas.prototype.clear = function() {
    return this.ctx.clearRect(0, 0, this.w, this.h);
  };

  Canvas.prototype.xscreen = function(x) {
    return x + this.w / 2;
  };

  Canvas.prototype.yscreen = function(y) {
    return y + this.h / 2;
  };

  EventHandler = (function() {
    function EventHandler(world) {
      $("#chess-board").click(function(e) {
        var clicked_point, pos;
        clicked_point = {
          x: e.offsetX,
          y: e.offsetY
        };
        pos = world.board.point2pos(clicked_point);
        return world.select(pos);
      });
      $("#chess-board").mousemove(function(e) {
        var clicked_point, pos;
        clicked_point = {
          x: e.offsetX,
          y: e.offsetY
        };
        pos = world.board.point2pos(clicked_point);
        return world.hover(pos);
      });
    }

    return EventHandler;

  })();

  WIDTH = 800.0;

  HEIGHT = 800.0;

  OFFSET = 200;

  getRatio = function() {
    var h, height, ratio, ratioh, ratiow, w, width;
    width = WIDTH;
    height = HEIGHT;
    w = window.innerWidth;
    h = window.innerHeight - OFFSET;
    ratiow = w / width;
    ratioh = h / height;
    if (ratiow < ratioh) {
      ratio = ratiow;
    } else {
      ratio = ratioh;
    }
    return ratio;
  };

  setRatio = function(width, height) {
    var c, ratio, ratioh, ratiow;
    c = document.getElementById("chess-board");
    c.width = window.innerWidth;
    c.height = window.innerHeight - OFFSET;
    ratiow = c.width / width;
    ratioh = c.height / height;
    if (ratiow < ratioh) {
      ratio = ratiow;
      c.height = height * ratio;
    } else {
      ratio = ratioh;
      c.width = width * ratio;
    }
    return ratio;
  };

  getCanvas = function() {
    var c, ctx, height, ratio, width;
    width = WIDTH;
    height = HEIGHT;
    c = document.getElementById("chess-board");
    ctx = c.getContext("2d");
    ratio = setRatio(width, height);
    ctx.scale(ratio, ratio);
    return new Canvas(ctx, width, height);
  };

  main = function() {
    var canvas, parser, status_bar, world, ws;
    canvas = getCanvas();
    world = new World(canvas);
    status_bar = new StatusBar;
    parser = new Parser(world, status_bar);
    ws = new Websocket(parser);
    ws.connect();
    return world.ws = ws;
  };

  $(function() {
    return main();
  });

  Parser = (function() {
    var STATE_BOARD_UPDATED, STATE_GAMEOVER_FOR_WATCHER, STATE_GAMEOVER_LOSE, STATE_GAMEOVER_WIN, STATE_ILLEGAL_OPERATION, STATE_OPPOENENT_ABORT, STATE_OPPOENENT_GIVEUP, STATE_READY, STATE_WAIT;

    STATE_WAIT = 0;

    STATE_READY = 1;

    STATE_ILLEGAL_OPERATION = 2;

    STATE_BOARD_UPDATED = 3;

    STATE_OPPOENENT_ABORT = 4;

    STATE_OPPOENENT_GIVEUP = 5;

    STATE_GAMEOVER_WIN = 6;

    STATE_GAMEOVER_LOSE = 7;

    STATE_GAMEOVER_FOR_WATCHER = 8;

    function Parser(world, status_bar) {
      this.world = world;
      this.status_bar = status_bar;
    }

    Parser.prototype.parse = function(data) {
      var game_state;
      game_state = JSON.parse(data);
      console.log(game_state.state);
      if (game_state.state === STATE_WAIT) {
        this.status_bar.render("waiting for another player, copy url and invite your firend to play", "warning");
        this.world.render();
        return;
      }
      if (game_state.state === STATE_READY) {
        this.status_bar.render("opponent found, game start!", "info");
        this.world.init_units(game_state.boardInfo);
        this.world.render();
        return;
      }
      if (game_state.state === STATE_BOARD_UPDATED) {
        this.world.init_units(game_state.boardInfo);
        this.world.render();
        if (game_state.boardInfo.movable) {
          this.status_bar.render("opponent moved, your turn now", "info");
        } else {
          this.status_bar.render("you've moved, waiting opponent's move", "info");
        }
        return;
      }
      if (game_state.state === STATE_OPPOENENT_ABORT) {
        this.status_bar.render("opponent leave suddenly, waiting for another player...", "warning");
        return;
      }
      if (game_state.state === STATE_GAMEOVER_WIN) {
        this.world.init_units(game_state.boardInfo);
        this.world.render();
        this.status_bar.render("congraturations, you win!", "success");
        return;
      }
      if (game_state.state === STATE_GAMEOVER_LOSE) {
        this.world.init_units(game_state.boardInfo);
        this.world.render();
        this.status_bar.render("oh, you lose...", "danger");
      }
    };

    return Parser;

  })();

  StatusBar = (function() {
    function StatusBar() {}

    StatusBar.prototype.clear_class = function() {
      $("#status-bar").removeClass("alert-info");
      $("#status-bar").removeClass("alert-success");
      $("#status-bar").removeClass("alert-warning");
      return $("#status-bar").removeClass("alert-danger");
    };

    StatusBar.prototype.render = function(text, klass) {
      this.clear_class();
      $("#status-bar").addClass("alert-" + klass);
      return $("#status-bar").html(text);
    };

    return StatusBar;

  })();

  Unit = (function() {
    var COLOR_CIRCLE, COLOR_UNIT_BLACK, COLOR_UNIT_GREEN, COLOR_UNIT_RED, COLOR_UNIT_WHITE;

    COLOR_CIRCLE = 'RGB(244, 122, 2)';

    COLOR_UNIT_BLACK = 'RGB(0, 0, 0)';

    COLOR_UNIT_WHITE = 'RGB(255, 255, 255)';

    COLOR_UNIT_GREEN = 'RGB(0, 255, 0)';

    COLOR_UNIT_RED = 'RGB(255, 0, 0)';

    function Unit(board, side, value, pos) {
      this.board = board;
      this.side = side;
      this.value = value;
      this.pos = pos;
    }

    Unit.prototype.hight_light = function(canvas) {
      var point, r;
      point = this.board.position2point(this.pos);
      r = this.board.radius();
      if (this.side === 1) {
        canvas.fillCircle(COLOR_UNIT_GREEN, point.x, point.y, r);
        return canvas.drawText(COLOR_UNIT_WHITE, "80px Arial", this.value, point.x, point.y + 30);
      } else {
        canvas.fillCircle(COLOR_UNIT_RED, point.x, point.y, r);
        return canvas.drawText(COLOR_UNIT_BLACK, "80px Arial", this.value, point.x, point.y + 30);
      }
    };

    Unit.prototype.render = function(canvas) {
      var point, r;
      point = this.board.position2point(this.pos);
      r = this.board.radius();
      if (this.side === 1) {
        canvas.drawCircle(COLOR_CIRCLE, point.x, point.y, r);
        canvas.fillCircle(COLOR_UNIT_BLACK, point.x, point.y, r);
        return canvas.drawText(COLOR_UNIT_WHITE, "80px Arial", this.value, point.x, point.y + 30);
      } else {
        canvas.drawCircle(COLOR_CIRCLE, point.x, point.y, r);
        return canvas.drawText(COLOR_UNIT_BLACK, "80px Arial", this.value, point.x, point.y + 30);
      }
    };

    return Unit;

  })();

  Websocket = (function() {
    var WS_HOST;

    WS_HOST = "ws://ec2-54-65-78-87.ap-northeast-1.compute.amazonaws.com:3000";

    function Websocket(parser) {
      this.set_slug_and_url();
      this.ws_conn = null;
      this.parser = parser;
    }

    Websocket.prototype.random_slug = function() {
      return (Math.floor(Math.random() * 1000) + 1000).toString();
    };

    Websocket.prototype.set_slug_and_url = function() {
      var array, currentUrl;
      currentUrl = window.location.href;
      array = currentUrl.split("?room=");
      if (array.length < 2) {
        this.slug = this.random_slug();
        currentUrl += "?room=" + this.slug;
      } else {
        this.slug = array[1];
      }
      return window.history.pushState({}, 0, currentUrl);
    };

    Websocket.prototype.connect = function() {
      var self, _action, _parser, _reconnect;
      if (this.ws_conn !== null) {
        return;
      }
      console.log("connected");
      _parser = this.parser;
      _reconnect = this.reconnect;
      self = this;
      _action = function() {
        self.ws_conn = null;
        return self.connect();
      };
      this.ws_conn = new WebSocket(WS_HOST + "/ws/" + this.slug);
      this.ws_conn.onopen = function(data) {
        return console.log(data);
      };
      this.ws_conn.onmessage = function(msg_event) {
        var data;
        data = msg_event.data;
        return _parser.parse(data);
      };
      this.ws_conn.onclose = function(data) {
        return alert("close");
      };
      return this.ws_conn.onerror = function(data) {
        return alert("error");
      };
    };

    Websocket.prototype.reconnect_action = function() {
      this.ws_conn = null;
      return this.connect();
    };

    Websocket.prototype.reconnect = function(action) {
      return setTimeout(action, Math.floor(Math.random() * 5001) + 1000);
    };

    Websocket.prototype.send = function(data) {
      return this.ws_conn.send(data);
    };

    return Websocket;

  })();

  World = (function() {
    var _match;

    function World(canvas) {
      this.canvas = canvas;
      this.objects = [];
      this.board = new Board(6);
      this.units = [];
      this.attack_points = [];
      this.ws = null;
      new EventHandler(this);
    }

    World.prototype.init_units = function(board_info) {
      var unit, _i, _len, _ref, _results;
      this.units = [];
      this.movable = board_info.movable;
      this.my_side = board_info.side;
      _ref = board_info.Units;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        unit = _ref[_i];
        _results.push(this.units.push(new Unit(this.board, unit.side, unit.value, {
          x: unit.pos.x,
          y: unit.pos.y
        })));
      }
      return _results;
    };

    World.prototype.hover = function(pos) {
      this.default_cursor();
      if (this.attack_points.length === 0) {
        this.hight_light(pos, false);
      }
      if (this._included(this.attack_points, pos) || this.in_my_side(pos)) {
        return this.pointer_cursor();
      }
    };

    World.prototype.select = function(pos) {
      var json_str, move;
      this.hight_light(pos, true);
      if (this._included(this.attack_points, pos)) {
        move = {
          from_pos: this.from_pos,
          to_pos: pos
        };
        json_str = JSON.stringify(move);
        this.ws.send(json_str);
        this.attack_points = [];
        return this.from_pos = null;
      }
    };

    World.prototype.pointer_cursor = function() {
      return this.change_cursor_shape('pointer');
    };

    World.prototype.default_cursor = function() {
      return this.change_cursor_shape('default');
    };

    World.prototype.change_cursor_shape = function(shape) {
      return document.body.style.cursor = shape;
    };

    World.prototype.in_my_side = function(pos) {
      var unit, _i, _len, _ref;
      _ref = this.units;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        unit = _ref[_i];
        if (unit.pos.x === pos.x && unit.pos.y === pos.y && unit.side === this.my_side && this.movable) {
          return true;
        }
      }
      return false;
    };

    World.prototype.hight_light = function(pos, need_to_show_range) {
      var unit, _i, _len, _ref;
      this.default_cursor();
      this.render();
      _ref = this.units;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        unit = _ref[_i];
        if (unit.pos.x === pos.x && unit.pos.y === pos.y && unit.side === this.my_side && this.movable) {
          this.pointer_cursor();
          unit.hight_light(this.canvas);
          if (need_to_show_range) {
            this.show_attack_range(unit);
            return;
          }
        }
      }
      if (!this._included(this.attack_points, pos)) {
        this.attack_points = [];
        return this.from_pos = null;
      }
    };

    World.prototype.show_attack_range = function(unit) {
      var attack_points;
      attack_points = this._find_attack_points(unit);
      this.board.hight_light_attckable_points(attack_points, this.canvas);
      this.attack_points = attack_points;
      return this.from_pos = unit.pos;
    };

    World.prototype.move_to = function(point) {};

    World.prototype.render = function() {
      var unit, _i, _len, _ref, _results;
      this.canvas.clear();
      this.board.render(this.canvas);
      _ref = this.units;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        unit = _ref[_i];
        _results.push(unit.render(this.canvas));
      }
      return _results;
    };

    World.prototype._find_attack_points = function(unit) {
      var attack_points, p, ps, u, _i, _len;
      attack_points = [];
      ps = this._inside_reach_range(unit.pos, unit.value, this.board.size);
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        p = ps[_i];
        u = this._find_unit(p);
        if (u && u.side === unit.side) {
          continue;
        }
        if (!this._reachable(unit, unit.pos, p)) {
          continue;
        }
        attack_points.push(p);
      }
      return attack_points;
    };

    World.prototype._remove = function(ps, pos) {
      var new_ps, p, _i, _len;
      new_ps = [];
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        p = ps[_i];
        if (p.x === pos.x && p.y === pos.y) {
          continue;
        }
        new_ps.push(p);
      }
      return new_ps;
    };

    _match = function(seen, obj) {
      var key, match, other, val, _i, _len;
      for (_i = 0, _len = seen.length; _i < _len; _i++) {
        other = seen[_i];
        match = true;
        for (key in obj) {
          val = obj[key];
          if (other[key] !== val) {
            match = false;
          }
        }
        if (match) {
          return true;
        }
      }
      return false;
    };

    World.prototype._uniq = function(ps) {
      var found, new_ps, np, p, _i, _j, _len, _len1;
      new_ps = [];
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        p = ps[_i];
        found = false;
        for (_j = 0, _len1 = new_ps.length; _j < _len1; _j++) {
          np = new_ps[_j];
          if (np.x === p.x && np.y === p.y) {
            found = true;
            break;
          }
        }
        if (found) {
          continue;
        }
        new_ps.push(p);
      }
      return new_ps;
    };

    World.prototype._included = function(ps, pos) {
      var p, _i, _len;
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        p = ps[_i];
        if (p.x === pos.x && p.y === pos.y) {
          return true;
        }
      }
      return false;
    };

    World.prototype._move = function(pos, delta) {
      return {
        x: pos.x + delta.x,
        y: pos.y + delta.y
      };
    };

    World.prototype._reach_range = function(pos, steps) {
      var new_ps, p, ps, _i, _len;
      if (steps < 1) {
        return [];
      }
      if (steps === 1) {
        return [
          this._move(pos, {
            x: -1,
            y: 0
          }), this._move(pos, {
            x: 0,
            y: 1
          }), this._move(pos, {
            x: 1,
            y: 0
          }), this._move(pos, {
            x: 0,
            y: -1
          })
        ];
      }
      if (steps === 2) {
        return [
          this._move(pos, {
            x: -1,
            y: -1
          }), this._move(pos, {
            x: -2,
            y: 0
          }), this._move(pos, {
            x: -1,
            y: 1
          }), this._move(pos, {
            x: 0,
            y: 2
          }), this._move(pos, {
            x: 1,
            y: 1
          }), this._move(pos, {
            x: 2,
            y: 0
          }), this._move(pos, {
            x: 1,
            y: -1
          }), this._move(pos, {
            x: 0,
            y: -2
          })
        ];
      }
      ps = this._reach_range(pos, steps - 2);
      new_ps = [];
      for (_i = 0, _len = ps.length; _i < _len; _i++) {
        p = ps[_i];
        new_ps.push(p);
        new_ps = new_ps.concat(this._reach_range(p, 2));
      }
      ps = this._uniq(new_ps);
      ps = this._remove(ps, pos);
      return ps;
    };

    World.prototype._inside_reach_range = function(pos, steps, length) {
      var full_range, new_ps, p, _i, _len;
      new_ps = [];
      full_range = this._reach_range(pos, steps);
      for (_i = 0, _len = full_range.length; _i < _len; _i++) {
        p = full_range[_i];
        if (p.x < 0 || p.x > length - 1 || p.y < 0 || p.y > length - 1) {
          continue;
        }
        new_ps.push(p);
      }
      return new_ps;
    };

    World.prototype._distance = function(p1, p2) {
      return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    };

    World.prototype._normalize_x = function(p1, p2) {
      return this._normalize(p1.x, p2.x);
    };

    World.prototype._normalize_y = function(p1, p2) {
      return this._normalize(p1.y, p2.y);
    };

    World.prototype._normalize = function(x1, x2) {
      var a, b;
      a = x2 - x1;
      b = Math.abs(a);
      if (b === 0) {
        return 0;
      }
      return a / b;
    };

    World.prototype._single_line_path = function(a, b, d, f) {
      var r, x;
      r = [];
      x = a;
      while (x !== b) {
        x += d;
        r.push(f(x));
      }
      return r;
    };

    World.prototype._single_line_path_x = function(p1, p2) {
      var direction, f;
      direction = this._normalize_x(p1, p2);
      f = function(v) {
        return {
          x: v,
          y: p1.y
        };
      };
      return this._single_line_path(p1.x, p2.x, direction, f);
    };

    World.prototype._single_line_path_y = function(p1, p2) {
      var direction, f;
      direction = this._normalize_y(p1, p2);
      f = function(v) {
        return {
          x: p1.x,
          y: v
        };
      };
      return this._single_line_path(p1.y, p2.y, direction, f);
    };

    World.prototype._shortest_paths = function(p1, p2) {
      var path_x, path_y, px, py, r, step_x, step_y, _i, _j, _len, _len1;
      if (p1.x === p2.x && p1.y === p2.y) {
        return [];
      }
      r = [];
      if (p1.x === p2.x) {
        r.push(this._single_line_path_y(p1, p2));
        return r;
      }
      if (p1.y === p2.y) {
        r.push(this._single_line_path_x(p1, p2));
        return r;
      }
      step_x = this._normalize_x(p1, p2);
      step_y = this._normalize_y(p1, p2);
      path_x = this._shortest_paths(p1, this._move(p2, {
        x: -step_x,
        y: 0
      }));
      for (_i = 0, _len = path_x.length; _i < _len; _i++) {
        px = path_x[_i];
        px.push(p2);
      }
      path_y = this._shortest_paths(p1, this._move(p2, {
        x: 0,
        y: -step_y
      }));
      for (_j = 0, _len1 = path_y.length; _j < _len1; _j++) {
        py = path_y[_j];
        py.push(p2);
      }
      return path_x.concat(path_y);
    };

    World.prototype._paths_from_next_step = function(p1, p2, steps, next_move) {
      var new_paths, p, path, paths, _i, _len;
      p = next_move(p1);
      if (p.x === p2.x && p.y === p2.y) {
        return [];
      }
      new_paths = [];
      paths = this._reachable_paths(p, p2, steps - 1);
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        if (this._included(path, p1)) {
          continue;
        }
        path = [p].concat(path);
        new_paths.push(path);
      }
      return new_paths;
    };

    World.prototype._reachable_paths = function(p1, p2, steps) {
      var f, paths, r, _move;
      if (p1.x === p2.x && p1.y === p2.y) {
        return [];
      }
      if (this._distance(p1, p2) > steps) {
        return [];
      }
      if (this._distance(p1, p2) === steps) {
        return this._shortest_paths(p1, p2);
      }
      r = [];
      _move = this._move;
      f = function(old_pos, pos) {
        return _move(old_pos, {
          x: -1,
          y: 0
        });
      };
      paths = this._paths_from_next_step(p1, p2, steps, f);
      r = r.concat(paths);
      f = function(old_pos, pos) {
        return _move(old_pos, {
          x: 1,
          y: 0
        });
      };
      paths = this._paths_from_next_step(p1, p2, steps, f);
      r = r.concat(paths);
      f = function(old_pos, pos) {
        return _move(old_pos, {
          x: 0,
          y: -1
        });
      };
      paths = this._paths_from_next_step(p1, p2, steps, f);
      r = r.concat(paths);
      f = function(old_pos, pos) {
        return _move(old_pos, {
          x: 0,
          y: 1
        });
      };
      paths = this._paths_from_next_step(p1, p2, steps, f);
      r = r.concat(paths);
      return r;
    };

    World.prototype._find_unit = function(pos) {
      var u, _i, _len, _ref;
      _ref = this.units;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        if (u.pos.x === pos.x && u.pos.y === pos.y) {
          return u;
        }
      }
      return null;
    };

    World.prototype._reachable = function(u, from_pos, to_pos) {
      var bad_path_count, i, length, p, path, paths, uu, _i, _j, _len, _len1;
      paths = this._reachable_paths(from_pos, to_pos, u.value);
      bad_path_count = 0;
      length = this.board.size;
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        for (i = _j = 0, _len1 = path.length; _j < _len1; i = ++_j) {
          p = path[i];
          if (p.x < 0 || p.x > length - 1 || p.y < 0 || p.y > length - 1) {
            bad_path_count += 1;
            break;
          }
          uu = this._find_unit(p);
          if (!!uu) {
            if ((i + 1 === path.length) && uu.side !== u.side) {
              break;
            }
            bad_path_count += 1;
            break;
          }
        }
      }
      return bad_path_count < paths.length;
    };

    return World;

  })();

}).call(this);
