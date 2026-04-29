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

const ROLE_BASE = "1477683902079303932";
const CHANNEL_ID = "1477683905187414165";

// 🤖 CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 📊 GERAR HIERARQUIA
async function gerarHierarquia(guild) {
  const baseRole = guild.roles.cache.get(ROLE_BASE);
  if (!baseRole) return "❌ Cargo base não encontrado";

  const grupos = {
    "RESP.HP": [],
    DIR: [],
    VD: [],
    SUP: [],
    COD: [],
    MED: [],
    ENF: [],
    PARM: []
  };

  baseRole.members.forEach(member => {
    const nome = member.nickname || member.user.username;

    const siglaMatch = nome.match(/\[(.*?)\]/);
    if (!siglaMatch) return;

    const sigla = siglaMatch[1];

    const nomeLimpo = nome.replace(/\[.*?\]/, "").trim();
    const matchId = nomeLimpo.match(/\|\s*(\d+)/);

    const nomeFinal = nomeLimpo.split("|")[0].trim();
    const id = matchId ? matchId[1] : "Sem ID";

    const linha = `• [${sigla}] ${nomeFinal} | ${id}`;

    if (grupos[sigla]) {
      grupos[sigla].push(linha);
    }
  });

  return `🔰 HIERARQUIA DO HOSPITAL HP 🔰

━━━━━━━━━━━━━━━━━━━━━━

✅ RESPONSÁVEL DO HP
${grupos["RESP.HP"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ DIRETORIA GERAL
${grupos.DIR.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ VICE DIRETORIA
${grupos.VD.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ SUPERVISOR
${grupos.SUP.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ COORDENADOR
${grupos.COD.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ MÉDICO
${grupos.MED.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ ENFERMEIRO
${grupos.ENF.join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ PARAMÉDICO
${grupos.PARM.join("\n") || "• Nenhum"}
`;
}

// 🧠 CRIAR EMBED
async function criarEmbed(guild) {
  const texto = await gerarHierarquia(guild);

  return new EmbedBuilder()
    .setColor("Blue")
    .setDescription(`\`\`\`\n${texto}\n\`\`\``)
    .setFooter({ text: "Sistema de Hierarquia HP" })
    .setTimestamp();
}

// 💾 SALVAR ID DA MENSAGEM
let mensagemID = null;

// 🔄 ATUALIZAR MENSAGEM
async function atualizarMensagem(guild) {
  const canal = guild.channels.cache.get(CHANNEL_ID);
  if (!canal) return;

  const embed = await criarEmbed(guild);

  try {
    if (mensagemID) {
      const msg = await canal.messages.fetch(mensagemID);
      await msg.edit({ embeds: [embed] });
    } else {
      const msg = await canal.send({ embeds: [embed] });
      mensagemID = msg.id;
    }
  } catch {
    const msg = await canal.send({ embeds: [embed] });
    mensagemID = msg.id;
  }
}

// 📜 REGISTRAR SLASH COMMAND
const commands = [
  new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Atualiza a hierarquia")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Comando registrado");
  } catch (err) {
    console.error(err);
  }
}

// 🚀 READY
client.once("ready", async () => {
  console.log(`🔥 Logado como ${client.user.tag}`);

  await registrarComandos();

  const guild = client.guilds.cache.first();

  // Atualiza ao iniciar
  atualizarMensagem(guild);

  // ⏱️ Atualiza a cada 3 minutos
  setInterval(() => {
    atualizarMensagem(guild);
  }, 3 * 60 * 1000);
});

// 🎮 INTERAÇÃO
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "hierarquia") {
    await interaction.reply({
      content: "🔄 Atualizando hierarquia...",
      ephemeral: true
    });

    await atualizarMensagem(interaction.guild);
  }
});

// 🔑 LOGIN
client.login(TOKEN);
