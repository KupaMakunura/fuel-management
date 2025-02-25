from rest_framework.routers import DefaultRouter

from core.views import UserViewSet

router = DefaultRouter()

# Register the viewsets with the router


urlpatterns = [
    router.register('users', UserViewSet, basename='users'),
]
