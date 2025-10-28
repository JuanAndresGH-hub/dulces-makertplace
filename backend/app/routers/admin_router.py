# backend/app/routers/admin_router.py
from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Product, RoleEnum
from ..auth import get_current_user

router = APIRouter(tags=["admin"])

# =======================
#   Helpers
# =======================
def _role_to_str(r) -> str:
    if hasattr(r, "value"):
        return str(r.value)
    if hasattr(r, "name"):
        return str(r.name)
    return str(r or "")

def _is_admin(role_value) -> bool:
    return _role_to_str(role_value).upper() == "ADMIN"

def admin_only(current=Depends(get_current_user)):
    if not _is_admin(getattr(current, "role", None)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo ADMIN")
    return current

def _iso(dt) -> Optional[str]:
    return dt.isoformat() if hasattr(dt, "isoformat") else None

# =======================
#   Schemas de respuesta
# =======================
class AdminUserBrief(BaseModel):
    id: int
    # EmailStr rompía con dominios especiales (.local). Usamos str.
    email: str = Field(..., min_length=3)
    role: str
    createdAt: Optional[str] = None

class AdminProductBrief(BaseModel):
    id: int
    name: str
    price: float
    stock: Optional[int] = None
    createdAt: Optional[str] = None

class AdminOverviewOut(BaseModel):
    counts: dict
    latestUsers: List[AdminUserBrief]
    products: List[AdminProductBrief]

# =======================
#   Endpoints
# =======================
@router.get("/overview", response_model=AdminOverviewOut)
def admin_overview(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    users_count = db.query(User).count()
    products_count = db.query(Product).count()

    latest_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    latest_products = db.query(Product).order_by(Product.created_at.desc()).limit(10).all()

    users_out = [
        AdminUserBrief(
            id=u.id,
            email=(getattr(u, "email", None) or getattr(u, "username", "")),
            role=_role_to_str(getattr(u, "role", None)),
            createdAt=_iso(getattr(u, "created_at", None)),
        )
        for u in latest_users
    ]

    prods_out = [
        AdminProductBrief(
            id=p.id,
            name=p.name,
            price=float(p.price),
            stock=getattr(p, "stock", None),
            createdAt=_iso(getattr(p, "created_at", None)),
        )
        for p in latest_products
    ]

    return AdminOverviewOut(
        counts={"users": users_count, "products": products_count},
        latestUsers=users_out,
        products=prods_out,
    )

@router.get("/users", response_model=List[AdminUserBrief])
def list_admin_users(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
    q: Optional[str] = Query(None, description="Filtra por email/username (contiene)"),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    query = db.query(User)
    if q:
        like = f"%{q}%"
        if hasattr(User, "email") and hasattr(User, "username"):
            query = query.filter((User.email.ilike(like)) | (User.username.ilike(like)))
        elif hasattr(User, "email"):
            query = query.filter(User.email.ilike(like))
        elif hasattr(User, "username"):
            query = query.filter(User.username.ilike(like))

    rows = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    return [
        AdminUserBrief(
            id=u.id,
            email=(getattr(u, "email", None) or getattr(u, "username", "")),
            role=_role_to_str(getattr(u, "role", None)),
            createdAt=_iso(getattr(u, "created_at", None)),
        )
        for u in rows
    ]
