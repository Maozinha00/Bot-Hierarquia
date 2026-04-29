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

const CHANNEL_ID = "1477683905187414165";

/* =========================
   📦 BANCO (MEMÓRIA)
========================= */

const cargos = {
  "RESP.HP": [],
  "AUX.RESP.HP": [],
  "DIR": [],
  "VD": [],
  "STF": [],
  "COD": [],
  "MED": [],
  "ENF": [],
  "PARM": []
};

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

  function listar(cargo) {
    return cargos[cargo].length
      ? cargos[cargo].map(id => `${cargo} | <@${id}>`).join("\n")
      : `${cargo} | (vazio)`;
  }

  return `📋 **QUADRO DE CARGOS - HOSPITAL**

👑 **RESPONSÁVEL DO HP**
${listar("RESP.HP")}

🩺 **AUX. RESPONSÁVEL DO HP**
${listar("AUX.RESP.HP")}

🏛️ **DIRETORIA**
${listar("DIR")}

📌 **VICE DIRETORIA**
${listar("VD")}

⚖️ **STAFF / STF**
${listar("STF")}

📊 **COORDENAÇÃO**
${listar("COD")}

💉 **MÉDICOS**
${listar("MED")}

🩹 **ENFERMEIROS**
${listar("ENF")}

🚑 **PARAMÉDICOS**
${listar("PARM")}

📅 Atualizado em ${dataFormatada} às ${horaFormatada}`;
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
  if (!canal) return;

  await canal.send({
    embeds: [criarEmbed()],
    allowedMentions: { parse: ["users"] }
  });
}

/* =========================
   📜 COMANDOS
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName("quadro")
    .setDescription("Ver quadro de cargos"),

  new SlashCommandBuilder()
    .setName("addcargo")
    .setDescription("Adicionar pessoa ao cargo")
    .addStringOption(opt =>
      opt.setName("cargo")
        .setDescription("Nome do cargo (ex: MED)")
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName("pessoa")
        .setDescription("Usuário")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("removercargo")
    .setDescription("Remover pessoa do cargo")
    .addStringOption(opt =>
      opt.setName("cargo")
        .setDescription("Nome do cargo")
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName("pessoa")
        .setDescription("Usuário")
        .setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
}

/* =========================
   🎮 INTERAÇÕES
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cargo = interaction.options?.getString("cargo");
  const user = interaction.options?.getUser("pessoa");

  if (interaction.commandName === "quadro") {
    return interaction.reply({
      embeds: [criarEmbed()],
      ephemeral: true
    });
  }

  if (!cargos[cargo]) {
    return interaction.reply({
      content: "❌ Cargo inválido!",
      ephemeral: true
    });
  }

  if (interaction.commandName === "addcargo") {
    if (!cargos[cargo].includes(user.id)) {
      cargos[cargo].push(user.id);
    }

    return interaction.reply({
      content: `✅ ${user} adicionado ao cargo ${cargo}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === "removercargo") {
    cargos[cargo] = cargos[cargo].filter(id => id !== user.id);

    return interaction.reply({
      content: `❌ ${user} removido do cargo ${cargo}`,
      ephemeral: true
    });
  }
});

/* =========================
   🚀 READY
========================= */

client.once("ready", async () => {
  console.log(`🔥 ${client.user.tag}`);
  await registrarComandos();
});

/* =========================
   🔑 LOGIN
========================= */

client.login(TOKEN);
