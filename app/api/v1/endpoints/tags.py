from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.api import deps
from app.services.tag import tag as tag_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Tag])
async def read_tags(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve tags.
    """
    tags = await tag_service.get_multi(db, skip=skip, limit=limit)
    return tags

@router.post("/", response_model=schemas.Tag)
async def create_tag(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tag_in: schemas.TagCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new tag.
    """
    tag = await tag_service.create(db, obj_in=tag_in)
    return tag
