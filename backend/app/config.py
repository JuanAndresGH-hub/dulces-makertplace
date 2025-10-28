from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_db: str = Field(default="candy_db", alias="POSTGRES_DB")
    postgres_user: str = Field(default="candy_user", alias="POSTGRES_USER")
    postgres_password: str = Field(default="candy_pass", alias="POSTGRES_PASSWORD")

    jwt_secret: str = Field(default="change_me", alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_min: int = Field(default=120, alias="JWT_EXPIRE_MIN")

    admin_email: str | None = Field(default=None, alias="ADMIN_EMAIL")
    admin_password: str | None = Field(default=None, alias="ADMIN_PASSWORD")
    admin_invite_code: str | None = Field(default=None, alias="ADMIN_INVITE_CODE")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
