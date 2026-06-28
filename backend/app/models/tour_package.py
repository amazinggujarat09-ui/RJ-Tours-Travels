from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TourPackage(Base):
    __tablename__ = "tour_packages"

    package_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    destination: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    available_seats: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    @property
    def category(self) -> str:
        dest = (self.destination or "").lower()
        desc = (self.description or "").lower()
        title = (self.title or "").lower()
        if "beach" in dest or "beach" in desc or "sunset" in title or "phuket" in dest:
            return "Beach"
        elif "adventure" in desc or "mountain" in desc or "alps" in desc or "ubud" in dest or "bali" in dest:
            return "Adventure"
        elif "city" in desc or "tokyo" in dest or "dubai" in dest or "neon" in desc:
            return "City"
        elif "culture" in desc or "paris" in dest or "museum" in desc or "temple" in desc:
            return "Culture"
        return "Family"

    @property
    def start_date(self) -> date:
        return date(2026, 8, 1)

    @property
    def end_date(self) -> date:
        return date(2026, 8, 8)

    @property
    def featured(self) -> bool:
        return True

    @property
    def rating_average(self) -> float:
        if not self.reviews:
            return 5.0
        return sum(review.rating for review in self.reviews) / len(self.reviews)

    @property
    def review_count(self) -> int:
        return len(self.reviews)

    bookings = relationship("Booking", back_populates="package", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="package", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="package", cascade="all, delete-orphan")
