# backend/app/main.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, engine
from .models import Product
from .auth import seed_admin
from .routers import auth_router, products_router, orders_router, admin_router

# Usa un nombre distinto para evitar sombra con el paquete "app"
api = FastAPI(title="Candy Marketplace API", version="1.0.0")

# Servir estáticos (imágenes)
STATIC_DIR = Path(__file__).resolve().parent / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
api.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# CORS (ajusta dominios si quieres)
api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # si quieres abrir a todos durante dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
api.include_router(auth_router.router, tags=["auth"])
api.include_router(products_router.router, tags=["products"])
api.include_router(orders_router.router, tags=["orders"])
api.include_router(admin_router.router, prefix="/admin", tags=["admin"])  # ✅ prefijo /admin

# Healthcheck rápido
@api.get("/__health")
def __health():
    return {"status": "ok", "version": "1.0.0"}

@api.on_event("startup")
def on_startup():
    # Crear tablas
    Base.metadata.create_all(bind=engine)

    # Semillas
    with Session(bind=engine) as db:
        seed_admin(db)
        # Productos de ejemplo (solo si no hay)
        if db.query(Product).count() == 0:
            samples = [
                Product(
                    name="Gomitas de Fruta", description="Gomitas surtidas",
                    price=3.50, stock=100, image_url="/static/gomitas.svg",
                    category="Gomitas", is_vegan=True, is_gluten_free=True
                ),
                Product(
                    name="Chocolate Amargo 70%", description="Tableta premium",
                    price=5.99, stock=50, image_url="/static/chocolate.svg",
                    category="Chocolates", is_vegan=False, is_gluten_free=True
                ),
                Product(
                    name="Chicle de Menta", description="Paquete x10",
                    price=1.99, stock=200, image_url="/static/chicle.svg",
                    category="Caramelos", is_vegan=True, is_gluten_free=True
                ),
                Product(
                    name="Galletas de Chocolate", description="Galletas crujientes",
                    price=4.50, stock=75, image_url="/static/chocolate.svg",
                    category="Galletas", is_vegan=False, is_gluten_free=False
                ),
                Product(
                    name="Confites Colombianos", description="Dulces tradicionales",
                    price=6.00, stock=30, image_url="/static/gomitas.svg",
                    category="Colombianos", is_vegan=True, is_gluten_free=True
                ),
                Product(
                    name="Bebida de Chocolate", description="Chocolate caliente",
                    price=3.00, stock=40, image_url="/static/chocolate.svg",
                    category="Bebidas", is_vegan=False, is_gluten_free=True
                ),
            ]
            db.add_all(samples)
            db.commit()

# Exporta con el nombre que uvicorn espera: "app"
app = api
