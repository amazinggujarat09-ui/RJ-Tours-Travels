from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    package_id: int
    rating: int = Field(ge=1, le=5)
    review_text: str | None = Field(default=None, max_length=1000)


class ReviewOut(BaseModel):
    review_id: int
    user_id: int
    package_id: int
    rating: int
    review_text: str | None
    created_at: datetime
    user_name: str | None = None

    model_config = {"from_attributes": True}
