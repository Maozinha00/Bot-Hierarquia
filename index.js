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
   🌐 KEEP ALIVE
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

// 🔴 ID do canal
const CHANNEL_ID = "1477683905187414165";

// 🔴 ID de quem atualiza (Henrique)
const ATUALIZADO_POR_ID = "ID_DO_JHENRIQUE";

/* =========================
   🤖 CLIENT
========================= */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* =========================
   🧠 GERAR TEXTO
========================= */

function gerarTexto() {
  const data = new Date();

  const dataFormatada = data.toLocaleDateString("pt-BR");
  const horaFormatada = data.toLocaleTimeString("pt-BR");

  return `📋 **QUADRO DE CARGOS - HOSPITAL**

👑 **RESPONSÁVEL DO HP**
RESP.HP | @simpae.

🩺 **AUX. RESPONSÁVEL DO HP**
AUX.RESP.HP | @ywsh7

🏛️ **DIRETORIA**
DIR | @isautrini9327
DIR | @jhenrique.28

📌 **VICE DIRETORIA**
VD | @mavi_60141

⚖️ **STAFF / STF**
STF | @rute.rute

📊 **COORDENAÇÃO**
COD | @_paulaasx

💉 **MÉDICOS**
MED | @xbuny_
MED | @youtuberfrg
MED | @karateka4150

🩹 **ENFERMEIROS**
ENF | @walison07676
ENF | @letipotato

🚑 **PARAMÉDICOS**
PARM | @_rogin085
PARM | @44yve

📅 Atualizado em ${dataFormatada} às ${horaFormatada} por <@${ATUALIZADO_POR_ID}>`;
}

/* =========================
   🧠 EMBED
========================= */

function criarEmbed() {
  return new EmbedBuilder()
    .setColor("#00BFFF")
    .setDescription(gerarTexto())
    .setFooter({ text: "Sistema automático HP" })
    .setTimestamp();
}

/* =========================
   📤 ENVIAR
========================= */

async function enviar(guild) {
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
   📜 COMANDO
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName("quadro")
    .setDescription("Enviar quadro de cargos do hospital")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Comando registrado");
}

/* =========================
   🚀 READY
========================= */

client.once("ready", async () => {
  console.log(`🔥 ${client.user.tag}`);
  await registrarComandos();
});

/* =========================
   🎮 INTERAÇÃO
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "quadro") {
    await interaction.reply({
      content: "📤 Enviando quadro...",
      ephemeral: true
    });

    await enviar(interaction.guild);
  }
});

/* =========================
   🔑 LOGIN
========================= */

client.login(TOKEN);
