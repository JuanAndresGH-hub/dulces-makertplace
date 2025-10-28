from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Auth / User
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Product
class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int
    image_url: str | None = None
    category: str = "General"
    is_vegan: bool = False
    is_gluten_free: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    image_url: str | None = None
    category: str | None = None
    is_vegan: bool | None = None
    is_gluten_free: bool | None = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Orders
class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    product_name: str

class OrderCreate(BaseModel):
    items: List[OrderItemIn]

class OrderOut(BaseModel):
    id: int
    created_at: datetime
    status: str
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
