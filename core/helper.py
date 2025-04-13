import random

# Gmail SMTP setup
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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
        print(verification_code)

        # Create or update two factor instance
        UserTwoFactor.objects.create(user=user, verification_code=verification_code)

        sender_email = "chinguwacliveria@gmail.com"
        sender_password = "oiwrnwwubarsusfw"

        message = MIMEMultipart("alternative")
        message["Subject"] = "Email Verification Code"
        message["From"] = sender_email
        message["To"] = email

        text = f"Your verification code is: {verification_code}"
        html = f"Your verification code is: {verification_code}"

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")

        message.attach(part1)
        message.attach(part2)

        # Create SMTP session
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)

        # Send email
        server.send_message(message)
        server.quit()

        return verification_code

    except User.DoesNotExist:
        print("User not found")
        return None
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return None
