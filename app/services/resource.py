from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate
from app.services.base import CRUDBase

class CRUDResource(CRUDBase[Resource, ResourceCreate, ResourceUpdate]):
    async def get_multi_by_topic(
        self, db: AsyncSession, *, topic_id: int, skip: int = 0, limit: int = 100
    ) -> List[Resource]:
        result = await db.execute(
            select(self.model)
            .filter(Resource.topic_id == topic_id)
            .offset(skip)
            .limit(limit)
            .options(selectinload(self.model.tags), selectinload(self.model.author))
        )
        return result.scalars().all()

    async def search(
        self, db: AsyncSession, *, keyword: str, skip: int = 0, limit: int = 100
    ) -> List[Resource]:
        result = await db.execute(
            select(self.model)
            .filter(Resource.title.ilike(f"%{keyword}%"))
            .offset(skip)
            .limit(limit)
            .options(selectinload(self.model.tags), selectinload(self.model.author))
        )
        return result.scalars().all()

    async def get_multi_by_author(
        self, db: AsyncSession, *, author_id: int, skip: int = 0, limit: int = 100
    ) -> List[Resource]:
        result = await db.execute(
            select(self.model)
            .filter(Resource.author_id == author_id)
            .offset(skip)
            .limit(limit)
            .options(selectinload(self.model.tags), selectinload(self.model.author))
        )
        return result.scalars().all()

    async def get_multi_by_status(
        self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Resource]:
        result = await db.execute(
            select(self.model)
            .filter(Resource.status == status)
            .offset(skip)
            .limit(limit)
            .options(selectinload(self.model.tags), selectinload(self.model.author))
        )
        return result.scalars().all()

resource = CRUDResource(Resource)
