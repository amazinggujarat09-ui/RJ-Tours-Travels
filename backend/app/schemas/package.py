from datetime import date, datetime

from pydantic import BaseModel, Field


class PackageBase(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    destination: str = Field(min_length=2, max_length=100)
    description: str | None = None
    price: float = Field(gt=0)
    duration_days: int = Field(gt=0)
    image_url: str | None = None
    category: str | None = "All"
    start_date: date | None = None
    end_date: date | None = None
    featured: bool | None = False
    available_seats: int | None = Field(default=0, ge=0)


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    title: str | None = None
    destination: str | None = None
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    duration_days: int | None = Field(default=None, gt=0)
    image_url: str | None = None
    category: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    featured: bool | None = None
    available_seats: int | None = Field(default=None, ge=0)


class PackageOut(PackageBase):
    package_id: int
    rating_average: float | None = 0.0
    review_count: int | None = 0
    created_at: datetime

    model_config = {"from_attributes": True}
