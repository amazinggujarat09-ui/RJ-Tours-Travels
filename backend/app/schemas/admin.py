from pydantic import BaseModel


class AnalyticsOut(BaseModel):
    user_count: int
    package_count: int
    booking_count: int
    pending_booking_count: int
    confirmed_booking_count: int
    total_revenue: float
    average_rating: float
