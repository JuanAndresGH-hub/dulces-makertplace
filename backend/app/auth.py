# backend/app/auth.py
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Callable, Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, RoleEnum

# ===== Config (.env) =====
SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MIN", "120"))

# Acepta hashes legacy además de bcrypt (evita UnknownHashError)
pwd_context = CryptContext(
    schemes=["bcrypt", "pbkdf2_sha256", "sha256_crypt", "argon2", "plaintext"],
    deprecated="auto",
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# ===== Password utils =====
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contra varios esquemas; si es desconocido, prueba igualdad (texto plano legacy)."""
    if hashed_password is None:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except UnknownHashError:
        # Compatibilidad: algunos datos antiguos pueden tener password en texto plano
        return hashed_password == plain_password

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# ===== JWT =====
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Requiere al menos data['sub'] = email o username del usuario.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# ===== DB helpers =====
def get_user_by_identity(db: Session, identity: str) -> Optional[User]:
    if hasattr(User, "email"):
        u = db.query(User).filter(User.email == identity).first()
        if u:
            return u
    if hasattr(User, "username"):
        return db.query(User).filter(User.username == identity).first()
    return None

def _is_enabled(u: User) -> bool:
    if hasattr(u, "is_active"):
        return bool(getattr(u, "is_active"))
    if hasattr(u, "enabled"):
        return bool(getattr(u, "enabled"))
    return True

# ===== Current user =====
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        subject: Optional[str] = payload.get("sub")
        if not subject:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = get_user_by_identity(db, subject)
    if not user or not _is_enabled(user):
        raise credentials_exc
    return user

# ===== Role guard =====
def require_role(*roles: Iterable) -> Callable:
    if len(roles) == 1 and isinstance(roles[0], (list, tuple, set)):
        roles = tuple(roles[0])

    accepted: set[str] = set()
    for r in roles:
        if hasattr(r, "value"):
            accepted.add(str(r.value))
            if hasattr(r, "name"):
                accepted.add(str(r.name))
        else:
            accepted.add(str(r))

    def _dep(current: User = Depends(get_current_user)) -> User:
        raw_role = getattr(current, "role", None)
        role_str = (
            str(getattr(raw_role, "value", None))
            if hasattr(raw_role, "value")
            else (str(getattr(raw_role, "name", None)) if hasattr(raw_role, "name") else str(raw_role))
        )
        if not accepted or role_str in accepted or raw_role in roles:
            return current
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes")

    return _dep

# ===== Seed admin =====
def seed_admin(db: Session):
    """
    Crea un admin por defecto si no existe.
    Credenciales: admin@mail.com / admin123
    Usa 'email' si existe, si no 'username'.
    """
    identity_field = "email" if hasattr(User, "email") else ("username" if hasattr(User, "username") else None)
    if identity_field is None:
        return

    admin_identity = "admin@mail.com"
    exists = db.query(User).filter(getattr(User, identity_field) == admin_identity).first()
    if exists:
        return

    if hasattr(RoleEnum, "ADMIN"):
        member = getattr(RoleEnum, "ADMIN")
        role_value = getattr(member, "value", member)
    else:
        role_value = "ADMIN"

    admin = User(
        **{
            identity_field: admin_identity,
            "password_hash": get_password_hash("admin123"),
            "role": role_value,
            ("is_active" if hasattr(User, "is_active") else "enabled"): True,
        }
    )
    db.add(admin)
    db.commit()
