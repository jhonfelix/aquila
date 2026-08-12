from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.html import mark_safe
from unfold.admin import ModelAdmin
from unfold.forms import UserCreationForm, UserChangeForm
from usuario.models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email',)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ('email', 'nome', 'nome_guerra', 'local_trabalho', 'is_staff', 'totp_badge')
    search_fields = ['email', 'nome', 'nome_guerra']
    list_filter = ('is_staff', 'is_superuser', 'local_trabalho', 'totp_enabled')
    filter_horizontal = ('groups', 'user_permissions')
    ordering = ('email',)
    actions = ['resetar_2fa']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('nome', 'nome_guerra', 'avatar', 'cpf', 'telefone')}),
        ('Informações Profissionais', {'fields': ('posto_graduacao', 'hierarquia_posto_graduacao', 'credencial', 'qualificacao', 'local_trabalho', 'investigador', 'ojt', 'trilha_capacitacao')}),
        ('Permissões', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Segurança — 2FA', {'fields': ('totp_obrigatorio', 'totp_status',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('totp_status',)
    # totp_obrigatorio é editável — não está em readonly_fields

    # Store request so totp_status can check if viewing own profile
    def changeform_view(self, request, *args, **kwargs):
        self._current_request = request
        return super().changeform_view(request, *args, **kwargs)

    @admin.display(description='2FA')
    def totp_badge(self, obj):
        if obj.totp_enabled:
            return mark_safe('<span style="color:#16a34a;font-weight:bold;">✓ Ativo</span>')
        return mark_safe('<span style="color:#9ca3af;">—</span>')

    @admin.display(description='Autenticação de Dois Fatores')
    def totp_status(self, obj):
        request = getattr(self, '_current_request', None)
        is_own = request and obj.pk == request.user.pk

        if obj.totp_enabled:
            html = '<span style="color:#16a34a;font-weight:bold;">✓ Ativo</span>'
            if is_own:
                html += (
                    '&nbsp;&nbsp;<a href="/2fa/disable/" '
                    'style="color:#dc2626;font-size:0.85em;">[Desativar]</a>'
                )
        else:
            html = '<span style="color:#6b7280;">✗ Inativo</span>'
            if is_own:
                html += (
                    '&nbsp;&nbsp;<a href="/2fa/setup/" '
                    'style="color:#2563eb;font-size:0.85em;">[Ativar 2FA]</a>'
                )
            else:
                html += (
                    '&nbsp;&nbsp;<small style="color:#6b7280;">'
                    '(use a ação "Resetar 2FA" para remover o 2FA de outro usuário)</small>'
                )
        return mark_safe(html)

    @admin.action(description='Resetar 2FA dos usuários selecionados')
    def resetar_2fa(self, request, queryset):
        count = queryset.update(totp_secret='', totp_enabled=False)
        self.message_user(request, f"2FA resetado para {count} usuário(s).")


admin.site.unregister(Group)


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass
