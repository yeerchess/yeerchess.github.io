CONCAT = coffeescript-concat

# Put coffeescript files here from bottom to top
SERVER=
SERVER+= app/src/canvas.coffee
SERVER+= app/src/status_bar.coffee
SERVER+= app/src/board.coffee
SERVER+= app/src/unit.coffee
SERVER+= app/src/websocket.coffee
SERVER+= app/src/world.coffee
SERVER+= app/src/parser.coffee
SERVER+= app/src/event_handler.coffee
SERVER+= app/src/main.coffee


.PHONY: all clean compile minify

all: compile
publish: compile minify

clean:
	rm -rf build/

compile:
	mkdir -p build/
	@echo "> Compiling..."
	$(CONCAT) ${SERVER} | coffee -sc > app/app.js

minify:
	@echo "> Minifying..."
	@uglifyjs build/output.js --stats --lint -m \
		-p 1 --source-map build/output.min.js.map --source-map-url output.min.js.map \
		-o build/output.min.js
