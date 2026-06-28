from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.booking import Booking
from app.models.review import Review
from app.models.tour_package import TourPackage
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/package/{package_id}", response_model=list[ReviewOut])
def list_reviews(package_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.package_id == package_id).order_by(Review.created_at.desc()).all()
    return [
        ReviewOut(
            review_id=review.review_id,
            user_id=review.user_id,
            package_id=review.package_id,
            rating=review.rating,
            review_text=review.review_text,
            created_at=review.created_at,
            user_name=review.user.full_name if review.user else None,
        )
        for review in reviews
    ]


@router.post("", response_model=ReviewOut)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    package = db.get(TourPackage, payload.package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    has_booking = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.user_id, Booking.package_id == payload.package_id)
        .first()
    )
    if not has_booking:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book the package before reviewing")

    review = Review(
        user_id=current_user.user_id,
        package_id=payload.package_id,
        rating=payload.rating,
        review_text=payload.review_text,
    )
    db.add(review)
    db.flush()

    reviews = db.query(Review).filter(Review.package_id == payload.package_id).all()
    package.rating_average = sum(review.rating for review in reviews) / len(reviews)
    package.review_count = len(reviews)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        review_id=review.review_id,
        user_id=review.user_id,
        package_id=review.package_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at,
        user_name=current_user.full_name,
    )
