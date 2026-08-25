MVP — Magnet Rover

1. Objetivo do jogo

Criar um jogo mobile hiper casual, top-down, simples e satisfatório, no qual o jogador controla um pequeno veículo equipado com um sistema magnético.

O objetivo de cada fase é explorar o mapa, coletar todos os objetos metálicos espalhados, descarregar a carga em uma processadora e limpar 100% da fase antes que a energia do veículo acabe.

O mapa deve ser maior do que a área visível da tela para gerar sensação de exploração e descoberta.

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

Controle simples.

Feedback visual satisfatório.

Poucas regras.

Partidas curtas.

Implementação simples.

Boa performance em celulares modestos.

Fácil criação de novas fases.

Progressão simples baseada em moedas e upgrades.

Não incluir inicialmente:

inimigos;

combate;

física complexa;

pathfinding;

multiplayer;

árvore de habilidades;

crafting;

inventário;

missões;

energia regenerativa;

vários tipos de processadoras.

4. Loop principal

Iniciar fase
    ↓
Explorar mapa
    ↓
Encontrar objetos
    ↓
Atrair cubos metálicos com o ímã traseiro
    ↓
Carga do veículo aumenta (fila maleável)
    ↓
Capacidade máxima atingida
    ↓
Ir até a processadora
    ↓
Descarregar objetos
    ↓
Continuar explorando
    ↓
Limpar 100% do mapa
    ↓
Vitória

Condição alternativa:

Energia chega a 0
    ↓
Ainda existem objetos no mapa
    ↓
Derrota

5. Condições de vitória e derrota

Vitória

O jogador vence quando todos os objetos coletáveis da fase forem removidos do mapa.

Regra:

remainingObjects == 0

A fase pode terminar imediatamente após o último objeto ser coletado ou após a última carga ser descarregada.

Para o MVP, recomenda-se considerar a fase concluída somente quando:

remainingObjects == 0
AND
carriedObjects == 0

Assim, o jogador precisa levar a última carga até a processadora.

Derrota

O jogador perde quando:

energy <= 0
AND
fase ainda não foi concluída

A energia não se regenera naturalmente.

Power-ups de energia poderão existir em algumas fases.

6. Veículo do jogador

Nome provisório:

Magnet Rover

O veículo deve ser:

pequeno;

visualmente simples;

fácil de identificar em câmera top-down;

equipado com um ímã claramente visível na parte de trás;

capaz de puxar e arrastar visualmente uma fila crescente de cubos metálicos.

Movimento

Controle recomendado:

joystick virtual  transparente na parte inferior central tela;

movimento baseado no arraste do dedo.

Exemplo:

dedo para cima    → veículo sobe
dedo para baixo   → veículo desce
dedo para esquerda → veículo vira/move para esquerda
dedo para direita  → veículo vira/move para direita

O veículo deve seguir o input com suavização.

Não utilizar aceleração ou direção realista no MVP.

O controle deve parecer arcade.

7. Sistema magnético

O ímã fica na parte de trás do Rover.

O veículo possui um raio magnético medido a partir dessa posição traseira.

Todo cubo metálico dentro desse raio começa a ser atraído.

Fluxo:

Cubo entra no raio
    ↓
Cubo muda para estado ATTRACTED
    ↓
Move-se em direção ao ímã (traseira do Rover)
    ↓
Chega próximo ao ímã / fim da fila
    ↓
Estado CARRIED

Estados do objeto

enum ScrapState {
  Idle,
  Attracted,
  Carried,
  Processing
}

Regra básica

if (distance(scrap, magnetAnchor) <= magnetRadius) {
    scrap.state = ScrapState.Attracted;
}

O cubo pode se aproximar usando interpolação simples:

scrap.x += (targetX - scrap.x) * attractionSpeed;
scrap.y += (targetY - scrap.y) * attractionSpeed;

target deve ser o ímã traseiro (ou a ponta da fila, se já houver carga).

Não é necessário utilizar física real.

8. Visual da carga — fila maleável

Os cubos coletados não devem desaparecer imediatamente.

Eles formam uma fila maleável atrás do Rover, ancorada no ímã traseiro.

Objetivo:

mostrar visualmente o crescimento da carga;

gerar sensação satisfatória de "comboio" metálico;

permitir ao jogador perceber que está ficando cheio sem depender somente da UI.

Implementação sugerida

Manter a carga como uma lista ordenada:

cargo: Scrap[]

O primeiro cubo carregado segue o ímã.

Cada cubo seguinte segue o anterior.

Usar interpolação / follow suave para a fila se curvar com o movimento do Rover (snake / train feel).

A fila deve parecer maleável: curvas suaves, sem trava rígida em slots fixos ao redor do veículo.

Não usar cargoSlots em posições predefinidas ao redor do Rover no MVP.

Exemplo:

[ROVER] 🧲 — ■ — ■ — ■ — ■

Cubos de cores e tamanhos diferentes na mesma fila.

Quando a capacidade aumenta via upgrade, a fila pode ficar mais longa.

9. Capacidade

O Magnet Rover possui limite máximo de carga.

Exemplo inicial:

capacity = 20 objetos

Quando estiver cheio:

carriedObjects >= capacity

o veículo deixa de coletar novos objetos.

Os objetos continuam no mapa.

Feedback necessário:

pequeno efeito visual;

som curto;

mensagem opcional "FULL";

indicação da processadora.

Não bloquear o movimento do jogador.

10. Processadora

Cada fase possui inicialmente uma única processadora.

Ela deve ser claramente visível e diferente do restante do cenário.

Quando o veículo carregado entra na área da processadora:

Processadora detecta Rover
    ↓
Objetos começam a ser puxados
    ↓
Objetos saem do Rover
    ↓
Objetos entram na máquina
    ↓
Moedas são adicionadas

Descarga

A descarga deve ser rápida e satisfatória.

Evitar remover todos os objetos instantaneamente.

Usar sequência:

objeto 1 → máquina
objeto 2 → máquina
objeto 3 → máquina
...

Intervalo sugerido:

20–60 ms

por objeto.

Adicionar:

tween;

escala;

rotação;

partículas;

som;

vibração leve;

contador de moedas.

11. Energia

A energia representa o limite principal da fase.

Começa em:

100%

e diminui durante a movimentação.

Para o MVP:

energy -= movementEnergyCost * delta;

Evitar regras adicionais.

Não consumir energia por:

coletar;

descarregar;

ficar parado.

Consumir energia somente quando o veículo estiver se movimentando.

Isso torna a regra fácil de entender:

Quanto mais você roda pelo mapa, mais energia gasta.

12. Power-up de energia

Algumas fases podem conter baterias.

Exemplo:

🔋

Ao coletar:

energy = Math.min(maxEnergy, energy + energyBonus);

Valores possíveis:

+10%
+20%
+25%

No MVP, utilizar apenas um tipo.

Power-ups devem ser opcionais na construção das fases.

13. Exploração do mapa

O mapa deve ser maior do que a viewport.

Exemplo:

Viewport:
1080 × 1920

Mapa:
2500 × 4000

A câmera segue o Rover.

camera.startFollow(rover);

O jogador não deve visualizar toda a fase de uma vez.

Isso cria:

descoberta;

curiosidade;

exploração;

sensação de progresso.

14. Estrutura visual de uma fase

Uma fase pode conter diferentes regiões.

Exemplo:

┌──────────────────────────────┐
│ Oficina                      │
│ ■ ■ ■                        │
│                              │
│      corredor                │
│                              │
│ Ferro-velho                  │
│ ■ ■ ■ 🚙                     │
│                              │
│            🔋                │
│                              │
│              PROCESSADORA    │
└──────────────────────────────┘

Cubos metálicos de cores e tamanhos diferentes espalhados pelas regiões.

Evitar mapas labirínticos no MVP.

O jogador deve conseguir navegar intuitivamente.

15. Objetos coletáveis

No MVP, os itens coletáveis são cubos metálicos.

Variações permitidas:

cores diferentes;

tamanhos diferentes.

Todos os cubos possuem o mesmo comportamento de gameplay.

Diferenças de cor e tamanho são apenas visuais.

Não criar peso, raridade ou valor diferente no MVP.

Todos contam como:

1 objeto

Isso reduz bastante a complexidade.

16. Moedas

O jogador ganha moedas ao processar objetos.

Exemplo:

1 objeto processado = 1 moeda

Moedas persistem entre fases.

playerCoins += processedObjects;

No futuro podem existir multiplicadores, mas não no MVP.

17. Upgrades

Inicialmente utilizar somente três upgrades.

Capacidade

Aumenta quantos objetos podem ser carregados.

Exemplo:

20 → 25 → 30 → 40

Raio magnético

Aumenta a distância de atração.

100px → 120px → 145px → 175px

Velocidade

Aumenta a velocidade do Rover.

200 → 215 → 230 → 250

Regra

Cada upgrade custa moedas.

Exemplo:

Level 1 → 100 moedas
Level 2 → 250 moedas
Level 3 → 500 moedas

18. Progressão

Fluxo:

Fase
 ↓
Vitória
 ↓
Recompensa
 ↓
Tela de upgrades
 ↓
Próxima fase

No MVP não é necessário implementar mapa de fases.

Pode existir apenas:

Level 1
Level 2
Level 3
...

19. Interface durante a fase

Manter a UI mínima.

Topo

ENERGIA
████████░░ 80%

Segundo indicador

LIMPEZA
██████░░░░ 60%

ou:

Restantes: 38

Preferência:

barra de limpeza percentual, pois reforça a mecânica principal.

Carga

Pode existir uma pequena indicação:

12 / 20

Mas o principal feedback deve ser visual através da fila de cubos atrás do Rover.

20. Cálculo de limpeza

cleanPercentage =
    ((totalObjects - remainingObjects) / totalObjects) * 100;

Exemplo:

Total: 100
Restantes: 35

Limpeza: 65%

21. Câmera

A câmera deve:

seguir o veículo;

possuir pequena suavização;

não mostrar além dos limites do mapa.

Exemplo:

camera.startFollow(rover, true, 0.08, 0.08);

Pode existir um pequeno look-ahead na direção do movimento futuramente.

Não necessário no MVP.

22. Feedback satisfatório

Essa é uma das partes mais importantes do jogo.

Ao atrair

Adicionar:

pequena rotação do cubo;

aceleração em direção ao ímã traseiro;

brilho opcional;

som metálico curto.

Ao entrar na fila

Adicionar:

pequeno bounce;

encaixe suave no fim da fila;

som "click";

pequena vibração.

Ao descarregar

Adicionar:

sucção rápida;

múltiplos sons;

partículas;

moedas surgindo;

números aumentando;

leve screen shake.

Ao limpar uma região

Adicionar pequenos efeitos como:

partículas de poeira;

brilho;

"Clean!";

som positivo.

23. Arquitetura sugerida

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
│   │   ├── GameScene.ts
│   │   ├── UpgradeScene.ts
│   │   └── ResultScene.ts
│   │
│   ├── entities/
│   │   ├── Rover.ts
│   │   ├── Scrap.ts
│   │   ├── Processor.ts
│   │   └── EnergyPickup.ts
│   │
│   ├── systems/
│   │   ├── MagnetSystem.ts
│   │   ├── CargoSystem.ts
│   │   ├── EnergySystem.ts
│   │   └── ProgressSystem.ts
│   │
│   ├── config/
│   │   ├── GameConfig.ts
│   │   └── Levels.ts
│   │
│   └── ui/
│       ├── EnergyBar.ts
│       ├── CleanBar.ts
│       └── CargoIndicator.ts
│
└── assets/
    ├── sprites/
    ├── audio/
    └── maps/

24. Entidades principais

Rover

class Rover {
    speed: number;
    magnetRadius: number;
    capacity: number;
    energy: number;
    cargo: Scrap[];
    // ímã ancorado na traseira do veículo
}

Scrap

class Scrap {
    state: ScrapState;
    color: number;
    size: number;
    sprite: Phaser.GameObjects.Sprite;
}

Processor

class Processor {
    processingArea: Phaser.Geom.Rectangle;
}

EnergyPickup

class EnergyPickup {
    energyAmount: number;
}

25. Dados da fase

As fases devem ser configuráveis sem alterar código.

Exemplo:

interface LevelConfig {
    id: number;

    mapWidth: number;
    mapHeight: number;

    initialEnergy: number;

    processor: {
        x: number;
        y: number;
    };

    scraps: {
        x: number;
        y: number;
        color: string;
        size: 'small' | 'medium' | 'large';
    }[];

    powerUps?: {
        x: number;
        y: number;
        type: 'energy';
    }[];
}

Isso permitirá posteriormente criar um editor ou gerar fases automaticamente.

26. Save local

Utilizar inicialmente:

localStorage

Salvar:

{
    coins: number,
    currentLevel: number,
    upgrades: {
        capacity: number,
        magnetRadius: number,
        speed: number
    }
}

Ao migrar para Android com Capacitor, esse sistema pode permanecer inicialmente.

27. Fluxo de telas

BOOT
 ↓
MENU
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
UPGRADES
│
↓
NEXT LEVEL

28. Primeira fase do protótipo

Criar apenas uma fase para validar a mecânica.

Configuração

Mapa:

2000 × 3000

Objetos:

100

Capacidade:

20

Energia:

100

Processadora:

1

Power-ups:

0

Upgrades:

desativados inicialmente.

Objetivo

Validar:

movimentação;

câmera;

sensação magnética;

fila maleável de cubos;

descarga;

limpeza;

consumo de energia;

vitória;

derrota.

29. Segunda etapa

Depois que o gameplay básico estiver satisfatório:

Adicionar:

moedas;

tela de upgrades;

diferentes mapas;

power-up de energia;

mais cores e tamanhos de cubos metálicos;

efeitos sonoros;

partículas;

vibração;

tutorial;

build Android.

30. Ordem recomendada de implementação

Fase 1 — Core

Criar projeto Phaser + TypeScript + Vite

Criar mapa maior que a viewport

Criar Rover

Implementar controle touch

Implementar câmera

Criar cubos metálicos coletáveis (cores e tamanhos)

Implementar raio magnético no ímã traseiro

Implementar atração

Implementar fila maleável de carga

Fase 2 — Game Loop

Criar processadora

Implementar descarga

Implementar energia

Implementar barra de energia

Implementar percentual de limpeza

Implementar vitória

Implementar derrota

Implementar retry

Fase 3 — Game Feel

Tweens

Partículas

Sons

Vibração

Screen shake

Feedback de carga cheia

Feedback de limpeza

Fase 4 — Progressão

Moedas

Persistência

Upgrade de capacidade

Upgrade de raio

Upgrade de velocidade

Tela de upgrades

Fase 5 — Mobile

Adicionar Capacitor

Criar projeto Android

Testar diferentes resoluções

Testar performance

Gerar APK

Gerar AAB

31. Critérios para considerar o MVP pronto

O MVP está pronto quando:

o jogador consegue movimentar o Rover confortavelmente com uma mão;

o mapa é maior do que a tela;

a câmera acompanha o jogador;

cubos metálicos são atraídos ao chegar perto do ímã traseiro;

cubos ficam visualmente em uma fila maleável atrás do Rover;

existe limite de carga;

o jogador consegue descarregar na processadora;

objetos processados desaparecem permanentemente;

a energia diminui durante a movimentação;

energia zero causa derrota;

limpar e processar todos os objetos causa vitória;

moedas são concedidas;

upgrades básicos funcionam;

progresso é salvo;

o jogo roda suavemente em Android;

uma fase completa pode ser jogada do início ao fim sem bugs bloqueantes.

32. Objetivo do protótipo

Antes de produzir conteúdo, o protótipo deve responder apenas a esta pergunta:

É divertido e satisfatório dirigir pelo mapa, puxar muitos cubos metálicos com o ímã traseiro, ver a fila maleável crescer atrás do Rover e descarregar tudo na processadora?

Se a resposta for sim, expandir.

Se não, ajustar principalmente:

velocidade;

raio do ímã;

comportamento da atração;

quantidade de objetos;

distribuição pelo mapa;

visual e maleabilidade da fila de cubos;

efeito da descarga;

tamanho do mapa.

O principal diferencial do jogo deve estar na sensação produzida por essas ações, e não na quantidade de sistemas.