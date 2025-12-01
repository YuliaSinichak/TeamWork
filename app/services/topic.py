from app.models.topic import Topic
from app.schemas.topic import TopicCreate, TopicUpdate
from app.services.base import CRUDBase

class CRUDTopic(CRUDBase[Topic, TopicCreate, TopicUpdate]):
    pass

topic = CRUDTopic(Topic)
