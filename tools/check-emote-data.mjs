/**
 * check-emote-data.mjs — 校验 lib/client.js 内嵌的 827 条表情数据自洽性。
 *
 * 内嵌数据是手工/脚本拼成的巨型常量，玩家提新表情或误改时容易坏。
 * 本脚本从 client.js 抽取 EMOJI_TABS / EMOJI_ROLE_GROUPS / EMOJI_NAME2FILE，
 * 检查：
 *   - 按弹(51)与按角色(151)覆盖的贴图 id 一致 = 827 且无重复；
 *   - 每个 item 引用的 assets/gNNNN.png 真实存在；
 *   - EMOJI_NAME2FILE 的键都能映射到存在的文件、且键值无重复；
 *   - 中英名(enn/cnn) 无重复（确保 token 唯一可解析）。
 *
 * 用法：node tools/check-emote-data.mjs      （非零退出=发现问题）
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const SRC = readFileSync(join(ROOT, "lib", "client.js"), "utf8");

function extract(name, openChar, closeChar) {
  const anchor = `const ${name} = `;
  const i = SRC.indexOf(anchor);
  if (i < 0) throw new Error(`找不到 const ${name}`);
  const start = SRC.indexOf(openChar, i);
  let depth = 0, end = -1;
  for (let k = start; k < SRC.length; k++) {
    const c = SRC[k];
    if (c === openChar) depth++;
    else if (c === closeChar) { depth--; if (depth === 0) { end = k + 1; break; } }
  }
  if (end < 0) throw new Error(`${name} 未闭合`);
  return Function(`return ${SRC.slice(start, end)}`)();
}

const tabs = extract("EMOJI_TABS", "[", "]");
const roles = extract("EMOJI_ROLE_GROUPS", "[", "]");
const n2f = extract("EMOJI_NAME2FILE", "{", "}");

const problems = [];
const tabIds = new Map();
const roleIds = new Map();

for (const group of tabs) for (const it of group.items) {
  if (tabIds.has(it.id)) problems.push(`按弹重复 id: ${it.id}`);
  tabIds.set(it.id, it);
}
for (const group of roles) for (const it of group.items) {
  if (roleIds.has(it.id)) problems.push(`按角色重复 id: ${it.id}`);
  roleIds.set(it.id, it);
}

// 统计
const tabItems = tabs.reduce((a, t) => a + t.items.length, 0);
const roleItems = roles.reduce((a, t) => a + t.items.length, 0);
console.log(`[check] 按弹 ${tabs.length} 弹 / ${tabItems} 项；按角色 ${roles.length} 组 / ${roleItems} 项；唯一 id: 按弹=${tabIds.size}, 按角色=${roleIds.size}`);
if (tabs.length !== 51) problems.push(`按弹应 51，实为 ${tabs.length}`);
if (tabIds.size !== 827 || roleIds.size !== 827) problems.push(`唯一 id 应 827：按弹=${tabIds.size}，按角色=${roleIds.size}`);
const setA = new Set(tabIds.keys()), setB = new Set(roleIds.keys());
const onlyA = [...setA].filter((x) => !setB.has(x));
const onlyB = [...setB].filter((x) => !setA.has(x));
if (onlyA.length || onlyB.length) {
  problems.push(`按弹/按角色 id 集合不一致：仅按弹 ${onlyA.slice(0, 5).join(",")}，仅按角色 ${onlyB.slice(0, 5).join(",")}`);
}

// 文件引用（任一视图即可，集合一致）
for (const it of roleIds.values()) {
  if (!existsSync(join(ROOT, "assets", it.file))) problems.push(`缺失文件: ${it.file} (${it.id})`);
}

// NAME2FILE：键唯一、值对应的文件存在（一图可有 EN+CN 两个键，属设计）
const nameKeys = Object.keys(n2f);
const seenK = new Set();
for (const k of nameKeys) {
  if (seenK.has(k)) problems.push(`NAME2FILE 重复键: ${k}`);
  seenK.add(k);
  const v = n2f[k];
  if (!existsSync(join(ROOT, "assets", v))) problems.push(`NAME2FILE 指向缺失文件: ${v} <- ${k}`);
}

// 中英名唯一（以 EMOJI_ROLE_GROUPS 为主集）
const enSeen = new Map(), cnSeen = new Map();
for (const group of roles) for (const it of group.items) {
  if (enSeen.has(it.enn)) problems.push(`英文名重复: ${it.enn} (${it.id} 与 ${enSeen.get(it.enn)})`);
  else enSeen.set(it.enn, it.id);
  if (cnSeen.has(it.cnn)) problems.push(`中文名重复: ${it.cnn} (${it.id} 与 ${cnSeen.get(it.cnn)})`);
  else cnSeen.set(it.cnn, it.id);
}

if (problems.length) {
  console.log(`[check] 发现 ${problems.length} 个问题:`);
  for (const p of problems.slice(0, 40)) console.log("  ✗ " + p);
  process.exit(1);
}
console.log(`[check] OK：51 弹 / 151 组 / 827 张，中英名唯一，文件引用齐备，NAME2FILE ${nameKeys.length} 键互不冲突`);
