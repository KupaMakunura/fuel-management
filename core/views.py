from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.helper import hash_password, generate_tokens
from core.models import User
from core.serializers import UserSerializer
from rest_framework.decorators import action as restful_action


# Create your models here.

class UserViewSet(ModelViewSet):

    def get_serializer_class(self):
        if self.request.method == 'POST' and self.action == 'create':
            return UserSerializer
        elif self.request.method == 'GET' and self.action == 'list':
            return UserSerializer

    def get_queryset(self):
        return User.objects.all()

    # create new user
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # hash the password

            password = serializer.validated_data.get('password')
            hashed_password = hash_password(password)

            serializer.validated_data.__setitem__('password', hashed_password)
            serializer.save()

            # create tokens
            access_token, refresh_token = generate_tokens(serializer.instance)

            user_data = UserSerializer(serializer.instance).data

            response = {
                'created': True,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'data': user_data
            }

            return Response(response, status=status.HTTP_201_CREATED)

        else:

            response = {
                'created': False,
            }

            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    #     login the user

    @restful_action(methods=['POST'], detail=False, url_path='login')
    def login(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        try:

            user = User.objects.get(email=email)

            if user.check_password(password):
                access_token, refresh_token = generate_tokens(user)

                # return user data

                user_data = UserSerializer(user).data

                response = {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'login': True,
                    'data': user_data,
                }

                return Response(response, status=status.HTTP_200_OK)
            else:

                response = {
                    'password': False,
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            response = {
                'found': False
            }

            return Response(response, status=status.HTTP_404_NOT_FOUND)

    # send code for resetting password
    @restful_action(methods=['POST'], detail=False, url_path='forgot-password')
    def forgot_password(self, *args, **kwargs):
        try:
            email = self.request.data['email']

            user = User.objects.get(email=email)

            access_token, refresh_token = generate_tokens(user)

            user_data = UserSerializer(user, many=False).data

            response = {
                'user': user_data,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'sent': True,
            }

            return Response(response, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            response = {
                'found': False
            }

            return Response(response, status=status.HTTP_404_NOT_FOUND)

    # changing  password
    @restful_action(methods=['POST'], detail=True, url_path='change-password')
    def change_password(self, *args, **kwargs):
        old_password = self.request.data['old_password']
        new_password = self.request.data['new_password']

        user = self.get_object()

        if user.check_password(old_password):
            if old_password == new_password:
                response = {
                    'repeat': True
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            else:
                user.password = hash_password(new_password)

                user.save()

                # creating new token for user
                access_token, refresh_token = generate_tokens(user)

                user_data = UserSerializer(user, many=False).data

                response = {
                    'user': user_data,
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'changed': True,
                }

                return Response(response, status=status.HTTP_200_OK)

        # old password is wrong
        else:
            response = {
                'valid': False
            }

            return Response(response, status=status.HTTP_400_BAD_REQUEST)
