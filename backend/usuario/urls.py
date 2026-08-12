from django.urls import path

from usuario import views

urlpatterns = [
    path('setup/', views.totp_setup_view, name='totp_setup'),
    path('verify/', views.totp_verify_view, name='totp_verify'),
    path('disable/', views.totp_disable_view, name='totp_disable'),
]
