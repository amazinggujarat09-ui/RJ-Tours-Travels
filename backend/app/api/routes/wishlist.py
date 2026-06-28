from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.tour_package import TourPackage
from app.models.wishlist import Wishlist
from app.schemas.wishlist import WishlistCreate, WishlistOut

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/me", response_model=list[WishlistOut])
def my_wishlist(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.user_id)
        .all()
    )
    return [
        WishlistOut(
            wishlist_id=item.wishlist_id,
            user_id=item.user_id,
            package_id=item.package_id,
            package_title=item.package.title if item.package else None,
            package_image_url=item.package.image_url if item.package else None,
            package_destination=item.package.destination if item.package else None,
        )
        for item in items
    ]


@router.post("", response_model=WishlistOut)
def add_to_wishlist(payload: WishlistCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    package = db.get(TourPackage, payload.package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    existing = db.query(Wishlist).filter(Wishlist.user_id == current_user.user_id, Wishlist.package_id == payload.package_id).first()
    if existing:
        return WishlistOut(
            wishlist_id=existing.wishlist_id,
            user_id=existing.user_id,
            package_id=existing.package_id,
            package_title=package.title,
            package_image_url=package.image_url,
            package_destination=package.destination,
        )

    wishlist = Wishlist(user_id=current_user.user_id, package_id=payload.package_id)
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return WishlistOut(
        wishlist_id=wishlist.wishlist_id,
        user_id=wishlist.user_id,
        package_id=wishlist.package_id,
        package_title=package.title,
        package_image_url=package.image_url,
        package_destination=package.destination,
    )


@router.delete("/{package_id}")
def remove_from_wishlist(package_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    item = db.query(Wishlist).filter(Wishlist.user_id == current_user.user_id, Wishlist.package_id == package_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
