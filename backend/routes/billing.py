from fastapi import APIRouter, Depends
from backend.services.asaas_service import AsaasService
from backend.models.subscription import Subscription
from backend.database import get_db

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.post("/subscribe")
def subscribe(plan: str, db=Depends(get_db), user=Depends(get_current_user)):
    business = user.business

    customer = AsaasService.create_customer(business)

    subscription_data = AsaasService.create_subscription(
        customer_id=customer["id"],
        plan=get_plan(plan)
    )

    subscription = Subscription(
        id=subscription_data["id"],
        business_id=business.id,
        asaas_customer_id=customer["id"],
        asaas_subscription_id=subscription_data["id"],
        status=subscription_data["status"],
        plan=plan
    )

    db.add(subscription)
    db.commit()

    return {"status": "ok", "subscription": subscription_data}
