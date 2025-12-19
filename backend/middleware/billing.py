from fastapi import Request, HTTPException
from datetime import datetime, timezone
from functools import wraps

# Plan limits
PLAN_LIMITS = {
    "basic": {"staff_limit": 1, "appointments_per_month": 100},
    "pro": {"staff_limit": 5, "appointments_per_month": 500},
    "business": {"staff_limit": -1, "appointments_per_month": -1}
}

async def check_billing_status(request: Request) -> dict:
    """Check if user has active billing (trial or subscription)"""
    db = request.app.state.db
    
    # Get user from session
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return {"can_use": False, "reason": "not_authenticated"}
    
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session:
        return {"can_use": False, "reason": "invalid_session"}
    
    user_id = session["user_id"]
    
    # Get billing status
    billing = await db.billing.find_one({"user_id": user_id})
    
    if not billing:
        return {"can_use": False, "reason": "no_subscription", "user_id": user_id}
    
    status = billing.get("status")
    now = datetime.now(timezone.utc)
    
    if status == "trialing":
        trial_end = billing.get("trial_end_date")
        if trial_end:
            if isinstance(trial_end, str):
                trial_end = datetime.fromisoformat(trial_end.replace('Z', '+00:00'))
            if trial_end.tzinfo is None:
                trial_end = trial_end.replace(tzinfo=timezone.utc)
            if now < trial_end:
                return {
                    "can_use": True,
                    "reason": "trialing",
                    "user_id": user_id,
                    "plan_id": billing.get("plan_id", "pro"),
                    "trial_days_remaining": (trial_end - now).days
                }
        return {"can_use": False, "reason": "trial_expired", "user_id": user_id}
    
    elif status == "active":
        return {
            "can_use": True,
            "reason": "active",
            "user_id": user_id,
            "plan_id": billing.get("plan_id", "basic")
        }
    
    elif status == "past_due":
        grace_end = billing.get("grace_period_end")
        if grace_end:
            if isinstance(grace_end, str):
                grace_end = datetime.fromisoformat(grace_end.replace('Z', '+00:00'))
            if grace_end.tzinfo is None:
                grace_end = grace_end.replace(tzinfo=timezone.utc)
            if now < grace_end:
                return {
                    "can_use": True,
                    "reason": "grace_period",
                    "user_id": user_id,
                    "plan_id": billing.get("plan_id", "basic"),
                    "grace_days_remaining": (grace_end - now).days
                }
        return {"can_use": False, "reason": "payment_failed", "user_id": user_id}
    
    return {"can_use": False, "reason": "inactive", "user_id": user_id}

async def check_staff_limit(request: Request, business_id: str) -> dict:
    """Check if business can add more staff"""
    db = request.app.state.db
    
    billing_status = await check_billing_status(request)
    if not billing_status.get("can_use"):
        return {"allowed": False, "reason": billing_status.get("reason")}
    
    plan_id = billing_status.get("plan_id", "basic")
    limits = PLAN_LIMITS.get(plan_id, PLAN_LIMITS["basic"])
    
    if limits["staff_limit"] == -1:
        return {"allowed": True, "limit": "unlimited"}
    
    staff_count = await db.staff.count_documents({"business_id": business_id})
    
    if staff_count >= limits["staff_limit"]:
        return {
            "allowed": False,
            "reason": "staff_limit_reached",
            "current": staff_count,
            "limit": limits["staff_limit"],
            "plan": plan_id
        }
    
    return {"allowed": True, "current": staff_count, "limit": limits["staff_limit"]}

async def check_appointment_limit(request: Request, business_id: str) -> dict:
    """Check if business can create more appointments this month"""
    db = request.app.state.db
    
    billing_status = await check_billing_status(request)
    if not billing_status.get("can_use"):
        return {"allowed": False, "reason": billing_status.get("reason")}
    
    plan_id = billing_status.get("plan_id", "basic")
    limits = PLAN_LIMITS.get(plan_id, PLAN_LIMITS["basic"])
    
    if limits["appointments_per_month"] == -1:
        return {"allowed": True, "limit": "unlimited"}
    
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    appointments_count = await db.appointments.count_documents({
        "business_id": business_id,
        "created_at": {"$gte": month_start}
    })
    
    if appointments_count >= limits["appointments_per_month"]:
        return {
            "allowed": False,
            "reason": "appointment_limit_reached",
            "current": appointments_count,
            "limit": limits["appointments_per_month"],
            "plan": plan_id
        }
    
    return {"allowed": True, "current": appointments_count, "limit": limits["appointments_per_month"]}
