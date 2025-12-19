import requests
import os

ASAAS_API_KEY = os.getenv("ASAAS_API_KEY")
BASE_URL = os.getenv("ASAAS_BASE_URL")

HEADERS = {
    "Content-Type": "application/json",
    "access_token": ASAAS_API_KEY
}

class AsaasService:

    @staticmethod
    def create_customer(business):
        payload = {
            "name": business.name,
            "email": business.email,
            "externalReference": str(business.id)
        }
        response = requests.post(
            f"{BASE_URL}/customers",
            json=payload,
            headers=HEADERS
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    def create_subscription(customer_id, plan):
        payload = {
            "customer": customer_id,
            "billingType": "CREDIT_CARD",
            "cycle": "MONTHLY",
            "value": plan.price,
            "description": f"Corella {plan.name} Plan"
        }
        response = requests.post(
            f"{BASE_URL}/subscriptions",
            json=payload,
            headers=HEADERS
        )
        response.raise_for_status()
        return response.json()
