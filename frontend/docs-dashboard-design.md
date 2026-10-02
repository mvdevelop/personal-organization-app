# Design do dashboard

O dashboard do OrgApp adapta princípios observados no projeto `Power-BI-Design-Files` sem copiar arquivos, layouts ou assets de terceiros.

## Princípios

- **Decisão antes da visualização:** cada bloco deve ajudar a decidir o que fazer em seguida.
- **Análise visível:** progresso, atrasos e consistência aparecem como contexto, não apenas como números.
- **Interação com propósito:** links e seletores levam a uma ação concreta; decoração não compete com a informação.
- **Hierarquia consistente:** o primeiro viewport prioriza atenção, progresso e próxima ação.
- **Sistema reutilizável:** tokens existentes, `DashboardCard`, `StatCard` e estilos semânticos mantêm as páginas coerentes.

## Regras de implementação

- Use os tokens de `frontend/src/theme` e preserve os modos claro e escuro.
- Prefira dados já fornecidos pelo endpoint de dashboard; não derive métricas que pareçam precisas sem suporte no backend.
- Estados vazios e estados de atenção devem ter texto explicativo e um caminho de ação.
- Toda interação deve funcionar por teclado e manter foco visível.
- Gráficos devem ter uma pergunta clara, legenda compreensível e layout responsivo.

A referência Power BI inspira o método de composição e leitura. A implementação final usa componentes React nativos do OrgApp e não redistribui recursos externos.
