from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.api import deps
from app.services.topic import topic as topic_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Topic])
async def read_topics(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve topics.
    """
    topics = await topic_service.get_multi(db, skip=skip, limit=limit)
    return topics

@router.post("/", response_model=schemas.Topic)
async def create_topic(
    *,
    db: AsyncSession = Depends(deps.get_db),
    topic_in: schemas.TopicCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new topic.
    """
    topic = await topic_service.create(db, obj_in=topic_in)
    return topic
