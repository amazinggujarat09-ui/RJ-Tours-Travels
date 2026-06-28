from datetime import datetime

from pydantic import BaseModel


class WishlistCreate(BaseModel):
    package_id: int


class WishlistOut(BaseModel):
    wishlist_id: int
    user_id: int
    package_id: int
    package_title: str | None = None
    package_image_url: str | None = None
    package_destination: str | None = None

    model_config = {"from_attributes": True}
