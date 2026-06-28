from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin, get_current_user, get_db
from app.models.booking import Booking
from app.models.tour_package import TourPackage
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    package = db.get(TourPackage, payload.package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    
    available = package.available_seats or 0
    if available < payload.number_of_people:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough seats available")

    booking = Booking(
        user_id=current_user.user_id,
        package_id=payload.package_id,
        number_of_people=payload.number_of_people,
        total_amount=package.price * payload.number_of_people,
        status="Confirmed",
    )
    if package.available_seats is not None:
        package.available_seats -= payload.number_of_people
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/me", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Booking).filter(Booking.user_id == current_user.user_id).order_by(Booking.booking_date.desc()).all()


@router.get("", response_model=list[BookingOut])
def list_bookings(db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    return db.query(Booking).order_by(Booking.booking_date.desc()).all()


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(booking_id: int, payload: BookingStatusUpdate, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return booking
