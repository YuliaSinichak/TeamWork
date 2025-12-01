from pydantic import BaseModel

# Shared properties
class TagBase(BaseModel):
    name: str

# Properties to receive on tag creation
class TagCreate(TagBase):
    pass

# Properties to receive on tag update
class TagUpdate(TagBase):
    pass

# Properties shared by models stored in DB
class TagInDBBase(TagBase):
    id: int
    name: str

    class Config:
        orm_mode = True

# Properties to return to client
class Tag(TagInDBBase):
    pass

# Properties stored in DB
class TagInDB(TagInDBBase):
    pass
