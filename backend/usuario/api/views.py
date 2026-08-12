import base64
from io import BytesIO

import pyotp
import qrcode
from auditlog.models import LogEntry
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MeSerializer


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFView(APIView):
    """Garante o cookie csrftoken antes de qualquer POST (login incluso).

    O Next.js chama isso uma vez no bootstrap e lê o cookie `csrftoken`
    para mandar de volta no header `X-CSRFToken` nas mutações seguintes.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'ok', 'csrftoken': get_token(request)})


class LoginView(APIView):
    """POST {email, password}.

    Login "puro" do Django (sessão/cookie) não tem CSRF exigido pelo DRF
    aqui porque ainda não há usuário de sessão no momento da chamada (ver
    SessionAuthentication.enforce_csrf). Depois de logado, toda mutação
    exige X-CSRFToken (ver CSRFView).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({'detail': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        request.session.pop('2fa_verified', None)

        if getattr(user, 'totp_enabled', False):
            return Response({'status': '2fa_required'})

        if getattr(user, 'totp_obrigatorio', False):
            return Response({'status': '2fa_setup_required'})

        return Response({'status': 'ok', 'user': MeSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'status': 'ok'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = MeSerializer(request.user).data
        data['2fa_verified'] = bool(request.session.get('2fa_verified'))
        return Response(data)


class TOTPSetupView(APIView):
    """Mesma lógica de usuario/views.py:totp_setup_view, em JSON.

    GET gera (ou reaproveita) um secret pendente na sessão e devolve o QR
    em base64; POST {code} confirma e ativa o 2FA.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if 'totp_pending_secret' not in request.session:
            request.session['totp_pending_secret'] = pyotp.random_base32()

        secret = request.session['totp_pending_secret']
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name="ÁQUILA")

        img = qrcode.make(uri)
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            'qr_b64': qr_b64,
            'secret': secret,
            'already_enabled': user.totp_enabled,
        })

    def post(self, request):
        user = request.user
        secret = request.session.get('totp_pending_secret')
        if not secret:
            return Response({'detail': 'Nenhum setup de 2FA em andamento.'}, status=status.HTTP_400_BAD_REQUEST)

        code = str(request.data.get('code', '')).strip()
        totp = pyotp.TOTP(secret)
        if not totp.verify(code):
            return Response({'detail': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        user.totp_secret = secret
        user.totp_enabled = True
        user.save(update_fields=['totp_secret', 'totp_enabled'])
        request.session.pop('totp_pending_secret', None)
        request.session['2fa_verified'] = True
        return Response({'status': 'ok'})


class TOTPVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not getattr(user, 'totp_enabled', False):
            return Response({'detail': '2FA não está ativado para este usuário.'}, status=status.HTTP_400_BAD_REQUEST)

        code = str(request.data.get('code', '')).strip()
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code):
            return Response({'detail': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        request.session['2fa_verified'] = True
        return Response({'status': 'ok'})


class TOTPDisableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.totp_secret = ''
        user.totp_enabled = False
        user.save(update_fields=['totp_secret', 'totp_enabled'])
        request.session.pop('2fa_verified', None)
        return Response({'status': 'ok'})


class MinhasAtividadesView(APIView):
    """Últimas entradas do django-auditlog cujo actor é o usuário logado.

    Usado pelo dashboard inicial do Next.js ("últimos logs do usuário").
    Auditlog já captura create/update/delete em OcorrenciaGeral e afins
    via signals (registrado em ocorrencia/apps.py) — nada novo a logar,
    só expor o que já é gravado.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 10)), 50)
        entries = (
            LogEntry.objects.filter(actor=request.user)
            .select_related('content_type')
            .order_by('-timestamp')[:limit]
        )
        data = [
            {
                'id': e.id,
                'action': e.action,
                'action_display': e.get_action_display(),
                'model': e.content_type.model if e.content_type else None,
                'model_verbose': str(e.content_type.name).capitalize() if e.content_type else None,
                'object_repr': e.object_repr,
                'object_pk': e.object_pk,
                'timestamp': e.timestamp,
            }
            for e in entries
        ]
        return Response(data)
