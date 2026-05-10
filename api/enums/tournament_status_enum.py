from enum import Enum

class TournamentStatus(str, Enum):
    DRAFT = "Draft"
    REGISTRATION = "Registration"
    RUNNING = "Running"
    FINISHED = "Finished"