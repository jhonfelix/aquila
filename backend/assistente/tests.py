import json
from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase

from ocorrencia.models import (
    OcorrenciaAeronave,
    OcorrenciaAeronaveLesao,
    OcorrenciaConfirmacao,
    OcorrenciaControle,
    OcorrenciaGeral,
    OcorrenciaRevisaoRelatorio,
)
from taxonomia.models import GeografiaCidade, GeografiaPais, GeografiaUf

from .tools import Assistente

User = get_user_model()


def _usuario(email, nome, perms=True):
    u = User.objects.create(email=email, nome=nome, nome_guerra=nome.split()[0], local_trabalho='CENIPA',
                            posto_graduacao='MAJ')
    if perms:
        u.user_permissions.set(Permission.objects.filter(
            content_type__app_label='ocorrencia', codename__startswith='view_'))
    return u


class FerramentasTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        pais = GeografiaPais.objects.create(nome='Brasil')
        uf = GeografiaUf.objects.create(pais=pais, nome='Maranhão')
        cls.cidade = GeografiaCidade.objects.create(uf=uf, pais=pais, nome='Alcântara')
        cls.autor = _usuario('autor@x.br', 'Autor Silva')
        cls.revisor_a = _usuario('a@x.br', 'Ana Revisora')
        cls.revisor_b = _usuario('b@x.br', 'Bruno Revisor')

    def _oc(self, status, proc):
        return OcorrenciaGeral.objects.create(status=status, numero_processo=proc, cidade=self.cidade,
                                              cadastrado_por_id=self.autor, dia=date(2026, 1, 2),
                                              classificacao='ACIDENTE')

    def test_aguardando_autenticacao_lista_so_status_autenticar(self):
        a = self._oc('AUTENTICAR', 'P-AUT')
        self._oc('AUTENTICADO', 'P-OK')
        self._oc('CONFIRMAR', 'P-CONF')
        OcorrenciaConfirmacao.objects.create(ocorrencia=a, usuario=self.autor, data_confirmacao=date(2026, 2, 1))
        t = Assistente(self.autor)
        r = json.loads(t.aguardando_autenticacao())
        self.assertEqual(r['total'], 1)
        self.assertNotIn('P-AUT', json.dumps(r))  # números vão só nas fichas, não ao modelo
        self.assertIn('P-AUT', t.fichas[0]['titulo'])
        self.assertIn('confirmado por', t.fichas[0]['paragrafo'])

    def test_aguardando_autenticacao_vazio_retorna_zero(self):
        self._oc('AUTENTICADO', 'P-OK')
        t = Assistente(self.autor)
        r = json.loads(t.aguardando_autenticacao())
        self.assertEqual(r['total'], 0)
        self.assertEqual(t.fichas, [])

    def test_em_revisao_usa_registro_mais_recente_e_exclui_fim(self):
        o1 = self._oc('AUTENTICADO', 'P-1')
        o2 = self._oc('AUTENTICADO', 'P-2')
        OcorrenciaRevisaoRelatorio.objects.create(ocorrencia=o1, setor='DESIGNACAO', revisor=self.revisor_a)
        OcorrenciaRevisaoRelatorio.objects.create(ocorrencia=o1, setor='REVISAO_FATOR_HUMANO', revisor=self.revisor_b)
        OcorrenciaRevisaoRelatorio.objects.create(ocorrencia=o2, setor='REVISAO_FINAL', revisor=self.revisor_a)
        OcorrenciaControle.objects.create(ocorrencia=o1, fase_atual='REV', investigador=self.autor)
        OcorrenciaControle.objects.create(ocorrencia=o2, fase_atual='FIM')
        r = json.loads(Assistente(self.autor).em_revisao())
        self.assertEqual(r['total'], 1)                      # P-2 saiu (fase FIM)
        p = Assistente(self.autor)
        p.em_revisao()
        self.assertEqual(len(p.fichas), 1)
        self.assertIn('P-1', p.fichas[0]['titulo'])
        self.assertIn('em revisão na etapa Revisão Fator Humano', p.fichas[0]['paragrafo'])
        self.assertIn('Bruno', p.fichas[0]['paragrafo'])
        self.assertIn('encontra-se na fase de revisão do relatório', p.fichas[0]['paragrafo'])

    def _ficha(self, proc, user=None):
        t = Assistente(user or self.autor)
        t.fichas_ocorrencias(numero_processo=proc)
        return t.fichas[0]['paragrafo']

    def test_ficha_controle_investigacao_em_andamento(self):
        o = self._oc('AUTENTICADO', 'P-C1')
        OcorrenciaControle.objects.create(
            ocorrencia=o, status='INVESTIGADA', orgao_investigador='CENIPA', investigador=self.revisor_a,
            prioridade='3', situacao_investigacao='ATIVA', fase_atual='RAI', tipo_relatorio='RF',
            numero_relatorio='A DEFINIR', fez_acao_inicial='SIM', observacoes='Aguardando laudo.')
        par = self._ficha('P-C1')
        for trecho in ['A ocorrência será investigada pelo CENIPA', 'investigador responsável Maj Ana',
                       'prioridade 3 (alta)',
                       'A investigação está em andamento, na fase de elaboração do Relatório de Ação Inicial (RAI).',
                       'O relatório a ser produzido é um Relatório Final (RF), com número ainda a definir.',
                       'Houve deslocamento da equipe até o local da ocorrência.',
                       'Nas observações do controle, consta: Aguardando laudo.']:
            self.assertIn(trecho, par)

    def test_ficha_controle_concluida_com_numero_e_coleta_de_dados(self):
        o = self._oc('AUTENTICADO', 'P-C2')
        OcorrenciaControle.objects.create(ocorrencia=o, status='INVESTIGADA', orgao_investigador='CENIPA',
                                          situacao_investigacao='FINALIZADA', fase_atual='FIM',
                                          tipo_relatorio='RF', numero_relatorio='A-012/CENIPA/2026')
        par = self._ficha('P-C2')
        self.assertIn('A ocorrência foi investigada pelo CENIPA', par)
        self.assertIn('A investigação está concluída.', par)
        self.assertIn('O relatório produzido é um Relatório Final (RF), registrado sob o número A-012/CENIPA/2026.', par)
        o3 = self._oc('AUTENTICADO', 'P-C3')
        OcorrenciaControle.objects.create(ocorrencia=o3, status='COLETA DE DADOS')
        self.assertIn('coleta de dados, sem abertura de investigação', self._ficha('P-C3'))

    def test_ficha_sem_controle_e_sem_permissao(self):
        self._oc('AUTENTICADO', 'P-C4')
        self.assertIn('Não há registro de controle de investigação', self._ficha('P-C4'))
        o = self._oc('AUTENTICADO', 'P-C5')
        OcorrenciaControle.objects.create(ocorrencia=o, status='INVESTIGADA', numero_relatorio='SECRETO-1')
        restrito = _usuario('r@x.br', 'Restrito Silva', perms=False)
        restrito.user_permissions.set(Permission.objects.filter(codename='view_ocorrenciageral'))
        restrito = User.objects.get(pk=restrito.pk)          # limpa o cache de permissões
        par = self._ficha('P-C5', restrito)
        self.assertNotIn('SECRETO-1', par)
        self.assertNotIn('investig', par.lower())

    def test_ficha_humanizada_tem_data_hora_local_artefato_e_historico(self):
        from datetime import time
        o = self._oc('AUTENTICADO', 'P-F')
        o.horario = time(14, 30)
        o.local = 'Centro de Lançamento'
        o.historico = 'durante   a contagem\nregressiva houve falha'
        o.danos_terceiros = 'NÃO'
        o.aerodromo = 'CLA'
        o.save()
        art = OcorrenciaAeronave.objects.create(ocorrencia=o, tipo='Satélite', operador='AEB', massa_total=120,
                                                fase_missao='LANCAMENTO', danos='PARCIAL')
        OcorrenciaAeronaveLesao.objects.create(ocorrencia_aeronave=art, categoria='TRIPULANTE',
                                               tipo_lesao='GRAVE', quantidade=2)
        t = Assistente(self.autor)
        t.fichas_ocorrencias(numero_processo='P-F')
        par = t.fichas[0]['paragrafo']
        for trecho in ['No dia 02/01/2026, às 14:30 (horário local)', 'registrou-se um acidente',
                       'no Centro de Lançamento, no município de Alcântara', 'durante a fase de lançamento',
                       'conduzida pelo CLA', 'o satélite', 'operado por AEB', 'massa total de 120 kg',
                       'Durante a contagem regressiva houve falha.',
                       'Em decorrência do evento, o artefato sofreu danos parciais e não houve danos a terceiros.',
                       '2 tripulantes com lesões graves']:
            self.assertIn(trecho, par)
        # narrativa, não lista de campos
        for rotulo in ['Histórico:', 'Artefato espacial envolvido:', 'Danos a terceiros:', 'Local de impacto']:
            self.assertNotIn(rotulo, par)
        self.assertNotIn('\n', par)
        # ordem: situação -> artefato -> fatos -> consequências
        ordem = [par.index(x) for x in ['registrou-se', 'o satélite', 'Durante a contagem', 'Em decorrência']]
        self.assertEqual(ordem, sorted(ordem))
        # a fase da missão aparece uma única vez (sem repetição)
        self.assertEqual(par.count('lançamento'), 1)

    def test_sem_permissao_nega(self):
        sem = _usuario('sem@x.br', 'Sem Perm', perms=False)
        r = json.loads(Assistente(sem).aguardando_autenticacao())
        self.assertIn('Sem permissão', r['erro'])

    def test_consultar_filtra_e_bloqueia_campos_sensiveis(self):
        self._oc('AUTENTICAR', 'P-A')
        self._oc('CONFIRMAR', 'P-B')
        t = Assistente(self.autor)
        r = json.loads(t.consultar('ocorrenciageral', {'status': 'CONFIRMAR'}, ['numero_processo', 'status']))
        self.assertEqual(r['total_encontrado'], 1)
        self.assertEqual(r['registros'], [['P-B', 'CONFIRMAR']])
        # filtro que vazaria dado sensível via relação com o usuário
        r = json.loads(Assistente(self.autor).consultar(
            'ocorrenciageral', {'cadastrado_por_id__password__startswith': 'pbkdf2'}))
        self.assertIn('erro', r)
        r = json.loads(Assistente(self.autor).consultar('ocorrenciageral', {'cadastrado_por_id__cpf': 1}))
        self.assertIn('erro', r)
        r = json.loads(Assistente(self.autor).consultar('ocorrenciageral', {}, ['inexistente']))
        self.assertIn('erro', r)
        r = json.loads(Assistente(self.autor).consultar('auth_user'))
        self.assertIn('erro', r)

    def test_consultar_por_relacao_revisor(self):
        o = self._oc('AUTENTICADO', 'P-1')
        OcorrenciaRevisaoRelatorio.objects.create(ocorrencia=o, setor='JEDI', revisor=self.revisor_a)
        r = json.loads(Assistente(self.autor).consultar(
            'ocorrenciarevisaorelatorio', {'revisor__nome_guerra': 'Ana'}, ['setor', 'revisor']))
        self.assertEqual(r['total_encontrado'], 1)
        self.assertEqual(r['registros'][0][0], 'JEDI')

    def test_detalhar_ocorrencia_agrega_tabelas_relacionadas_sem_cpf(self):
        o = self._oc('AUTENTICAR', 'P-D')
        OcorrenciaControle.objects.create(ocorrencia=o, fase_atual='RAI')
        t = Assistente(self.autor)
        r = json.loads(t.detalhar_ocorrencia('P-D'))
        self.assertEqual(r['ocorrencia'], 'P-D')
        self.assertIn('Dados gerais', r['secoes'])
        self.assertTrue(any('Controle' in k for k in r['secoes']))
        self.assertNotIn('cpf', json.dumps(r).lower())
        self.assertIn('erro', json.loads(Assistente(self.autor).detalhar_ocorrencia('NAO-EXISTE')))


class FiltrosInvestigacaoETravaTest(TestCase):
    setUpTestData = FerramentasTest.__dict__['setUpTestData']   # reaproveita os dados, não os testes
    _oc = FerramentasTest._oc

    def test_fichas_filtra_por_investigacao(self):
        a = self._oc('AUTENTICADO', 'P-INV')
        b = self._oc('AUTENTICADO', 'P-OUT')
        c = self._oc('AUTENTICADO', 'P-COL')
        OcorrenciaControle.objects.create(ocorrencia=a, status='INVESTIGADA', orgao_investigador='CENIPA',
                                          situacao_investigacao='FINALIZADA')
        OcorrenciaControle.objects.create(ocorrencia=b, status='INVESTIGADA', orgao_investigador='OUTRO')
        OcorrenciaControle.objects.create(ocorrencia=c, status='COLETA DE DADOS')
        t = Assistente(self.autor)
        r = json.loads(t.fichas_ocorrencias(tratamento='INVESTIGADA', orgao_investigador='cenipa'))
        self.assertEqual(r['total_encontrado'], 1)
        self.assertEqual([f['titulo'] for f in t.fichas], ['Processo P-INV'])
        r = json.loads(Assistente(self.autor).fichas_ocorrencias(tratamento='COLETA DE DADOS'))
        self.assertEqual(r['total_encontrado'], 1)

    def test_trava_descarta_resposta_sem_consulta_de_dados(self):
        from .agent import SEM_DADOS, validar_resposta
        t = Assistente(self.autor)
        t.descrever_dados()                                   # só metadados, nenhum dado
        self.assertEqual(validar_resposta(t, 'Encontrei 6 ocorrências investigadas.'), SEM_DADOS)

    def test_abertura_vem_dos_dados_e_nao_do_modelo(self):
        from .agent import validar_resposta
        self._oc('AUTENTICAR', 'P-X')
        t = Assistente(self.autor)
        t.aguardando_autenticacao()
        # mesmo que o modelo diga outra coisa, vale a frase montada pelo código
        self.assertEqual(validar_resposta(t, 'Encontrei 6 ocorrências investigadas pelo CENIPA.'),
                         'Encontrei 1 ocorrência aguardando autenticação:')

    def test_abertura_descreve_filtros_de_investigacao(self):
        a = self._oc('AUTENTICADO', 'P-A')
        b = self._oc('AUTENTICADO', 'P-B')
        for o in (a, b):   # situacao_investigacao tem padrão ATIVA no modelo
            OcorrenciaControle.objects.create(ocorrencia=o, status='INVESTIGADA', orgao_investigador='CENIPA',
                                              situacao_investigacao='FINALIZADA')
        t = Assistente(self.autor)
        t.fichas_ocorrencias(tratamento='INVESTIGADA', orgao_investigador='CENIPA')
        self.assertEqual(t.aberturas, ['Encontrei 2 ocorrências investigadas pelo CENIPA:'])
        t = Assistente(self.autor)
        t.fichas_ocorrencias(situacao_investigacao='ATIVA')
        self.assertEqual(t.aberturas, ['Não encontrei ocorrências com investigação ativa.'])
        t = Assistente(self.autor)
        t.fichas_ocorrencias()
        self.assertEqual(t.aberturas, ['Encontrei 2 ocorrências cadastradas:'])
        t = Assistente(self.autor)
        t.fichas_ocorrencias(numero_processo='P-A')
        self.assertEqual(t.aberturas, ['Esta é a ocorrência de processo P-A:'])

    def test_trava_descarta_numero_que_nao_esta_nos_dados(self):
        from .agent import NAO_CONFIAVEL, validar_resposta
        self._oc('AUTENTICADO', 'P-Y')
        t = Assistente(self.autor)
        t.consultar('ocorrenciageral', {'numero_processo': 'P-Y'}, ['numero_processo', 'status'])
        self.assertEqual(validar_resposta(t, 'Não há previsão de conclusão registrada.'),
                         'Não há previsão de conclusão registrada.')
        self.assertEqual(validar_resposta(t, 'A conclusão está prevista para 2027.'), NAO_CONFIAVEL)

    def test_schema_das_ferramentas_expoe_as_opcoes_dos_filtros(self):
        from agno.tools.function import Function
        props = Function.from_callable(Assistente(self.autor).fichas_ocorrencias).parameters['properties']
        texto = json.dumps(props)
        for opcao in ['INVESTIGADA', 'COLETA DE DADOS', 'CENIPA', 'OUTRO', 'ATIVA', 'FINALIZADA', 'RAI', 'AUTENTICAR']:
            self.assertIn(opcao, texto)
