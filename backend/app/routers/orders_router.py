from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Order, OrderItem, Product, User
from ..schemas import OrderCreate, OrderOut, OrderItemOut
from ..auth import get_current_user

# Mantén este prefijo: el FE llama /orders/... (y en main.py ya está incluido)
router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """
    Crea una orden para el usuario autenticado.
    - Valida que haya items
    - Bloquea filas de productos (SELECT ... FOR UPDATE)
    - Verifica stock y descuenta de forma atómica
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="La orden está vacía")

    try:
        # Orden base
        order = Order(user_id=current.id, status="CREATED")
        db.add(order)
        db.flush()  # genera order.id sin commit

        items_out: List[OrderItemOut] = []

        for item in payload.items:
            # Bloquea el producto para evitar carreras de stock
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto {item.product_id} no existe",
                )

            if getattr(product, "stock", 0) < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para {product.name}",
                )

            # Descontar stock
            product.stock -= item.quantity

            # Registrar item con precio unitario "congelado"
            unit_price = float(product.price)
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
            db.add(order_item)

            items_out.append(
                OrderItemOut(
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    product_name=product.name,
                )
            )

        db.commit()
        db.refresh(order)

        return OrderOut(
            id=order.id,
            created_at=order.created_at,
            status=order.status,
            items=items_out,
        )
    except Exception:
        db.rollback()
        raise


@router.get("/my", response_model=List[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """
    Devuelve las órdenes del usuario autenticado, más eficiente
    (evita N+1) cargando items y productos con joinedload.
    """
    orders: List[Order] = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == current.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    result: List[OrderOut] = []
    for o in orders:
        items_out = [
            OrderItemOut(
                product_id=i.product_id,
                quantity=i.quantity,
                unit_price=float(i.unit_price),
                product_name=i.product.name if i.product else "",
            )
            for i in (o.items or [])
        ]
        result.append(
            OrderOut(
                id=o.id,
                created_at=o.created_at,
                status=o.status,
                items=items_out,
            )
        )
    return result
