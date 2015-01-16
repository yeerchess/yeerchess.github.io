CONCAT = coffeescript-concat

# Put coffeescript files here from bottom to top
SERVER=
SERVER+= src/canvas.coffee
SERVER+= src/status_bar.coffee
SERVER+= src/board.coffee
SERVER+= src/unit.coffee
SERVER+= src/websocket.coffee
SERVER+= src/world.coffee
SERVER+= src/event_handler.coffee
SERVER+= src/main.coffee


.PHONY: all clean compile minify

all: compile
publish: compile minify

clean:
	rm -rf build/

compile:
	mkdir -p build/
	@echo "> Compiling..."
	$(CONCAT) ${SERVER} | coffee -sc > app.js

minify:
	@echo "> Minifying..."
	@uglifyjs build/output.js --stats --lint -m \
		-p 1 --source-map build/output.min.js.map --source-map-url output.min.js.map \
		-o build/output.min.js
