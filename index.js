async function gerarHierarquia(guild) {
  const roleBase = guild.roles.cache.get("1477683902079303932");
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

    const linha = `• ${mention} | ${nomeFinal} | ${idInterno}`;

    if (grupos[sigla]) {
      grupos[sigla].push(linha);
    }
  });

  return `🔰 HIERARQUIA DO HOSPITAL HP 🔰

━━━━━━━━━━━━━━━━━━━━━━

✅ RESPONSÁVEL DO HP
${grupos["RESP.HP"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ AUX RESPONSÁVEL
${grupos["AUX.RESP.HP"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ DIRETORIA
${grupos["DIR"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ VICE DIRETORIA
${grupos["VD"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ SUPERVISÃO
${grupos["SUP"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ COORDENAÇÃO
${grupos["COD"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ MÉDICOS
${grupos["MED"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ ENFERMEIROS
${grupos["ENF"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ PARAMÉDICOS
${grupos["PARM"].join("\n") || "• Nenhum"}

━━━━━━━━━━━━━━━━━━━━━━

✅ STAFF
${grupos["STF"].join("\n") || "• Nenhum"}
`;
}
