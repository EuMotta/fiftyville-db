const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const Table = require("cli-table3");

const db = new sqlite3.Database("./fiftyville.db", (err) => {
  if (err) return console.error("Erro ao abrir o banco:", err.message);
  console.log("Banco aberto");

  const sql = fs.readFileSync("./src/data/comandos.sql", "utf8");
  const consultas = sql
    .split(";")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const resultados = [];

  function executar(i) {
    if (i >= consultas.length) {
      const textoFinal = resultados.join("\n\n");

      fs.writeFile("./src/txt/resultado.txt", textoFinal, (err) => {
        if (err) return console.error("Erro ao salvar:", err.message);
        console.log("salvo em resultado.txt");
        db.close();
      });

      return;
    }

    const consulta = consultas[i];
    const nomeTabela =
      consulta.match(/from\s+(\w+)/i)?.[1] || `Consulta ${i + 1}`;

    db.all(consulta, [], (err, linhas) => {
      if (err) {
        console.error(`Erro na consulta ${i + 1}:`, err.message);
      } else if (linhas.length > 0) {
        const tabela = new Table({
          head: Object.keys(linhas[0]),
          wordWrap: true,
          style: { head: [], border: [] },
        });

        linhas.forEach((linha) => tabela.push(Object.values(linha)));
        resultados.push(`Tabela: ${nomeTabela}\n${tabela.toString()}`);
      } else {
        resultados.push(`Tabela: ${nomeTabela}\nNenhum resultado.`);
      }

      executar(i + 1);
    });
  }

  executar(0);
});
