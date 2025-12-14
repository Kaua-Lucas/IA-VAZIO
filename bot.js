// --- IMPORTAÇÕES DE MÓDULOS ---
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;
const mcDataRequester = require('minecraft-data'); // Renomeado para evitar conflito
const { Vec3 } = require('vec3');

// --- IMPORTAÇÕES CUSTOMIZADAS (Seus arquivos) ---
// Onde nela tera lista de diversos itens,comidas,blocos, mobs e ate ferramentas
const mob = require('./mobs/mobs.js');
const espadas = require('./Equipamentos/ferramentas.js');
const Ferramentas = require('./Equipamentos/ferramentas.js');
const tipos_De_Blocos = require('./blocosEComida/tipoDeBlocos.js');
const tipos_De_comidas = require('./blocosEComida/comestivel.js');

//-------------------------------------------------------------------------------\\

// --- CONFIGURAÇÃO DO BOT ---
const botConfig = {
  username: 'IA-Vazio',

  // servidores
  //host: 'krebinkkj.aternos.me',
  //port: '17968',
  //version: '1.20.4',

  //servidor
  
  host: 'nepotismo3.aternos.me',
  port: '56723',
  version: '1.21.9',

  hideErrors: false, // Mantenha como false para exibir erros durante o desenvolvimento
}; //o nick da skin do vazio é: 6628

// --- VARIÁVEIS GLOBAIS ---
let mcData; // Será inicializado no 'login'
let andando = false;
let mining = false;
let blocksToMine = [];
let blocksBroken = []; // Lista para armazenar blocos quebrados
var resetPvpMob = 0;
let velocidade = 0; // Variável global para armazenar a velocidade do bot
let atividadeAtual = null; // Variável para armazenar a atividade atual do bot
let comandoCopiado = null; // Variável para armazenar o comando copiado
let botSilenciado = false; // Variável para controlar se o bot pode falar no chat

// --- INICIALIZAÇÃO DO BOT ---
const bot = mineflayer.createBot(botConfig);
module.exports = { bot };

// Carrega o plugin pathfinder
bot.loadPlugin(pathfinder);

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE CHAT E COMANDOS ---
//-------------------------------------------------------------------------------\\

/**
 * Envia uma mensagem no chat, mas apenas se o bot não estiver silenciado.
 * @param {string} mensagem - A mensagem a ser enviada.
 */
function safeBotChat(mensagem) {
  if (!botSilenciado) {
    bot.chat(mensagem);
  } else {
    console.log(`[CHAT SILENCIADO] ${mensagem}`);
  }
}

// --- OUVINTES DE EVENTOS DO BOT (`bot.on`) ---

/**
 * Evento 'login': Disparado quando o bot entra no servidor com sucesso.
 */
bot.on('login', () => {
  console.log('Bot logado com sucesso!');
  const botSocket = bot._client.socket;
  console.log(`logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
  
  // Inicializa o mcData com a versão correta do servidor
  mcData = mcDataRequester(bot.version);
});

/**
 * Evento 'end': Disparado quando o bot é desconectado.
 */
bot.on('end', () => {
  console.log(bot.username + " saiu do servidor");
  // reconnect(); // Chame a função reconectar imediatamente (se desejar)
});

/**
 * Evento 'spawn': Disparado quando o bot (re)nasce no mundo.
 */
bot.on('spawn', async () => {
  monitorarVelocidade();
  console.log("Nasceu", Object.keys(bot.players));

  // Se estava minerando antes de cair, retoma a mineração
  if (blocksToMine.length > 0) {
    safeBotChat('Fui desconectado, mas estou retomando a mineração!');
    mineNextBlock(bot);
  }
});

/**
 * Evento 'death': Disparado quando o bot morre.
 */
bot.on('death', () => {
  safeBotChat('Morri! Tentando reconectar e continuar mineração...');
  mining = false;
});

/**
 * Evento 'health': Disparado quando a vida ou fome do bot mudam.
 * Usado para lógica de comer automaticamente.
 */
bot.on('health', async () => {
  console.log(`Vida: ${bot.health}/20, Fome: ${bot.food}/20`);

  if (bot.food <= 17 && bot.health < 20) {
    console.log('O bot está com fome e precisa comer!');
    verificarEComer();
  } else if (bot.food < 10) {
    while (bot.food != 20) {
      await bot.waitForTicks(120);
      await verificarEComer();
      if (bot.food == 20) {
        break;
      }
    }
  }
  await bot.waitForTicks(40);
});

/**
 * Evento 'error': Disparado quando ocorre um erro.
 */
bot.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log(`Falha ao conectar a ${err.address}:${err.port}`);
  } else {
    console.log(`Erro não tratado: ${err}`);
  }
});

/**
 * OUVINTE DE CHAT PRINCIPAL
 * Unifica toda a lógica de comandos do chat.
 */
bot.on("chat", async (username, message) => {
  // Ignora as próprias mensagens do bot
  if (username === bot.username) return;

  // --- Comandos Globais (Funcionam em qualquer distância) ---

  // Remove prefixos de rank/nick (ex: [Admin] Player: ...)
  let msgLimpa = message.replace(/.*\] /, '');
  console.log(`[CHAT] ${username}: ${message} (Limpa: ${msgLimpa})`);

  // Comando para silenciar o bot
  if (msgLimpa === '!silenciar') {
    botSilenciado = true;
    bot.chat('Ok, vou ficar quieto.'); // Uma última mensagem de confirmação
    return;
  }

  // Comando para o bot voltar a falar
  if (msgLimpa === '!falar') {
    botSilenciado = false;
    safeBotChat('Voltei a falar!');
    return;
  }

  // Comando de Drop
  if (message.startsWith("!drop")) {
    const args = message.split(" ");
    if (args.length < 4) {
      safeBotChat("Uso correto: !drop <x> <y> <z> [item]");
      return;
    }
    const x = parseInt(args[1]);
    const y = parseInt(args[2]);
    const z = parseInt(args[3]);
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      safeBotChat("Coordenadas inválidas! Use números.");
      return;
    }
    const itemNome = args.length > 4 ? args[4] : "todos"; // Se não especificar item, dropa tudo
    await dropItens(x, y, z, itemNome);
    return;
  }
  
  // Comando de Ajuda
  if (msgLimpa === '!help') {
    // Envia a mensagem de ajuda diretamente para o jogador, sem passar pelo safeBotChat
    // Isso garante que a ajuda funcione mesmo se o bot estiver silenciado.
    bot.whisper(username, `
      Comandos disponíveis:
      - !silenciar / !falar: Ativa ou desativa minhas mensagens no chat.
      - !drop <x> <y> <z> [item]: Vou até as coords e dropo o item (ou tudo).
      - !copia: <comando>: Copia um comando para ser executado após eu dormir.
      - onde está o bot: Digo minhas coordenadas atuais.
      - minerar <x1> <y1> <z1> <x2> <y2> <z2>: Minero uma área.
      - parar: Paro a mineração ou de seguir.
      - me siga / pare de me seguir: Começo ou paro de te seguir.
      - durma: Tento dormir se for noite.
      - equipar armadura: Equipa a melhor armadura do meu inventário.
      - explore: Começo a explorar o mapa.
      - E outros comandos de coleta/craft (madeira, terra, craft, etc.)
    `);
    return;
  }

  // Comando de Cópia (para loop pós-dormir)
  if (message.startsWith('!copia:')) {
    comandoCopiado = message.replace('!copia:', '').trim();
    safeBotChat('Comando copiado');
  }
  
  // Limpa o comando copiado se for um comando que não deve ser repetido
  if (['me siga', 'pare de me seguir', 'Mineração concluída!', 'equipar armadura', 'explorar'].includes(msgLimpa)) {
    comandoCopiado = null;
  }

  // Comando de Posição
  if (msgLimpa === "onde está o bot") {
    const { x, y, z } = bot.entity.position;
    safeBotChat(`A posição do jogador ${bot.username} é: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}`);
  }

  // Comandos de Mineração (Área)
  const args = msgLimpa.split(' ');
  if (args[0] === 'minerar') {
    if (args.length < 7) {
      safeBotChat('Uso: minerar x1 y1 z1 x2 y2 z2');
      return;
    }
    const x1 = parseInt(args[1]);
    const y1 = parseInt(args[2]);
    const z1 = parseInt(args[3]);
    const x2 = parseInt(args[4]);
    const y2 = parseInt(args[5]);
    const z2 = parseInt(args[6]);
    
    atividadeAtual = 'minerar'; // Define a atividade
    startMining(bot, new Vec3(x1, y1, z1), new Vec3(x2, y2, z2));
    return;
  }

  // Comando de Parar
  if (msgLimpa === 'parar') {
    atividadeAtual = null; // Limpa a atividade
    comandoCopiado = null; // Limpa o comando copiado
    stopMining(bot);
    pararDeSeguir(); // Também para de seguir
    return;
  }

  // --- Comandos de Proximidade (Requerem que o jogador esteja perto) ---
  const player = bot.players[username]?.entity;
  if (!player) return; // Se o jogador não for encontrado, ignora o resto

  const distancia = bot.entity.position.distanceTo(player.position);
  if (distancia <= 35) {
    // Comandos de Seguir
    if (msgLimpa === 'me siga') {
      atividadeAtual = 'seguir';
      seguirJogador(player);
    } else if (msgLimpa === 'pare de me seguir') {
      atividadeAtual = null;
      comandoCopiado = null;
      pararDeSeguir();
    }
    
    // Comandos de Coleta
    if (msgLimpa === "terra") {
      pegarTerra();
    }
    if (msgLimpa === "madeira") {
      pegarMadeira();
    }
    if (msgLimpa === "minerar") { // Nota: Este comando está duplicado (um para área, outro para stone)
      minerarStone(); // Este é o 'minerar' para stone
    }
    
    // Comandos de Crafting
    if (msgLimpa === "graveto") {
      fazerStick();
    }
    if (msgLimpa === "tabua") {
      fazerMadeira(); // Função de craftar tábuas
    }
    if (msgLimpa === "craft") {
      fazerCraftingTable();
    }
    if (msgLimpa === "coloque") {
      colocarCraftingTable();
    }
    if (msgLimpa === "procure") {
      ProcurarCraftingTable();
    }
    if (msgLimpa === "criar picareta") {
      craftPickaxe();
    }
    if (msgLimpa === "machado") {
      craftAxe();
    }
    if (message === 'vem') {
    const barco = bot.nearestEntity(e => 
      e.name === 'boat' || e.name === 'chest_boat'
    );
    if (message === 'sair') {
    if (bot.vehicle) {
      bot.dismount();
      console.log('Saí do barco!');
    }
  }
    if (barco) {
      bot.mount(barco);
    }
    }
    // Comandos de Ação
    if (msgLimpa === "ataque") {
      ATKMonstros();
    }
    if (msgLimpa === "explore") {
      atividadeAtual = 'explorar';
      explorarBiomas();
    }
    if (msgLimpa === "durma") {
      Dormir();
    }
    if (msgLimpa === "suba") {
      voltarParaSuperfice();
    }
    
    // Comando de Equipar
    if (msgLimpa === 'equipar armadura') {
      await equiparArmadura();
    }
  }
});

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE MINERAÇÃO E COLETA ---
//-------------------------------------------------------------------------------\\

/**
 * Inicia a mineração em uma área definida por duas posições.
 * @param {object} bot - A instância do bot.
 * @param {Vec3} posA - Posição inicial (canto 1).
 * @param {Vec3} posB - Posição final (canto 2).
 */
async function startMining(bot, posA, posB) {
  if (mining) {
    safeBotChat('Já estou minerando!');
    return;
  }
  mining = true;
  blocksToMine = [];
  blocksBroken = []; // Limpa a lista de blocos quebrados ao iniciar a mineração
  
  // Define as posições mínimas e máximas
  const minX = Math.min(posA.x, posB.x);
  const maxX = Math.max(posA.x, posB.x);
  const minY = Math.min(posA.y, posB.y);
  const maxY = Math.max(posA.y, posB.y);
  const minZ = Math.min(posA.z, posB.z);
  const maxZ = Math.max(posA.z, posB.z);
  
  // Coleta todos os blocos nas coordenadas especificadas
  await atualizarListaDeBlocos(bot, minX, maxX, minY, maxY, minZ, maxZ);

  // Inicia o intervalo para atualizar a lista de blocos a cada 5 segundos
  const atualizarIntervalo = setInterval(async () => {
    await atualizarListaDeBlocos(bot, minX, maxX, minY, maxY, minZ, maxZ);
  }, 5 * 1000); // 5 segundos

  // Inicia a mineração
  await mineNextBlock(bot, atualizarIntervalo); // Passa o intervalo para a função de mineração
}

/**
 * Minera o próximo bloco da lista 'blocksToMine'.
 * @param {object} bot - A instância do bot.
 * @param {NodeJS.Timeout} atualizarIntervalo - O ID do intervalo de atualização para poder pará-lo.
 */
async function mineNextBlock(bot, atualizarIntervalo) {
  if (!mining || blocksToMine.length === 0) {
    if (mining) {
      safeBotChat('Mineração concluída!');
      comandoCopiado = null; // Limpa o comando copiado
      atividadeAtual = null; // Limpa a atividade
    }
    mining = false;
    clearInterval(atualizarIntervalo); // Para o intervalo quando a mineração termina
    await verificarBlocosQuebrados(bot); // Verifica os blocos quebrados após a mineração
    return;
  }

  const block = blocksToMine.shift(); // Pega o próximo bloco
  console.log(`Minerando bloco: ${block.name} na posição: ${block.position}`);
  await bot.pathfinder.setGoal(new goals.GoalBlock(block.position.x, block.position.y, block.position.z), 0);
  await equiparFerramentaCerta(block);
  
  // Lógica de tentativas para quebrar o bloco
  const maxAttempts = 3;
  let attempt = 0;
  let success = false;
  
  while (attempt < maxAttempts && !success) {
    attempt++;
    try {
      await bot.dig(block);
      console.log(`Bloco ${block.name} minerado com sucesso.`);
      blocksBroken.push(block); // Adiciona o bloco à lista de blocos quebrados
      success = true; // Marca como sucesso se não houver erro
    } catch (err) {
      console.error(`Erro ao minerar o bloco ${block.name}: ${err.message}`);
      if (attempt < maxAttempts) {
        console.log(`Tentando novamente... (Tentativa ${attempt})`);
        await bot.waitForTicks(20);
      } else {
        console.log(`Falha ao quebrar o bloco ${block.name} após ${maxAttempts} tentativas.`);
      }
    }
  }

  await bot.waitForTicks(20);
  await mineNextBlock(bot, atualizarIntervalo); // Chama a função novamente para minerar o próximo bloco
}

/**
 * Atualiza a lista 'blocksToMine' com os blocos presentes na área definida.
 */
async function atualizarListaDeBlocos(bot, minX, maxX, minY, maxY, minZ, maxZ) {
  blocksToMine = []; // Limpa a lista atual

  // Coleta todos os blocos nas coordenadas especificadas
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const block = bot.blockAt(new Vec3(x, y, z));
        if (block && block.name !== 'air') {
          blocksToMine.push(block);
        }
      }
    }
  }

  // Ordena os blocos pela posição (do menor para o maior)
  blocksToMine.sort((a, b) => {
    const aPos = a.position;
    const bPos = b.position;
    return aPos.x - bPos.x || aPos.y - bPos.y || aPos.z - bPos.z;
  });

  // Imprime a lista de blocos atualizada
  console.log("Lista de blocos a minerar atualizada:", blocksToMine.length);
}

/**
 * Verifica e reporta o resultado da mineração.
 */
async function verificarBlocosQuebrados(bot) {
  if (blocksToMine.length === 0 && blocksBroken.length > 0) {
    console.log("Todos os blocos foram minerados com sucesso.");
    console.log("Blocos quebrados:", blocksBroken.length);
  } else {
    console.log("Ainda existem blocos a serem minerados ou algum bloco não foi quebrado.");
  }
}

/**
 * Para a atividade de mineração atual.
 */
function stopMining(bot) {
  if (!mining) {
    safeBotChat('Não estou minerando no momento!');
    return;
  }
  
  mining = false;
  blocksToMine = [];
  safeBotChat('Mineração interrompida!');
}

/**
 * Conta quantos blocos de 'cobblestone' o bot tem.
 * @returns {number} - A quantidade total de cobblestone.
 */
function contarBlocosDeStone() {
  let totalStone = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === 'cobblestone') {
      totalStone += item.count;
    }
  }
  return totalStone;
}

/**
 * Minera 'stone' até atingir 192 (3 packs) de 'cobblestone'.
 */
async function minerarStone() {
  while (contarBlocosDeStone() < 192) {
    const stoneBlock = bot.findBlock({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 64,
    });

    if (stoneBlock) {
      bot.pathfinder.setGoal(new goals.GoalBlock(stoneBlock.position.x, stoneBlock.position.y, stoneBlock.position.z), 0);
      console.log("minerei:", contarBlocosDeStone());
      // NOTA: Esta função não chama bot.dig(). Ela apenas vai até o bloco.
      // A quebra pode estar sendo feita por outro plugin ou manualmente.
      // A função 'startMining' (linha 280) USA bot.dig().
    } else {
      safeBotChat("Nenhuma Stone perto de mim");
      break;
    }
    await bot.waitForTicks(60);
  }
  
  if (contarBlocosDeStone() >= 192) {
    safeBotChat("ja tenho 3 packs no meu inventario, não preciso minerar");
    console.log("voltando pra superfice apos ter minerado...");
    await voltarParaSuperfice();
    console.log("voltei pra superfice");
  }
}

/**
 * Conta quantos troncos ('oak_log') o bot tem.
 * @returns {number} - A quantidade total de troncos.
 */
function contarBlocosDeMadeira() {
  let totalMadeira = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === 'oak_log') {
      totalMadeira += item.count;
    }
  }
  return totalMadeira;
}

/**
 * Coleta troncos ('oak_log') até ter 20.
 */
async function pegarMadeira() {
  while (contarBlocosDeMadeira() < 20) {
    const madeira = bot.findBlock({
      matching: mcData.blocksByName.oak_log.id,
      maxDistance: 100,
    });

    if (madeira) {
      bot.pathfinder.setGoal(new goals.GoalBlock(madeira.position.x, madeira.position.y, madeira.position.z));
      await bot.waitForTicks(120);
      // NOTA: Esta função também não chama bot.dig().
      console.log("Troncos:", contarBlocosDeMadeira());
    } else {
      safeBotChat("Não consegui encontrar madeira");
      break;
    }
    await bot.waitForTicks(20);
  }
  safeBotChat("Agora tenho 20 troncos de madeira!");
}

/**
 * Conta quantos blocos de 'dirt' o bot tem.
 * @returns {number} - A quantidade total de terra.
 */
function contarBlocosDeTerra() {
  let totalTerra = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === 'dirt') {
      totalTerra += item.count;
    }
  }
  return totalTerra;
}

/**
 * Coleta 'dirt' (terra) até ter 64 (1 pack).
 */
async function pegarTerra() {
  while (contarBlocosDeTerra() < 64) {
    const Terra = bot.findBlock({
      matching: mcData.blocksByName.grass_block.id, // Procura por grama
      maxDistance: 10000,
    });

    if (Terra) {
      bot.pathfinder.setGoal(new goals.GoalBlock(Terra.position.x, Terra.position.y, Terra.position.z));
      await bot.waitForTicks(120);
      // NOTA: Esta função também não chama bot.dig().
      console.log("Terra:", contarBlocosDeTerra());
    } else {
      safeBotChat("Não consegui encontrar Terra");
      break;
    }
    await bot.waitForTicks(20);
  }
  safeBotChat("Agora tenho 64 blocos de Terra!");
  voltarParaSuperfice();
}

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE MOVIMENTAÇÃO E SEGUIR ---
//-------------------------------------------------------------------------------\\

/**
 * Faz o bot seguir um jogador alvo.
 * @param {object} player - A entidade do jogador a seguir.
 */
async function seguirJogador(player) {
  andando = true;
  safeBotChat('Estou seguindo você!');

  while (andando) {
    await bot.waitForTicks(60);
    bot.pathfinder.setGoal(new GoalFollow(player, 1));
    olharParaPlayer(player);
  }
}

/**
 * Faz o bot parar de seguir o jogador.
 */
function pararDeSeguir() {
  if (andando) {
    bot.pathfinder.setGoal(null);
    safeBotChat('Parei de seguir você.');
    andando = false;
  }
}

/**
 * Faz o bot olhar para a entidade do jogador.
 * @param {object} player - A entidade do jogador.
 */
function olharParaPlayer(player) {
  const posicaoPlayer = player.position.offset(0, player.height, 0);
  bot.lookAt(posicaoPlayer, true);
}

/**
 * Tenta encontrar um bloco de grama e ir até ele (voltar à superfície).
 */
async function voltarParaSuperfice() {
  const grass = bot.findBlock({
    matching: mcData.blocksByName.short_grass.id,
    maxDistance: 40000
  });

  if (grass) {
    bot.pathfinder.setGoal(new goals.GoalBlock(grass.position.x, grass.position.y, grass.position.z));
  } else {
    safeBotChat("não consigo voltar pra superfice");
  }
}

/**
 * Inicia um loop para o bot explorar biomas aleatoriamente.
 */
function explorarBiomas() {
  safeBotChat("okay");
  setInterval(() => {
    moverParaDirecaoAleatoria();
  }, 240000); // Explora a cada 4min
}

/**
 * Define um objetivo aleatório para o bot se mover.
 */
function moverParaDirecaoAleatoria() {
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  const x = bot.entity.position.x + Math.floor(Math.random() * 1000 - 50);
  const z = bot.entity.position.z + Math.floor(Math.random() * 1000 - 50);
  const y = bot.entity.position.y;

  const alvo = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (alvo && !alvo.waterlogged) {
    const goal = new goals.GoalNear(x, y, z, 1);
    bot.pathfinder.setGoal(goal);
    console.log(`Explorando para a posição X:${x}, Y:${y}, Z:${z}`);
  } else {
    console.log('Direção inválida. Tentando outra...');
  }
}

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE CRAFTING E INVENTÁRIO ---
//-------------------------------------------------------------------------------\\

/**
 * Droppa itens do inventário em coordenadas específicas.
 * @param {number} x - Coordenada X.
 * @param {number} y - Coordenada Y.
 * @param {number} z - Coordenada Z.
 * @param {string} itemNome - Nome do item para dropar, ou "todos".
 */
async function dropItens(x, y, z, itemNome = "todos") {
  safeBotChat(`Indo para as coordenadas (${x}, ${y}, ${z}) para dropar itens...`);
  bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
  await bot.waitForTicks(40);

  const inventario = bot.inventory.items();
  if (inventario.length === 0) {
    safeBotChat("Não tenho itens para dropar!");
    return;
  }

  safeBotChat(`Dropando ${itemNome === "todos" ? "todos os itens" : itemNome}...`);
  for (let item of inventario) {
    if (itemNome === "todos" || item.name === itemNome) {
      try {
        await bot.tossStack(item);
        await bot.waitForTicks(10);
      } catch (err) {
        console.log(`Erro ao dropar ${item.name}: ${err.message}`);
      }
    }
  }
  safeBotChat("Itens dropados!");
}

/**
 * Procura e vai até uma crafting table próxima.
 */
async function ProcurarCraftingTable() {
  const CraftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 100
  });
  await bot.waitForTicks(60);
  
  if (CraftingTable) {
    bot.pathfinder.setGoal(new goals.GoalBlock(CraftingTable.position.x - 1, CraftingTable.position.y, CraftingTable.position.z));
    await bot.waitForTicks(60);
    bot.look(-1.5, -0.5, 0);
  } else {
    safeBotChat("Não encontrei uma crafting table");
  }
}

/**
 * Crafta uma picareta de madeira (wooden_pickaxe).
 */
async function craftPickaxe() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas;
  await ProcurarCraftingTable();
  
  let totalDeStick = 0;
  let totalDeMadeira = 0;

  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    let contadorDeLista = 0;
    while (contadorDeLista != tiposDeTabuas.length) {
      if (item.name === tiposDeTabuas[contadorDeLista]) {
        totalDeMadeira += item.count;
      }
      contadorDeLista++;
    }
  }

  if (totalDeStick < 2 || totalDeMadeira < 3) {
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return;
  }
  
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto.");
    return;
  }
  
  await bot.waitForTicks(20);
  const recipe = bot.recipesFor(mcData.itemsByName.wooden_pickaxe.id, null, 1, craftingTable)[0];

  if (recipe) {
    try {
      await bot.craft(recipe, 1, craftingTable);
      console.log("Picareta de madeira criada com sucesso!");
    } catch (err) {
      console.log("Erro ao criar a picareta:", err);
    }
  } else {
    console.log("Erro: Receita para picareta de madeira não encontrada.");
  }
}

/**
 * Crafta um machado de madeira (wooden_axe).
 */
async function craftAxe() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas;
  await ProcurarCraftingTable();
  
  let totalDeStick = 0;
  let totalDeMadeira = 0;

  //... (lógica de contagem de itens igual a craftPickaxe) ...
  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    let contadorDeLista = 0;
    while (contadorDeLista != tiposDeTabuas.length) {
      if (item.name === tiposDeTabuas[contadorDeLista]) {
        totalDeMadeira += item.count;
      }
      contadorDeLista++;
    }
  }

  if (totalDeStick < 2 || totalDeMadeira < 3) {
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return;
  }

  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto.");
    return;
  }
  
  await bot.waitForTicks(20);
  const recipe = bot.recipesFor(mcData.itemsByName.wooden_axe.id, null, 1, craftingTable)[0];

  if (recipe) {
    try {
      await bot.craft(recipe, 1, craftingTable);
      console.log("Machado de madeira criada com sucesso!");
    } catch (err) {
      console.log("Erro ao criar a Machado:", err);
    }
  } else {
    console.log("Erro: Receita para Machado de madeira não encontrada.");
  }
}

/**
 * Crafta uma espada de madeira (wooden_sword).
 */
async function craftSword() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas;
  await ProcurarCraftingTable();
  
  let totalDeStick = 0;
  let totalDeMadeira = 0;
  
  //... (lógica de contagem de itens igual a craftPickaxe) ...
  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    let contadorDeLista = 0;
    while (contadorDeLista != tiposDeTabuas.length) {
      if (item.name === tiposDeTabuas[contadorDeLista]) {
        totalDeMadeira += item.count;
      }
      contadorDeLista++;
    }
  }

  if (totalDeStick < 1 || totalDeMadeira < 2) { // Requisitos diferentes para espada
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return;
  }

  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto.");
    return;
  }

  await bot.waitForTicks(20);
  const recipe = bot.recipesFor(mcData.itemsByName.wooden_sword.id, null, 1, craftingTable)[0];

  if (recipe) {
    try {
      await bot.craft(recipe, 1, craftingTable);
      console.log("espada de madeira criada com sucesso!");
    } catch (err) {
      console.log("Erro ao criar a espada:", err);
    }
  } else {
    console.log("Erro: Receita para espada de madeira não encontrada.");
  }
}

/**
 * Crafta uma pá de madeira (wooden_shovel).
 */
async function craftShovel() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas;
  await ProcurarCraftingTable();
  
  let totalDeStick = 0;
  let totalDeMadeira = 0;
  
  //... (lógica de contagem de itens igual a craftPickaxe) ...
  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    let contadorDeLista = 0;
    while (contadorDeLista != tiposDeTabuas.length) {
      if (item.name === tiposDeTabuas[contadorDeLista]) {
        totalDeMadeira += item.count;
      }
      contadorDeLista++;
    }
  }

  if (totalDeStick < 2 || totalDeMadeira < 1) { // Requisitos diferentes para pá
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return;
  }
  
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto.");
    return;
  }
  
  await bot.waitForTicks(20);
  const recipe = bot.recipesFor(mcData.itemsByName.wooden_shovel.id, null, 1, craftingTable)[0];

  if (recipe) {
    try {
      await bot.craft(recipe, 1, craftingTable);
      console.log("pá de madeira criada com sucesso!");
    } catch (err) {
      console.log("Erro ao criar a pá:", err);
    }
  } else {
    console.log("Erro: Receita para pá de madeira não encontrada.");
  }
}

/**
 * Crafta gravetos (stick) a partir de tábuas.
 */
async function fazerStick() {
  const tabuas = bot.inventory.items().find(item => item.name.includes('planks'));
  if (!tabuas || tabuas.count < 2) {
    safeBotChat("Não tenho tabuas suficiente para fazer um Stick.");
    return;
  }
  
  const tabuaRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, bot.inventory);
  if (tabuaRecipe.length === 0) {
    safeBotChat("Não encontrei a receita para o Stick.");
    return;
  }
  
  try {
    await bot.craft(tabuaRecipe[0], 1, null);
    safeBotChat("Stick criada com sucesso!");
  } catch (err) {
    safeBotChat("Erro ao criar o stick.");
    console.error(err);
  }
}

/**
 * Crafta tábuas (oak_planks) a partir de troncos.
 */
async function fazerMadeira() {
  const troncoss = bot.inventory.items().find(item => item.name.includes('log'));
  if (!troncoss || troncoss.count < 1) {
    safeBotChat("Não tenho troncos suficientes para fazer madeira.");
    return;
  }

  const tabuaRecipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, bot.inventory);
  if (tabuaRecipe.length === 0) {
    safeBotChat("Não encontrei a receita para madeira.");
    return;
  }
  
  try {
    await bot.craft(tabuaRecipe[0], 1, null);
    safeBotChat("Madeira criada com sucesso!");
  } catch (err) {
    safeBotChat("Erro ao criar o Madeira.");
    console.error(err);
  }
}

/**
 * Crafta uma mesa de trabalho (crafting_table) e a coloca no chão.
 */
async function fazerCraftingTable() {
  const madeira = bot.inventory.items().find(item => item.name.includes('planks'));
  if (!madeira || madeira.count < 4) {
    safeBotChat("Não tenho madeira suficiente para fazer uma mesa de trabalho.");
    return;
  }

  const craftingTableRecipe = bot.recipesFor(mcData.itemsByName.crafting_table.id, null, 1, bot.inventory);
  if (craftingTableRecipe.length === 0) {
    safeBotChat("Não encontrei a receita para a mesa de trabalho.");
    return;
  }

  try {
    await bot.craft(craftingTableRecipe[0], 1, null);
    safeBotChat("Mesa de trabalho criada com sucesso!");
  } catch (err) {
    safeBotChat("Erro ao criar a mesa de trabalho.");
    console.error(err);
    return;
  }
  
  // Coloque a mesa de trabalho no chão
  await colocarCraftingTable();
}

/**
 * Coloca uma mesa de trabalho (crafting_table) do inventário no mundo.
 */
async function colocarCraftingTable() {
  const mesaTrabalho = bot.inventory.items().find(item => item.name === 'crafting_table');
  const block = bot.blockAt(bot.entity.position.offset(1, 0, 0)); // Bloco à frente
  
  if (mesaTrabalho) {
    try {
      await equiparFerramentaCerta(block); // Equipa ferramenta (provavelmente para quebrar grama/etc)
      
      const blocoAlvo = bot.blockAt(bot.entity.position.offset(1, -1, 0)); // Bloco no chão, à frente
      
      // Limpa o espaço se necessário
      if (block && block.name !== 'air') {
        await bot.dig(block);
        await bot.waitForTicks(60);
      }
      
      bot.equip(mesaTrabalho, 'hand');
      
      if (blocoAlvo) {
        // Tenta colocar a mesa no blocoAlvo (chão)
        await bot.placeBlock(blocoAlvo, new Vec3(0, 1, 0)); // Vec3(0, 1, 0) significa "em cima"
        safeBotChat("Mesa de trabalho colocada no chão!");
      } else {
        safeBotChat("Não há espaço adequado para colocar a mesa de trabalho.");
      }
    } catch (err) {
      safeBotChat("Erro ao colocar a mesa de trabalho no chão.");
      console.error(err);
    }
  } else {
    safeBotChat("Não encontrei a mesa de trabalho no inventário.");
  }
}

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE COMBATE E EQUIPAMENTOS ---
//-------------------------------------------------------------------------------\\

/**
 * Equipa a ferramenta correta para quebrar um determinado bloco.
 * @param {object} bloco - O bloco que o bot pretende quebrar.
 */
async function equiparFerramentaCerta(bloco) {
  let ferramenta;

  // Percorre o objeto para encontrar a ferramenta adequada
  for (const [ferramentaNome, blocos] of Object.entries(Ferramentas.ferramentasBlocos)) {
    if (blocos.some(b => bloco.name.includes(b))) {
      ferramenta = bot.inventory.items().find(item => item.name.includes(ferramentaNome));
      break;
    }
  }

  // Equipa a ferramenta caso encontrada no inventário
  if (ferramenta) {
    try {
      await bot.equip(ferramenta, 'hand');
      console.log(`Equipado com ${ferramenta.name}`);
    } catch (error) {
      console.log(`Erro ao equipar ${ferramenta.name}:`, error.message);
    }
  } else {
    console.log("Ferramenta apropriada não encontrada no inventário!");
  }
}

/**
 * Equipa a melhor espada disponível no inventário.
 */
async function equiparEspada() {
  const swords = espadas.swords;
  const espada = bot.inventory.items().find(item => swords.includes(item.name));
  
  if (espada) {
    try {
      await bot.equip(espada, 'hand');
      console.log(`Equipada: ${espada.name}`);
    } catch (error) {
      console.error('Erro ao equipar a espada:', error.message);
    }
  } else {
    console.log('Nenhuma espada encontrada no inventário.');
  }
}

const materialPriority = [
    'netherite',
    'diamond',
    'iron',
    'chainmail',
    'golden',
    'leather',
    'turtle' // Prioridade especial para o casco de tartaruga
];

/**
 * Define o mapeamento de quais tipos de item vão em quais slots.
 */
const slotMapping = {
    'head': ['helmet', 'turtle_shell'], // Slot 'head' aceita 'helmet' e 'turtle_shell'
    'torso': ['chestplate', 'elytra'], // Slot 'torso' aceita 'chestplate' e 'elytra'
    'legs': ['leggings'], // Slot 'legs' aceita 'leggings'
    'feet': ['boots'] // Slot 'feet' aceita 'boots'
};

/**
 * Equipa as melhores peças de armadura disponíveis no inventário,
 * usando a lista de armaduras de 'ferramentas.js'.
 */
async function equiparArmadura() {
    console.log("Verificando e equipando a melhor armadura...");
    
    // 1. Pega a lista de TODAS as armaduras do seu arquivo ferramentas.js
    const allArmorItems = espadas.armor; 
    
    // 2. Pega todos os itens do inventário do bot
    const inventoryItems = bot.inventory.items();

    // 3. Filtra o inventário para conter APENAS os itens que estão na sua lista 'espadas.armor'
    const armorInInventory = inventoryItems.filter(item => allArmorItems.includes(item.name));

    // 4. Itera sobre cada SLOT de destino (cabeça, peito, pernas, pés)
    //    Isso cumpre seu requisito de "loop 4 vezes"
    for (const slot of ['head', 'torso', 'legs', 'feet']) {
        
        // Pega os tipos de item para este slot (ex: ['helmet', 'turtle_shell'])
        const itemTypesForSlot = slotMapping[slot]; 
        
        let bestItem = null;
        let bestPriority = -1; // Usamos -1 para garantir que qualquer item seja melhor

        // 5. Cria a "categoria" de itens para este slot
        //    (ex: todos os capacetes que o bot possui)
        const compatibleItems = armorInInventory.filter(item => {
            // Verifica se o nome do item termina com o tipo (ex: 'diamond_helmet' termina com 'helmet')
            // ou se é um item especial (ex: 'turtle_shell' é 'turtle_shell')
            return itemTypesForSlot.some(type => item.name.endsWith(type) || item.name === type);
        });

        // 6. Se o bot tem itens para este slot, acha o MELHOR
        if (compatibleItems.length > 0) {
            
            // Lida com a 'elytra' como um caso especial de alta prioridade
            if (slot === 'torso') {
                const elytra = compatibleItems.find(item => item.name === 'elytra');
                if (elytra) {
                    bestItem = elytra;
                    bestPriority = 99; // Prioridade máxima
                }
            }

            // Itera sobre os materiais (Netherite, Diamond, etc.) para achar o melhor
            for (const item of compatibleItems) {
                // Se já achamos a elytra, não precisamos procurar mais por peitorais
                if (bestPriority === 99) break; 

                let currentPriority = -1;
                for (let i = 0; i < materialPriority.length; i++) {
                    if (item.name.startsWith(materialPriority[i])) {
                        // Prioridade mais alta = 0 (netherite), mais baixa = 5 (leather)
                        // Invertemos para que a prioridade mais alta tenha o maior número
                        currentPriority = materialPriority.length - i;
                        break;
                    }
                }

                // Se este item for melhor que o 'bestItem' anterior, ele se torna o novo 'bestItem'
                if (currentPriority > bestPriority) {
                    bestPriority = currentPriority;
                    bestItem = item;
                }
            }
        }

        // 7. Depois de achar o melhor item, equipa-o
        if (bestItem) {
            try {
                // O bot.equip é inteligente, ele só troca se o item for diferente
                await bot.equip(bestItem, slot);
                console.log(`Equipado no slot ${slot}: ${bestItem.name}`);
            } catch (err) {
                console.error(`Erro ao equipar ${bestItem.name} no slot ${slot}: ${err.message}`);
            }
        } else {
            // Informa se não achou nada para este slot específico
            console.log(`Nenhuma armadura encontrada no inventário para o slot: ${slot}`);
        }
    }
    
    console.log("Verificação de armadura concluída.");
    safeBotChat("Armadura verificada e equipada!");
}

/**
 * Procura e ataca monstros hostis próximos.
 * @param {number} distanciaMaxima - Distância máxima para procurar alvos.
 * @param {number} maxAlvos - Número máximo de alvos para atacar de uma vez.
 */
async function ATKMonstros(distanciaMaxima = 10, maxAlvos = 1) {
  while (true) {
    try {
      const mobsHostis = mob.Mobs_Hostis;
    
      // Encontrar todos os monstros e ordená-los pela distância
      const monstros = Object.values(bot.entities)
        .filter(entity => mobsHostis.includes(entity.name))
        .sort((a, b) => {
          const distanciaA = bot.entity.position.distanceTo(a.position);
          const distanciaB = bot.entity.position.distanceTo(b.position);
          return distanciaA - distanciaB;
        });

      let numAlvos = 0;
      
      for (const Mob of monstros) {
        const distancia = bot.entity.position.distanceTo(Mob.position);
        if (distancia <= distanciaMaxima) {
          
           equiparEspada();
           bot.pathfinder.setGoal(new GoalFollow(Mob, 2.5));
          
          bot.lookAt(Mob.position.offset(0, Mob.height, 0));
          bot.attack(Mob);
          
          numAlvos++;
          if (numAlvos >= maxAlvos) {
            break;
          }
        } else if (distancia > 4 && distancia <= 10) {
          await bot.waitForTicks(80);
          resetPvpMob = 1;
        }
      }

      await bot.waitForTicks(10);
    } catch (error) {
      console.error('Ocorreu um erro:', error.message);
      safeBotChat('Ocorreu um erro ao tentar interagir com os zumbis.');
      break;
    }
  }
}

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE SOBREVIVÊNCIA (COMER, DORMIR) ---
//-------------------------------------------------------------------------------\\

/**
 * Tenta encontrar e comer o primeiro item comestível do inventário.
 */
async function verificarEComer() {
  const itensComestiveis = tipos_De_comidas.itensComestiveis;
  const comida = bot.inventory.items().find(item => itensComestiveis.includes(item.name));

  if (comida) {
    console.log(`Bot encontrou ${comida.name}, tentando comer...`);
    try {
      await bot.equip(comida, 'hand');
      await bot.waitForTicks(20);
      bot.activateItem();
      console.log(`Bot comeu ${comida.name}`);
    } catch (err) {
      console.log('Erro ao equipar/comer a comida:', err);
    }
  } else {
    console.log('Nenhuma comida disponível no inventário.');
  }
}

/**
 * Lógica principal para fazer o bot dormir (versão "em teste" / melhorada).
 * Procura uma cama e tenta dormir se for noite.
 */
async function Dormir() {
  const cama = bot.findBlock({
    matching: mcData.blocksByName.white_bed.id, // TODO: Adicionar outras cores de cama
    maxDistance: 30,
  });

  if (!cama) {
    safeBotChat("Não encontrei uma cama próxima!");
    return;
  }

  safeBotChat("Indo dormir...");
  await bot.waitForTicks(20);
  bot.pathfinder.setGoal(new goals.GoalBlock(cama.position.x - 2, cama.position.y, cama.position.z - 2)); // Vai para perto da cama
  await bot.waitForTicks(20);

  // Tenta dormir apenas se estiver perto da cama E for noite
  while (velocidade <= 0 && (bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000)) {
    await tentarDormir(cama);
  }
}

/**
 * Função auxiliar para 'Dormir'. Tenta interagir com a cama.
 * @param {object} cama - O bloco da cama.
 */
async function tentarDormir(cama) {
  await bot.lookAt(cama.position, true);
  await bot.activateBlock(cama);

  try {
    await bot.sleep(cama);
    safeBotChat("Tentando dormir...");
  } catch (err) {
    safeBotChat("Não consegui dormir! " + err.message);
    return;
  }

  let tempoDormirMaximo = 5 * 1000;
  let tempoInicio = Date.now();

  // Espera até estar dormindo
  while (!bot.isSleeping && Date.now() - tempoInicio < tempoDormirMaximo) {
    await bot.waitForTicks(10);
  }

  if (!bot.isSleeping) {
    safeBotChat("Não consegui dormir a tempo, cancelando ação.");
    return;
  }

  // Espera até acordar (amanhecer)
  let tempoMaximoDormindo = 10 * 1000;
  tempoInicio = Date.now();

  while (bot.isSleeping && Date.now() - tempoInicio < tempoMaximoDormindo) {
    await bot.waitForTicks(20);
  }

  // Acorda manualmente se ainda estiver dormindo (raro)
  if (bot.isSleeping) {
    bot.wake();
    safeBotChat("Acordei!");
  }
}

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES DE CICLO DIA/NOITE E TAREFAS ---
//-------------------------------------------------------------------------------\\

/**
 * Verifica se é noite no jogo.
 * @returns {boolean} - True se for noite, false caso contrário.
 */
async function verificarSeEstaAnoitecendo() {
  const time = bot.time.timeOfDay;
  const isNight = time >= 13000 && time <= 23000; // Noite no Minecraft
  return isNight;
}

/**
 * Verifica se é dia no jogo.
 * @returns {boolean} - True se for dia, false caso contrário.
 */
async function verificarSeEstaDeDia() {
  const time = bot.time.timeOfDay;
  const isDay = time < 13000 || time > 23000; // Dia no Minecraft
  return isDay;
}

/**
 * Monitora o tempo do jogo para dormir e retomar tarefas.
 */
async function monitorarTempo() {
  setInterval(async () => {
    const isNight = await verificarSeEstaAnoitecendo();

    // Lógica para dormir
    if (isNight) {
      safeBotChat("Está ficando de noite, vou tentar dormir.");
      if (atividadeAtual) {
        safeBotChat(`Interrompendo a atividade atual: ${atividadeAtual}`);
        await bot.waitForTicks(40);
        
        if (atividadeAtual === 'minerar') {
          // A função 'parar' já envia msg e limpa 'atividadeAtual'
          bot.emit('chat', bot.username, 'parar'); 
        } else if (atividadeAtual === 'seguir') {
          pararDeSeguir();
          atividadeAtual = null;
        }
        // Adicione outras atividades que precisam ser interrompidas aqui
      }
      await bot.waitForTicks(40);
      await Dormir();
    }

    // Lógica para retomar tarefas
    const isDay = await verificarSeEstaDeDia();
    console.log('isDay:', isDay, ", comandoCopiado:", comandoCopiado, ", atividadeAtual:", atividadeAtual);
    
    // Se for dia, E tiver um comando copiado, E não estiver fazendo nada
    if (isDay && comandoCopiado !== null && comandoCopiado !== '' && atividadeAtual === null) {
      safeBotChat(`Retomando comando: ${comandoCopiado}`);
      // Emite o comando no chat como se o bot mesmo tivesse digitado
      // O ouvinte de chat principal irá pegá-lo
      bot.emit('chat', bot.username, comandoCopiado); 
      // Não limpa o comando copiado aqui, deixa o próprio comando limpar (como 'parar' faz)
    }
  }, 30 * 1000); // Verifica a cada 30 segundos (reduzido de 4 min para testes)
}

// Inicia o monitoramento do tempo
monitorarTempo();

//-------------------------------------------------------------------------------\\
// --- FUNÇÕES UTILITÁRIAS E GERAIS ---
//-------------------------------------------------------------------------------\\

/**
 * Monitora a velocidade do bot, atualizando a variável global 'velocidade'.
 */
function monitorarVelocidade() {
  let ultimaPosicao = bot.entity.position.clone();

  setInterval(() => {
    let posicaoAtual = bot.entity.position.clone();
    velocidade = ultimaPosicao.distanceTo(posicaoAtual); // Distância percorrida no último segundo
    ultimaPosicao = posicaoAtual;
  }, 1000); // Atualiza a cada 1 segundo
}



// Monitorar quando o jogador monta em um barco
bot.on('entityMoved', (entity) => {
  if (entity.username && entity.vehicle) {
    // Se algum jogador montou em um veículo
    const vehicleType = entity.vehicle.name;
    
    if (vehicleType === 'oak_boat' || vehicleType === 'chest_boat') {
      // Procurar outro barco próximo para o bot
      const barcoProximo = bot.nearestEntity(e => {
        return (e.name === 'boat' || e.name === 'chest_boat') && 
               e.id !== entity.vehicle.id && // Não é o barco do jogador
               bot.entity.position.distanceTo(e.position) < 5;
      });
      
      if (barcoProximo && !bot.vehicle) {
        bot.mount(barcoProximo);
        console.log('Montei no barco para acompanhar!');
      }
    }
  }
});




/**
 * Tenta se reconectar ao servidor (atualmente não usada).
 */
const reconnect = async () => {
  console.log('Tentando reconectar...');
  try {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Espere 5 segundos
    await bot.end();
    await mineflayer.createBot(botConfig);
    console.log('Reconectado!');
  } catch (error) {
    console.error('Erro ao reconectar:', error);
  }
};