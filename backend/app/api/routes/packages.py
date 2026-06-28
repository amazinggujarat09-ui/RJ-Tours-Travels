from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from app.dependencies import get_current_admin, get_current_user, get_db
from app.models.booking import Booking
from app.models.review import Review
from app.models.tour_package import TourPackage
from app.models.wishlist import Wishlist
from app.schemas.package import PackageCreate, PackageOut, PackageUpdate

router = APIRouter(prefix="/packages", tags=["Tour Packages"])


@router.get("", response_model=list[PackageOut])
def list_packages(
    db: Session = Depends(get_db),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    destination: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
):
    packages = db.query(TourPackage).all()
    filtered = []
    for p in packages:
        if search:
            pat = search.lower()
            in_title = pat in (p.title or "").lower()
            in_dest = pat in (p.destination or "").lower()
            in_desc = pat in (p.description or "").lower()
            in_cat = pat in (p.category or "").lower()
            if not (in_title or in_dest or in_desc or in_cat):
                continue
        if category and category.lower() != "all" and p.category.lower() != category.lower():
            continue
        if destination and destination.lower() not in (p.destination or "").lower():
            continue
        if featured is not None and p.featured != featured:
            continue
        if min_price is not None and p.price < min_price:
            continue
        if max_price is not None and p.price > max_price:
            continue
        filtered.append(p)
    
    # Sort: featured first, then created_at desc
    from datetime import datetime
    filtered.sort(key=lambda x: (x.featured or False, x.created_at or datetime.min), reverse=True)
    return filtered


@router.get("/featured", response_model=list[PackageOut])
def featured_packages(db: Session = Depends(get_db)):
    packages = db.query(TourPackage).all()
    featured = [p for p in packages if p.featured]
    from datetime import datetime
    featured.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
    return featured[:6]


@router.get("/{package_id}")
def get_package(package_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    package = (
        db.query(TourPackage)
        .options(selectinload(TourPackage.reviews).selectinload(Review.user), selectinload(TourPackage.bookings))
        .filter(TourPackage.package_id == package_id)
        .first()
    )
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    user_wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.user_id, Wishlist.package_id == package_id).first()
    return {
        "package": package,
        "reviews": [
            {
                "review_id": review.review_id,
                "user_id": review.user_id,
                "package_id": review.package_id,
                "rating": review.rating,
                "review_text": review.review_text,
                "created_at": review.created_at,
                "user_name": review.user.full_name if review.user else None,
            }
            for review in package.reviews
        ],
        "wishlist": bool(user_wishlist),
        "booked": any(booking.user_id == current_user.user_id for booking in package.bookings),
    }


@router.post("", response_model=PackageOut)
def create_package(payload: PackageCreate, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    package = TourPackage(**payload.model_dump())
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@router.put("/{package_id}", response_model=PackageOut)
def update_package(package_id: int, payload: PackageUpdate, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    package = db.get(TourPackage, package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(package, key, value)
    db.commit()
    db.refresh(package)
    return package


@router.delete("/{package_id}")
def delete_package(package_id: int, db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    package = db.get(TourPackage, package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    db.delete(package)
    db.commit()
    return {"message": "Package deleted successfully"}
