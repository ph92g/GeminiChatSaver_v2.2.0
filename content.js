(function () {
  let isExporting = false;
  let widgetContainer = null;
  let scanOverlay = null;

  function createCyberUI() {
    if (document.getElementById('cyber-export-widget')) return;

    widgetContainer = document.createElement('div');
    widgetContainer.id = 'cyber-export-widget';
    widgetContainer.className = 'cyber-export-widget';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'cyber-glitch-btn';
    exportBtn.id = 'cyber-export-btn';
    exportBtn.innerHTML = '<span>⚡ EXPORT CHAT</span>';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'cyber-toggle-btn';
    toggleBtn.id = 'cyber-toggle-btn';
    toggleBtn.innerHTML = '⚙️';

    widgetContainer.appendChild(exportBtn);
    widgetContainer.appendChild(toggleBtn);
    document.body.appendChild(widgetContainer);

    exportBtn.addEventListener('click', startExportProcess);
    toggleBtn.addEventListener('click', toggleWidgetState);
  }

  function toggleWidgetState() {
    const exportBtn = document.getElementById('cyber-export-btn');
    if (exportBtn.style.display === 'none') {
      exportBtn.style.display = 'block';
      exportBtn.style.animation = 'cyberEntrance 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    } else {
      exportBtn.style.display = 'none';
    }
  }

  function createScanOverlay() {
    scanOverlay = document.createElement('div');
    scanOverlay.className = 'cyber-scan-overlay';
    scanOverlay.innerHTML = `
      <div class="cyber-grid-bg"></div>
      <div class="cyber-scan-line"></div>
      <div class="cyber-hud-box">
        <div class="cyber-hud-title">SYSTEM SCANNING DOM</div>
        <div class="cyber-progress-bar">
          <div class="cyber-progress-fill" id="cyber-progress-fill"></div>
        </div>
        <div class="cyber-status-text" id="cyber-status-text">INITIALIZING QUANTUM SCROLL...</div>
      </div>
    `;
    document.body.appendChild(scanOverlay);
    requestAnimationFrame(() => scanOverlay.classList.add('active'));
  }

  function removeScanOverlay() {
    if (scanOverlay) {
      scanOverlay.classList.remove('active');
      setTimeout(() => {
        if (scanOverlay && scanOverlay.parentNode) {
          scanOverlay.parentNode.removeChild(scanOverlay);
          scanOverlay = null;
        }
      }, 400);
    }
  }

  function isScrollableElement(el) {
    if (!el || el === document.documentElement) return false;
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    return (
      el.scrollHeight > el.clientHeight + 40 &&
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay')
    );
  }

  function getScrollContainer() {
    // Gemini uses different scroll containers across layouts/versions.
    // Start from an actual message and walk upward so we pick the container
    // that really owns the conversation scroll position.
    const message =
      document.querySelector(
        'user-query, model-response, .user-query, .model-response, [data-test-id="user-query"], [data-test-id="model-response"]'
      );

    let node = message;
    while (node && node !== document.body) {
      if (isScrollableElement(node)) return node;
      node = node.parentElement;
    }

    // Fallback: find the largest visible scrollable element.
    const candidates = [...document.querySelectorAll('main, [role="main"], div, section')];
    const scrollables = candidates.filter(isScrollableElement);

    if (scrollables.length) {
      scrollables.sort(
        (a, b) =>
          (b.scrollHeight - b.clientHeight) -
          (a.scrollHeight - a.clientHeight)
      );
      return scrollables[0];
    }

    return window;
  }

  function getMessageCount() {
    return document.querySelectorAll(
      'user-query, model-response, .user-query, .model-response, [data-test-id="user-query"], [data-test-id="model-response"]'
    ).length;
  }

  function getConversationSignature(container) {
    const isWindow = container === window;
    const scrollTop = isWindow
      ? window.scrollY
      : container.scrollTop;

    const scrollHeight = isWindow
      ? Math.max(
          document.documentElement.scrollHeight,
          document.body ? document.body.scrollHeight : 0
        )
      : container.scrollHeight;

    return {
      scrollTop,
      scrollHeight,
      messageCount: getMessageCount()
    };
  }

  function scrollContainerToTop(container) {
    if (container === window) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      window.scrollBy(0, -window.innerHeight);
      return;
    }

    container.scrollTo({ top: 0, behavior: 'auto' });
    container.scrollTop = 0;

    // Also send a wheel gesture. Some virtualized UIs react more reliably
    // to real scroll input than to a single scrollTop assignment.
    try {
      container.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -Math.max(500, container.clientHeight),
          deltaMode: 0,
          bubbles: true,
          cancelable: true
        })
      );
    } catch (_) {
      // Older/locked-down browsers may reject synthetic WheelEvent creation.
    }
  }

  function isAtTop(container) {
    const top = container === window ? window.scrollY : container.scrollTop;
    return top <= 8;
  }

  function updateScanStatus(progressFill, statusText, container, state) {
    const sig = getConversationSignature(container);
    const isWindow = container === window;
    const viewport = isWindow ? window.innerHeight : container.clientHeight;
    const remaining = Math.max(0, sig.scrollTop);
    const estimatedProgress =
      state.totalScrollDistance > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                (1 - remaining / state.totalScrollDistance) * 100
              )
            )
          )
        : isAtTop(container)
          ? 100
          : 0;

    if (progressFill) {
      progressFill.style.width = `${estimatedProgress}%`;
    }

    if (statusText) {
      statusText.innerText =
        `LOADING OLDER HISTORY... ${estimatedProgress}% • ${sig.messageCount} DOM NODES`;
    }

    state.lastSignature = sig;
    state.viewport = viewport;
  }

  async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getMessageElements() {
    const selectors = [
      'user-query',
      'model-response',
      '.user-query',
      '.model-response',
      '[data-test-id="user-query"]',
      '[data-test-id="model-response"]'
    ];

    const set = new Set();
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => set.add(el));
    }

    return [...set]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return ra.top - rb.top;
      });
  }

  function getMessageRole(el) {
    const tag = (el.tagName || '').toLowerCase();
    const cls = typeof el.className === 'string' ? el.className : '';
    const testId = el.getAttribute('data-test-id') || '';

    if (
      tag === 'user-query' ||
      cls.includes('user-query') ||
      testId === 'user-query'
    ) {
      return 'User';
    }

    if (
      tag === 'model-response' ||
      cls.includes('model-response') ||
      testId === 'model-response'
    ) {
      return 'Gemini';
    }

    return null;
  }

  function normalizeMessageText(text) {
    return (text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function fingerprintMessage(role, text) {
    const normalized = normalizeMessageText(text);
    // Long messages are common. A role + length + both ends keeps the key
    // compact while making accidental collisions very unlikely.
    return `${role}|${normalized.length}|${normalized.slice(0, 180)}|${normalized.slice(-180)}`;
  }

  function readVisibleMessageBatch() {
    const batch = [];
    const elements = getMessageElements();

    for (const el of elements) {
      const role = getMessageRole(el);
      if (!role) continue;

      const text = normalizeMessageText(el.innerText || el.textContent || '');
      if (!text) continue;

      batch.push({ role, text, key: fingerprintMessage(role, text) });
    }

    return batch;
  }

  function mergeOlderBatch(collected, seenKeys, batch) {
    // Scanning goes from newer -> older. Therefore newly discovered messages
    // in the current viewport are prepended. Already-seen overlap is ignored.
    const fresh = [];
    for (const msg of batch) {
      if (seenKeys.has(msg.key)) continue;
      seenKeys.add(msg.key);
      fresh.push({ role: msg.role, text: msg.text });
    }

    if (fresh.length) collected.unshift(...fresh);
    return fresh.length;
  }

  function findTopSentinel(container) {
    const elements = getMessageElements();
    if (!elements.length) return null;

    // When virtualization is active, the oldest loaded message becomes the
    // topmost visible message. Returning it gives us a useful DOM sentinel.
    return elements[0];
  }

  async function waitForDomToSettle(previousCount = null, previousHeight = null) {
    const timeout = 2600;
    const started = performance.now();
    let stableFrames = 0;
    let lastCount = previousCount ?? getMessageCount();
    let lastHeight = previousHeight ?? document.documentElement.scrollHeight;

    while (performance.now() - started < timeout) {
      await wait(180);
      const count = getMessageCount();
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0
      );

      if (count === lastCount && Math.abs(height - lastHeight) < 20) {
        stableFrames++;
        if (stableFrames >= 3) return;
      } else {
        stableFrames = 0;
        lastCount = count;
        lastHeight = height;
      }
    }
  }

  async function autoScrollAndLoad() {
    createScanOverlay();

    let container = getScrollContainer();
    let progressFill = document.getElementById('cyber-progress-fill');
    let statusText = document.getElementById('cyber-status-text');

    // Important: Gemini may virtualize message DOM nodes. Never depend on the
    // final DOM containing the entire conversation. We read every viewport and
    // keep the extracted messages in memory as we move upward.
    const MAX_ITERATIONS = 500;
    const STEP_RATIO = 0.72;          // overlap between scan windows
    const LOAD_WAIT_MS = 650;
    const TOP_STABLE_PASSES = 6;

    const collected = [];
    const seenKeys = new Set();
    let stableTopPasses = 0;
    let noMovementPasses = 0;
    let lastTopSignature = '';
    let totalDistanceEstimate = Math.max(
      1,
      container === window
        ? Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)
        : container.scrollHeight
    );
    let lastScrollTop = container === window ? window.scrollY : container.scrollTop;

    // Start by recording whatever the user can currently see. This is crucial
    // when the conversation is already partially scrolled.
    let initialBatch = readVisibleMessageBatch();
    mergeOlderBatch(collected, seenKeys, initialBatch);

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const refreshed = getScrollContainer();
      if (refreshed !== container) {
        container = refreshed;
        progressFill = document.getElementById('cyber-progress-fill');
        statusText = document.getElementById('cyber-status-text');
        lastScrollTop = container === window ? window.scrollY : container.scrollTop;
      }

      const isWindow = container === window;
      const viewport = isWindow ? window.innerHeight : container.clientHeight;
      const currentTop = isWindow ? window.scrollY : container.scrollTop;
      const currentHeight = isWindow
        ? Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)
        : container.scrollHeight;

      totalDistanceEstimate = Math.max(totalDistanceEstimate, currentHeight);

      // Read BEFORE moving, then move only one viewport-ish step. This avoids
      // jumping past virtualized/lazy-loaded sections.
      const beforeBatch = readVisibleMessageBatch();
      mergeOlderBatch(collected, seenKeys, beforeBatch);

      const atTopBefore = currentTop <= 12;
      if (atTopBefore) {
        const oldest = findTopSentinel(container);
        const oldestText = oldest
          ? normalizeMessageText(oldest.innerText || oldest.textContent || '')
          : '';
        const topSignature = `${Math.round(currentTop)}|${getMessageCount()}|${oldestText.slice(0, 120)}`;

        if (topSignature === lastTopSignature) {
          stableTopPasses++;
        } else {
          stableTopPasses = 0;
          lastTopSignature = topSignature;
        }

        if (statusText) {
          statusText.innerText =
            `READING HISTORY... ${collected.length} MESSAGES • TOP CHECK ${stableTopPasses}/${TOP_STABLE_PASSES}`;
        }

        if (stableTopPasses >= TOP_STABLE_PASSES) {
          if (progressFill) progressFill.style.width = '100%';
          if (statusText) {
            statusText.innerText = `FULL HISTORY CAPTURED • ${collected.length} MESSAGES`;
          }
          await wait(500);
          removeScanOverlay();
          return collected;
        }

        // A direct top nudge can trigger another lazy-load cycle in some
        // Gemini layouts even though scrollTop is already zero.
        if (isWindow) {
          window.scrollBy(0, -Math.max(120, Math.floor(viewport * 0.35)));
        } else {
          container.scrollBy({ top: -Math.max(120, Math.floor(viewport * 0.35)), behavior: 'auto' });
        }
        await wait(LOAD_WAIT_MS);
        await waitForDomToSettle();
        continue;
      }

      const step = Math.max(160, Math.floor(viewport * STEP_RATIO));
      const target = Math.max(0, currentTop - step);

      if (isWindow) {
        window.scrollTo({ top: target, behavior: 'auto' });
      } else {
        container.scrollTo({ top: target, behavior: 'auto' });
        container.scrollTop = target;
      }

      await wait(LOAD_WAIT_MS);
      await waitForDomToSettle();

      const afterContainer = getScrollContainer();
      if (afterContainer !== container) container = afterContainer;

      const afterTop = container === window ? window.scrollY : container.scrollTop;
      const afterHeight = container === window
        ? Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)
        : container.scrollHeight;

      const afterBatch = readVisibleMessageBatch();
      const added = mergeOlderBatch(collected, seenKeys, afterBatch);

      if (added === 0 && Math.abs(afterTop - lastScrollTop) < 8) {
        noMovementPasses++;
      } else {
        noMovementPasses = 0;
      }

      lastScrollTop = afterTop;
      totalDistanceEstimate = Math.max(totalDistanceEstimate, afterHeight);

      const progress = totalDistanceEstimate > 0
        ? Math.max(0, Math.min(100, Math.round((1 - afterTop / totalDistanceEstimate) * 100)))
        : 0;

      if (progressFill) progressFill.style.width = `${progress}%`;
      if (statusText) {
        statusText.innerText =
          `READING HISTORY... ${progress}% • ${collected.length} MESSAGES • SCAN ${iteration + 1}`;
      }

      // If the page refuses to move because of a transient UI state, retry
      // several times instead of silently exporting a partial conversation.
      if (noMovementPasses >= 8) {
        const force = Math.max(220, Math.floor(viewport * 0.9));
        if (container === window) {
          window.scrollBy(0, -force);
        } else {
          container.scrollBy({ top: -force, behavior: 'auto' });
        }
        await wait(1000);
        noMovementPasses = 0;
      }
    }

    // Never throw away what was captured. Return the assembled snapshot and
    // make the status explicit so the user knows it was a safety-limit finish.
    if (statusText) {
      statusText.innerText = `SCAN LIMIT REACHED • ${collected.length} MESSAGES CAPTURED`;
    }
    await wait(600);
    removeScanOverlay();
    return collected;
  }

  function parseGeminiMessages(capturedMessages = null) {
    if (Array.isArray(capturedMessages) && capturedMessages.length) {
      return capturedMessages.map((msg) => ({ role: msg.role, text: msg.text }));
    }

    // Fallback for pages where virtualization is disabled.
    const conversation = [];
    const elements = getMessageElements();

    if (elements.length) {
      for (const el of elements) {
        const role = getMessageRole(el);
        if (!role) continue;
        const text = normalizeMessageText(el.innerText || el.textContent || '');
        if (text) conversation.push({ role, text });
      }
      return conversation;
    }

    const fallbackBlocks = document.querySelectorAll('.query-text, .message-content, .markdown');
    fallbackBlocks.forEach((block) => {
      const text = normalizeMessageText(block.innerText || block.textContent || '');
      if (text) conversation.push({ role: 'Content', text });
    });
    return conversation;
  }

  function generateMarkdown(messages) {
    const timestamp = new Date().toLocaleString();
    let md = `# Gemini Chat History\n`;
    md += `**Exported at:** ${timestamp}\n\n`;
    md += `---\n\n`;

    messages.forEach((msg) => {
      if (msg.role === 'User') {
        md += `### 👤 User\n${msg.text}\n\n`;
      } else if (msg.role === 'Gemini') {
        md += `### 🤖 Gemini\n${msg.text}\n\n`;
      } else {
        md += `### 💬 ${msg.role}\n${msg.text}\n\n`;
      }
      md += `---\n\n`;
    });

    return md;
  }

  function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function startExportProcess() {
    if (isExporting) return;
    isExporting = true;

    try {
      const capturedMessages = await autoScrollAndLoad();
      const messages = parseGeminiMessages(capturedMessages);

      if (messages.length === 0) {
        alert('Không tìm thấy nội dung chat để xuất!');
      } else {
        const markdownContent = generateMarkdown(messages);
        const fileName = `Gemini_Chat_${new Date().toISOString().slice(0, 10)}.md`;
        downloadFile(markdownContent, fileName);
      }
    } catch (err) {
      alert('Lỗi xuất chat: ' + err.message);
    } finally {
      isExporting = false;
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_EXPORT') {
      startExportProcess().then(() => {
        sendResponse({ status: 'SUCCESS' });
      });
      return true;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCyberUI);
  } else {
    createCyberUI();
  }
})();