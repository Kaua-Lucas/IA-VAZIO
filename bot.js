const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;
const mcData = require('minecraft-data')
const { Vec3 } = require('vec3');

//-------------------------------------------------------------------------------\\

//Importações criadas por mim
//Onde nela tera lista de diversos itens,comidas,blocos, mobs e ate ferramentas

const mob = require('./mobs/mobs.js');
const espadas = require('./Equipamentos/ferramentas.js')
const Ferramentas = require('./Equipamentos/ferramentas.js')
const tipos_De_Blocos = require('./blocosEComida/tipoDeBlocos.js')
const tipos_De_comidas = require('./blocosEComida/comestivel.js')
var resetPvpMob = 0

//-------------------------------------------------------------------------------\\


// Objeto de configuração
const botConfig = {
  username: 'IA-Vazio',

  // servidores
  //host: 'krebinkkj.aternos.me',
  //port: '17968',
  //version: '1.20.4',

  //local
  host: 'localhost',
  port: '30000',
  version: '1.20.4',


  hideErrors: false, // Mantenha como false para exibir erros durante o desenvolvimento
  
};//o nick da skin do vazio é: 6628
const bot = mineflayer.createBot(botConfig);  
module.exports = { bot }

// Carrega o plugin pathfinder para seguir o jogador
bot.loadPlugin(pathfinder);


let andando = false;






bot.on('login', () => {
  console.log('Bot logado com sucesso!');
  const botSocket = bot._client.socket;
  console.log(`logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
  
});

bot.on('end', () => {
  console.log(bot.username + " saiu do servidor");
  // reconnect(); // Chame a função reconectar imediatamente
});

bot.on('spawn', async () => {
monitorarVelocidade()
console.log("Nasceu",Object.keys(bot.players))

if (blocksToMine.length > 0) {
  bot.chat('Fui desconectado, mas estou retomando a mineração!');
  mineNextBlock(bot);
}


})
bot.on('death', () => {
  bot.chat('Morri! Tentando reconectar e continuar mineração...');
  mining = false;
});






bot.on("chat", async (username, message) => {
  if (!message.startsWith("!drop")) return; // Ignora mensagens sem o comando "!drop"

  const args = message.split(" ");

  if (args.length < 4) {
      bot.chat("Uso correto: !drop <x> <y> <z> [item]");
      return;
  }

  const x = parseInt(args[1]);
  const y = parseInt(args[2]);
  const z = parseInt(args[3]);

  if (isNaN(x) || isNaN(y) || isNaN(z)) {
      bot.chat("Coordenadas inválidas! Use números.");
      return;
  }

  const itemNome = args.length > 4 ? args[4] : "todos"; // Se não especificar item, dropa tudo

  await dropItens(x, y, z, itemNome);
});

async function dropItens(x, y, z, itemNome = "todos") {
  bot.chat(`Indo para as coordenadas (${x}, ${y}, ${z}) para dropar itens...`);

  bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));

  await bot.waitForTicks(40);

  const inventario = bot.inventory.items();

  if (inventario.length === 0) {
      bot.chat("Não tenho itens para dropar!");
      return;
  }

  bot.chat(`Dropando ${itemNome === "todos" ? "todos os itens" : itemNome}...`);

  for (let item of inventario) {
      if (itemNome === "todos" || item.name === itemNome) {
          await bot.tossStack(item);
          await bot.waitForTicks(10);
      }
  }

  bot.chat("Itens dropados!");
}













bot.on('chat', async (username, message) => {
  
 
// Supondo que o comando recebido esteja em uma variável chamada 'mensagem'
let msg = message;

// Usando uma expressão regular para remover tudo até (e incluindo) o primeiro `] `
message = msg.replace(/.*\] /, '');

// Agora 'mensagem' conterá apenas "me siga"
console.log(message); // Saída: "me siga"
  
  

  
 
  

  if (username == bot.username){
    
    return;
  }  // Ignora as próprias mensagens do bot
  if(message === "onde está o bot"){
    
        
        const { x, y, z } = bot.entity.position;
        bot.chat(`A posição do jogador ${bot.username} é: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}`);
  }
  
  const player = bot.players[username]?.entity;

  //essa parte faz com que ele minere uma certa coodernada
  const args = message.split(' ');
        
  if (args[0] === 'minerar') {
      if (args.length < 7) {
          bot.chat('Uso: minerar x1 y1 z1 x2 y2 z2');
          return;
      }
      
      const x1 = parseInt(args[1]);
      const y1 = parseInt(args[2]);
      const z1 = parseInt(args[3]);
      const x2 = parseInt(args[4]);
      const y2 = parseInt(args[5]);
      const z2 = parseInt(args[6]);
      
      startMining(bot, new Vec3(x1, y1, z1), new Vec3(x2, y2, z2));
  }
  
  if (message === 'parar') {
      stopMining(bot);
  }
  
  if (player) {
    const distancia = bot.entity.position.distanceTo(player.position); // Calcula a distância entre o bot e o jogador
    
    if (distancia <= 35) { // Verifica se a distância é de 10 blocos ou menos
      
        

      //codigo para fazer com que o bot siga o player
      if (player) {
        if (message === 'me siga') {
          seguirJogador(player);
        } else if (message === 'pare de me seguir') {
          pararDeSeguir();
        }
      }
      if(message=="terra"){
        pegarTerra()
      }
      if(message=="graveto"){
        fazerStick()
      }
      if(message == "tabua"){
        fazerMadeira()
      }
      if(message== "craft"){
        fazerCraftingTable()
      }
      if(message=="coloque"){
        colocarCraftingTable()
      }
      if(message=="madeira"){
        pegarMadeira()
      }
      if(message == "suba"){
        voltarParaSuperfice()
      }
      if(message == "minerar"){
        minerarStone()
      }
      if(message == "procure"){
        ProcurarCraftingTable()
      }
      if(message =="ataque"){
        ATKMonstros()
      }
      if (message === "criar picareta") {
       craftPickaxe();

      }
      if(message === "machado"){
        craftAxe()
      }
      if(message === "explore"){
        explorarBiomas()
      }
      if(message === "durma"){
        Dormir()
      }
    }
  
  }


});








let mining = false;
let blocksToMine = [];
let blocksBroken = []; // Lista para armazenar blocos quebrados

async function startMining(bot, posA, posB) {
  if (mining) {
    bot.chat('Já estou minerando!');
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

// Modifica a função mineNextBlock para parar o intervalo quando a mineração terminar
async function mineNextBlock(bot, atualizarIntervalo) {
  if (!mining || blocksToMine.length === 0) {
    if (mining) {
      bot.chat('Mineração concluída!');
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

// Atualiza a lista de blocos a serem minerados
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

// Verifica se todos os blocos foram quebrados
async function verificarBlocosQuebrados(bot) {
  // Verifica se a lista de blocos quebrados está vazia ou se ainda existem blocos a serem minerados
  if (blocksToMine.length === 0 && blocksBroken.length > 0) {
    console.log("Todos os blocos foram minerados com sucesso.");
    console.log("Blocos quebrados:", blocksBroken.length);
  } else {
    console.log("Ainda existem blocos a serem minerados ou algum bloco não foi quebrado.");
  }
}

function stopMining(bot) {
  if (!mining) {
      bot.chat('Não estou minerando no momento!');
      return;
  }
  
  mining = false;
  blocksToMine = [];
  bot.chat('Mineração interrompida!');
}


async function Dormir() {
  const mcData = require('minecraft-data')(bot.version);
  const cama = bot.findBlock({
      matching: mcData.blocksByName.white_bed.id,
      maxDistance: 30,
  });

  if (!cama) {
      bot.chat("Não encontrei uma cama próxima!");
      return;
  }

  bot.chat("Indo dormir...");
  bot.pathfinder.setGoal(new goals.GoalBlock(cama.position.x - 1, cama.position.y, cama.position.z));

  await bot.waitForTicks(20); // Espera um pouco antes de interagir

  while(velocidade<=0){
      // Olhar para a cama
    await bot.lookAt(cama.position, true);

    // Interagir com a cama
    await bot.activateBlock(cama);

    try {
        await bot.sleep(cama);
        bot.chat("Tentando dormir...");
    } catch (err) {
        bot.chat("Não consegui dormir! " + err.message);
        return;
    }

    // Tempo máximo para dormir: 5 segundos
    let tempoDormirMaximo = 5 * 1000;
    let tempoInicio = Date.now();

    while (!bot.isSleeping && Date.now() - tempoInicio < tempoDormirMaximo) {
        await bot.waitForTicks(10);
    }

    // Se não conseguiu dormir, cancela a ação
    if (!bot.isSleeping) {
        bot.chat("Não consegui dormir a tempo, cancelando ação.");
        return;
    }

    // Se dormiu, espera até amanhecer ou 10 segundos
    let tempoMaximoDormindo = 10 * 1000;
    tempoInicio = Date.now();

    while (bot.isSleeping && Date.now() - tempoInicio < tempoMaximoDormindo) {
        await bot.waitForTicks(10);
    }

    // Se ainda estiver dormindo, acorda
    if (bot.isSleeping) {
        bot.wake();
        bot.chat("Acordei!");
    }
  }
  
}





let velocidade = 0; // Variável global para armazenar a velocidade do bot

function monitorarVelocidade() {
    let ultimaPosicao = bot.entity.position.clone(); // Salva a posição inicial

    setInterval(() => {
        let posicaoAtual = bot.entity.position.clone();
        velocidade = ultimaPosicao.distanceTo(posicaoAtual); // Calcula a velocidade

        // Atualiza a última posição
        ultimaPosicao = posicaoAtual;
    }, 1000); // Atualiza a cada 1 segundo
}



// Listener para mudanças na saúde e fome do bot
bot.on('health', async  () => {
  
  console.log(`Vida: ${bot.health}/20, Fome: ${bot.food}/20`);
 

  if (bot.food <= 17 && bot.health < 20) {
    console.log('O bot está com fome e precisa comer!');
    verificarEComer();
    

  }else if(bot.food < 10){

    while(bot.food != 20){
      await bot.waitForTicks(120)
      await verificarEComer();
      if(bot.food == 20 ){
        break
      }
    }
    
  }
  await bot.waitForTicks(40)
 
 

    
    
    
    
    
    

  

  
});
//
// if(resetPvpMob == 1){
//  setTimeout( ()=>  Monstros(10,1), 10000)
//   resetPvpMob = 0
//   console.log(resetPvpMob)
// }
// Evento disparado quando uma entidade toma dano

// Função para o bot verificar e comer se tiver comida no inventário
const itensComestiveis = tipos_De_comidas.itensComestiveis

async function verificarEComer() {
  const comida = bot.inventory.items().find(item => itensComestiveis.includes(item.name));

  if (comida) {
    console.log(`Bot encontrou ${comida.name}, tentando comer...`);

    bot.equip(comida, 'hand', (err) => {
      if (err) {
        console.log('Erro ao equipar a comida:', err);
        return;
      }
    });
    await bot.waitForTicks(20)
    bot.activateItem(); // Usa o item na mão para comer
    console.log(`Bot comeu ${comida.name}`);
  } else {
    console.log('Nenhuma comida disponível no inventário.');
  }
}



// Função para fazer o bot seguir o jogador
async function seguirJogador(player) {
  andando = true;
  bot.chat('Estou seguindo você!');
  

  while (andando) {
    await bot.waitForTicks(60);
    bot.pathfinder.setGoal(new GoalFollow(player, 1));
    olharParaPlayer(player);
  }
}



// Função para o bot parar de seguir o jogador
function pararDeSeguir() {
  bot.pathfinder.setGoal(null);
  bot.chat('Parei de seguir você.');
  andando = false;
}



// Função para contar blocos de stone no inventário
function contarBlocosDeStone() {
  let totalStone = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === 'cobblestone') {
      totalStone += item.count;
    }
  }
  return totalStone;
}



// Função para minerar stone até ter 3 packs (192 blocos)
async function minerarStone() {
  const mcData = require('minecraft-data')(bot.version);
  
  while (contarBlocosDeStone() < 192) {
    // Verificar se o bot está segurando uma picareta
    
    

    const stoneBlock = bot.findBlock({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 64,
    });

    if (stoneBlock) {
      
        bot.pathfinder.setGoal(new goals.GoalBlock(stoneBlock.position.x, stoneBlock.position.y, stoneBlock.position.z), 0);

        console.log("minerei:" , contarBlocosDeStone())

        //bot.pathfinder.setGoal(new GoalFollow(player, 1));

        
          // await bot.waitForTicks(120);
          // bot.dig(stoneBlock, { breakLevel: 1 });
        
      
    }else{
      bot.chat("Nenhuma Stone perto de mim")
      break
    }

    await bot.waitForTicks(60);
  }
  if(contarBlocosDeStone() >= 192){
    bot.chat("ja tenho 3 packs no meu inventario, não preciso minerar");
    console.log("voltando pra superfice apos ter minerado...")
    await voltarParaSuperfice()
    console.log("voltei pra superfice") 
  }
  

}



// implementa e faz com que o bot volte para a superfice    
async function voltarParaSuperfice() {
  const mcData = require('minecraft-data')(bot.version);

  const grass = bot.findBlock({
    matching: mcData.blocksByName.short_grass.id, //depois ver se dar pra entrgar outros blocos aqui usando||
    maxDistance: 40000 
  });

  if (grass) {
    
      bot.pathfinder.setGoal(new goals.GoalBlock(grass.position.x, grass.position.y, grass.position.z));
      

      
      
    
  }else{
    bot.chat("não consigo voltar pra superfice")
  }
}



function contarBlocosDeMadeira() {
  let totalMadeira = 0;
  for (const item of bot.inventory.items()) {
    if (item.name === 'oak_log') {
      totalMadeira += item.count;
    }
  }
  return totalMadeira;
}



async function pegarMadeira() {
  const mcData = require('minecraft-data')(bot.version);

  while (contarBlocosDeMadeira() < 20) {
    // Encontre um bloco de madeira próximo para o bot pegar
    const madeira = bot.findBlock({
      matching: mcData.blocksByName.oak_log.id,
      maxDistance: 100, // Reduza o alcance para não buscar tão longe
    });

    if (madeira) {
      // Define a meta do bot como o bloco de madeira encontrado
      bot.pathfinder.setGoal(new goals.GoalBlock(madeira.position.x, madeira.position.y, madeira.position.z));

      // Aguarde até o bot chegar ao bloco e quebrá-lo
      await bot.waitForTicks(120)

      console.log("Troncos:", contarBlocosDeMadeira());
    } else {
      bot.chat("Não consegui encontrar madeira");
      break; // Sai do loop se não encontrar mais madeira
    }

    // Aguarda para evitar um loop muito rápido
    await bot.waitForTicks(20);
  }

  bot.chat("Agora tenho 20 troncos de madeira!");
}



// Função para o bot olhar para o jogador
function olharParaPlayer(player) {
  const posicaoPlayer = player.position.offset(0, player.height, 0); // Posição com ajuste de altura do jogador
  bot.lookAt(posicaoPlayer, true); // O 'true' faz o bot olhar suavemente

}

// implementa e faz ele procurar uma crafttable
async function ProcurarCraftingTable() {
  const mcData = require('minecraft-data')(bot.version);

  const CraftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id, //depois ver se dar pra entrgar outros blocos aqui usando||
    maxDistance: 100
  });
  await bot.waitForTicks(60)
  
  if (CraftingTable) {
    
    bot.pathfinder.setGoal(new goals.GoalBlock(CraftingTable.position.x -1, CraftingTable.position.y, CraftingTable.position.z))
    await bot.waitForTicks(60)
    bot.look(-1.5,-0.5,0)
    // bot.activateBlock() //pesquisar depois como usar esse codigo
  }else{
    bot.chat("Não encontrei uma crafting table")
  }
}


//faz uma picareta de madeira
async function craftPickaxe() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas
  const mcData = require('minecraft-data')(bot.version);

  await ProcurarCraftingTable()
  let totalDeStick = 0 
  let totalDeMadeira = 0 

  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    contadorDeLista = 0
    while(contadorDeLista != tiposDeTabuas.length){
      if(item.name === tiposDeTabuas[contadorDeLista]){
        
        totalDeMadeira += item.count;
      }
      contadorDeLista ++
    }
    
  }
  

  if(totalDeStick < 2 && totalDeMadeira < 3){
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return
  }
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6  // Ajuste a distância conforme necessário
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto. Coloque uma mesa de trabalho próxima ao bot.");
    return; // Sai da função se não houver uma mesa de trabalho
  }
  await bot.waitForTicks(20)
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

//faz uma Machado de madeira
async function craftAxe() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas
  const mcData = require('minecraft-data')(bot.version);

  await ProcurarCraftingTable()
  let totalDeStick = 0 
  let totalDeMadeira = 0 

  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    contadorDeLista = 0
    while(contadorDeLista != tiposDeTabuas.length){
      if(item.name === tiposDeTabuas[contadorDeLista]){
        
        totalDeMadeira += item.count;
      }
      contadorDeLista ++
    }
    
  }
  

  if(totalDeStick < 2 && totalDeMadeira < 3){
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return
  }
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6  // Ajuste a distância conforme necessário
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto. Coloque uma mesa de trabalho próxima ao bot.");
    return; // Sai da função se não houver uma mesa de trabalho
  }
  await bot.waitForTicks(20)
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
//faz uma espada de madeira
async function craftSword() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas
  const mcData = require('minecraft-data')(bot.version);

  await ProcurarCraftingTable()
  let totalDeStick = 0 
  let totalDeMadeira = 0 

  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    contadorDeLista = 0
    while(contadorDeLista != tiposDeTabuas.length){
      if(item.name === tiposDeTabuas[contadorDeLista]){
        
        totalDeMadeira += item.count;
      }
      contadorDeLista ++
    }
    
  }
  

  if(totalDeStick < 2 && totalDeMadeira < 2){
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return
  }
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6  // Ajuste a distância conforme necessário
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto. Coloque uma mesa de trabalho próxima ao bot.");
    return; // Sai da função se não houver uma mesa de trabalho
  }
  await bot.waitForTicks(20)
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
//faz uma pá de madeira
async function craftShovel() {
  const tiposDeTabuas = tipos_De_Blocos.tiposDeTabuas
  const mcData = require('minecraft-data')(bot.version);

  await ProcurarCraftingTable()
  let totalDeStick = 0 
  let totalDeMadeira = 0 

  for (const item of bot.inventory.items()) {
    if (item.name === 'stick') {
      totalDeStick += item.count;
    }
    contadorDeLista = 0
    while(contadorDeLista != tiposDeTabuas.length){
      if(item.name === tiposDeTabuas[contadorDeLista]){
        
        totalDeMadeira += item.count;
      }
      contadorDeLista ++
    }
    
  }
  

  if(totalDeStick < 2 && totalDeMadeira < 1){
    console.log(`Não tenho madeira e Stick suficiente, so tenho ${totalDeStick} Sticks e tenho ${totalDeMadeira} madeiras`);
    return
  }
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 6  // Ajuste a distância conforme necessário
  });

  if (!craftingTable) {
    console.log("Erro: Mesa de trabalho não encontrada por perto. Coloque uma mesa de trabalho próxima ao bot.");
    return; // Sai da função se não houver uma mesa de trabalho
  }
  await bot.waitForTicks(20)
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


function contarBlocosDeTerra() {
  let totalTerra = 0;
  for (const item of bot.inventory.items()) {
    if (item.name ==='dirt') {
      totalTerra += item.count;
    }
  }
  return totalTerra;
}



async function pegarTerra() {
  const mcData = require('minecraft-data')(bot.version);

  while (contarBlocosDeTerra() < 64) {
    // Encontre um bloco de madeira próximo para o bot pegar
    const Terra = bot.findBlock({
      matching: mcData.blocksByName.grass_block.id,
      maxDistance: 10000, // Reduza o alcance para não buscar tão longe
    });

    if (Terra) {
      // Define a meta do bot como o bloco de madeira encontrado
      bot.pathfinder.setGoal(new goals.GoalBlock(Terra.position.x, Terra.position.y, Terra.position.z));

      // Aguarde até o bot chegar ao bloco e quebrá-lo
      await bot.waitForTicks(120)

      console.log("Terra:", contarBlocosDeTerra());
    } else {
      bot.chat("Não consegui encontrar Terra");
      break; // Sai do loop se não encontrar mais Terra
    }

    // Aguarda para evitar um loop muito rápido
    await bot.waitForTicks(20);
  }

  bot.chat("Agora tenho 64 blocos de Terra!");
  voltarParaSuperfice()
}


//função de se reconectar
const reconnect = async () => {
  console.log('Tentando reconectar...');
  try {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Espere 5 segundos
    await bot.end(); // Encerre explicitamente a instância atual do bot
    await mineflayer.createBot(botConfig); // Crie uma nova instância do bot
    console.log('Reconectado!');
  } catch (error) {
    console.error('Erro ao reconectar:', error);
  }
};

async function fazerStick() {
  // Verifique se o bot tem madeira suficiente (4 blocos de madeira)
  const tabuas = bot.inventory.items().find(item => item.name.includes('planks'));
  if (!tabuas || tabuas.count < 2) {
    bot.chat("Não tenho tabuas suficiente para fazer um Stick.");
    return;
  }

  // Obtenha os dados da crafting table do Minecraft
  const mcDataVersion = mcData(bot.version);
  const tabua = bot.recipesFor(mcDataVersion.itemsByName.stick.id, null, 1,bot.inventory);

  // Verifique se há uma receita para a crafting table
  if (tabua.length === 0) {
    bot.chat("Não encontrei a receita para o Stick.");
    return;
  }
  //teste
  // Crafta a mesa de trabalho
  try {
    await bot.craft(tabua[0], 1, null);
    bot.chat("Stick criada com sucesso!");
  } catch (err) {
    bot.chat("Erro ao criar o stick.");
    console.error(err);
    return;
  }

 
}

async function fazerMadeira() {
  // Verifique se o bot tem madeira suficiente (4 blocos de madeira)
  const troncoss = bot.inventory.items().find(item => item.name.includes('log'));
  if (!troncoss || troncoss.count < 1) {
    bot.chat("Não tenho troncos suficientes para fazer madeira.");
    return;
  }

  // Obtenha os dados da crafting table do Minecraft
  const mcDataVersion = mcData(bot.version);
        const tabua = bot.recipesFor(mcDataVersion.itemsByName.oak_planks.id, null, 1,bot.inventory);
  //Depois fazer uma variavelconfig  \-------------------------------------/ que se encaixe aqui e seja funcional, so que na function madeira e tronco
  // Verifique se há uma receita para a crafting table
  if (tabua.length === 0) {
    bot.chat("Não encontrei a receita para madeira.");
    return;
  }
  //teste
  // Crafta a mesa de trabalho
  try {
    await bot.craft(tabua[0], 1, null);
    bot.chat("Madeira criada com sucesso!");
  } catch (err) {
    bot.chat("Erro ao criar o Madeira.");
    console.error(err);
    return;
  }

 
}

async function fazerCraftingTable() {
  // Verifique se o bot tem madeira suficiente (4 blocos de madeira)
  const madeira = bot.inventory.items().find(item => item.name.includes('planks'));
  if (!madeira || madeira.count < 4) {
    bot.chat("Não tenho madeira suficiente para fazer uma mesa de trabalho.");
    return;
  }

  // Obtenha os dados da crafting table do Minecraft
  const mcDataVersion = mcData(bot.version);
  const craftingTableRecipe = bot.recipesFor(mcDataVersion.itemsByName.crafting_table.id, null, 1, bot.inventory);

  // Verifique se há uma receita para a crafting table
  if (craftingTableRecipe.length === 0) {
    bot.chat("Não encontrei a receita para a mesa de trabalho.");
    return;
  }

  // Crafta a mesa de trabalho
  try {
    await bot.craft(craftingTableRecipe[0], 1, null);
    bot.chat("Mesa de trabalho criada com sucesso!");
  } catch (err) {
    bot.chat("Erro ao criar a mesa de trabalho.");
    console.error(err);
    return;
  }

  // Coloque a mesa de trabalho no chão
  colocarCraftingTable();
}



async function equiparFerramentaCerta(bloco) {

  const Ferramentas = require('./Equipamentos/ferramentas.js')

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

async function colocarCraftingTable() {
  // Verifique se o bot tem uma mesa de trabalho no inventário
  

  // await andarPraFrenteERetornar()
  
  const mesaTrabalho = bot.inventory.items().find(item => item.name === 'crafting_table');
  const block = bot.blockAt(bot.entity.position.offset(1, 0, 0));
  
  if (mesaTrabalho) {
    try {

      

      await equiparFerramentaCerta(block)
      // Encontre um bloco ao lado para colocar a mesa de trabalho
      const blocoAlvo = bot.blockAt(bot.entity.position.offset(1, -1, 0)); // bloco ao lado do bot
      await bot.dig(block)
      await bot.waitForTicks(60)
      bot.equip(mesaTrabalho, 'hand');
      if (blocoAlvo) {
        await bot.placeBlock(blocoAlvo, { x: 0, y: 1, z: 0 });
        bot.chat("Mesa de trabalho colocada no chão!");

      } else {
        bot.chat("Não há espaço adequado para colocar a mesa de trabalho.");
        
        
      }
      
    } catch (err) {
      
      bot.chat("Erro ao colocar a mesa de trabalho no chão.");
      console.error(err);
    }



  } else {
    bot.chat("Não encontrei a mesa de trabalho no inventário.");
  }
}
 
async function equiparEspada() {
  // Lista de espadas em ordem de prioridade (mais forte para mais fraca)
  const swords = espadas.swords
  
  // Procurar a espada mais forte no inventário
  const espada = bot.inventory.items().find(item => swords.includes(item.name));
  
  // Se uma espada foi encontrada, tentar equipá-la
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




//aqui faz com que ele ataque qualquer monstro dentro da lisa fornecida
async function ATKMonstros(distanciaMaxima = 10,  maxAlvos = 1) {//distancia passiva: 4 / agressiva é 10
  
  while (true) {
    try {
      const mobs = mob.Mobs_Hostis
    
      // Encontrar todos os monstros e ordená-los pela distância
      const monstros = Object.values(bot.entities)
        .filter(entity => mobs.includes(entity.name) )
        .sort((a, b) => {
          const distanciaA = bot.entity.position.distanceTo(a.position);
          const distanciaB = bot.entity.position.distanceTo(b.position);
          return distanciaA - distanciaB;
        })

      // Atacar os monstros mais próximos (até o limite de maxAlvos)
      let numAlvos = 0;
      
      for (const Mob of monstros) {
        const distancia = bot.entity.position.distanceTo(Mob.position);
        if (distancia <= distanciaMaxima) {
          
           equiparEspada() 
           bot.pathfinder.setGoal(new GoalFollow(Mob, 2.5))
          
          
          
          bot.lookAt(Mob.position.offset(0, Mob.height, 0));
          bot.attack(Mob);
          
          numAlvos++;
          if (numAlvos >= maxAlvos) {

            break;
          }
        }else if(distancia>4&&distancia<=10){
          await bot.waitForTicks(80)
          resetPvpMob = 1
        }

      }

      // Aguardar um tempo antes de procurar novos zumbis
      await bot.waitForTicks(10);
    } catch (error) {
      console.error('Ocorreu um erro:', error.message);
      bot.chat('Ocorreu um erro ao tentar interagir com os zumbis.');
      break;
    }
  }
}



// Função para explorar diferentes biomas
function explorarBiomas() {
  bot.chat("okay")
  setInterval(() => {
    

    // Mover em uma direção aleatória
    moverParaDirecaoAleatoria();
  }, 240000); // Explora a cada 4min 
}

// Função para mover o bot em uma direção aleatória
function moverParaDirecaoAleatoria() {
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  // Gera uma coordenada aleatória
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



bot.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log(`Falha ao conectar a ${err.address}:${err.port}`);
  } else {
    console.log(`Erro não tratado: ${err}`);
  }
});













//comandos em fase de teste

let atividadeAtual = null; // Variável para armazenar a atividade atual do bot

async function Dormir() {
  const mcData = require('minecraft-data')(bot.version);
  const cama = bot.findBlock({
    matching: mcData.blocksByName.white_bed.id,
    maxDistance: 30,
  });

  if (!cama) {
    bot.chat("Não encontrei uma cama próxima!");
    return;
  }

  bot.chat("Indo dormir...");
  await bot.waitForTicks(20); // Espera um pouco antes de interagir 
  bot.pathfinder.setGoal(new goals.GoalBlock(cama.position.x - 2, cama.position.y, cama.position.z - 2));

  await bot.waitForTicks(20); // Espera um pouco antes de interagir

  while (velocidade <= 0 && (bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000)) {
    await tentarDormir(cama);
  }
}

async function tentarDormir(cama) {
  await bot.lookAt(cama.position, true);
  await bot.activateBlock(cama);

  try {
    await bot.sleep(cama);
    bot.chat("Tentando dormir...");
  } catch (err) {

    bot.chat("Não consegui dormir! " + err.message);
    // reconnect(); // Reconecta o bot se não conseguir dormir 
    return;
  }

  let tempoDormirMaximo = 5 * 1000;
  let tempoInicio = Date.now();

  while (!bot.isSleeping && Date.now() - tempoInicio < tempoDormirMaximo) {
    await bot.waitForTicks(10);
  }

  if (!bot.isSleeping) {
    bot.chat("Não consegui dormir a tempo, cancelando ação.");
    return;
  }

  let tempoMaximoDormindo = 10 * 1000;
  tempoInicio = Date.now();

  while (bot.isSleeping && Date.now() - tempoInicio < tempoMaximoDormindo) {
    await bot.waitForTicks(20);
  }

  if (bot.isSleeping ) {
    bot.wake();
    bot.chat("Acordei!");
  }


  
}


async function verificarSeEstaAnoitecendo() {
  const time = bot.time.timeOfDay;
  const isNight = time >= 13000 && time <= 23000; // Verifica se está entre 13000 e 23000 ticks (noite no Minecraft)

  if (isNight) {
    bot.chat("Está ficando de noite, vou tentar dormir.");
    if (atividadeAtual) {
      bot.chat(`Interrompendo a atividade atual: ${atividadeAtual}`);
      await bot.waitForTicks(40); // Aguarda um pouco antes de interromper  
      if (atividadeAtual === 'minerar') {
        bot.chat("parar");
        await bot.waitForTicks(60); // Aguarda um pouco antes de parar
        atividadeAtual = null;
      } else if (atividadeAtual === 'seguir') {
        pararDeSeguir();
      }
      // Adicione outras atividades que precisam ser interrompidas aqui
    }
    await bot.waitForTicks(40); // Aguarda um pouco antes de dormir 
    await Dormir();
    if (atividadeAtual) {
      bot.chat(`Retomando a atividade: ${atividadeAtual}`);
      if (atividadeAtual === 'minerar') {
        startMining(bot, posA, posB); // Certifique-se de que posA e posB estejam definidas corretamente
      } else if (atividadeAtual === 'seguir') {
        seguirJogador(player); // Certifique-se de que player esteja definido corretamente
      }
      // Adicione outras atividades que precisam ser retomadas aqui
    }
  }
  
}





//fazer com que ele quando acordar verique se estava minerando antes de dormir e se estava, ele volta a minerar dizendo 'minerar' no chat atribuindo a atividade atual como minerar e fazer co que ele volte a minerar novamente isso serve tbm pra o copiado




async function verificarSeEstaDeDia() {
  const time = bot.time.timeOfDay;
  const isDay = time < 13000 || time > 23000; // Verifica se está fora do intervalo de noite no Minecraft
  return isDay;
}

function monitorarTempo() {
  setInterval(async () => {
    await verificarSeEstaAnoitecendo();

    const isDay = await verificarSeEstaDeDia();
    console.log('isDay:', isDay, ", comandoCopiado:", comandoCopiado  , ", atividadeAtual:", atividadeAtual);
    if (isDay && comandoCopiado !== null && comandoCopiado !== '' && (atividadeAtual == null || atividadeAtual !== null)) {//problema aqui na atividade atual
      bot.chat(comandoCopiado);
    }
  }, 0.30 * 60 * 1000); // 4 minutos em milissegundos
}
// Chama a função para começar a monitorar o tempo
monitorarTempo();

async function equiparArmadura() {
  const tiposDeArmadura = ['helmet', 'chestplate', 'leggings', 'boots'];
  const mcData = require('minecraft-data')(bot.version);

  for (const tipo of tiposDeArmadura) {
    const armadura = bot.inventory.items().find(item => item.name.includes(tipo));
    if (armadura) {
      try {
        await bot.equip(armadura, tipo);
        bot.chat(`Equipada: ${armadura.name}`);
      } catch (error) {
        bot.chat(`Erro ao equipar ${tipo}: ${error.message}`);
      }
    }
  }
}

bot.on('chat', async (username, message) => {
  if (username === bot.username) return; // Ignora as próprias mensagens do bot

  const args = message.split(' ');

  if (message === '!help') {
    const helpMessage = `
      Comandos disponíveis:
      - minerar x1 y1 z1 x2 y2 z2: Inicia a mineração entre as coordenadas especificadas.
      - parar: Interrompe a mineração.
      - me siga: Faz o bot seguir o jogador.
      - pare de me seguir: Faz o bot parar de seguir o jogador.
      - durma: Faz o bot dormir se for noite.
      - equipar armadura: Equipa a armadura do inventário.
      - explore: Faz o bot explorar biomas.
    `;
    bot.chat(username, helpMessage);
  }

  if (args[0] === 'minerar') {
    atividadeAtual = 'minerar';
  }

  if (message === 'parar') {
    
    await bot.waitForTicks(40);
    stopMining(bot);
  }

  if (message === 'equipar armadura') {
    await equiparArmadura();
  }
});

//copiador de comando de chat
//ele simplesmente ira copiar o comando que o jogador digitar e ira colar no chat do bot pra fazer um loop apos acordar ja que todos os comando foram limpados ao dormir


let comandoCopiado = null; // Variável para armazenar o comando copiado
bot.on('chat', (username, message) => {
  if (message.startsWith('!copia:')) {
    comandoCopiado = message.replace('!copia:', '').trim();
    bot.chat('Comando copiado');
  }

  if( message === 'me siga' || message === 'pare de me seguir' || message === 'Mineração concluída!' || message === 'equipar armadura' || message === 'explorar'){
    comandoCopiado = null; // Limpa o comando copiado após a execução
   
   
  }
});
