#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function parseEnvFile(envPath) {
  const env = {};
  if (!fs.existsSync(envPath)) {
    return env;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const idx = line.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

function stamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

async function captureLoginPage(browser, baseUrl, viewport, outDir) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const response = await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const target = path.join(outDir, `login_${viewport.tag}.png`);
  await page.screenshot({ path: target, fullPage: true });
  await context.close();
  return {
    route: "/login",
    file: target,
    status: response ? response.status() : null
  };
}

async function loginAndCapture(browser, baseUrl, viewport, outDir, username, password) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });

  const userSelector = "#username, input[autocomplete='username'], input[type='text']";
  const passSelector = "#password, input[autocomplete='current-password'], input[type='password']";

  await page.fill(userSelector, username);
  await page.fill(passSelector, password);

  await Promise.all([
    page.waitForLoadState("domcontentloaded"),
    page.click("button[type='submit']")
  ]);

  const routes = [
    { slug: "dashboard", path: "/" },
    { slug: "eventos", path: "/eventos" },
    { slug: "webhooks", path: "/webhooks" },
    { slug: "configuracoes", path: "/configuracoes" }
  ];

  const captures = [];
  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    const target = path.join(outDir, `${route.slug}_${viewport.tag}.png`);
    await page.screenshot({ path: target, fullPage: true });
    captures.push({
      route: route.path,
      file: target,
      status: response ? response.status() : null
    });
  }

  await context.close();
  return captures;
}

async function main() {
  const root = process.cwd();
  const env = parseEnvFile(path.join(root, ".env"));
  const port = env.PORT || "3010";
  const baseUrl = process.env.BASELINE_BASE_URL || `http://127.0.0.1:${port}`;

  const username = env.APP_ADMIN_USER || "admin";
  const password = env.APP_ADMIN_PASS || "";

  if (!password) {
    throw new Error("APP_ADMIN_PASS ausente no .env");
  }

  const outDir = path.join(root, "docs", "ui-baseline", stamp());
  fs.mkdirSync(outDir, { recursive: true });

  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { tag: "1440", width: 1440, height: 900 },
    { tag: "390", width: 390, height: 844 }
  ];

  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    captures: []
  };

  for (const viewport of viewports) {
    report.captures.push(await captureLoginPage(browser, baseUrl, viewport, outDir));
    const authCaptures = await loginAndCapture(browser, baseUrl, viewport, outDir, username, password);
    report.captures.push(...authCaptures);
  }

  await browser.close();

  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Baseline capturado em: ${outDir}`);
  console.log(`Relatorio: ${reportPath}`);
  for (const item of report.captures) {
    console.log(`${item.route} -> ${item.status} -> ${path.basename(item.file)}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Erro ao capturar baseline: ${message}`);
  process.exit(1);
});
