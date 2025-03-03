from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views import UserViewSet, TankViewSet, InventoryViewSet

router = DefaultRouter()

# Register the view sets with the router
router.register("users", UserViewSet, basename="users")
router.register("tanks", TankViewSet, basename="tanks")
router.register("inventory", InventoryViewSet, basename="inventory")

urlpatterns = [
    path("", include(router.urls)),
]
