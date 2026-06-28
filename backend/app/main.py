from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, auth, bookings, contacts, packages, reviews, wishlist
from app.core.config import get_settings
from app.db.init_db import init_db, seed_db
from app.db.session import SessionLocal
from app.models import booking, contact, review, tour_package, user, wishlist as wishlist_model

settings = get_settings()

app = FastAPI(title=settings.project_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(packages.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(contacts.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "RJ Travels API is running"}
