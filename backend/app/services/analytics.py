from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.review import Review
from app.models.tour_package import TourPackage
from app.models.user import User


class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(db: Session) -> dict[str, float | int]:
        user_count = db.scalar(select(func.count(User.user_id))) or 0
        package_count = db.scalar(select(func.count(TourPackage.package_id))) or 0
        booking_count = db.scalar(select(func.count(Booking.booking_id))) or 0
        pending_booking_count = db.scalar(select(func.count(Booking.booking_id)).where(func.lower(Booking.status) == "pending")) or 0
        confirmed_booking_count = db.scalar(select(func.count(Booking.booking_id)).where(func.lower(Booking.status) == "confirmed")) or 0
        total_revenue = db.scalar(select(func.coalesce(func.sum(Booking.total_amount), 0.0)).where(func.lower(Booking.status).in_(["confirmed", "completed"]))) or 0.0
        average_rating = db.scalar(select(func.coalesce(func.avg(Review.rating), 0.0))) or 0.0
        return {
            "user_count": user_count,
            "package_count": package_count,
            "booking_count": booking_count,
            "pending_booking_count": pending_booking_count,
            "confirmed_booking_count": confirmed_booking_count,
            "total_revenue": float(total_revenue),
            "average_rating": float(average_rating),
        }
