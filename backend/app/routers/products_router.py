from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..database import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductUpdate, ProductOut
from ..auth import require_role  # para proteger endpoints de admin

router = APIRouter(tags=["Products"])

@router.get("/products", response_model=List[ProductOut])
def list_products(
    q: Optional[str] = Query(None, description="Búsqueda por nombre o descripción"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    max_price: Optional[float] = Query(None, description="Precio máximo"),
    vegan_only: Optional[bool] = Query(None, description="Solo productos veganos"),
    gluten_free: Optional[bool] = Query(None, description="Solo productos sin gluten"),
    sort_by: Optional[str] = Query("Relevancia", description="Criterio de ordenamiento"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    # Filtro de búsqueda
    if q:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%")
            )
        )
    
    # Filtro por categoría
    if category:
        query = query.filter(Product.category == category)
    
    # Filtro por precio máximo
    if max_price:
        query = query.filter(Product.price <= max_price)
    
    # Filtro vegano
    if vegan_only:
        query = query.filter(Product.is_vegan == True)
    
    # Filtro sin gluten
    if gluten_free:
        query = query.filter(Product.is_gluten_free == True)
    
    # Ordenamiento
    if sort_by == "Precio: Menor a Mayor":
        query = query.order_by(Product.price.asc())
    elif sort_by == "Precio: Mayor a Menor":
        query = query.order_by(Product.price.desc())
    elif sort_by == "Nombre A-Z":
        query = query.order_by(Product.name.asc())
    elif sort_by == "Nombre Z-A":
        query = query.order_by(Product.name.desc())
    else:  # Relevancia (por defecto)
        query = query.order_by(Product.created_at.desc())
    
    return query.all()

@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

@router.post(
    "/products",
    response_model=ProductOut,
    status_code=201,
    dependencies=[Depends(require_role("ADMIN"))],
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.put(
    "/products/{product_id}",
    response_model=ProductOut,
    dependencies=[Depends(require_role("ADMIN"))],
)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p

@router.delete(
    "/products/{product_id}",
    status_code=204,
    dependencies=[Depends(require_role("ADMIN"))],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(p)
    db.commit()