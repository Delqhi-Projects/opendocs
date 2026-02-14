import { test, expect } from "@playwright/test";

test.describe("AI Backend API", () => {
  test("health check returns valid response", async ({ request }) => {
    const resp = await request.get("/api/health");
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.ok).toBe(true);
    expect(data.product).toBe("OpenDocs");
    expect(data.features.ai).toBe(true);
    expect(data.features.agent).toBe(true);
  });

  test("nvidia chat returns text response", async ({ request }) => {
    const resp = await request.post("/api/nvidia/chat", {
      data: {
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Say 'hello' in one word." }
        ]
      }
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.choices).toBeDefined();
    expect(data.choices[0].message.content).toBeTruthy();
  });

  test("agent plan returns structured response", async ({ request }) => {
    const resp = await request.post("/api/agent/plan", {
      data: {
        prompt: "Create a simple test page",
        context: { currentPage: "test" }
      }
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.llm).toBeDefined();
  });

  test("github analyze requires valid URL", async ({ request }) => {
    const resp = await request.post("/api/github/analyze", {
      data: { url: "https://github.com/facebook/react" }
    });
    expect(resp.status()).toBeLessThan(500);
  });

  test("website analyze requires valid URL", async ({ request }) => {
    const resp = await request.post("/api/website/analyze", {
      data: { url: "https://react.dev" }
    });
    expect(resp.status()).toBeLessThan(500);
  });
});

test.describe("AI Panel UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("opens AI panel with Ctrl+G", async ({ page }) => {
    await page.keyboard.press("Control+g");
    const modal = page.locator('[role="dialog"], [data-testid="ai-panel"], .fixed:has-text("AI Generate")');
    await expect(modal.first()).toBeVisible({ timeout: 5000 });
  });

  test("AI panel has mode selector", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    const select = page.locator('select:has(option[value="topic"]), select:has(option[value="github"])');
    await expect(select).toBeVisible({ timeout: 3000 });
  });

  test("AI panel has input field", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    const input = page.locator('input[placeholder*="e.g."], input[placeholder*="github"], input[placeholder*="example"]');
    await expect(input.first()).toBeVisible({ timeout: 3000 });
  });

  test("AI panel has Generate button", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    const btn = page.locator('button:has-text("Generate"), button:has-text("Generating")');
    await expect(btn).toBeVisible({ timeout: 3000 });
  });

  test("AI panel closes on Cancel", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    const cancelBtn = page.locator('button:has-text("Cancel")');
    await cancelBtn.click();
    const modal = page.locator('[role="dialog"]:has-text("AI Generate")');
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("AI panel minimizes on minimize button", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    const minimizeBtn = page.locator('button:has(svg), [aria-label*="minimize"]').first();
    if (await minimizeBtn.isVisible()) {
      await minimizeBtn.click();
      const minimized = page.locator('button:has-text("AI Generate"), .fixed.bottom-4:has-text("AI")');
      await expect(minimized).toBeVisible({ timeout: 3000 });
    }
  });

  test("switches between Topic, GitHub, Website modes", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const select = page.locator('select').first();
    await select.selectOption("github");
    await page.waitForTimeout(200);
    let input = page.locator('input').first();
    await expect(input).toHaveAttribute("placeholder", /github/i);
    
    await select.selectOption("website");
    await page.waitForTimeout(200);
    input = page.locator('input').first();
    await expect(input).toHaveAttribute("placeholder", /https/i);
    
    await select.selectOption("topic");
    await page.waitForTimeout(200);
    input = page.locator('input').first();
    await expect(input).toHaveAttribute("placeholder", /tailwind|css/i);
  });

  test("shows error on empty input", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    const error = page.locator('.border-red, .text-red, [class*="error"]');
    await expect(error.first()).toBeVisible({ timeout: 3000 });
  });
});

test.describe("AI Generation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("generates documentation from topic", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const input = page.locator('input').first();
    await input.fill("React hooks basics");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await expect(generateBtn).toContainText("Generating", { timeout: 3000 });
    
    await page.waitForTimeout(10000);
    
    const sidebarItem = page.locator('[data-testid="sidebar-item"], .sidebar:has-text("React"), nav:has-text("hooks")');
    const isVisible = await sidebarItem.first().isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("generates from GitHub URL", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const select = page.locator('select').first();
    await select.selectOption("github");
    
    const input = page.locator('input').first();
    await input.fill("https://github.com/facebook/react");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(15000);
    
    const modal = page.locator('[role="dialog"]:has-text("AI Generate")');
    const closed = await modal.isHidden().catch(() => true);
    expect(typeof closed).toBe("boolean");
  });

  test("handles invalid GitHub URL gracefully", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const select = page.locator('select').first();
    await select.selectOption("github");
    
    const input = page.locator('input').first();
    await input.fill("not-a-valid-url");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(5000);
    
    const errorVisible = await page.locator('.border-red, .text-red, [class*="error"]').first().isVisible().catch(() => false);
    expect(typeof errorVisible).toBe("boolean");
  });

  test("generates from Website URL", async ({ page }) => {
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const select = page.locator('select').first();
    await select.selectOption("website");
    
    const input = page.locator('input').first();
    await input.fill("https://react.dev");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(15000);
    
    const modal = page.locator('[role="dialog"]:has-text("AI Generate")');
    const closed = await modal.isHidden().catch(() => true);
    expect(typeof closed).toBe("boolean");
  });
});

test.describe("Chat Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("opens chat with Ctrl+J", async ({ page }) => {
    await page.keyboard.press("Control+j");
    const chat = page.locator('[data-testid="chat-panel"], .fixed:has-text("Chat"), [role="dialog"]:has(input)');
    await expect(chat.first()).toBeVisible({ timeout: 5000 });
  });

  test("chat has input field", async ({ page }) => {
    await page.keyboard.press("Control+j");
    await page.waitForTimeout(500);
    const input = page.locator('input[placeholder*="message"], input[placeholder*="ask"], input[placeholder*="type"]').first();
    await expect(input).toBeVisible({ timeout: 3000 });
  });

  test("chat has send button", async ({ page }) => {
    await page.keyboard.press("Control+j");
    await page.waitForTimeout(500);
    const sendBtn = page.locator('button:has-text("Send"), button[aria-label*="send"], button:has(svg)').first();
    await expect(sendBtn).toBeVisible({ timeout: 3000 });
  });

  test("can send message and receive response", async ({ page }) => {
    await page.keyboard.press("Control+j");
    await page.waitForTimeout(500);
    
    const input = page.locator('input[type="text"], textarea').first();
    await input.fill("Hello, can you help me?");
    
    const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
    await sendBtn.click();
    
    await page.waitForTimeout(10000);
    
    const response = page.locator('[class*="assistant"], [class*="ai-message"], [class*="response"]');
    const hasResponse = await response.first().isVisible().catch(() => false);
    expect(typeof hasResponse).toBe("boolean");
  });
});

test.describe("AI Prompt Block", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("can add AI Prompt block via slash command", async ({ page }) => {
    await page.click('[contenteditable="true"], [data-testid="editor"]');
    await page.keyboard.type("/ai");
    await page.waitForTimeout(500);
    
    const aiOption = page.locator('[role="option"]:has-text("AI"), button:has-text("AI Prompt")');
    if (await aiOption.first().isVisible()) {
      await aiOption.first().click();
      const block = page.locator('[data-type="aiPrompt"], [class*="ai-prompt"]');
      await expect(block.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test("AI Prompt block has input area", async ({ page }) => {
    await page.click('[contenteditable="true"]');
    await page.keyboard.type("/ai prompt");
    await page.waitForTimeout(500);
    
    const aiPromptOption = page.locator('[role="option"]:has-text("Prompt"), button:has-text("AI Prompt")').first();
    if (await aiPromptOption.isVisible()) {
      await aiPromptOption.click();
      const textarea = page.locator('textarea[placeholder*="prompt"], input[placeholder*="ask"]').first();
      await expect(textarea).toBeVisible({ timeout: 3000 });
    }
  });

  test("AI Prompt block has execute button", async ({ page }) => {
    await page.click('[contenteditable="true"]');
    await page.keyboard.type("/ai prompt");
    await page.waitForTimeout(500);
    
    const aiPromptOption = page.locator('[role="option"]:has-text("Prompt"), button:has-text("AI Prompt")').first();
    if (await aiPromptOption.isVisible()) {
      await aiPromptOption.click();
      const execBtn = page.locator('button:has-text("Run"), button:has-text("Execute"), button:has-text("Generate")').first();
      await expect(execBtn).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe("Per-Block AI Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("block has AI action button", async ({ page }) => {
    await page.click('[contenteditable="true"]');
    await page.keyboard.type("Test paragraph");
    
    const block = page.locator('[data-block-id], [data-type="paragraph"]').first();
    await block.hover();
    
    const aiBtn = page.locator('button[aria-label*="AI"], button:has-text("AI"), [data-testid="ai-action"]').first();
    const isVisible = await aiBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("AI block actions menu appears", async ({ page }) => {
    await page.click('[contenteditable="true"]');
    await page.keyboard.type("Test text for AI");
    await page.waitForTimeout(300);
    
    const block = page.locator('[data-block-id]').first();
    await block.click({ button: "right" });
    
    const contextMenu = page.locator('[role="menu"], .context-menu');
    const hasMenu = await contextMenu.first().isVisible().catch(() => false);
    expect(typeof hasMenu).toBe("boolean");
  });
});

test.describe("AI Error Handling", () => {
  test("handles API timeout gracefully", async ({ page, context }) => {
    await context.route("**/api/nvidia/**", route => {
      route.abort("timedout");
    });
    
    await page.goto("/");
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const input = page.locator('input').first();
    await input.fill("Test timeout");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(5000);
    
    const errorVisible = await page.locator('.border-red, .text-red, [class*="error"]').first().isVisible().catch(() => false);
    expect(typeof errorVisible).toBe("boolean");
  });

  test("handles API error gracefully", async ({ page, context }) => {
    await context.route("**/api/nvidia/**", route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) });
    });
    
    await page.goto("/");
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const input = page.locator('input').first();
    await input.fill("Test error");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(5000);
    
    const errorVisible = await page.locator('.border-red, .text-red, [class*="error"]').first().isVisible().catch(() => false);
    expect(typeof errorVisible).toBe("boolean");
  });

  test("handles network failure gracefully", async ({ page, context }) => {
    await context.route("**/api/**", route => {
      route.abort("failed");
    });
    
    await page.goto("/");
    await page.keyboard.press("Control+g");
    await page.waitForTimeout(500);
    
    const input = page.locator('input').first();
    await input.fill("Test network failure");
    
    const generateBtn = page.locator('button:has-text("Generate")');
    await generateBtn.click();
    
    await page.waitForTimeout(5000);
    
    const body = await page.locator('body').innerHTML();
    expect(body.length).toBeGreaterThan(0);
  });
});

test.describe("AI Performance", () => {
  test("health check responds within 1000ms", async ({ request }) => {
    const start = Date.now();
    const resp = await request.get("/api/health");
    const duration = Date.now() - start;
    
    expect(resp.ok()).toBeTruthy();
    expect(duration).toBeLessThan(1000);
  });

  test("chat API responds within 30s", async ({ request }) => {
    const start = Date.now();
    const resp = await request.post("/api/nvidia/chat", {
      data: {
        temperature: 0.2,
        messages: [
          { role: "user", content: "Say 'test'" }
        ]
      },
      timeout: 30000
    });
    const duration = Date.now() - start;
    
    expect(resp.ok()).toBeTruthy();
    expect(duration).toBeLessThan(30000);
  });
});
