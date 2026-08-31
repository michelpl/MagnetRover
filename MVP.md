MVP — Magnet Rover (Survival)

1. Objetivo do jogo

Criar um jogo mobile top-down de sobrevivência, simples e satisfatório, no qual o jogador controla um pequeno veículo (Rover) equipado com até quatro armas.

O objetivo de cada stage é sobreviver a uma onda de inimigos hostis, eliminando todos antes que o HP do Rover chegue a zero.

O mapa deve ser maior do que a área visível da tela para permitir reposicionamento durante o combate.

Diferencial do loop: loadout de armas escolhido antes da partida + upgrades permanentes entre runs.

2. Stack sugerida

HTML5

TypeScript

Phaser

Vite

Capacitor

Android Studio apenas para build/publicação Android

Estrutura:

TypeScript
   ↓
Phaser
   ↓
Canvas / WebGL
   ↓
Capacitor
   ↓
Android APK / AAB

3. Princípios do MVP

O MVP deve priorizar:

Controle simples (uma mão).

Feedback visual satisfatório no combate.

Poucas regras.

Partidas curtas.

Implementação simples.

Boa performance em celulares modestos.

Fácil criação de novos stages via dados.

Progressão simples baseada em moedas e upgrades.

Não incluir inicialmente:

ímã traseiro / coleta / processadora / energia;

pathfinding complexo;

multiplayer;

árvore de habilidades;

crafting;

missões;

regeneração passiva de HP;

vários tipos de inimigo com comportamentos distintos;

pausa forçada entre rajadas de spawn.

4. Loop principal

Iniciar stage
    ↓
Rover spawna no centro do mapa
    ↓
Armas equipadas disparam automaticamente
    ↓
Onda de inimigos (rajadas + respiros)
    ↓
Combate: HP do Rover vs HP dos inimigos
    ↓
┌────────────────────┬────────────────────┐
│ Todos eliminados   │ HP do Rover = 0    │
│ Vitória + moedas   │ Derrota + retry    │
└────────────────────┴────────────────────┘
    ↓
Garage: upgrades permanentes
    ↓
Inventário: ajustar loadout (até 4 armas)
    ↓
Próximo stage

5. Condições de vitória e derrota

Vitória

O jogador vence quando não restam inimigos vivos nem spawns pendentes na onda do stage.

Regra:

remainingEnemies === 0
AND
waveFullySpawned === true

Derrota

O jogador perde quando:

roverHp <= 0

Não existe energia, percentual de limpeza nem carga.

6. Veículo do jogador

Nome provisório:

Magnet Rover (working title interno: Rover Survival — ver decisões em aberto §33)

O veículo deve ser:

pequeno;

visualmente simples;

fácil de identificar em câmera top-down;

capaz de carregar armas visíveis (placeholder aceitável).

Movimento

Controle recomendado:

joystick virtual transparente na parte inferior central da tela;

movimento baseado no arraste do dedo.

Exemplo:

dedo para cima     → veículo sobe
dedo para baixo    → veículo desce
dedo para esquerda → veículo move para esquerda
dedo para direita  → veículo move para direita

O veículo deve seguir o input com suavização.

Não utilizar aceleração ou direção realista no MVP.

O controle deve parecer arcade.

HP

O Rover possui maxHp e hp.

hp começa em maxHp no início de cada partida.

Dano reduz hp; hp não regenera naturalmente no MVP.

Stats upgradeáveis (proposta inicial):

HP máximo

Velocidade

Armadura (redução de dano %)

Sem ímã, sem capacidade de carga, sem raio magnético.

7. Sistema de armas

O jogador possui uma coleção de armas desbloqueadas ao longo do jogo.

Antes de cada partida, escolhe até 4 armas no inventário.

Armas disparam automaticamente respeitando cooldown (padrão survivor-like — reduz complexidade no mobile).

Cada arma define:

id

name

damage

fireRate (ms entre disparos)

range

projectileSpeed (se aplicável)

upgradeTier (nível comprado na Garage)

Armas placeholder (provisório)

| Arma         | Comportamento sugerido                          |
| ------------ | ----------------------------------------------- |
| Pulse Cannon | Projétil reto, curto alcance, alto DPS          |
| Arc Turret   | Disparo em cone à frente do rover               |
| Orbit Drone  | Projétil que orbita o rover                     |
| Mine Layer   | Deixa minas ao se mover (cooldown)              |

Upgrades de arma (na Garage):

dano por tier;

cadência (fireRate) por tier;

alcance por tier.

Regra: no máximo 4 armas ativas simultaneamente por partida.

8. Inimigos

Placeholder visual: rover hostil (reutilizar sprite do jogador com tint diferente).

Comportamento MVP:

perseguir o jogador com movimento arcade interpolado;

sem pathfinding A*.

Stats por stage / receita:

hp

speed

contactDamage (proposta MVP: só dano por contato; ranged pós-MVP)

Ao morrer:

remover da lista de inimigos vivos;

feedback visual (flash, partículas, som);

contribuir para remainingEnemies e contagem de moedas ao fim da partida.

9. Ondas (wave model)

Cada stage possui uma onda estruturada em rajadas com respiros.

Exemplo de configuração:

WaveConfig {
  bursts: [
    { count: 5,  intervalMs: 800,  delayAfterMs: 3000 },
    { count: 8,  intervalMs: 600,  delayAfterMs: 2500 },
    { count: 12, intervalMs: 500,  delayAfterMs: 0 }
  ]
}

Durante o respiro (delayAfterMs):

não spawna novos inimigos;

inimigos vivos continuam perseguindo e causando dano;

o jogador pode reposicionar;

a partida não pausa (sem modal, sem freeze de input).

Vitória só quando toda a onda foi spawnada e todos os inimigos foram eliminados.

10. Mapa e stages

Todos os stages utilizam o mesmo mapa (mesma textura de fundo, mesmas dimensões).

O mapa deve ser maior do que a viewport.

Exemplo:

Viewport:
1080 × 1920

Mapa:
1672 × 941 (workshop — scenario1)

A câmera segue o Rover com lerp e respeita os limites do mapa.

Dificuldade entre stages vem da receita de onda (contagem, HP, velocidade dos inimigos) e obstáculos opcionais — não de mapas diferentes.

11. Dados do stage

As fases devem ser configuráveis sem alterar código de gameplay.

Exemplo:

interface StageConfig {
    id: number;
    displayName: string;

    mapWidth: number;
    mapHeight: number;

    spawn: {
        x: number;
        y: number;
    };

    wave: WaveConfig;

    enemyRecipe: {
        type: string;
        hp: number;
        speed: number;
        contactDamage: number;
    };

    obstacles?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
}

Isso permitirá criar receitas por stage e escalar dificuldade sem novos assets de mapa.

12. Moedas

O jogador ganha moedas ao eliminar inimigos e ao vencer stages.

Proposta MVP:

1 moeda por inimigo eliminado (creditada ao fim da partida);

bônus fixo por vitória de stage;

bônus extra opcional na primeira vitória de cada stage.

Moedas persistem entre partidas.

playerCoins += enemiesKilled + stageBonus;

13. Upgrades

Garage (evolução da tela de upgrades atual):

Upgrades de rover

| Linha    | Exemplo de tiers        |
| -------- | ----------------------- |
| HP máx.  | 100 → 120 → 145 → 175   |
| Velocidade | 160 → 180 → 200 → 220 |
| Armadura | 0% → 10% → 20% → 30%    |

Upgrades de arma (por id de arma)

| Atributo  | Exemplo de tiers por arma |
| --------- | ------------------------- |
| Dano      | 10 → 14 → 19 → 25         |
| Cadência  | 500ms → 420ms → 350ms     |
| Alcance   | 200 → 240 → 290 px        |

Regra

Cada upgrade custa moedas.

Exemplo de custos por tier:

Level 1 → 12 moedas
Level 2 → 30 moedas
Level 3 → 70 moedas

Removido do design: capacity, battery, magnet radius.

14. Progressão

Fluxo:

Stage
 ↓
Vitória ou derrota
 ↓
Recompensa (moedas)
 ↓
Garage (upgrades) / Inventário (loadout)
 ↓
Próximo stage

Lista linear de stages (Level 1, Level 2, …) sem mapa de mundo.

15. Interface durante a fase

Manter a UI mínima.

Topo

HP
████████░░ 80%

Indicador de onda

12 enemies left

ou barra de progresso da onda (spawnados / eliminados).

Joystick

Parte inferior central — transparente, uma mão.

Minimap (opcional)

Mostrar posição do rover, inimigos e obstáculos.

Removido do HUD: energia, limpeza, carga.

16. Inventário (nova tela)

Tela dedicada ao que o jogador possui e ao que levará para a partida.

Funcionalidades:

listar armas desbloqueadas (ownedWeapons);

equipar até 4 armas em slots de loadout;

salvar loadout no save local;

acessível pelo HubBar (aba Inventory).

Fluxo sugerido:

Menu (Stages) → Inventory (confirmar loadout) → Game

ou Play direto com último loadout salvo.

17. Câmera

A câmera deve:

seguir o veículo;

possuir pequena suavização;

não mostrar além dos limites do mapa.

Exemplo:

camera.startFollow(rover, true, 0.08, 0.08);

Look-ahead na direção do movimento: pós-MVP.

18. Feedback satisfatório

Ao acertar inimigo

flash no inimigo;

número de dano opcional (pequeno);

som curto de impacto.

Ao eliminar inimigo

partículas;

som de destruição;

leve screen shake.

Ao receber dano

flash vermelho no rover;

i-frames curtos (proposta: 300 ms);

vibração leve.

Entre rajadas (respiro)

sem pausa; opcional: indicador visual sutil de “breather” na UI.

19. Arquitetura sugerida

src/
│
├── main.ts
│
├── game/
│   ├── Game.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── InventoryScene.ts
│   │   ├── GarageScene.ts
│   │   ├── GameScene.ts
│   │   └── ResultScene.ts
│   │
│   ├── entities/
│   │   ├── Rover.ts
│   │   ├── Enemy.ts
│   │   └── Projectile.ts
│   │
│   ├── systems/
│   │   ├── WeaponSystem.ts
│   │   ├── WaveSpawnSystem.ts
│   │   ├── CombatSystem.ts
│   │   ├── HpSystem.ts
│   │   └── RunState.ts
│   │
│   ├── config/
│   │   ├── GameConfig.ts
│   │   ├── StageConfig.ts
│   │   ├── Weapons.ts
│   │   └── Stages.ts
│   │
│   ├── save/
│   │   ├── Save.ts
│   │   └── Upgrades.ts
│   │
│   └── ui/
│       ├── HpBar.ts
│       ├── WaveIndicator.ts
│       ├── VirtualJoystick.ts
│       └── InventoryUI.ts
│
└── assets/
    ├── sprites/
    ├── audio/
    └── maps/

Deprecado (remover do design e do código legado):

Scrap, Processor, EnergyPickup

MagnetSystem, CargoSystem, DumpSystem, EnergySystem

ProgressSystem (limpeza), RegionClearSystem

EnergyBar, CleanBar, CargoIndicator

ShopScene (fundida em Inventory + Garage)

20. Entidades principais

Rover

class Rover {
    speed: number;
    maxHp: number;
    hp: number;
    armor: number;
}

Enemy

class Enemy {
    hp: number;
    maxHp: number;
    speed: number;
    contactDamage: number;
    type: string;
}

Projectile (quando a arma usar projétil)

class Projectile {
    damage: number;
    speed: number;
    ownerWeaponId: string;
}

21. Save local

Utilizar inicialmente:

localStorage

Salvar:

{
    coins: number,
    currentLevel: number,
    ownedWeapons: string[],
    loadout: [string | null, string | null, string | null, string | null],
    weaponUpgrades: Record<string, number>,
    roverUpgrades: {
        hp: number,
        speed: number,
        armor: number
    },
    tutorialDone: boolean,
    sfxMuted: boolean,
    hapticsEnabled: boolean
}

Ao migrar para Android com Capacitor, esse sistema pode permanecer inicialmente.

22. Fluxo de telas

BOOT
 ↓
MENU (Stages)
 ↓
┌─────────────┬──────────────┬─────────────┐
│  Inventory  │    Garage    │    PLAY     │
└─────────────┴──────────────┴─────────────┘
 ↓
GAME
 ↓
┌───────────────┐
│               │
Vitória       Derrota
│               │
↓               ↓
RESULT         RETRY
│
↓
Garage / Inventory / Next stage

HubBar: abas Stages | Inventory | Garage.

23. Primeiro stage do protótipo

Criar apenas um stage para validar a mecânica de combate.

Configuração sugerida

Mapa: workshop (1672 × 941)

Spawn: centro do mapa

Onda: 1 rajada pequena (ex.: 8 inimigos, intervalo 800 ms)

Inimigo: hp baixo, speed moderada, só dano por contato

Armas: 1–2 desbloqueadas no início

Loadout: até 4 slots (preencher só o que estiver desbloqueado)

Upgrades: desativados até o loop base estar divertido

Objetivo

Validar:

movimentação;

câmera;

HP e dano;

uma arma com auto-fire;

inimigo perseguindo o jogador;

onda com respiro;

vitória e derrota;

sensação arcade em mobile.

24. Segunda etapa

Depois que o combate básico estiver satisfatório:

Adicionar:

moedas e persistência;

tela de inventário com loadout;

Garage com upgrades de rover e armas;

4 armas placeholder;

5 stages com receitas de onda escalonadas;

efeitos sonoros e partículas;

vibração;

tutorial reescrito;

build Android.

25. Ordem recomendada de implementação

Fase 1 — Documentação

Alinhar MVP, ROADMAP, AGENTS e regras Cursor.

Fase 2 — Remover legado

Remover sistemas de ímã, carga, processadora, energia e limpeza.

Fase 3 — Core combat

HP do rover;

inimigo placeholder;

dano por contato;

vitória / derrota.

Fase 4 — Armas

WeaponSystem com auto-fire;

pelo menos uma arma;

Projectile se necessário.

Fase 5 — Ondas

WaveSpawnSystem com rajadas e respiros;

WaveIndicator no HUD.

Fase 6 — Meta

InventoryScene e loadout no save;

Garage repurpose;

moedas.

Fase 7 — Conteúdo

4 armas placeholder;

5 stages;

tutorial;

feel (VFX, SFX, haptics).

Fase 8 — Mobile

Capacitor / Android;

performance em dispositivos modestos.

26. Critérios para considerar o MVP pronto

O MVP está pronto quando:

o jogador consegue movimentar o Rover confortavelmente com uma mão;

o mapa é maior do que a tela;

a câmera acompanha o jogador;

o Rover tem HP visível no HUD;

inimigos perseguem o jogador;

pelo menos uma arma dispara automaticamente;

até 4 armas podem equipar no loadout;

a onda spawna em rajadas com respiros sem pausar a partida;

eliminar todos os inimigos causa vitória;

HP zero causa derrota;

moedas são concedidas e persistem;

upgrades de rover e armas funcionam na Garage;

o inventário salva o loadout entre sessões;

5 stages jogáveis no mesmo mapa com dificuldade crescente;

o jogo roda suavemente em Android;

uma partida completa pode ser jogada do início ao fim sem bugs bloqueantes.

27. Objetivo do protótipo

Antes de produzir conteúdo, o protótipo deve responder apenas a esta pergunta:

É divertido e satisfatório dirigir o Rover, esquivar inimigos, ver as armas dispararem sozinhas e sobreviver até o fim da onda?

Se a resposta for sim, expandir.

Se não, ajustar principalmente:

velocidade do rover e dos inimigos;

dano e HP;

cadência e alcance das armas;

tamanho e ritmo das rajadas;

duração dos respiros;

feedback de hit e morte;

tamanho do mapa.

O principal diferencial do jogo deve estar na sensação do combate arcade e no loadout de armas — não na quantidade de sistemas.

28. Legado (código existente)

O repositório contém uma implementação anterior do loop magnético (coleta, fila, processadora, energia). Esse código é legado e deve ser removido ou substituído conforme as fases acima.

Reaproveitar quando possível:

Rover (movimento), VirtualJoystick, câmera, RunState;

Save (estrutura base), HubBar, StageCarousel;

MenuScene, ResultScene, GarageScene (repurpose);

mapa workshop, obstáculos, Capacitor/Android.

Substituir ou remover:

MagnetSystem, CargoSystem, DumpSystem, EnergySystem, ProgressSystem, RegionClearSystem;

entidades Scrap, Processor, EnergyPickup;

HUD EnergyBar, CleanBar, CargoIndicator;

ShopScene.

29. Combate e detecção de colisão

Sem Arcade Physics no MVP, salvo necessidade futura explícita.

Usar interpolação para movimento e projéteis.

Hit detection: distância ou AABB simples.

Projéteis podem ser bloqueados por obstáculos.

Inimigos não se empilham com pathfinding — perseguição direta com clamp no mapa.

30. Tutorial

Reescrever para o novo loop. Proposta de 4 passos:

mover com o joystick;

armas disparam sozinhas — posicione-se;

evite contato — o HP cai;

elimine todos os inimigos da onda.

Gate no primeiro stage; skippable; sem sistema de missões.

31. Áudio e haptics

Manter helpers centralizados (Audio, Haptics).

SFX: disparo, impacto, morte de inimigo, dano no rover, vitória, derrota.

Vibração leve em dano recebido e morte de inimigo.

Falha ao carregar áudio não deve quebrar a partida.

32. Nome e posicionamento

Gênero: survival action top-down, sessões curtas.

Nome comercial em aberto (ver §33).

Internamente pode usar working title Rover Survival até definição de marketing.

33. Decisões em aberto (Open decisions)

Itens ainda não fechados no design. Cada um inclui recomendação para o MVP.

| # | Ponto | Opções | Recomendação |
| --- | --- | --- | --- |
| 1 | Nome do jogo | Manter "Magnet Rover" vs renomear | Renomear quando marketing definir; doc interno: working title Rover Survival |
| 2 | Dano inimigo | Só contato vs contato + disparo | Começar só contato; ranged pós-MVP |
| 3 | Moedas in-run | Drop instantâneo vs só no Result | Só no Result (menos ruído no HUD) |
| 4 | HP regen | Nenhum vs pickup raro | Nenhum no MVP; pickup % como power-up futuro |
| 5 | Desbloqueio de armas | Todas no início vs por stage | 2 armas no início, +1 por stage vencido |
| 6 | Invulnerabilidade | I-frames após hit? | 300 ms i-frames + flash vermelho |
| 7 | Friendly fire | Projéteis e obstáculos | Obstáculos bloqueiam projéteis; sem friendly fire entre inimigos |
| 8 | Dificuldade entre stages | Só contagem/HP vs tipos mistos | Escalar HP + contagem nos 5 stages; tipos mistos pós-MVP |
| 9 | Tutorial | Conteúdo dos passos | Mover → armas automáticas → evitar dano → eliminar onda |
| 10 | ShopScene | Deletar vs repurpose | Remover do design; Inventory + Garage cobrem tudo |
