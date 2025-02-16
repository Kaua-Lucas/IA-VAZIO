const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
    host: 'krebinkkj.aternos.me', // Endereço de ip do servidor
    port: 17968, // Porta do servidor 
    username: 'IA-VAZIO',// Nickname do bot
<<<<<<< HEAD
    version: false // Versão do Minecraft (1.20/1.19). O padrão é 'false' (auto-detectar)
=======
    version: false // Versão do Minecraft (Ex: 1.20/1.19). O padrão é 'false' (auto-detectar)
>>>>>>> 770d811 (fix: fazendo rework do bot)
})

bot.on('spawn', () => {
    console.log('Bot conectado!')
})

bot.on('error', err => console.log('Erro: ' + err))
bot.on('end', () => console.log('Bot desconectado'))