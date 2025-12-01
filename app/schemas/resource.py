from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.schemas.enums import ResourceType, ResourceStatus
from app.schemas.tag import Tag
from app.schemas.topic import Topic
from app.schemas.user import User


# Shared properties
class ResourceBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    status: Optional[ResourceStatus] = None


# Properties to receive on resource creation
class ResourceCreate(ResourceBase):
    title: str
    resource_type: ResourceType
    topic_id: int
    tags: List[int] = [] # List of tag IDs
    author_id: int


# Properties to receive on resource update
class ResourceUpdate(ResourceBase):
    pass

# Properties shared by models stored in DB
class ResourceInDBBase(ResourceBase):
    id: int
    title: str
    author_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Resource(ResourceInDBBase):
    author: User
    topic: Topic
    tags: List[Tag] = []
    status: ResourceStatus


# Properties stored in DB
class ResourceInDB(ResourceInDBBase):
    pass
