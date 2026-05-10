
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "Admin"
    ORGANIZER = "Organizer"
    JURY = "Jury"
    PARTICIPANT = "Participant"