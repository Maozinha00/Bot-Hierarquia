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

/* =========================
   🌐 KEEP ALIVE (Railway / Render)
========================= */

const app = express();
app.get("/", (_, res) => res.send("Bot online 🔥"));
app.listen(3000, () => console.log("🌐 Web server ativo"));

/* =========================
   🔐 CONFIG
========================= */

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// 🔴 COLOQUE O ID DO CANAL AQUI
const CHANNEL_ID = "1477683905187414165";

/* =========================
   ⚠️ VALIDAÇÃO
========================= */

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Configure TOKEN, CLIENT_ID e GUILD_ID no .env");
  process.exit(1);
}

/* =========================
   🤖 CLIENT
========================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* =========================
   📊 HIERARQUIA (USE ID DO DISCORD)
========================= */

const hierarquiaDB = {
  "RESP.HP": [
    { nome: "Seregio", idInterno: "-", discordId: "ID_AQUI" }
  ],
  "AUX.RESP.HP": [
    { nome: "Xulia", idInterno: "-", discordId: "ID_AQUI" }
  ],
  "DIR": [
    { nome: "Aurora", idInterno: "633", discordId: "ID_AQUI" },
    { nome: "Henrique", idInterno: "368", discordId: "ID_AQUI" }
  ],
  "VD": [
    { nome: "Aika Souza", idInterno: "408", discordId: "ID_AQUI" }
  ],
  "SUP": [],
  "COD": [
    { nome: "Kau", idInterno: "429", discordId: "ID_AQUI" }
  ],
  "MED": [
    { nome: "Aila Suzuki", idInterno: "2180", discordId: "ID_AQUI" },
    { nome: "Rian Beckham", idInterno: "17548", discordId: "ID_AQUI" },
    { nome: "Davidy Lampião", idInterno: "17518", discordId: "ID_AQUI" }
  ],
  "ENF": [
    { nome: "Rolnadinho", idInterno: "17249", discordId: "ID_AQUI" },
    { nome: "Tink Wink", idInterno: "15968", discordId: "ID_AQUI" }
  ],
  "PARM": [
    { nome: "Rogin", idInterno: "1207", discordId: "ID_AQUI" },
    { nome: "VENEZA", idInterno: "16461", discordId: "ID_AQUI" }
  ],
};

/* =========================
   📊 GERAR TEXTO
========================= */

function gerarHierarquia() {
  let texto = "🔰 HIERARQUIA DO HOSPITAL HP 🔰\n\n";

  for (const [cargo, lista] of Object.entries(hierarquiaDB)) {
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✅ ${cargo}\n`;

    if (!lista.length) {
      texto += "• Nenhum\n\n";
      continue;
    }

    for (const pessoa of lista) {
      texto += `• <@${pessoa.discordId}> | ${pessoa.nome} | ${pessoa.idInterno}\n`;
    }

    texto += "\n";
  }

  return texto;
}

/* =========================
   🧠 EMBED
========================= */

function criarEmbed() {
  const texto = gerarHierarquia();

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

  if (!canal) {
    console.log("❌ Canal não encontrado");
    return;
  }

  const embed = criarEmbed();

  await canal.send({
    embeds: [embed],
    allowedMentions: { parse: [] }
  });
}

/* =========================
   📜 COMANDOS
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Enviar a hierarquia no canal")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Comandos registrados");
}

/* =========================
   🚀 READY
========================= */

client.once("ready", async () => {
  console.log(`🔥 Bot logado como ${client.user.tag}`);
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
