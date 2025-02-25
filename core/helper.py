from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken


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
