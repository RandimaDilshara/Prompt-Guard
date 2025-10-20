const sensitiveKeywords = [
  "password", "ssn", "social security", "credit card", "api key", "secret", 
  "token", "address", "email", "phone number", "bank account", "pin code",
  "passport", "driver's license", "ssn number", "credit card number"
];

// Enhanced regex patterns for better detection
const sensitivePatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/, // Phone number pattern
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
];

// Returns array of keyword matches with positions
function findSensitiveMatches(text) {
  const matches = [];
  
  // Check keywords
  for (const keyword of sensitiveKeywords) {
    let regex = new RegExp(`\\b${keyword}\\b`, "gi");
    let match;
    while ((match = regex.exec(text))) {
      matches.push({ 
        keyword, 
        start: match.index, 
        end: match.index + keyword.length,
        type: 'keyword'
      });
    }
  }
  
  // Check patterns
  for (const pattern of sensitivePatterns) {
    let match;
    while ((match = pattern.exec(text))) {
      matches.push({
        keyword: match[0],
        start: match.index,
        end: match.index + match[0].length,
        type: 'pattern'
      });
    }
  }
  
  return matches;
}

function showWarning(target) {
  if (document.getElementById('prompt-guard-warning')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'prompt-guard-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(26, 26, 46, 0.85);
    backdrop-filter: blur(5px);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Create beautiful warning popup - CENTERED
  const warning = document.createElement('div');
  warning.id = 'prompt-guard-warning';
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #f5f5f5;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 32px 28px 28px 28px;
    z-index: 9999999;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    width: 420px;
    max-width: 90vw;
    text-align: center;
    backdrop-filter: blur(10px);
  `;

  warning.innerHTML = `
    <div style="
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #f8961e, #f72585);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(248, 150, 30, 0.3);
    ">
      <i class="fas fa-exclamation-triangle" style="font-size: 28px; color: white;"></i>
    </div>
    <div style="font-size: 24px; font-weight: 700; margin-bottom: 12px; background: linear-gradient(90deg, #f8961e, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      Sensitive Data Detected!
    </div>
    <div style="margin-bottom: 24px; line-height: 1.5; opacity: 0.9; font-size: 15px;">
      Please remove personal or confidential information from your prompt before submitting.
    </div>
    <button id="pg-dismiss" style="
      background: linear-gradient(90deg, #4361ee, #7209b7);
      color: white;
      border: none;
      padding: 12px 32px;
      cursor: pointer;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
      transition: all 0.3s ease;
      margin-top: 8px;
    ">
      OK, I'll fix it
    </button>
    <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
      <i class="fas fa-shield-alt" style="margin-right: 5px;"></i>
      Prompt Guard is protecting your privacy
    </div>
  `;

  // Add Font Awesome if not already present
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }

  document.body.appendChild(overlay);
  document.body.appendChild(warning);

  // Add hover effect to button
  const dismissBtn = document.getElementById('pg-dismiss');
  dismissBtn.onmouseenter = () => {
    dismissBtn.style.transform = 'translateY(-2px)';
    dismissBtn.style.boxShadow = '0 6px 15px rgba(67, 97, 238, 0.4)';
  };
  dismissBtn.onmouseleave = () => {
    dismissBtn.style.transform = 'translateY(0)';
    dismissBtn.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.3)';
  };

  // Style the target element
  target.style.border = "2px solid #f8961e";
  target.style.boxShadow = "0 0 0 3px rgba(248, 150, 30, 0.2)";
  target.disabled = true;

  // Dismiss button functionality
  dismissBtn.onclick = () => {
    // Add fade-out animation
    warning.style.opacity = '0';
    warning.style.transform = 'translate(-50%, -50%) scale(0.9)';
    warning.style.transition = 'all 0.3s ease';
    
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      warning.remove();
      overlay.remove();
      target.style.border = "";
      target.style.boxShadow = "";
      target.disabled = false;
      target.dataset.pgSuppressed = "true";
      underlineSensitive(target);
    }, 300);
  };

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      dismissBtn.click();
    }
  };

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      dismissBtn.click();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function underlineSensitive(target) {
  // For <div contenteditable>
  if (target.tagName === "DIV" && target.isContentEditable) {
    let text = target.innerText || target.textContent;
    let matches = findSensitiveMatches(text);
    if (matches.length === 0) return;

    let newHtml = "";
    let lastIndex = 0;
    matches.sort((a, b) => a.start - b.start);
    for (let m of matches) {
      newHtml += escapeHtml(text.substring(lastIndex, m.start));
      newHtml += `<span style="
        text-decoration: underline; 
        text-decoration-color: #f8961e; 
        text-decoration-thickness: 3px;
        background: rgba(248, 150, 30, 0.1);
        padding: 1px 2px;
        border-radius: 3px;
        color: inherit;
      ">${escapeHtml(text.substring(m.start, m.end))}</span>`;
      lastIndex = m.end;
    }
    newHtml += escapeHtml(text.substring(lastIndex));
    target.innerHTML = newHtml;
  } 
  // For <textarea> and <input>, use overlay with only underline style
  else if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
    let prev = document.getElementById("pg-underline-overlay");
    if (prev) prev.remove();

    let value = target.value;
    let matches = findSensitiveMatches(value);
    if (matches.length === 0) return;

    const rect = target.getBoundingClientRect();
    const overlay = document.createElement("div");
    overlay.id = "pg-underline-overlay";
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 99997;
      font: ${window.getComputedStyle(target).font};
      white-space: pre-wrap;
      background: none;
      color: transparent;
      overflow: hidden;
      line-height: ${window.getComputedStyle(target).lineHeight};
      padding: ${window.getComputedStyle(target).padding};
    `;

    let underlined = "";
    let lastIndex = 0;
    matches.sort((a, b) => a.start - b.start);
    for (let m of matches) {
      underlined += escapeHtml(value.substring(lastIndex, m.start));
      underlined += `<span style="
        text-decoration: underline; 
        text-decoration-color: #f8961e; 
        text-decoration-thickness: 3px;
        color: black;
        background: rgba(248, 150, 30, 0.1);
      ">${escapeHtml(value.substring(m.start, m.end))}</span>`;
      lastIndex = m.end;
    }
    underlined += escapeHtml(value.substring(lastIndex));

    overlay.innerHTML = `<div style="padding: ${target.tagName === "TEXTAREA" ? "2px" : "0"};">${underlined}</div>`;

    document.body.appendChild(overlay);

    function repositionOverlay() {
      const rect = target.getBoundingClientRect();
      overlay.style.left = rect.left + window.scrollX + "px";
      overlay.style.top = rect.top + window.scrollY + "px";
      overlay.style.width = rect.width + "px";
      overlay.style.height = rect.height + "px";
    }
    
    window.addEventListener("scroll", repositionOverlay);
    window.addEventListener("resize", repositionOverlay);
    
    target.addEventListener("input", () => {
      let value = target.value;
      let matches = findSensitiveMatches(value);
      if (matches.length === 0) {
        overlay.remove();
        return;
      }
      let underlined = "";
      let lastIndex = 0;
      matches.sort((a, b) => a.start - b.start);
      for (let m of matches) {
        underlined += escapeHtml(value.substring(lastIndex, m.start));
        underlined += `<span style="
          text-decoration: underline; 
          text-decoration-color: #f8961e; 
          text-decoration-thickness: 3px;
          color: black;
          background: rgba(248, 150, 30, 0.1);
        ">${escapeHtml(value.substring(m.start, m.end))}</span>`;
        lastIndex = m.end;
      }
      underlined += escapeHtml(value.substring(lastIndex));
      overlay.innerHTML = `<div style="padding: ${target.tagName === "TEXTAREA" ? "2px" : "0"};">${underlined}</div>`;
    });
    
    target.addEventListener("blur", () => { 
      overlay.remove(); 
      window.removeEventListener("scroll", repositionOverlay);
      window.removeEventListener("resize", repositionOverlay);
    });
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[m];
  });
}

// Enhanced input detection for modern websites
function handleInputEvent(e) {
  const target = e.target;
  
  // Check if it's a text input element
  const isTextInput = 
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'INPUT' && (
      target.type === 'text' ||
      target.type === 'search' ||
      target.type === 'email' ||
      target.type === 'password' ||
      target.type === 'tel' ||
      target.type === 'url' ||
      !target.type // default is text
    ) ||
    (target.tagName === 'DIV' && target.isContentEditable) ||
    target.getAttribute('role') === 'textbox' ||
    target.classList.contains('gLFyf') || // Google search
    target.classList.contains('searchbox') || // YouTube search
    target.id === 'search' || // Common search ID
    target.name === 'q' || // Common search name
    target.placeholder?.toLowerCase().includes('search'); // Search placeholder

  if (!isTextInput) return;

  if (target.dataset.pgSuppressed === "true") {
    underlineSensitive(target);
    return;
  }
  
  const value = target.value || target.innerText || target.textContent;
  if (!value || value.trim().length === 0) {
    // Clean up if empty
    let warn = document.getElementById('prompt-guard-warning');
    let ovl = document.getElementById('prompt-guard-overlay');
    if (warn) warn.remove();
    if (ovl) ovl.remove();
    target.style.border = "";
    target.style.boxShadow = "";
    target.disabled = false;
    let underline = document.getElementById("pg-underline-overlay");
    if (underline) underline.remove();
    return;
  }

  if (findSensitiveMatches(value).length > 0) {
    showWarning(target);
  } else {
    let warn = document.getElementById('prompt-guard-warning');
    let ovl = document.getElementById('prompt-guard-overlay');
    if (warn) warn.remove();
    if (ovl) ovl.remove();
    target.style.border = "";
    target.style.boxShadow = "";
    target.disabled = false;
    let underline = document.getElementById("pg-underline-overlay");
    if (underline) underline.remove();
  }
}

// Enhanced event listeners
document.addEventListener('input', handleInputEvent, true);
document.addEventListener('change', handleInputEvent, true);
document.addEventListener('keyup', handleInputEvent, true);

// Handle dynamic content (for SPAs)
let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        // Reattach event listeners to new inputs
        const inputs = node.querySelectorAll ? node.querySelectorAll(`
          textarea, 
          input[type="text"], 
          input[type="search"], 
          input[type="email"],
          input[type="password"],
          input[type="tel"],
          input[type="url"],
          input:not([type]),
          [contenteditable="true"],
          [role="textbox"]
        `) : [];
        
        inputs.forEach(input => {
          input.addEventListener('input', handleInputEvent);
          input.addEventListener('change', handleInputEvent);
          input.addEventListener('keyup', handleInputEvent);
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initialize on existing inputs
document.addEventListener('DOMContentLoaded', () => {
  const existingInputs = document.querySelectorAll(`
    textarea, 
    input[type="text"], 
    input[type="search"], 
    input[type="email"],
    input[type="password"],
    input[type="tel"],
    input[type="url"],
    input:not([type]),
    [contenteditable="true"],
    [role="textbox"]
  `);
  
  existingInputs.forEach(input => {
    input.addEventListener('input', handleInputEvent);
    input.addEventListener('change', handleInputEvent);
    input.addEventListener('keyup', handleInputEvent);
  });
});

document.addEventListener('blur', (e) => {
  const target = e.target;
  const isTextInput = 
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'INPUT' ||
    (target.tagName === 'DIV' && target.isContentEditable) ||
    target.getAttribute('role') === 'textbox';
    
  if (isTextInput) {
    delete target.dataset.pgSuppressed;
    let underline = document.getElementById("pg-underline-overlay");
    if (underline) underline.remove();
  }
}, true);