from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    message: str | None = Field(default=None, max_length=2000)


class ContactOut(BaseModel):
    contact_id: int
    name: str | None
    email: EmailStr | None
    message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
