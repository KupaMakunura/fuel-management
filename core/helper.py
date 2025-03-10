import json
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import requests
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserTwoFactor


# generate user tokens
def generate_tokens(user=None):
    access_token = None
    refresh_token = None
    if user is None:
        return access_token, refresh_token

    else:

        token_obj = RefreshToken.for_user(user)
        access_token = str(token_obj.access_token)
        refresh_token = str(token_obj)

        return access_token, refresh_token


# password hasher
def hash_password(password):
    return make_password(password)


def send_verification_code(email):
    try:
        # Get the user by email
        user = User.objects.get(email=email)

        # Generate a random 6-digit verification code
        verification_code = random.randint(100000, 999999)

        # Create or update two factor instance
        UserTwoFactor.objects.create(user=user, verification_code=verification_code)

        url = "https://api.mailersend.com/v1/email"
        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": f"Bearer mlsn.7f65e08654e5d705787b790209d269f378ca486213a9bc8899d308038689d9cd",
        }

        payload = {
            "from": {"email": "MS_8ctrUU@trial-vywj2lp896jg7oqz.mlsender.net"},
            "to": [{"email": email}],
            "subject": "Email Verification Code",
            "text": f"Your verification code is: {verification_code}",
            "html": f"Your verification code is: {verification_code}",
        }

        response = requests.post(url, headers=headers, data=json.dumps(payload))

        if response.status_code == 202:
            return verification_code
        else:
            print(f"Error sending email: {response.text}")
            return None

    except User.DoesNotExist:
        print("User not found")
        return None
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return None
