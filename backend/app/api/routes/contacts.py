from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin, get_current_user, get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactOut

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("", response_model=ContactOut)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    contact = Contact(
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("", response_model=list[ContactOut])
def list_contacts(db: Session = Depends(get_db), _: object = Depends(get_current_admin)):
    return db.query(Contact).order_by(Contact.created_at.desc()).all()
