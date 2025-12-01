from pydantic import BaseModel

# Shared properties
class TopicBase(BaseModel):
    name: str

# Properties to receive on topic creation
class TopicCreate(TopicBase):
    pass

# Properties to receive on topic update
class TopicUpdate(TopicBase):
    pass

# Properties shared by models stored in DB
class TopicInDBBase(TopicBase):
    id: int
    name: str

    class Config:
        from_attributes = True

# Properties to return to client
class Topic(TopicInDBBase):
    pass

# Properties stored in DB
class TopicInDB(TopicInDBBase):
    pass
