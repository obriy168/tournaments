from enum import Enum

class TaskStatus(str, Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    SUBMISSION_CLOSED = "SubmissionClosed"
    EVALUATED = "Evaluated"