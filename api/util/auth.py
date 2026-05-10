from typing import Annotated
from fastapi.security import APIKeyCookie
from fastapi import Depends, HTTPException, Security
from routes.models.user_session import UserSession

cookie_scheme = APIKeyCookie(name="session_id", auto_error=False)

async def validate_session(session_id: str = Security(cookie_scheme)):
    if not session_id:
        raise HTTPException(
            status_code=401, 
            detail="Session cookie missing"
        )
    try:
        user_session = UserSession.model_validate_json(session_id)
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid session")
    
    return user_session