.PHONY: help install dev test clean docker-build docker-run

help: ## Show this help message
	@echo "DocuMind Development Commands"
	@echo "============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pip install -r requirements.txt

dev: ## Start development server
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test: ## Run tests
	pytest tests/ -v

test-cov: ## Run tests with coverage
	pytest tests/ --cov=app --cov-report=html --cov-report=term

lint: ## Run linting
	black app/ tests/
	isort app/ tests/
	flake8 app/ tests/

clean: ## Clean up temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

docker-build: ## Build Docker image
	docker build -t documind .

docker-run: ## Run with Docker Compose
	docker-compose up -d

docker-stop: ## Stop Docker Compose
	docker-compose down

db-migrate: ## Run database migrations
	alembic upgrade head

db-reset: ## Reset database (WARNING: destroys data)
	alembic downgrade base
	alembic upgrade head

setup-dev: ## Set up development environment
	python -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -r requirements.txt
	.venv/bin/pip install -r requirements-dev.txt
	@echo "Development environment ready!"
	@echo "Activate with: source .venv/bin/activate"

check: ## Run all checks
	@echo "Running linting..."
	@make lint
	@echo "Running tests..."
	@make test
	@echo "All checks passed!"

format: ## Format code
	black app/ tests/
	isort app/ tests/

docs: ## Generate API documentation
	@echo "API documentation available at: http://localhost:8000/api/docs"
	@echo "ReDoc available at: http://localhost:8000/api/redoc"

health: ## Check application health
	curl -X GET "http://localhost:8000/health"

# Development shortcuts
start: dev ## Alias for dev
run: dev ## Alias for dev