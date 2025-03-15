from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views import ReportViewSet, UserViewSet, TankViewSet, InventoryViewSet

router = DefaultRouter()

# Register the view sets with the router
router.register("users", UserViewSet, basename="users")
router.register("tanks", TankViewSet, basename="tanks")
router.register("inventory", InventoryViewSet, basename="inventory")
router.register("reports", ReportViewSet, basename="reports")

urlpatterns = [
    path("", include(router.urls)),
]
