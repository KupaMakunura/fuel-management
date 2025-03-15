from rest_framework import serializers

from core.models import Report, User, Inventory, Tank


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "is_staff",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tank
        fields = ["id", "name", "capacity", "product", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class InventorySerializer(serializers.ModelSerializer):
    tank = TankSerializer(read_only=True, many=False)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "name",
            "tank",
            "volume",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "report_type", "file_url", "created_at", "updated_at"]
