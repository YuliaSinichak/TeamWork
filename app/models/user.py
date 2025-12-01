import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.resource import user_likes
from app.schemas.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean(), default=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_approved_teacher = Column(Boolean(), default=False)
    
    liked_resources = relationship("Resource", secondary=user_likes, back_populates="liked_by")
