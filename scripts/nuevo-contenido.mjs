#!/usr/bin/env node
// Script de automatización para crear contenido nuevo (Bicarbonato205)
//
// Uso:
//   npm run new -- tema
//   npm run new -- playlist
//   npm run new -- noticia
//
// Si es un tema, te pregunta primero el link de YouTube: si lo pegás,
// completa título y portada automáticamente (vía el servicio oEmbed
// público de YouTube, sin necesitar API key). Lo que no puede
// completar solo (fecha, link de streaming, descripción) te lo
// pregunta uno por uno.

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import fs from "node:fs";
import path from "node:path";

const rl = readline.createInterface({ input: stdin, output: stdout });

const TYPES = {
  tema:        { folder: "temas",       fields: ["title", "date", "type", "cover", "streamingUrl"] },
  playlist:    { folder: "playlists",    fields: ["title", "date", "platform", "url"] },
  noticia:     { folder: "noticias",     fields: ["title", "date"] },
};

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function getBestThumbnail(videoId) {
  const maxres = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const res = await fetch(maxres, { method: "HEAD" });
    const size = parseInt(res.headers.get("content-length") || "0", 10);
    // YouTube NO devuelve 404 cuando maxresdefault no existe — devuelve
    // un placeholder gris minúsculo con estado 200, como si fuera válido.
    // Por eso no alcanza con chequear res.ok: hay que mirar el tamaño real
    // del archivo. El placeholder pesa unos pocos cientos de bytes; una
    // miniatura real pesa muchísimo más.
    if (res.ok && size > 2000) {
      return maxres;
    }
  } catch {
    // sin conexión o error de red: seguimos al fallback
  }
  return fallback;
}

async function fetchYoutubeMeta(url) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    const videoId = new URL(url).searchParams.get("v")
      || url.split("/").pop().split("?")[0];
    return {
      title: data.title,
      cover: await getBestThumbnail(videoId),
    };
  } catch {
    return null;
  }
}

function formatValue(field, value) {
  if (field === "date") return value; // sin comillas, Eleventy lo lee como fecha
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

async function main() {
  const type = process.argv[2];
  if (!TYPES[type]) {
    console.log("Uso: npm run new -- <tema|playlist|noticia>");
    process.exit(1);
  }

  const { folder, fields } = TYPES[type];
  const data = {};
  const extraLinks = [];

  if (type === "tema") {
    const yt = (await rl.question("Link de YouTube (Enter para omitir): ")).trim();
    if (yt) {
      console.log("Buscando datos en YouTube...");
      const meta = await fetchYoutubeMeta(yt);
      if (meta) {
        data.title = meta.title;
        data.cover = meta.cover;
        extraLinks.push(yt); // el link de YouTube se guarda como plataforma adicional
        console.log(`  Encontrado: "${meta.title}"`);
      } else {
        console.log("  No se pudo obtener automáticamente, completá los datos a mano.");
      }
    }
  }

  for (const field of fields) {
    if (data[field]) continue; // ya completado automáticamente
    const hint = field === "date" ? ` (AAAA-MM-DD, Enter = hoy)` : "";
    const answer = (await rl.question(`${field}${hint}: `)).trim();
    if (field === "date" && !answer) {
      data[field] = todayISO();
    } else {
      data[field] = answer;
    }
  }

  const body = (await rl.question("Descripción/texto (Enter para dejar vacío): ")).trim();

  // Links adicionales (Spotify, Deezer, Apple Music, etc.), además del
  // campo principal (streamingUrl) y del link de YouTube ya cargado arriba.
  if (type === "tema") {
    console.log("\n¿Otras plataformas? (Enter vacío para terminar)");
    while (true) {
      const link = (await rl.question(`  Link ${extraLinks.length + 1} (o Enter para terminar): `)).trim();
      if (!link) break;
      extraLinks.push(link);
    }
  }

  const slug = slugify(data.title);
  const frontMatter = fields
    .filter((f) => data[f])
    .map((f) => `${f}: ${formatValue(f, data[f])}`)
    .join("\n");
  const linksBlock = extraLinks.length
    ? `\nlinks:\n${extraLinks.map((l) => `  - "${l}"`).join("\n")}`
    : "";
  const content = `---\n${frontMatter}${linksBlock}\n---\n\n${body}\n`;

  const dir = path.join("src", folder);
  const filepath = path.join(dir, `${slug}.md`);

  if (fs.existsSync(filepath)) {
    console.log(`\nYa existe ${filepath} — elegí otro título o borrá el archivo existente.`);
    rl.close();
    process.exit(1);
  }

  fs.writeFileSync(filepath, content);
  console.log(`\nCreado: ${filepath}`);
  console.log(`Revisalo con "npm run dev" antes de subirlo.`);
  rl.close();
}

main();
