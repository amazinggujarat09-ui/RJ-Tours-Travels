from datetime import date

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine
from app.models.booking import Booking
from app.models.contact import Contact
from app.models.review import Review
from app.models.tour_package import TourPackage
from app.models.user import User
from app.models.wishlist import Wishlist


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def seed_db(db: Session) -> None:
    package_price_updates = {
        "Taj Mahal Majestic Tour": 25415.0,
        "Kerala Backwaters Cruise": 42415.0,
        "Royal Rajasthan Heritage": 50915.0,
        "Himalayan Valley Escape": 33915.0,
        "Goa Golden Sand Beaches": 16915.0,
    }

    if db.query(User).count() > 0:
        admin_user = db.query(User).filter(User.email == "admin089@gmail.com").first()
        if admin_user and admin_user.full_name != "RJ Travels Admin":
            admin_user.full_name = "RJ Travels Admin"

        demo_user = db.query(User).filter(User.email == "demo@travelease.com").first()
        if demo_user:
            demo_user.email = "demo@rjtravels.com"

        for title, price in package_price_updates.items():
            package = db.query(TourPackage).filter(TourPackage.title == title).first()
            if package and package.price != price:
                package.price = price
        db.commit()
        return

    admin = User(
        full_name="RJ Travels Admin",
        email="admin089@gmail.com",
        password_hash=hash_password("admin089"),
        phone="+919876543210",
    )
    demo_user = User(
        full_name="Demo Traveler",
        email="demo@rjtravels.com",
        password_hash=hash_password("Demo@12345"),
        phone="+15550299",
    )
    db.add_all([admin, demo_user])
    db.commit()

    packages = [
        TourPackage(
            title="Taj Mahal Majestic Tour",
            destination="Agra, Uttar Pradesh",
            description="Explore the monument of love, visit the historic Agra Fort, and experience beautiful Mughal architecture.",
            price=package_price_updates["Taj Mahal Majestic Tour"],
            duration_days=3,
            image_url="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
            available_seats=15,
        ),
        TourPackage(
            title="Kerala Backwaters Cruise",
            destination="Alleppey, Kerala",
            description="Cruise through serene backwaters on a traditional luxury houseboat, surrounded by emerald palm trees.",
            price=package_price_updates["Kerala Backwaters Cruise"],
            duration_days=5,
            image_url="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
            available_seats=10,
        ),
        TourPackage(
            title="Royal Rajasthan Heritage",
            destination="Jaipur, Rajasthan",
            description="Tour grand historic forts, royal palaces, and vibrant bazaars in the Pink City of Jaipur.",
            price=package_price_updates["Royal Rajasthan Heritage"],
            duration_days=6,
            image_url="https://images.unsplash.com/photo-1477584322813-ac804b4c730e?auto=format&fit=crop&w=1200&q=80",
            available_seats=20,
        ),
        TourPackage(
            title="Himalayan Valley Escape",
            destination="Manali, Himachal Pradesh",
            description="Enjoy spectacular snow-capped peaks, paragliding, and scenic mountain drives in Solang Valley.",
            price=package_price_updates["Himalayan Valley Escape"],
            duration_days=4,
            image_url="https://images.unsplash.com/photo-1626830503241-11e6611f8c5c?auto=format&fit=crop&w=1200&q=80",
            available_seats=18,
        ),
        TourPackage(
            title="Goa Golden Sand Beaches",
            destination="Calangute, Goa",
            description="Relax on sun-kissed beaches, explore heritage Portuguese churches, and enjoy fresh seafood shacks.",
            price=package_price_updates["Goa Golden Sand Beaches"],
            duration_days=3,
            image_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            available_seats=25,
        ),
    ]
    db.add_all(packages)
    db.commit()

    # Seed Bookings
    booking1 = Booking(
        user_id=demo_user.user_id,
        package_id=packages[0].package_id,
        number_of_people=2,
        total_amount=packages[0].price * 2,
        status="Confirmed"
    )
    db.add(booking1)

    # Seed Reviews
    review1 = Review(
        user_id=demo_user.user_id,
        package_id=packages[0].package_id,
        rating=5,
        review_text="Visiting the Taj Mahal at sunrise was a dream come true! Highly recommend this tour."
    )
    review2 = Review(
        user_id=demo_user.user_id,
        package_id=packages[1].package_id,
        rating=5,
        review_text="Cruising the backwaters of Alleppey in a houseboat was incredibly relaxing. Amazing food too!"
    )
    db.add_all([review1, review2])

    # Seed Contacts
    contact1 = Contact(
        name="Amit Sharma",
        email="amit.sharma@example.com",
        message="Is there any discount available if we book both the Taj Mahal and Rajasthan packages together?"
    )
    db.add(contact1)
    db.commit()
