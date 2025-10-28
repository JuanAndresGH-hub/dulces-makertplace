# backend/app/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from ..database import get_db
from ..models import User, RoleEnum
from ..schemas import UserCreate, UserOut, TokenOut
from ..auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------- MODELOS ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


# ---------- ENDPOINTS ----------
@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # Unicidad por email
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    role_val = getattr(getattr(RoleEnum, "USER", "USER"), "value", "USER")

    # Construcción tolerante a diferencias del modelo (is_active / enabled)
    kwargs = {
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "role": role_val,
    }
    if hasattr(User, "is_active"):
        kwargs["is_active"] = True
    elif hasattr(User, "enabled"):
        kwargs["enabled"] = True

    user = User(**kwargs)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # 🔑 CLAVE: coloca la identidad en 'sub' (lo que lee get_current_user)
    role_str = getattr(getattr(user, "role", None), "value", getattr(user, "role", "USER"))
    token = create_access_token({
        "sub": user.email,   # <- usado por get_current_user
        "uid": user.id,      # opcional, útil en otros endpoints
        "role": role_str
    })

    # Tu esquema TokenOut espera 'access_token' y 'user'
    return {
        "access_token": token,
        "user": user
    }


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register-admin", response_model=UserOut, status_code=201)
def register_admin(
    payload: UserCreate,
    db: Session = Depends(get_db),
    x_admin_invite: str | None = Header(default=None, alias="X-Admin-Invite"),
):
    """
    Crea un usuario ADMIN si el header 'X-Admin-Invite' coincide con settings.admin_invite_code.
    """
    if not settings.admin_invite_code:
        raise HTTPException(status_code=400, detail="ADMIN_INVITE_CODE no configurado")

    if not x_admin_invite or x_admin_invite != settings.admin_invite_code:
        raise HTTPException(status_code=401, detail="Código de invitación inválido")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    role_val = getattr(getattr(RoleEnum, "ADMIN", "ADMIN"), "value", "ADMIN")

    kwargs = {
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "role": role_val,
    }
    if hasattr(User, "is_active"):
        kwargs["is_active"] = True
    elif hasattr(User, "enabled"):
        kwargs["enabled"] = True

    user = User(**kwargs)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
