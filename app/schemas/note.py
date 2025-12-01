from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class NoteBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

# Properties to receive on note creation
class NoteCreate(NoteBase):
    title: str

# Properties to receive on note update
class NoteUpdate(NoteBase):
    pass

# Properties shared by models stored in DB
class NoteInDBBase(NoteBase):
    id: int
    title: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Note(NoteInDBBase):
    pass

# Properties stored in DB
class NoteInDB(NoteInDBBase):
    pass
