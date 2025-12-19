from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta, date, time
from typing import Optional, List
import uuid
from .auth import get_authenticated_user

router = APIRouter(prefix="/agenda", tags=["agenda"])

# Helper
def get_db(request: Request):
    return request.app.state.db

# ==================== MODELS ====================

class BusinessCreate(BaseModel):
    name: str
    slug: str
    timezone: str = "America/New_York"
    working_hours: dict = Field(default_factory=lambda: {
        "monday": {"start": "09:00", "end": "18:00", "enabled": True},
        "tuesday": {"start": "09:00", "end": "18:00", "enabled": True},
        "wednesday": {"start": "09:00", "end": "18:00", "enabled": True},
        "thursday": {"start": "09:00", "end": "18:00", "enabled": True},
        "friday": {"start": "09:00", "end": "18:00", "enabled": True},
        "saturday": {"start": "09:00", "end": "13:00", "enabled": True},
        "sunday": {"start": "00:00", "end": "00:00", "enabled": False},
    })

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    working_hours: Optional[dict] = None
    logo_url: Optional[str] = None

class Business(BaseModel):
    business_id: str
    owner_id: str
    name: str
    slug: str
    timezone: str
    working_hours: dict
    logo_url: Optional[str] = None
    plan: str = "basic"
    created_at: datetime

class StaffCreate(BaseModel):
    name: str
    email: str
    role: str = "staff"  # owner, staff

class Staff(BaseModel):
    staff_id: str
    business_id: str
    user_id: Optional[str] = None
    name: str
    email: str
    role: str
    is_active: bool = True
    created_at: datetime

class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class Client(BaseModel):
    client_id: str
    business_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

class ServiceCreate(BaseModel):
    name: str
    duration: int  # minutes
    price: float
    description: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Service(BaseModel):
    service_id: str
    business_id: str
    name: str
    duration: int
    price: float
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class AppointmentCreate(BaseModel):
    client_id: str
    service_id: str
    staff_id: str
    start_time: datetime
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    status: Optional[str] = None  # scheduled, completed, canceled
    notes: Optional[str] = None

class Appointment(BaseModel):
    appointment_id: str
    business_id: str
    client_id: str
    service_id: str
    staff_id: str
    start_time: datetime
    end_time: datetime
    status: str = "scheduled"
    notes: Optional[str] = None
    created_at: datetime

class PublicBookingCreate(BaseModel):
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    service_id: str
    staff_id: str
    start_time: datetime

# ==================== BUSINESS ROUTES ====================

@router.get("/businesses")
async def list_businesses(request: Request):
    """List all businesses for the current user."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Find businesses where user is owner or staff
    businesses = await db.businesses.find(
        {"owner_id": user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    return businesses

@router.post("/businesses", response_model=Business)
async def create_business(request: Request, data: BusinessCreate):
    """Create a new business."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Check slug uniqueness
    existing = await db.businesses.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Business slug already exists")
    
    business_id = f"biz_{uuid.uuid4().hex[:12]}"
    business = {
        "business_id": business_id,
        "owner_id": user["user_id"],
        "name": data.name,
        "slug": data.slug,
        "timezone": data.timezone,
        "working_hours": data.working_hours,
        "logo_url": None,
        "plan": "basic",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.businesses.insert_one(business)
    
    # Create owner as staff member
    staff = {
        "staff_id": f"staff_{uuid.uuid4().hex[:12]}",
        "business_id": business_id,
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": "owner",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    await db.staff.insert_one(staff)
    
    return Business(**business)

@router.get("/businesses/{business_id}")
async def get_business(request: Request, business_id: str):
    """Get business details."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business

@router.put("/businesses/{business_id}")
async def update_business(request: Request, business_id: str, data: BusinessUpdate):
    """Update business settings."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.businesses.update_one(
        {"business_id": business_id},
        {"$set": update_data}
    )
    
    return {"message": "Business updated"}

# ==================== STAFF ROUTES ====================

@router.get("/businesses/{business_id}/staff")
async def list_staff(request: Request, business_id: str):
    """List all staff for a business."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Verify ownership
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    staff = await db.staff.find(
        {"business_id": business_id},
        {"_id": 0}
    ).to_list(100)
    
    return staff

@router.post("/businesses/{business_id}/staff")
async def add_staff(request: Request, business_id: str, data: StaffCreate):
    """Add a staff member."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    staff = {
        "staff_id": f"staff_{uuid.uuid4().hex[:12]}",
        "business_id": business_id,
        "user_id": None,
        "name": data.name,
        "email": data.email,
        "role": data.role,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.staff.insert_one(staff)
    return Staff(**staff)

# ==================== CLIENT ROUTES ====================

@router.get("/businesses/{business_id}/clients")
async def list_clients(request: Request, business_id: str):
    """List all clients for a business."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    clients = await db.clients.find(
        {"business_id": business_id},
        {"_id": 0}
    ).to_list(1000)
    
    return clients

@router.post("/businesses/{business_id}/clients")
async def create_client(request: Request, business_id: str, data: ClientCreate):
    """Create a new client."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    client = {
        "client_id": f"client_{uuid.uuid4().hex[:12]}",
        "business_id": business_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.clients.insert_one(client)
    return Client(**client)

@router.put("/businesses/{business_id}/clients/{client_id}")
async def update_client(request: Request, business_id: str, client_id: str, data: ClientUpdate):
    """Update a client."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.clients.update_one(
        {"client_id": client_id, "business_id": business_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client updated"}

@router.delete("/businesses/{business_id}/clients/{client_id}")
async def delete_client(request: Request, business_id: str, client_id: str):
    """Delete a client."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = await db.clients.delete_one(
        {"client_id": client_id, "business_id": business_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client deleted"}

@router.get("/businesses/{business_id}/clients/{client_id}/history")
async def get_client_history(request: Request, business_id: str, client_id: str):
    """Get client appointment history."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    appointments = await db.appointments.find(
        {"business_id": business_id, "client_id": client_id},
        {"_id": 0}
    ).sort("start_time", -1).to_list(100)
    
    return appointments

# ==================== SERVICE ROUTES ====================

@router.get("/businesses/{business_id}/services")
async def list_services(request: Request, business_id: str):
    """List all services for a business."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    services = await db.services.find(
        {"business_id": business_id},
        {"_id": 0}
    ).to_list(100)
    
    return services

@router.post("/businesses/{business_id}/services")
async def create_service(request: Request, business_id: str, data: ServiceCreate):
    """Create a new service."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = {
        "service_id": f"svc_{uuid.uuid4().hex[:12]}",
        "business_id": business_id,
        "name": data.name,
        "duration": data.duration,
        "price": data.price,
        "description": data.description,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.services.insert_one(service)
    return Service(**service)

@router.put("/businesses/{business_id}/services/{service_id}")
async def update_service(request: Request, business_id: str, service_id: str, data: ServiceUpdate):
    """Update a service."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.services.update_one(
        {"service_id": service_id, "business_id": business_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service updated"}

# ==================== APPOINTMENT ROUTES ====================

@router.get("/businesses/{business_id}/appointments")
async def list_appointments(
    request: Request,
    business_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """List appointments for a business."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    query = {"business_id": business_id}
    
    if start_date:
        query["start_time"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "start_time" in query:
            query["start_time"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["start_time"] = {"$lte": datetime.fromisoformat(end_date)}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(
        query,
        {"_id": 0}
    ).sort("start_time", 1).to_list(500)
    
    return appointments

@router.post("/businesses/{business_id}/appointments")
async def create_appointment(request: Request, business_id: str, data: AppointmentCreate):
    """Create a new appointment."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get service to calculate end time
    service = await db.services.find_one(
        {"service_id": data.service_id, "business_id": business_id}
    )
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    end_time = data.start_time + timedelta(minutes=service["duration"])
    
    # Check for double booking
    conflict = await db.appointments.find_one({
        "business_id": business_id,
        "staff_id": data.staff_id,
        "status": "scheduled",
        "$or": [
            {"start_time": {"$lt": end_time, "$gte": data.start_time}},
            {"end_time": {"$gt": data.start_time, "$lte": end_time}},
            {"start_time": {"$lte": data.start_time}, "end_time": {"$gte": end_time}}
        ]
    })
    
    if conflict:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    appointment = {
        "appointment_id": f"apt_{uuid.uuid4().hex[:12]}",
        "business_id": business_id,
        "client_id": data.client_id,
        "service_id": data.service_id,
        "staff_id": data.staff_id,
        "start_time": data.start_time,
        "end_time": end_time,
        "status": "scheduled",
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.appointments.insert_one(appointment)
    return Appointment(**appointment)

@router.put("/businesses/{business_id}/appointments/{appointment_id}")
async def update_appointment(
    request: Request,
    business_id: str,
    appointment_id: str,
    data: AppointmentUpdate
):
    """Update an appointment."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    appointment = await db.appointments.find_one(
        {"appointment_id": appointment_id, "business_id": business_id}
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # If rescheduling, recalculate end time and check conflicts
    if data.start_time:
        service = await db.services.find_one({"service_id": appointment["service_id"]})
        end_time = data.start_time + timedelta(minutes=service["duration"])
        update_data["end_time"] = end_time
        
        # Check conflicts
        conflict = await db.appointments.find_one({
            "business_id": business_id,
            "staff_id": appointment["staff_id"],
            "appointment_id": {"$ne": appointment_id},
            "status": "scheduled",
            "$or": [
                {"start_time": {"$lt": end_time, "$gte": data.start_time}},
                {"end_time": {"$gt": data.start_time, "$lte": end_time}},
                {"start_time": {"$lte": data.start_time}, "end_time": {"$gte": end_time}}
            ]
        })
        
        if conflict:
            raise HTTPException(status_code=400, detail="Time slot not available")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": update_data}
    )
    
    return {"message": "Appointment updated"}

@router.delete("/businesses/{business_id}/appointments/{appointment_id}")
async def cancel_appointment(request: Request, business_id: str, appointment_id: str):
    """Cancel an appointment."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id, "business_id": business_id},
        {"$set": {"status": "canceled", "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment canceled"}

# ==================== DASHBOARD STATS ====================

@router.get("/businesses/{business_id}/dashboard")
async def get_dashboard_stats(request: Request, business_id: str):
    """Get dashboard statistics."""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    business = await db.businesses.find_one(
        {"business_id": business_id, "owner_id": user["user_id"]}
    )
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    
    # Today's appointments
    today_count = await db.appointments.count_documents({
        "business_id": business_id,
        "start_time": {"$gte": today_start, "$lt": today_end},
        "status": "scheduled"
    })
    
    # This week's appointments
    week_count = await db.appointments.count_documents({
        "business_id": business_id,
        "start_time": {"$gte": week_start},
        "status": {"$in": ["scheduled", "completed"]}
    })
    
    # This month's appointments
    month_count = await db.appointments.count_documents({
        "business_id": business_id,
        "start_time": {"$gte": month_start},
        "status": {"$in": ["scheduled", "completed"]}
    })
    
    # Today's appointments list
    today_appointments = await db.appointments.find(
        {
            "business_id": business_id,
            "start_time": {"$gte": today_start, "$lt": today_end}
        },
        {"_id": 0}
    ).sort("start_time", 1).to_list(50)
    
    # Upcoming appointments (next 7 days)
    upcoming = await db.appointments.find(
        {
            "business_id": business_id,
            "start_time": {"$gte": now, "$lt": now + timedelta(days=7)},
            "status": "scheduled"
        },
        {"_id": 0}
    ).sort("start_time", 1).to_list(20)
    
    # Total clients
    total_clients = await db.clients.count_documents({"business_id": business_id})
    
    return {
        "stats": {
            "today": today_count,
            "this_week": week_count,
            "this_month": month_count,
            "total_clients": total_clients
        },
        "today_appointments": today_appointments,
        "upcoming_appointments": upcoming
    }

# ==================== PUBLIC BOOKING ROUTES ====================

@router.get("/public/{slug}")
async def get_public_business(request: Request, slug: str):
    """Get business info for public booking page."""
    db = get_db(request)
    
    business = await db.businesses.find_one(
        {"slug": slug},
        {"_id": 0, "owner_id": 0}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    services = await db.services.find(
        {"business_id": business["business_id"], "is_active": True},
        {"_id": 0}
    ).to_list(100)
    
    staff = await db.staff.find(
        {"business_id": business["business_id"], "is_active": True},
        {"_id": 0, "user_id": 0}
    ).to_list(100)
    
    return {
        "business": business,
        "services": services,
        "staff": staff
    }

@router.get("/public/{slug}/available-slots")
async def get_available_slots(
    request: Request,
    slug: str,
    staff_id: str,
    service_id: str,
    booking_date_str: str = Query(..., alias="date")
):
    """Get available time slots for a date."""
    db = get_db(request)
    
    business = await db.businesses.find_one({"slug": slug})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = await db.services.find_one({"service_id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Parse date
    booking_date = datetime.strptime(booking_date_str, "%Y-%m-%d")
    day_name = booking_date.strftime("%A").lower()
    
    # Get working hours
    working_hours = business.get("working_hours", {}).get(day_name, {})
    if not working_hours.get("enabled", False):
        return {"slots": []}
    
    start_hour, start_min = map(int, working_hours["start"].split(":"))
    end_hour, end_min = map(int, working_hours["end"].split(":"))
    
    # Get existing appointments
    day_start = booking_date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    day_end = day_start + timedelta(days=1)
    
    existing = await db.appointments.find({
        "business_id": business["business_id"],
        "staff_id": staff_id,
        "start_time": {"$gte": day_start, "$lt": day_end},
        "status": "scheduled"
    }).to_list(100)
    
    # Generate slots
    slots = []
    current_time = booking_date.replace(hour=start_hour, minute=start_min, tzinfo=timezone.utc)
    end_time = booking_date.replace(hour=end_hour, minute=end_min, tzinfo=timezone.utc)
    slot_duration = timedelta(minutes=30)  # 30-minute slots
    
    while current_time + timedelta(minutes=service["duration"]) <= end_time:
        slot_end = current_time + timedelta(minutes=service["duration"])
        
        # Check if slot conflicts with existing appointments
        is_available = True
        for apt in existing:
            apt_start = apt["start_time"]
            apt_end = apt["end_time"]
            if apt_start.tzinfo is None:
                apt_start = apt_start.replace(tzinfo=timezone.utc)
                apt_end = apt_end.replace(tzinfo=timezone.utc)
            
            if not (slot_end <= apt_start or current_time >= apt_end):
                is_available = False
                break
        
        if is_available:
            slots.append({
                "time": current_time.strftime("%H:%M"),
                "datetime": current_time.isoformat()
            })
        
        current_time += slot_duration
    
    return {"slots": slots}

@router.post("/public/{slug}/book")
async def create_public_booking(request: Request, slug: str, data: PublicBookingCreate):
    """Create a booking from public page."""
    db = get_db(request)
    
    business = await db.businesses.find_one({"slug": slug})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = await db.services.find_one({
        "service_id": data.service_id,
        "business_id": business["business_id"]
    })
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    end_time = data.start_time + timedelta(minutes=service["duration"])
    
    # Check for conflicts
    conflict = await db.appointments.find_one({
        "business_id": business["business_id"],
        "staff_id": data.staff_id,
        "status": "scheduled",
        "$or": [
            {"start_time": {"$lt": end_time, "$gte": data.start_time}},
            {"end_time": {"$gt": data.start_time, "$lte": end_time}},
            {"start_time": {"$lte": data.start_time}, "end_time": {"$gte": end_time}}
        ]
    })
    
    if conflict:
        raise HTTPException(status_code=400, detail="Time slot no longer available")
    
    # Find or create client
    client = await db.clients.find_one({
        "business_id": business["business_id"],
        "email": data.client_email
    })
    
    if not client:
        client = {
            "client_id": f"client_{uuid.uuid4().hex[:12]}",
            "business_id": business["business_id"],
            "name": data.client_name,
            "email": data.client_email,
            "phone": data.client_phone,
            "notes": None,
            "created_at": datetime.now(timezone.utc)
        }
        await db.clients.insert_one(client)
    else:
        client = {
            "client_id": client["client_id"],
            "business_id": client["business_id"],
            "name": client["name"],
            "email": client["email"],
            "phone": client.get("phone"),
            "notes": client.get("notes"),
            "created_at": client["created_at"]
        }
    
    # Create appointment
    appointment = {
        "appointment_id": f"apt_{uuid.uuid4().hex[:12]}",
        "business_id": business["business_id"],
        "client_id": client["client_id"],
        "service_id": data.service_id,
        "staff_id": data.staff_id,
        "start_time": data.start_time,
        "end_time": end_time,
        "status": "scheduled",
        "notes": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.appointments.insert_one(appointment)
    
    return {
        "message": "Booking confirmed!",
        "appointment_id": appointment["appointment_id"],
        "start_time": appointment["start_time"].isoformat(),
        "end_time": appointment["end_time"].isoformat(),
        "service": service["name"]
    }
