from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import uuid
import httpx
import hmac
import hashlib
import os
from .auth import get_authenticated_user

router = APIRouter(prefix="/billing", tags=["billing"])

# Asaas Configuration
ASAAS_API_KEY = os.environ.get('ASAAS_API_KEY', '')
ASAAS_SANDBOX = os.environ.get('ASAAS_SANDBOX', 'true').lower() == 'true'
ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3" if ASAAS_SANDBOX else "https://api.asaas.com/v3"
ASAAS_WEBHOOK_SECRET = os.environ.get('ASAAS_WEBHOOK_SECRET', '')

# Plan Configuration
PLANS = {
    "basic": {
        "id": "basic",
        "name": "Basic",
        "price": 29.00,
        "currency": "BRL",
        "staff_limit": 1,
        "appointments_per_month": 100,
        "features": ["1 business", "1 staff member", "100 appointments/month", "Email support"]
    },
    "pro": {
        "id": "pro",
        "name": "Pro",
        "price": 49.00,
        "currency": "BRL",
        "staff_limit": 5,
        "appointments_per_month": 500,
        "features": ["1 business", "Up to 5 staff", "500 appointments/month", "Priority support", "Reports"]
    },
    "business": {
        "id": "business",
        "name": "Business",
        "price": 79.00,
        "currency": "BRL",
        "staff_limit": -1,  # Unlimited
        "appointments_per_month": -1,  # Unlimited
        "features": ["1 business", "Unlimited staff", "Unlimited appointments", "Phone support", "Custom reports", "API access"]
    }
}

TRIAL_DAYS = 7
GRACE_PERIOD_DAYS = 3

# Helper
def get_db(request: Request):
    return request.app.state.db

async def make_asaas_request(method: str, endpoint: str, data: dict = None) -> dict:
    """Make request to Asaas API"""
    if not ASAAS_API_KEY:
        raise HTTPException(status_code=500, detail="Asaas API key not configured")
    
    async with httpx.AsyncClient() as client:
        headers = {
            "access_token": ASAAS_API_KEY,
            "Content-Type": "application/json"
        }
        url = f"{ASAAS_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = await client.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = await client.post(url, headers=headers, json=data, timeout=30)
        elif method == "PUT":
            response = await client.put(url, headers=headers, json=data, timeout=30)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code >= 400:
            error_detail = response.json() if response.text else {"error": "Unknown error"}
            raise HTTPException(status_code=response.status_code, detail=error_detail)
        
        return response.json() if response.text else {}

# ==================== MODELS ====================

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    cpf_cnpj: str
    phone: Optional[str] = None

class SubscriptionCreate(BaseModel):
    plan_id: str
    payment_method: str = "CREDIT_CARD"  # CREDIT_CARD, BOLETO, PIX

class PlanChange(BaseModel):
    new_plan_id: str

# ==================== BILLING STATUS ====================

@router.get("/status")
async def get_billing_status(request: Request):
    """Get current billing status for authenticated user"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Get user's billing record
    billing = await db.billing.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not billing:
        # New user - no billing record yet
        return {
            "status": "no_subscription",
            "plan": None,
            "trial_days_remaining": None,
            "can_use_app": False,
            "message": "Please subscribe to use Corella Agenda"
        }
    
    now = datetime.now(timezone.utc)
    status = billing.get("status", "inactive")
    plan_id = billing.get("plan_id")
    plan = PLANS.get(plan_id) if plan_id else None
    
    # Calculate trial days remaining
    trial_end = billing.get("trial_end_date")
    trial_days_remaining = None
    if trial_end:
        if isinstance(trial_end, str):
            trial_end = datetime.fromisoformat(trial_end.replace('Z', '+00:00'))
        if trial_end.tzinfo is None:
            trial_end = trial_end.replace(tzinfo=timezone.utc)
        trial_days_remaining = max(0, (trial_end - now).days)
    
    # Determine if user can use app
    can_use_app = False
    message = ""
    
    if status == "trialing":
        can_use_app = trial_days_remaining > 0
        if can_use_app:
            message = f"{trial_days_remaining} days left in your free trial"
        else:
            message = "Your trial has expired. Please subscribe to continue."
    elif status == "active":
        can_use_app = True
        message = "Your subscription is active"
    elif status == "past_due":
        # Grace period
        grace_end = billing.get("grace_period_end")
        if grace_end:
            if isinstance(grace_end, str):
                grace_end = datetime.fromisoformat(grace_end.replace('Z', '+00:00'))
            if grace_end.tzinfo is None:
                grace_end = grace_end.replace(tzinfo=timezone.utc)
            can_use_app = now < grace_end
            if can_use_app:
                days_left = (grace_end - now).days
                message = f"Payment failed. Please update payment method. {days_left} days until access is restricted."
            else:
                message = "Your subscription is suspended due to payment failure."
        else:
            message = "Payment failed. Please update your payment method."
    elif status == "canceled":
        message = "Your subscription has been canceled."
    else:
        message = "Please subscribe to use Corella Agenda"
    
    return {
        "status": status,
        "plan": plan,
        "plan_id": plan_id,
        "trial_days_remaining": trial_days_remaining,
        "trial_end_date": billing.get("trial_end_date"),
        "next_billing_date": billing.get("next_billing_date"),
        "can_use_app": can_use_app,
        "message": message,
        "asaas_customer_id": billing.get("asaas_customer_id"),
        "payment_method": billing.get("payment_method")
    }

@router.get("/plans")
async def get_plans():
    """Get available subscription plans"""
    return {"plans": list(PLANS.values()), "trial_days": TRIAL_DAYS}

# ==================== TRIAL & SUBSCRIPTION ====================

@router.post("/start-trial")
async def start_trial(request: Request):
    """Start a 7-day free trial"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Check if user already has billing record
    existing = await db.billing.find_one({"user_id": user["user_id"]})
    if existing:
        if existing.get("status") == "trialing":
            raise HTTPException(status_code=400, detail="You are already on a trial")
        if existing.get("trial_used"):
            raise HTTPException(status_code=400, detail="You have already used your free trial")
    
    now = datetime.now(timezone.utc)
    trial_end = now + timedelta(days=TRIAL_DAYS)
    
    billing_doc = {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "status": "trialing",
        "plan_id": "pro",  # Trial includes Pro features
        "trial_start_date": now,
        "trial_end_date": trial_end,
        "trial_used": True,
        "created_at": now,
        "updated_at": now
    }
    
    if existing:
        await db.billing.update_one(
            {"user_id": user["user_id"]},
            {"$set": billing_doc}
        )
    else:
        await db.billing.insert_one(billing_doc)
    
    return {
        "message": f"Your {TRIAL_DAYS}-day free trial has started!",
        "trial_end_date": trial_end.isoformat(),
        "plan": PLANS["pro"]
    }

@router.post("/create-customer")
async def create_asaas_customer(request: Request, customer: CustomerCreate):
    """Create customer in Asaas"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Check if customer already exists
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if billing and billing.get("asaas_customer_id"):
        return {"asaas_customer_id": billing["asaas_customer_id"], "message": "Customer already exists"}
    
    # Create in Asaas
    asaas_data = {
        "name": customer.name,
        "email": customer.email,
        "cpfCnpj": customer.cpf_cnpj.replace(".", "").replace("-", "").replace("/", ""),
        "externalReference": user["user_id"]
    }
    if customer.phone:
        asaas_data["phone"] = customer.phone
    
    result = await make_asaas_request("POST", "/customers", asaas_data)
    
    # Update billing record
    await db.billing.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "asaas_customer_id": result["id"],
                "cpf_cnpj": customer.cpf_cnpj,
                "phone": customer.phone,
                "updated_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    
    return {"asaas_customer_id": result["id"], "message": "Customer created successfully"}

@router.post("/subscribe")
async def create_subscription(request: Request, subscription: SubscriptionCreate):
    """Create a subscription after trial or for new users"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    # Validate plan
    if subscription.plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PLANS[subscription.plan_id]
    
    # Get billing record
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if not billing or not billing.get("asaas_customer_id"):
        raise HTTPException(status_code=400, detail="Please create a customer profile first")
    
    if billing.get("status") == "active" and billing.get("asaas_subscription_id"):
        raise HTTPException(status_code=400, detail="You already have an active subscription")
    
    now = datetime.now(timezone.utc)
    next_due = now + timedelta(days=1)  # First charge tomorrow
    
    # Create subscription in Asaas
    asaas_data = {
        "customer": billing["asaas_customer_id"],
        "billingType": subscription.payment_method,
        "value": plan["price"],
        "nextDueDate": next_due.strftime("%Y-%m-%d"),
        "description": f"Corella Agenda - Plano {plan['name']}",
        "cycle": "MONTHLY",
        "externalReference": f"{user['user_id']}:{subscription.plan_id}"
    }
    
    result = await make_asaas_request("POST", "/subscriptions", asaas_data)
    
    # Update billing record
    await db.billing.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "status": "active",
                "plan_id": subscription.plan_id,
                "asaas_subscription_id": result["id"],
                "payment_method": subscription.payment_method,
                "next_billing_date": next_due,
                "subscription_start_date": now,
                "updated_at": now
            }
        }
    )
    
    # Update business plan
    await db.businesses.update_many(
        {"owner_id": user["user_id"]},
        {"$set": {"plan": subscription.plan_id}}
    )
    
    return {
        "message": "Subscription created successfully!",
        "subscription_id": result["id"],
        "plan": plan,
        "next_billing_date": next_due.isoformat()
    }

@router.post("/change-plan")
async def change_plan(request: Request, plan_change: PlanChange):
    """Change subscription plan"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    if plan_change.new_plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if not billing or not billing.get("asaas_subscription_id"):
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    if billing.get("plan_id") == plan_change.new_plan_id:
        raise HTTPException(status_code=400, detail="You are already on this plan")
    
    new_plan = PLANS[plan_change.new_plan_id]
    
    # Update subscription in Asaas
    asaas_data = {
        "value": new_plan["price"],
        "description": f"Corella Agenda - Plano {new_plan['name']}"
    }
    
    await make_asaas_request("PUT", f"/subscriptions/{billing['asaas_subscription_id']}", asaas_data)
    
    # Update billing record
    await db.billing.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "plan_id": plan_change.new_plan_id,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Update business plan
    await db.businesses.update_many(
        {"owner_id": user["user_id"]},
        {"$set": {"plan": plan_change.new_plan_id}}
    )
    
    return {
        "message": f"Plan changed to {new_plan['name']} successfully!",
        "plan": new_plan
    }

@router.post("/cancel")
async def cancel_subscription(request: Request):
    """Cancel subscription"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if not billing or not billing.get("asaas_subscription_id"):
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    # Cancel in Asaas
    await make_asaas_request("DELETE", f"/subscriptions/{billing['asaas_subscription_id']}")
    
    # Update billing record
    await db.billing.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "status": "canceled",
                "canceled_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Subscription canceled. You can continue using the service until the end of your billing period."}

# ==================== INVOICES ====================

@router.get("/invoices")
async def get_invoices(request: Request):
    """Get payment history/invoices"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if not billing or not billing.get("asaas_customer_id"):
        return {"invoices": []}
    
    # Get payments from Asaas
    try:
        result = await make_asaas_request("GET", f"/payments?customer={billing['asaas_customer_id']}")
        invoices = []
        for payment in result.get("data", []):
            invoices.append({
                "id": payment["id"],
                "value": payment["value"],
                "status": payment["status"],
                "due_date": payment["dueDate"],
                "payment_date": payment.get("paymentDate"),
                "description": payment.get("description", ""),
                "invoice_url": payment.get("invoiceUrl"),
                "bank_slip_url": payment.get("bankSlipUrl"),
                "pix_qr_code": payment.get("pixQrCodeUrl")
            })
        return {"invoices": invoices}
    except Exception:
        return {"invoices": []}

# ==================== PLAN ENFORCEMENT ====================

@router.get("/limits")
async def get_plan_limits(request: Request):
    """Get current plan limits and usage"""
    db = get_db(request)
    user = await get_authenticated_user(request)
    
    billing = await db.billing.find_one({"user_id": user["user_id"]})
    if not billing:
        return {
            "can_use_app": False,
            "limits": None,
            "usage": None
        }
    
    plan_id = billing.get("plan_id", "basic")
    plan = PLANS.get(plan_id, PLANS["basic"])
    
    # Get user's business
    business = await db.businesses.find_one({"owner_id": user["user_id"]})
    if not business:
        return {
            "can_use_app": True,
            "limits": plan,
            "usage": {"staff": 0, "appointments_this_month": 0}
        }
    
    # Count staff
    staff_count = await db.staff.count_documents({"business_id": business["business_id"]})
    
    # Count appointments this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    appointments_count = await db.appointments.count_documents({
        "business_id": business["business_id"],
        "created_at": {"$gte": month_start}
    })
    
    # Check limits
    staff_limit_reached = plan["staff_limit"] != -1 and staff_count >= plan["staff_limit"]
    appointments_limit_reached = plan["appointments_per_month"] != -1 and appointments_count >= plan["appointments_per_month"]
    
    return {
        "can_use_app": True,
        "plan": plan,
        "limits": {
            "staff": plan["staff_limit"],
            "appointments_per_month": plan["appointments_per_month"]
        },
        "usage": {
            "staff": staff_count,
            "appointments_this_month": appointments_count
        },
        "limit_reached": {
            "staff": staff_limit_reached,
            "appointments": appointments_limit_reached
        },
        "upgrade_needed": staff_limit_reached or appointments_limit_reached
    }

# ==================== WEBHOOKS ====================

@router.post("/webhooks/asaas")
async def asaas_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Asaas webhook events"""
    db = get_db(request)
    body = await request.body()
    
    # Verify signature if secret is configured
    if ASAAS_WEBHOOK_SECRET:
        signature = request.headers.get("asaas-access-token", "")
        expected = hmac.new(
            ASAAS_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        import json
        data = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    event = data.get("event")
    payment = data.get("payment", {})
    
    # Store webhook event
    await db.webhook_events.insert_one({
        "event": event,
        "data": data,
        "processed": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Process event in background
    background_tasks.add_task(process_webhook_event, db, event, data)
    
    return {"status": "received"}

async def process_webhook_event(db, event: str, data: dict):
    """Process webhook event"""
    payment = data.get("payment", {})
    subscription_id = payment.get("subscription")
    
    if not subscription_id:
        return
    
    billing = await db.billing.find_one({"asaas_subscription_id": subscription_id})
    if not billing:
        return
    
    now = datetime.now(timezone.utc)
    
    if event == "PAYMENT_CONFIRMED" or event == "PAYMENT_RECEIVED":
        # Payment successful
        await db.billing.update_one(
            {"asaas_subscription_id": subscription_id},
            {
                "$set": {
                    "status": "active",
                    "last_payment_date": now,
                    "grace_period_end": None,
                    "updated_at": now
                }
            }
        )
    
    elif event == "PAYMENT_OVERDUE":
        # Payment overdue - start grace period
        grace_end = now + timedelta(days=GRACE_PERIOD_DAYS)
        await db.billing.update_one(
            {"asaas_subscription_id": subscription_id},
            {
                "$set": {
                    "status": "past_due",
                    "grace_period_end": grace_end,
                    "updated_at": now
                }
            }
        )
    
    elif event == "PAYMENT_DELETED" or event == "PAYMENT_REFUNDED":
        # Payment failed/refunded
        await db.billing.update_one(
            {"asaas_subscription_id": subscription_id},
            {
                "$set": {
                    "status": "past_due",
                    "updated_at": now
                }
            }
        )
    
    elif event == "SUBSCRIPTION_DELETED" or event == "SUBSCRIPTION_INACTIVATED":
        # Subscription canceled
        await db.billing.update_one(
            {"asaas_subscription_id": subscription_id},
            {
                "$set": {
                    "status": "canceled",
                    "canceled_at": now,
                    "updated_at": now
                }
            }
        )
