import base64
from io import BytesIO

import pyotp
import qrcode
from django.contrib import admin as django_admin
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render


@login_required
def totp_setup_view(request):
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

    error = None
    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        if totp.verify(code):
            user.totp_secret = secret
            user.totp_enabled = True
            user.save(update_fields=['totp_secret', 'totp_enabled'])
            request.session.pop('totp_pending_secret', None)
            request.session['2fa_verified'] = True
            messages.success(request, "Autenticação de dois fatores ativada com sucesso.")
            return redirect('/')
        else:
            error = "Código inválido. Tente novamente."

    return render(request, 'usuario/totp_setup.html', {
        'qr_b64': qr_b64,
        'secret': secret,
        'error': error,
        'already_enabled': user.totp_enabled,
    })


def totp_verify_view(request):
    if not request.user.is_authenticated:
        return redirect('/login/')

    user = request.user

    if not getattr(user, 'totp_enabled', False):
        return redirect('/')

    if request.session.get('2fa_verified'):
        return redirect('/')

    error = None
    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code):
            request.session['2fa_verified'] = True
            next_url = request.session.pop('2fa_next', '/')
            return redirect(next_url)
        else:
            error = "Código inválido. Tente novamente."

    context = {
        **django_admin.site.each_context(request),
        'error': error,
        'title': 'Verificação em Dois Fatores',
    }
    return render(request, 'usuario/totp_verify.html', context)


@login_required
def totp_disable_view(request):
    if request.method == 'POST':
        user = request.user
        user.totp_secret = ''
        user.totp_enabled = False
        user.save(update_fields=['totp_secret', 'totp_enabled'])
        request.session.pop('2fa_verified', None)
        messages.success(request, "Autenticação de dois fatores desativada.")
        return redirect('/')

    context = {
        **django_admin.site.each_context(request),
        'title': 'Desativar Dois Fatores',
    }
    return render(request, 'usuario/totp_disable.html', context)
