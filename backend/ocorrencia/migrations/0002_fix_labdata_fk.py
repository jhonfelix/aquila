# Generated manually to fix labdata foreign key

from django.db import migrations, connection


def fix_fk(apps, schema_editor):
    """Corrige a foreign key"""
    with connection.cursor() as cursor:
        # Verificar se a coluna antiga existe
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'ocorrencia_aeronave_labdata'
            AND COLUMN_NAME = 'ocorrencia_aeronave_id'
        """)
        coluna_antiga_existe = cursor.fetchone()[0] > 0

        # Verificar se a coluna nova já existe
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'ocorrencia_aeronave_labdata'
            AND COLUMN_NAME = 'ocorrencia_id'
        """)
        coluna_nova_existe = cursor.fetchone()[0] > 0

        if coluna_antiga_existe and not coluna_nova_existe:
            # Encontrar e remover qualquer FK existente na coluna antiga
            cursor.execute("""
                SELECT CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'ocorrencia_aeronave_labdata'
                AND COLUMN_NAME = 'ocorrencia_aeronave_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            """)
            fk_row = cursor.fetchone()
            if fk_row:
                try:
                    cursor.execute(f"ALTER TABLE ocorrencia_aeronave_labdata DROP FOREIGN KEY `{fk_row[0]}`")
                except Exception:
                    pass  # FK já foi removida

            # Atualizar os IDs para referenciar ocorrencia_geral através de ocorrencia_aeronave
            cursor.execute("""
                UPDATE ocorrencia_aeronave_labdata lab
                JOIN ocorrencia_aeronave aer ON lab.ocorrencia_aeronave_id = aer.id
                SET lab.ocorrencia_aeronave_id = aer.ocorrencia_id
            """)

            # Remover registros órfãos (que não tem correspondência)
            cursor.execute("""
                DELETE FROM ocorrencia_aeronave_labdata
                WHERE ocorrencia_aeronave_id NOT IN (SELECT id FROM ocorrencia_geral)
            """)

            # Renomear a coluna
            cursor.execute("ALTER TABLE ocorrencia_aeronave_labdata CHANGE COLUMN ocorrencia_aeronave_id ocorrencia_id BIGINT")

        # Verificar se a FK nova já existe
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'ocorrencia_aeronave_labdata'
            AND CONSTRAINT_NAME = 'ocorrencia_labdata_ocorrencia_fk'
        """)
        fk_existe = cursor.fetchone()[0] > 0

        if not fk_existe:
            # Limpar dados que não existem em ocorrencia_geral
            cursor.execute("""
                DELETE FROM ocorrencia_aeronave_labdata
                WHERE ocorrencia_id NOT IN (SELECT id FROM ocorrencia_geral)
            """)

            # Adicionar a nova FK
            cursor.execute("""
                ALTER TABLE ocorrencia_aeronave_labdata
                ADD CONSTRAINT ocorrencia_labdata_ocorrencia_fk
                FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencia_geral(id)
            """)


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(fix_fk, migrations.RunPython.noop),
    ]
