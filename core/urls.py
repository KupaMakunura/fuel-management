from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views import UserViewSet

router = DefaultRouter()

# Register the view sets with the router
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls))
]
