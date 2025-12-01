from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate
from app.services.base import CRUDBase

class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    pass

tag = CRUDTag(Tag)
