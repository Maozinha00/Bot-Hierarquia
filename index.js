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
   🚨 VALIDAÇÃO
========================= */

console.log("🔐 TOKEN:", !!TOKEN);
console.log("📏 TAMANHO:", TOKEN?.length);

if (!TOKEN || TOKEN.length < 50) {
  console.error("❌ TOKEN INVÁLIDO");
  process.exit(1);
}

/* =========================
   📦 BANCO
========================= */

const cargos = {
  "RESP.HP": [],
  "AUX.RESP.HP": [],
  "DIR": [],
  "VD": [],
  "SUP": [], // 🔥 AGORA É SUP
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
      ? cargos[cargo].map(id => `• <@${id}>`).join("\n")
      : "(vazio)";
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

🔱 **SUPERVISÃO**
${listar("SUP")}

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
        .setDescription("Ex: SUP, MED, DIR")
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName("pessoa")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("removercargo")
    .setDescription("Remover pessoa do cargo")
    .addStringOption(opt =>
      opt.setName("cargo")
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName("pessoa")
        .setRequired(true))
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
   🎮 INTERAÇÕES
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "quadro") {
    return interaction.reply({
      embeds: [criarEmbed()]
    });
  }

  const cargo = interaction.options.getString("cargo").toUpperCase();
  const user = interaction.options.getUser("pessoa");

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
      content: `✅ ${user} adicionado em ${cargo}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === "removercargo") {
    cargos[cargo] = cargos[cargo].filter(id => id !== user.id);

    return interaction.reply({
      content: `❌ ${user} removido de ${cargo}`,
      ephemeral: true
    });
  }
});

/* =========================
   🚀 READY
========================= */

client.once("ready", async () => {
  console.log(`🔥 ${client.user.tag} online`);
  await registrarComandos();
});

/* =========================
   🔑 LOGIN
========================= */

client.login(TOKEN);
