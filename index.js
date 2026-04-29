import "dotenv/config";
import express from "express";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

// 🌐 KEEP ALIVE
const app = express();
app.get("/", (_, res) => res.send("Bot online 🔥"));
app.listen(3000);

// 🔐 CONFIG
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const CHANNEL_ID = "1477683905187414165";

// 🤖 CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* =========================
   📊 DADOS FIXOS (SUA LISTA)
========================= */

const hierarquiaDB = {
  "RESP.HP": [
    { nome: "Seregio", idInterno: "-", discord: "simpae." }
  ],
  "AUX.RESP.HP": [
    { nome: "Xulia", idInterno: "-", discord: "ywsh7" }
  ],
  "DIR": [
    { nome: "Aurora", idInterno: "633", discord: "isautrini9327" },
    { nome: "Henrique", idInterno: "368", discord: "jhenrique.28" }
  ],
  "VD": [
    { nome: "Aika Souza", idInterno: "408", discord: "mavi_60141" }
  ],
  "SUP": [],
  "COD": [
    { nome: "Kau", idInterno: "429", discord: "_paulaasx" }
  ],
  "MED": [
    { nome: "Aila Suzuki", idInterno: "2180", discord: "xbuny_" },
    { nome: "Rian Beckham", idInterno: "17548", discord: "youtuberfrg" },
    { nome: "Davidy Lampião", idInterno: "17518", discord: "karateka4150" }
  ],
  "ENF": [
    { nome: "Rolnadinho", idInterno: "17249", discord: "walison07676" },
    { nome: "Tink Wink", idInterno: "15968", discord: "letipotato" }
  ],
  "PARM": [
    { nome: "Rogin", idInterno: "1207", discord: "_rogin085" },
    { nome: "VENEZA", idInterno: "16461", discord: "44yve" }
  ],
  "STF": [
    { nome: "Rute Rute", idInterno: "-", discord: "rute.rute" }
  ]
};

/* =========================
   📊 GERAR HIERARQUIA
========================= */

async function gerarHierarquia(guild) {
  let texto = "🔰 HIERARQUIA DO HOSPITAL HP 🔰\n\n";

  for (const [cargo, lista] of Object.entries(hierarquiaDB)) {
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✅ ${cargo}\n`;

    if (!lista.length) {
      texto += "• Nenhum\n\n";
      continue;
    }

    for (const pessoa of lista) {
      // tenta encontrar membro pelo username
      const membro = guild.members.cache.find(
        m => m.user.username === pessoa.discord
      );

      const mention = membro ? `<@${membro.id}>` : `@${pessoa.discord}`;

      texto += `• ${mention} | ${pessoa.nome} | ${pessoa.idInterno}\n`;
    }

    texto += "\n";
  }

  return texto;
}

/* =========================
   🧠 EMBED
========================= */

async function criarEmbed(guild) {
  const texto = await gerarHierarquia(guild);

  return new EmbedBuilder()
    .setColor("#00BFFF")
    .setTitle("🏥 Sistema de Hierarquia HP")
    .setDescription(`\`\`\`\n${texto}\n\`\`\``)
    .setFooter({ text: "Sistema automático" })
    .setTimestamp();
}

/* =========================
   📤 ENVIAR
========================= */

async function enviarHierarquia(guild) {
  const canal = guild.channels.cache.get(CHANNEL_ID);
  if (!canal) return console.log("❌ Canal não encontrado");

  const embed = await criarEmbed(guild);

  await canal.send({
    embeds: [embed],
    allowedMentions: { parse: [] }
  });
}

/* =========================
   📜 COMANDO
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Enviar hierarquia no canal")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
}

/* =========================
   🚀 READY
========================= */

client.once("ready", async () => {
  console.log(`🔥 Logado como ${client.user.tag}`);
  await registrarComandos();
});

/* =========================
   🎮 INTERAÇÃO
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "hierarquia") {
    await interaction.reply({
      content: "📤 Enviando hierarquia...",
      ephemeral: true
    });

    await enviarHierarquia(interaction.guild);
  }
});

/* =========================
   🔑 LOGIN
========================= */

client.login(TOKEN);
