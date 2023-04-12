.PHONY: build frontend clean

# Build Python package
build: frontend
	@poetry build

# Build and copy frontend into Python package
frontend:
	@cd frontend && yarn && yarn build
	@rm -rf paramview/static
	@cp -R frontend/dist paramview/static

# Remove Python package and frontend build artifacts
clean:
	@rm -rf dist frontend/dist paramview/static
