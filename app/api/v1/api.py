from fastapi import APIRouter

from app.api.v1.endpoints import login, users, resources, topics, tags

api_router = APIRouter()
api_router.include_router(login.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(topics.router, prefix="/topics", tags=["topics"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
