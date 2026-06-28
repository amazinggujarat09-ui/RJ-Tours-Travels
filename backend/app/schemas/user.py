from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}
