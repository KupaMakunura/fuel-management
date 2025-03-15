import io
from datetime import datetime
import os

import pandas as pd
from django.db.models import Sum, Count
from django.http import FileResponse
from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from rest_framework import status
from rest_framework.decorators import action as restful_action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny

from core.helper import hash_password, generate_tokens, send_verification_code
from core.models import Report, User, Inventory, Tank, UserTwoFactor
from core.predictions import predict_price
from core.serializers import (
    ReportSerializer,
    UserSerializer,
    InventorySerializer,
    TankSerializer,
)


# Create your models here.


class UserViewSet(ModelViewSet):

    def get_serializer_class(self):
        if self.request.method == "POST" and self.action == "create":
            return UserSerializer
        elif self.request.method == "GET" and self.action == "list":
            return UserSerializer

    def get_queryset(self):
        return User.objects.all()

    # create new user
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # hash the password

            password = serializer.validated_data.get("password")
            hashed_password = hash_password(password)

            serializer.validated_data.__setitem__("password", hashed_password)
            serializer.save()

            # send verification code

            verification_code = send_verification_code(request.data["email"])

            if verification_code is None:
                response = {
                    "sent": False,
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            # create tokens
            access_token, refresh_token = generate_tokens(serializer.instance)

            user_data = UserSerializer(serializer.instance).data

            response = {
                "created": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "data": user_data,
            }

            return Response(response, status=status.HTTP_201_CREATED)

        else:

            response = {
                "created": False,
            }

            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    #     login the user

    @restful_action(methods=["POST"], detail=False, url_path="login")
    def login(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        try:

            user = User.objects.get(email=email)

            if user.check_password(password):
                access_token, refresh_token = generate_tokens(user)

                # send the email verification code
                verification_code = send_verification_code(email)

                # return user data

                user_data = UserSerializer(user).data

                response = {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "login": True,
                    "data": user_data,
                }

                return Response(response, status=status.HTTP_200_OK)
            else:

                response = {
                    "password": False,
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            response = {
                "found": False,
            }

            return Response(response, status=status.HTTP_401_UNAUTHORIZED)

    # send code for resetting password
    @restful_action(methods=["POST"], detail=False, url_path="forgot-password")
    def forgot_password(self, *args, **kwargs):
        try:
            email = self.request.data["email"]

            user = User.objects.get(email=email)

            access_token, refresh_token = generate_tokens(user)

            user_data = UserSerializer(user, many=False).data

            response = {
                "user": user_data,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "sent": True,
            }

            return Response(response, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            response = {"found": False}

            return Response(response, status=status.HTTP_404_NOT_FOUND)

    @restful_action(methods=["POST"], detail=False, url_path="two-factor-auth")
    def two_factor_auth(self, *args, **kwargs):
        try:
            email = self.request.data["email"]
            code = self.request.data["code"]
            user = User.objects.get(email=email)
            verification_code = UserTwoFactor.objects.get(
                user=user, verification_code=code
            )
            if verification_code:
                verification_code.delete()
                access_token, refresh_token = generate_tokens(user)
                user_data = UserSerializer(user, many=False).data
                response = {
                    "user": user_data,
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "sent": True,
                }
                return Response(response, status=status.HTTP_200_OK)
            else:
                response = {
                    "valid": False,
                }
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            response = {
                "found": False,
            }
            return Response(response, status=status.HTTP_404_NOT_FOUND)

    # changing  password
    @restful_action(methods=["POST"], detail=True, url_path="change-password")
    def change_password(self, *args, **kwargs):
        old_password = self.request.data["old_password"]
        new_password = self.request.data["new_password"]

        user = self.get_object()

        if user.check_password(old_password):
            if old_password == new_password:
                response = {"repeat": True}

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            else:
                user.password = hash_password(new_password)

                user.save()

                # creating new token for user
                access_token, refresh_token = generate_tokens(user)

                user_data = UserSerializer(user, many=False).data

                response = {
                    "user": user_data,
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "changed": True,
                }

                return Response(response, status=status.HTTP_200_OK)

        # old password is wrong
        else:
            response = {"valid": False}

            return Response(response, status=status.HTTP_400_BAD_REQUEST)


# tank view set
class TankViewSet(ModelViewSet):
    queryset = Tank.objects.all().order_by("id")
    serializer_class = TankSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {"created": True, "data": serializer.data}
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                "created": False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # update

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {"updated": True, "data": serializer.data}
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                "updated": False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        # delete

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        response = {
            "deleted": True,
        }
        return Response(response, status=status.HTTP_200_OK)

    # upload csv with tanks

    @restful_action(methods=["POST"], detail=False, url_path="upload-csv")
    def upload_csv(self, request, *args, **kwargs):
        try:
            file = request.FILES["csv_file"]

            # Read CSV file using pandas
            df = pd.read_csv(file)

            # Validate required columns
            required_columns = ["name", "capacity", "product"]
            if not all(col in df.columns for col in required_columns):
                response = {
                    "uploaded": False,
                    "error": "The CSV file must contain columns: name, capacity description",
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            errors = []

            # Process each row
            for index, row in df.iterrows():
                try:

                    # Create inventory item
                    Tank.objects.create(
                        name=row["name"],
                        product=row["product"],
                        capacity=row["capacity"],
                    )
                    success_count += 1

                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")

            response = {
                "uploaded": True,
                "success_count": success_count,
                "total_rows": len(df),
                "errors": errors,
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            response = {"uploaded": False, "error": str(e)}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # tanks report
    @restful_action(methods=["GET"], detail=False, url_path="generate-tanks-report")
    def generate_tanks_report(self, request, *args, **kwargs):
        try:
            # Create buffer
            buffer = io.BytesIO()

            # Create PDF document
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()

            # Add title
            title_style = ParagraphStyle(
                "CustomTitle", parent=styles["Heading1"], fontSize=16, spaceAfter=30
            )
            story.append(Paragraph("Tanks Summary Report", title_style))
            story.append(
                Paragraph(
                    f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                    styles["Normal"],
                )
            )
            story.append(Spacer(1, 20))

            # Summary statistics
            total_tanks = Tank.objects.count()
            total_capacity = (
                Tank.objects.aggregate(Sum("capacity"))["capacity__sum"] or 0
            )

            # Add summary
            story.append(Paragraph("Summary Statistics:", styles["Heading2"]))
            summary_data = [
                ["Total Tanks:", str(total_tanks)],
                ["Total Capacity:", f"{total_capacity:,} liters"],
            ]
            summary_table = Table(summary_data, colWidths=[200, 200])
            summary_table.setStyle(
                TableStyle(
                    [
                        ("FONTSIZE", (0, 0), (-1, -1), 12),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ("PADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
            story.append(summary_table)
            story.append(Spacer(1, 20))

            # Tanks table
            story.append(Paragraph("Tank Details:", styles["Heading2"]))
            tanks = Tank.objects.all()

            # Table headers
            table_data = [["Name", "Product", "Capacity (L)", "Created Date"]]

            # Add tank data
            for tank in tanks:
                table_data.append(
                    [
                        tank.name,
                        tank.product,
                        f"{tank.capacity:,}",
                        tank.created_at.strftime("%Y-%m-%d"),
                    ]
                )

            # Create and style table
            tanks_table = Table(table_data, colWidths=[120, 120, 120, 120])
            tanks_table.setStyle(
                TableStyle(
                    [
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 0), (-1, -1), 10),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("PADDING", (0, 0), (-1, -1), 6),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ]
                )
            )
            story.append(tanks_table)

            doc.build(story)
            buffer.seek(0)

            # Create a unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"tanks_report_{timestamp}.pdf"

            # Ensure the reports directory exists
            reports_dir = os.path.join(settings.BASE_DIR, "cdn", "reports")
            os.makedirs(reports_dir, exist_ok=True)

            # Full file path
            file_path = os.path.join(reports_dir, filename)

            # Save the PDF to file
            with open(file_path, "wb") as f:
                f.write(buffer.getvalue())

            # Construct the file URL
            file_url = f"/cdn/reports/{filename}"
            absolute_url = request.build_absolute_uri(file_url)

            # Create and save the report
            Report.objects.create(file_url=absolute_url, report_type="tanks")

            return Response(
                {
                    "success": True,
                    "file_url": absolute_url,
                    "filename": filename,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# inventory view set
class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all().order_by("-created_at")
    serializer_class = InventorySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {"created": True, "data": serializer.data}
            return Response(response, status=status.HTTP_201_CREATED)
        else:
            response = {
                "created": False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # update

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response = {"updated": True, "data": serializer.data}
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                "updated": False,
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # delete
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        response = {
            "deleted": True,
        }
        return Response(response, status=status.HTTP_200_OK)

    #

    @restful_action(methods=["POST"], detail=False, url_path="upload-csv")
    def upload_csv(self, request, *args, **kwargs):
        try:
            file = request.FILES["csv_file"]

            # Read CSV file using pandas
            df = pd.read_csv(file)

            # Validate required columns
            required_columns = ["name", "volume", "description"]
            if not all(col in df.columns for col in required_columns):
                response = {
                    "uploaded": False,
                    "error": "The CSV file must contain columns: name, volume, description",
                }

                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            success_count = 0
            errors = []

            # Process each row
            for index, row in df.iterrows():
                try:

                    # Create inventory item
                    inventory = Inventory.objects.create(
                        name=row["name"],
                        volume=row["volume"],
                        description=row.get("description", ""),
                    )
                    success_count += 1

                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")

            response = {
                "uploaded": True,
                "success_count": success_count,
                "total_rows": len(df),
                "errors": errors,
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            response = {"uploaded": False, "error": str(e)}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @restful_action(methods=["GET"], detail=False, url_path="generate-inventory-report")
    def generate_inventory_report(self, request, *args, **kwargs):
        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()

            # Title
            title_style = ParagraphStyle(
                "CustomTitle", parent=styles["Heading1"], fontSize=16, spaceAfter=30
            )
            story.append(Paragraph("Inventory Summary Report", title_style))
            story.append(
                Paragraph(
                    f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
                    styles["Normal"],
                )
            )
            story.append(Spacer(1, 20))

            # Detailed inventory table
            story.append(Paragraph("Inventory Details:", styles["Heading2"]))
            inventories = Inventory.objects.select_related("tank").all()

            table_data = [
                ["Fuel Type", "Tank", "Volume (L)", "Description", "Date Added"]
            ]
            for inv in inventories:
                table_data.append(
                    [
                        inv.name.title(),
                        inv.tank.name if inv.tank else "N/A",
                        f"{inv.volume:,}",
                        (
                            inv.description[:50] + "..."
                            if len(inv.description) > 50
                            else inv.description
                        ),
                        inv.created_at.strftime("%Y-%m-%d"),
                    ]
                )

            inventory_table = Table(table_data, colWidths=[80, 80, 100, 160, 100])
            inventory_table.setStyle(
                TableStyle(
                    [
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 10),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("PADDING", (0, 0), (-1, -1), 6),
                        ("ALIGN", (2, 1), (2, -1), "RIGHT"),
                    ]
                )
            )
            story.append(inventory_table)

            doc.build(story)
            buffer.seek(0)

            # Create a unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"inventory_report_{timestamp}.pdf"

            # Ensure the reports directory exists
            reports_dir = os.path.join(settings.BASE_DIR, "cdn", "reports")
            os.makedirs(reports_dir, exist_ok=True)

            # Full file path
            file_path = os.path.join(reports_dir, filename)

            # Save the PDF to file
            with open(file_path, "wb") as f:
                f.write(buffer.getvalue())
            # Construct the file URL
            file_url = f"/cdn/reports/{filename}"
            absolute_url = request.build_absolute_uri(file_url)

            # Create and save the report
            Report.objects.create(file_url=absolute_url, report_type="inventory")

            return Response(
                {
                    "success": True,
                    "file_url": absolute_url,
                    "filename": filename,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "error": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # generate predictions for fuels based on volume and tank capacity
    @restful_action(methods=["POST"], detail=False, url_path="get-predictions")
    def get_predictions(self, request, *args, **kwargs):
        if request.method == "POST":
            product = request.data["product"]
            date = request.data["date"]
            formatted_date = pd.to_datetime(date)

            # fetch the current inventory

            inventory = Inventory.objects.filter(name=product)

            price = predict_price(product, formatted_date)

            if price:

                response = {"predicted_price": price, "product": product, "date": date}

                return Response(response, status=status.HTTP_200_OK)

            else:

                response = {"predictions": False}

                return Response(response, status=status.HTTP_400_BAD_REQUEST)


class ReportViewSet(ModelViewSet):
    queryset = Report.objects.all().order_by("-created_at")
    serializer_class = ReportSerializer
