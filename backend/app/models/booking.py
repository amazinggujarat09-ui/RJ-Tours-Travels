from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    package_id: Mapped[int] = mapped_column(ForeignKey("tour_packages.package_id", ondelete="CASCADE"), nullable=False)
    booking_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    number_of_people: Mapped[int] = mapped_column(Integer, nullable=False)
    total_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Confirmed", nullable=False)

    user = relationship("User", back_populates="bookings")
    package = relationship("TourPackage", back_populates="bookings")
