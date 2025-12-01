import enum

class ResourceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ResourceType(str, enum.Enum):
    BOOK = "book"
    LECTURE = "lecture"
    ARTICLE = "article"

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
