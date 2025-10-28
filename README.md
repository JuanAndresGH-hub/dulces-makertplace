# 🍬 Candy Marketplace (FastAPI + React + Postgres + Docker)

Proyecto full‑stack dockerizado con autenticación JWT (PyJWT), panel de **Administrador** y **Usuario**.

## Estructura
```
candy-market/
├─ backend/        # FastAPI + SQLAlchemy + JWT
├─ frontend/       # React + Vite
└─ docker-compose.yml
```

## Arranque rápido (Docker)
1. Copia `backend/.env.example` a `backend/.env` y **opcionalmente** cambia `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
2. En la raíz del proyecto:
   ```bash
   docker compose up -d --build
   ```
3. API: http://localhost:8000  (Swagger en `/docs`)
4. Frontend: http://localhost:5173

### Credenciales seed
- Admin: `admin@example.com` / `admin123` (si no cambiaste el .env)

## Endpoints clave
- `POST /auth/register` — registro
- `POST /auth/login` — login → `{ access_token, user }`
- `GET  /products` — catálogo
- `POST /products` — crear (ADMIN)
- `PUT  /products/{id}` — actualizar (ADMIN)
- `DELETE /products/{id}` — borrar (ADMIN)
- `POST /orders` — crear orden (USER)
- `GET  /orders/my` — mis órdenes
- `GET  /admin/users` — lista usuarios (ADMIN)
- `GET  /admin/orders` — lista órdenes (ADMIN)

## Desarrollo local (sin Docker)
Backend:
```bash
cd backend
python -m venv .venv && . .venv/bin/activate  # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Notas
- Base de datos: PostgreSQL (puerto local 5433 desde el host).
- CORS abierto para demo. Ajusta `allow_origins` en `backend/app/main.py` para producción.
- La base crea tablas y productos de ejemplo si está vacía en el primer inicio.
# dulces-marketplace-python
# dulces-makertplace
