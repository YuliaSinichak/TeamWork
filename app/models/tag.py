from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.resource import resource_tags

class Tag(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    # Relationship
    resources = relationship("Resource", secondary=resource_tags, back_populates="tags")
