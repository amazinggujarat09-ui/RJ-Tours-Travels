from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin, get_db
from app.models.booking import Booking
from app.models.user import User
from app.schemas.admin import AnalyticsOut
from app.schemas.user import UserOut
from app.services.analytics import AnalyticsService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AnalyticsOut)
def dashboard(db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    metrics = AnalyticsService.get_dashboard_metrics(db)
    return AnalyticsOut(**metrics)


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role modification is not supported; admin role is determined dynamically.")


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    if user_id == current_admin.user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete themselves")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.get("/bookings", response_model=list[dict])
def admin_bookings(db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    bookings = db.query(Booking).order_by(Booking.booking_date.desc()).all()
    return [
        {
            "booking_id": booking.booking_id,
            "user_id": booking.user_id,
            "package_id": booking.package_id,
            "package_title": booking.package.title if booking.package else None,
            "customer_name": booking.user.full_name if booking.user else "Deleted User",
            "booking_date": booking.booking_date,
            "number_of_people": booking.number_of_people,
            "total_amount": booking.total_amount,
            "status": booking.status,
        }
        for booking in bookings
    ]


@router.get("/tables/{table_name}", response_model=list[dict])
def get_table_data(table_name: str, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    allowed_tables = {"users", "tour_packages", "bookings", "wishlist", "reviews", "contacts"}
    if table_name not in allowed_tables:
        raise HTTPException(status_code=400, detail="Invalid table name")

    result = db.execute(text(f"SELECT * FROM {table_name}")).mappings().all()
    data = []
    for row in result:
        row_dict = {}
        for k, v in row.items():
            if isinstance(v, (datetime, date)):
                row_dict[k] = v.isoformat()
            else:
                row_dict[k] = v
        data.append(row_dict)
    return data
