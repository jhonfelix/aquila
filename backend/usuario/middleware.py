from django.http import JsonResponse
from django.shortcuts import redirect

EXEMPT_PATHS = (
    '/2fa/',
    '/login/',
    '/logout/',
    '/jsi18n/',
    '/static/',
    '/media/',
    '/favicon',
    # /api/auth/ cobre csrf/login/logout/me + os próprios endpoints de
    # setup/verify/disable do 2FA — precisam ficar acessíveis antes da
    # sessão ter '2fa_verified', do mesmo jeito que /2fa/ fica isento
    # para as rotas HTML do admin.
    '/api/auth/',
)


class TOTPRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)

        if (user is not None
                and user.is_authenticated
                and not any(request.path.startswith(p) for p in EXEMPT_PATHS)):

            totp_enabled = getattr(user, 'totp_enabled', False)
            totp_obrigatorio = getattr(user, 'totp_obrigatorio', False)
            is_api = request.path.startswith('/api/')

            # Usuário com 2FA ativo mas ainda não verificou nesta sessão
            if totp_enabled and not request.session.get('2fa_verified'):
                if is_api:
                    return JsonResponse({'detail': '2fa_required'}, status=401)
                request.session['2fa_next'] = request.path
                return redirect('/2fa/verify/')

            # Usuário com 2FA obrigatório mas ainda não configurou
            if totp_obrigatorio and not totp_enabled:
                if is_api:
                    return JsonResponse({'detail': '2fa_setup_required'}, status=401)
                return redirect('/2fa/setup/')

        return self.get_response(request)
