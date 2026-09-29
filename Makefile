.PHONY: dev install test clean

dev:
	@echo "Starting SAMANVAY in development mode..."
	powershell -ExecutionPolicy Bypass -File ./run_dev.ps1

install:
	cd api && pip install -r requirements.txt
	cd web && npm install

test:
	cd api && python tests/test_backend.py && python tests/test_api.py
	cd web && npm run typecheck

docker-up:
	docker compose up --build
