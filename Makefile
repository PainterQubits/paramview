.PHONY: build frontend clean

build: frontend
	@poetry build

frontend:
	@cd frontend && yarn build
	@rm -rf paramview/static
	@cp -R frontend/dist paramview/static

clean:
	@rm -rf dist frontend/dist paramview/static
