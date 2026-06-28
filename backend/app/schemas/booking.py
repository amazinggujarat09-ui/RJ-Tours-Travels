from datetime import datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    package_id: int
    number_of_people: int = Field(gt=0)


class BookingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Confirmed|Pending|Cancelled|Completed)$")


class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    package_id: int
    booking_date: datetime
    number_of_people: int
    total_amount: float | None
    status: str

    model_config = {"from_attributes": True}
