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

// 📊 GERAR HIERARQUIA PROFISSIONAL (COM @)
async function gerarHierarquia(guild) {
  const roleBase = guild.roles.cache.get(ROLE_BASE);
  if (!roleBase) return "❌ Cargo base não encontrado";

  const grupos = {};

  roleBase.members.forEach(member => {
    const cargos = member.roles.cache
      .filter(r => r.id !== roleBase.id)
      .sort((a, b) => b.position - a.position);

    const cargoPrincipal = cargos.first();
    if (!cargoPrincipal) return;

    if (!grupos[cargoPrincipal.name]) {
      grupos[cargoPrincipal.name] = {
        position: cargoPrincipal.position,
        membros: []
      };
    }

    const nick = member.nickname || "Sem nick";
    const id = member.id;
    const mention = `<@${id}>`;

    grupos[cargoPrincipal.name].membros.push(
      `• ${mention} | ${nick} | ${id}`
    );
  });

  // ordenar cargos por hierarquia real
  const cargosOrdenados = Object.entries(grupos)
    .sort((a, b) => b[1].position - a[1].position);

  let texto = "🔰 HIERARQUIA DO HOSPITAL HP 🔰\n\n";

  for (const [cargo, dados] of cargosOrdenados) {
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✅ ${cargo}\n`;
    texto += `${dados.membros.join("\n") || "• Nenhum"}\n\n`;
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
    .setFooter({ text: "Atualiza automaticamente a cada 3 minutos" })
    .setTimestamp();
}

// 💾 CONTROLE DA MENSAGEM
let mensagemID = null;

// 🔄 ATUALIZAR / ENVIAR
async function atualizarMensagem(guild) {
  const canal = guild.channels.cache.get(CHANNEL_ID);
  if (!canal) return;

  const embed = await criarEmbed(guild);

  try {
    if (mensagemID) {
      const msg = await canal.messages.fetch(mensagemID);
      await msg.edit({
        embeds: [embed],
        allowedMentions: { parse: [] } // não notifica geral
      });
    } else {
      const msg = await canal.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
      mensagemID = msg.id;
    }
  } catch {
    const msg = await canal.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
    mensagemID = msg.id;
  }
}

// 📜 SLASH COMMAND
const commands = [
  new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Atualizar a hierarquia do hospital")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Comando /hierarquia registrado");
  } catch (err) {
    console.error(err);
  }
}

// 🚀 BOT READY
client.once("ready", async () => {
  console.log(`🔥 Logado como ${client.user.tag}`);

  await registrarComandos();

  const guild = client.guilds.cache.first();

  // Atualiza ao iniciar
  await atualizarMensagem(guild);

  // ⏱️ Atualiza a cada 3 minutos
  setInterval(() => {
    atualizarMensagem(guild);
  }, 3 * 60 * 1000);
});

// 🎮 COMANDO
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
