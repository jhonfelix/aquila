from django.apps import apps
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers

from usuario.models import User


class PermissionSerializer(serializers.ModelSerializer):
    """Somente-leitura — usado pelo widget de transferência (filter_horizontal)
    de permissões no form de Grupo. app_label_display/model_display replicam
    os nomes verbose usados pelo Django Admin (ex.: "Administração | entrada
    de log | Can add log entry")."""

    app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    model = serializers.CharField(source='content_type.model', read_only=True)
    app_label_display = serializers.SerializerMethodField()
    model_display = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'app_label', 'model', 'app_label_display', 'model_display']

    def get_app_label_display(self, obj):
        try:
            return apps.get_app_config(obj.content_type.app_label).verbose_name
        except LookupError:
            return obj.content_type.app_label

    def get_model_display(self, obj):
        model_class = obj.content_type.model_class()
        return str(model_class._meta.verbose_name) if model_class else obj.content_type.model


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']


class UserSerializer(serializers.ModelSerializer):
    """CRUD de usuários do sistema (tela Usuários/Fase 3).

    `password` é write-only e opcional: em branco no PATCH mantém a senha
    atual; no POST em branco deixa o usuário sem senha utilizável
    (set_unusable_password), igual ao comportamento do Django Admin para
    contas criadas sem senha definida na hora.
    """

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nome', 'nome_guerra', 'password', 'is_staff', 'is_superuser',
            'posto_graduacao', 'hierarquia_posto_graduacao', 'credencial', 'qualificacao',
            'local_trabalho', 'telefone', 'cpf', 'investigador', 'ojt', 'trilha_capacitacao',
            'totp_enabled', 'totp_obrigatorio', 'groups', 'user_permissions',
        ]
        read_only_fields = ['totp_enabled']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', [])
        user_permissions = validated_data.pop('user_permissions', [])
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        if groups:
            user.groups.set(groups)
        if user_permissions:
            user.user_permissions.set(user_permissions)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        user_permissions = validated_data.pop('user_permissions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)
        return instance


class MeSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'nome', 'nome_guerra', 'posto_graduacao', 'local_trabalho',
            'is_staff', 'is_superuser', 'totp_enabled', 'totp_obrigatorio',
            'groups', 'permissions',
        ]

    def get_permissions(self, obj):
        return sorted(obj.get_all_permissions())
