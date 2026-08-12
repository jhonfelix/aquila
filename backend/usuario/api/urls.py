from django.urls import path

from . import views

urlpatterns = [
    path('csrf/', views.CSRFView.as_view(), name='api-auth-csrf'),
    path('login/', views.LoginView.as_view(), name='api-auth-login'),
    path('logout/', views.LogoutView.as_view(), name='api-auth-logout'),
    path('me/', views.MeView.as_view(), name='api-auth-me'),
    path('2fa/setup/', views.TOTPSetupView.as_view(), name='api-auth-2fa-setup'),
    path('2fa/verify/', views.TOTPVerifyView.as_view(), name='api-auth-2fa-verify'),
    path('2fa/disable/', views.TOTPDisableView.as_view(), name='api-auth-2fa-disable'),
    path('atividades/', views.MinhasAtividadesView.as_view(), name='api-auth-atividades'),
]
