from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.api.routers import documents, users
from app.core.config import settings
from app.models.schemas import ErrorDetail
import time

description = """
# DocuMind API

DocuMind is an intelligent document processing and semantic search system.

## Features

* 📄 Document Upload and Processing
* 🔍 Semantic Search
* 👥 User Management
* 🔒 Authentication

## Authentication

All API endpoints (except /health) require authentication using a JWT token.
Include the token in the Authorization header:
```
Authorization: Bearer your_token_here
```
"""

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=description,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc", 
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global error handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": ErrorDetail(
            message="Validation error",
            code="VALIDATION_ERROR",
            params={"errors": exc.errors()}
        ).dict()}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": ErrorDetail(
            message="Database error",
            code="DATABASE_ERROR"
        ).dict()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": ErrorDetail(
            message="Internal server error",
            code="INTERNAL_ERROR"
        ).dict()}
    )

# Include routers
app.include_router(
    documents.router,
    prefix="/api/v1/documents",
    tags=["documents"]
)
app.include_router(
    users.router,
    prefix="/api/v1/auth",
    tags=["auth"]
)

@app.get(
    "/health",
    tags=["system"],
    summary="System Health Check",
    response_model=dict,
    responses={
        200: {
            "description": "System is healthy",
            "content": {
                "application/json": {
                    "example": {"status": "healthy", "version": settings.VERSION}
                }
            }
        }
    }
)

async def health_check():
    """
    Check system health status
    
    Returns:
        dict: System health information
    """
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time()
    }

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to DocuMind API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }