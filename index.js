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
  await guild.members.fetch(); // 🔥 ESSENCIAL

  const roleBase = guild.roles.cache.get(ROLE_BASE);
  if (!roleBase) return "❌ Cargo base não encontrado";

  const grupos = {
    "RESP.HP": [],
    "AUX.RESP.HP": [],
    "DIR": [],
    "VD": [],
    "SUP": [],
    "COD": [],
    "MED": [],
    "ENF": [],
    "PARM": [],
    "STF": []
  };

  roleBase.members.forEach(member => {
    const nome = member.nickname || member.user.username;

    const siglaMatch = nome.match(/\[(.*?)\]/);
    if (!siglaMatch) return;

    const sigla = siglaMatch[1];

    const nomeLimpo = nome.replace(/\[.*?\]/, "").trim();
    const matchId = nomeLimpo.match(/\|\s*(\d+)/);

    const nomeFinal = nomeLimpo.split("|")[0].trim();
    const idInterno = matchId ? matchId[1] : "Sem ID";

    const mention = `<@${member.id}>`;

    if (grupos[sigla]) {
      grupos[sigla].push(
        `• ${mention} | ${nomeFinal} | ${idInterno}`
      );
    }
  });

  let texto = "🔰 HIERARQUIA DO HOSPITAL HP 🔰\n\n";

  for (const [cargo, lista] of Object.entries(grupos)) {
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✅ ${cargo}\n`;
    texto += `${lista.join("\n") || "• Nenhum"}\n\n`;
  }

  return texto;
}

// 🧠 EMBED
async function criarEmbed(guild) {
  const texto = await gerarHierarquia(guild);

  return new EmbedBuilder()
    .setColor("#00BFFF")
    .setTitle("🏥 Sistema de Hierarquia HP")
    .setDescription(`\`\`\`\n${texto}\n\`\`\``)
    .setFooter({ text: "Gerado manualmente" })
    .setTimestamp();
}

// 📤 ENVIAR NO CANAL
async function enviarHierarquia(guild) {
  const canal = guild.channels.cache.get(CHANNEL_ID);
  if (!canal) return console.log("❌ Canal não encontrado");

  const embed = await criarEmbed(guild);

  await canal.send({
    embeds: [embed],
    allowedMentions: { parse: [] }
  });
}

// 📜 COMANDO
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

// 🚀 READY
client.once("ready", async () => {
  console.log(`🔥 Logado como ${client.user.tag}`);
  await registrarComandos();
});

// 🎮 INTERAÇÃO
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

// 🔑 LOGIN
client.login(TOKEN);
