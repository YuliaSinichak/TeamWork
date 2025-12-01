import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.schemas.enums import ResourceType, ResourceStatus

# Association Table for Many-to-Many relationship between Resource and Tag
resource_tags = Table(
    "resource_tags",
    Base.metadata,
    Column("resource_id", Integer, ForeignKey("resources.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

user_likes = Table(
    "user_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("resource_id", Integer, ForeignKey("resources.id"), primary_key=True),
)

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    content = Column(Text)
    status = Column(Enum(ResourceStatus), default=ResourceStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    topic_id = Column(Integer, ForeignKey("topics.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    topic = relationship("Topic", back_populates="resources")
    author = relationship("User")
    tags = relationship("Tag", secondary=resource_tags, back_populates="resources")
    liked_by = relationship("User", secondary=user_likes, back_populates="liked_resources")
