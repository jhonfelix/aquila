from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin


# Postos e graduações da Força Aérea Brasileira (hierarquia: do mais alto ao mais baixo)
POSTO_GRADUACAO_CHOICES = [

    ('MB', 'Major-Brigadeiro'),
    ('BR', 'Brig Ar'),
    # Oficiais superiores
    ('CEL', 'Cel'),
    ('CEL R1', 'Cel R1'),
    ('TC', 'Ten Cel'),
    ('TC R1', 'Ten Cel R1'),
    ('MAJ', 'Maj'),
    ('MAJ R1', 'Maj R1'),
    # Oficiais intermediários e subalternos
    ('CAP', 'Cap'),
    ('CAP R1', 'Cap R1'),
    ('1T', '1º Ten'),
    ('2T', '2º Ten'),
    ('ASP', 'Asp'),
    # Graduados (praças)
    ('SO', 'SO'),
    ('SO R1', 'SO R1'),
    ('1S', '1º SGT'),
    ('2S', '2º SGT'),
    ('3S', '3º SGT'),
    ('CB', 'Cabo'),
    ('CV', 'CIVIL'),

]
LOCAL_TRABALHO_CHOICES = [
    ('CENIPA', 'CENIPA'), 
    ('DCTA', 'DCTA'),
    ('CLBI', 'CLBI'),
    ('COPE', 'COPE'),
    ('CLA', 'CLA'),
]

LABELS_SCHEMA = {
        "type": "array",
        "items": {
            "type": "string",
            "choices": ["blue", "red", "green"],
        },
    }

class UserManager(BaseUserManager):
    def create_superuser(self, email, password):
        user = self.model(
            email=self.normalize_email(email)
        )

        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

        return user
    


class User(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=150)
    nome_guerra = models.CharField(null=True, max_length=100)
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    last_access = models.DateTimeField(auto_now_add=True)
    avatar = models.TextField(default="/media/avatars/default-avatar.png")
    posto_graduacao = models.CharField(
        choices=POSTO_GRADUACAO_CHOICES,
        max_length=10,
        null=True
    )
    hierarquia_posto_graduacao = models.IntegerField(null=True, blank=True)
    credencial = models.CharField(max_length=50, blank=True)
    qualificacao = models.CharField(max_length=50, blank=True)
    local_trabalho = models.CharField(choices=LOCAL_TRABALHO_CHOICES,max_length=50)
    telefone = models.IntegerField(null=True,blank=True)
    cpf = models.IntegerField(null=True,blank=True)
    investigador = models.IntegerField(null=True,blank=True)
    ojt = models.TextField(null=True,blank=True)
    trilha_capacitacao = models.TextField(null=True,blank=True)
    totp_secret = models.CharField(max_length=64, blank=True, default='')
    totp_enabled = models.BooleanField(default=False)
    totp_obrigatorio = models.BooleanField(default=False, verbose_name='2FA obrigatório')

    objects = UserManager()

    USERNAME_FIELD = "email"

    def __str__(self):
        return f"{self.posto_graduacao} {self.nome_guerra} [ {self.local_trabalho} ]"

    class Meta:
        db_table = "usuarios"

    



