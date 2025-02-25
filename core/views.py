from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.helper import hash_password, generate_tokens
from core.models import User, Inventory, Tank
from core.serializers import UserSerializer, InventorySerializer, TankSerializer
from rest_framework.decorators import action as restful_action
from rest_framework.exceptions import ValidationError
import pandas as pd


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


# tank view set
class TankViewSet(ModelViewSet):
    queryset = Tank.objects.all()
    serializer_class = TankSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {
                'created': True,
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                'created': False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # update

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {
                'updated': True,
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                'updated': False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        # delete

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        response = {
            'deleted': True,
        }
        return Response(response, status=status.HTTP_200_OK)

    # upload csv with tanks

    @restful_action(methods=['POST'], detail=False, url_path='upload-csv')
    def upload_csv(self, request, *args, **kwargs):
        try:
            file = request.FILES['csv_file']

            # Read CSV file using pandas
            df = pd.read_csv(file)

            # Validate required columns
            required_columns = ['name', 'capacity', 'product']
            if not all(col in df.columns for col in required_columns):
                response = {
                    'uploaded': False,
                    'error': 'The CSV file must contain columns: name, capacity description'
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            errors = []

            # Process each row
            for index, row in df.iterrows():
                try:

                    # Create inventory item
                    tank = Tank.objects.create(
                        name=row['name'],
                        product=row['product'],
                        capacity=row['capacity']

                    )
                    success_count += 1

                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")

            response = {
                'uploaded': True,
                'success_count': success_count,
                'total_rows': len(df),
                'errors': errors
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            response = {
                'uploaded': False,
                'error': str(e)
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)


# inventory view set
class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {
                'created': True,
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                'created': False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # update

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {
                'updated': True,
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                'updated': False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # delete
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        response = {
            'deleted': True,
        }
        return Response(response, status=status.HTTP_200_OK)

    @restful_action(methods=['POST'], detail=False, url_path='upload-csv')
    def upload_csv(self, request, *args, **kwargs):
        try:
            file = request.FILES['csv_file']

            # Read CSV file using pandas
            df = pd.read_csv(file)

            # Validate required columns
            required_columns = ['name', 'volume', 'description']
            if not all(col in df.columns for col in required_columns):
                response = {
                    'uploaded': False,
                    'error': 'The CSV file must contain columns: name, volume, description'
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            errors = []

            # Process each row
            for index, row in df.iterrows():
                try:

                    # Create inventory item
                    inventory = Inventory.objects.create(
                        name=row['name'],

                        volume=row['volume'],
                        description=row.get('description', '')
                    )
                    success_count += 1

                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")

            response = {
                'uploaded': True,
                'success_count': success_count,
                'total_rows': len(df),
                'errors': errors
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            response = {
                'uploaded': False,
                'error': str(e)
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
