from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime
from backend.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True)
    business_id = Column(String, ForeignKey("businesses.id"))
    asaas_customer_id = Column(String)
    asaas_subscription_id = Column(String)
    status = Column(String, default="trialing")
    plan = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
