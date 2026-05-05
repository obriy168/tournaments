from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "that_need_to_be_changed_and_must_be_kept_secret_in_environment_later" 
ALGORITHM = "HS256" # This should also be in the .env file
ACCESS_TOKEN_EXPIRE_DAYS = 2

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)