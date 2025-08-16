/**
 * Content Script for API Discovery Extension
 * Observes user interactions and provides context for API discovery
 */

// Track user interactions
let userInteractions = [];
let isObserving = false;

// Initialize content script
console.log('🔍 API Discovery Content Script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Content script received message:', message);

  switch (message.action) {
    case 'startObserving':
      startObserving();
      sendResponse({ success: true });
      break;
      
    case 'stopObserving':
      stopObserving();
      sendResponse({ success: true });
      break;
      
    case 'getInteractions':
      sendResponse({ interactions: userInteractions });
      break;
      
    default:
      console.log('Unknown message action:', message.action);
  }
});

// Start observing user interactions
function startObserving() {
  if (isObserving) return;
  
  console.log('👀 Starting user interaction observation');
  isObserving = true;
  userInteractions = [];
  
  // Observe clicks
  document.addEventListener('click', handleUserInteraction, true);
  
  // Observe form submissions
  document.addEventListener('submit', handleFormSubmission, true);
  
  // Observe input changes
  document.addEventListener('input', handleInputChange, true);
  
  // Observe scroll events (for infinite scroll detection)
  document.addEventListener('scroll', handleScroll, true);
  
  // Observe URL changes (for SPA navigation)
  observeURLChanges();
}

// Stop observing user interactions
function stopObserving() {
  if (!isObserving) return;
  
  console.log('⏹️ Stopping user interaction observation');
  isObserving = false;
  
  // Remove event listeners
  document.removeEventListener('click', handleUserInteraction, true);
  document.removeEventListener('submit', handleFormSubmission, true);
  document.removeEventListener('input', handleInputChange, true);
  document.removeEventListener('scroll', handleScroll, true);
}

// Handle user clicks
function handleUserInteraction(event) {
  const target = event.target;
  const interaction = {
    type: 'click',
    timestamp: Date.now(),
    element: {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      textContent: target.textContent?.substring(0, 100),
      href: target.href,
      type: target.type
    },
    context: getPageContext()
  };
  
  userInteractions.push(interaction);
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'userInteraction',
    interaction
  }).catch(error => {
    console.log('Failed to send interaction to background:', error);
  });
}

// Handle form submissions
function handleFormSubmission(event) {
  const form = event.target;
  const interaction = {
    type: 'form_submit',
    timestamp: Date.now(),
    form: {
      action: form.action,
      method: form.method,
      id: form.id,
      className: form.className
    },
    inputs: Array.from(form.elements).map(input => ({
      name: input.name,
      type: input.type,
      value: input.type === 'password' ? '[HIDDEN]' : input.value?.substring(0, 50)
    })),
    context: getPageContext()
  };
  
  userInteractions.push(interaction);
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'userInteraction',
    interaction
  }).catch(error => {
    console.log('Failed to send form submission to background:', error);
  });
}

// Handle input changes (for search/filter detection)
function handleInputChange(event) {
  const target = event.target;
  
  // Only track significant inputs
  if (target.type === 'search' || 
      target.type === 'text' || 
      target.placeholder?.toLowerCase().includes('search') ||
      target.id?.toLowerCase().includes('search') ||
      target.className?.toLowerCase().includes('search')) {
    
    const interaction = {
      type: 'input_change',
      timestamp: Date.now(),
      input: {
        name: target.name,
        type: target.type,
        placeholder: target.placeholder,
        id: target.id,
        className: target.className,
        value: target.value?.substring(0, 50)
      },
      context: getPageContext()
    };
    
    userInteractions.push(interaction);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'userInteraction',
      interaction
    }).catch(error => {
      console.log('Failed to send input change to background:', error);
    });
  }
}

// Handle scroll events (for infinite scroll detection)
function handleScroll(event) {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  
  // Check if near bottom (potential infinite scroll)
  if (scrollHeight - scrollTop - clientHeight < 100) {
    const interaction = {
      type: 'scroll_bottom',
      timestamp: Date.now(),
      scroll: {
        scrollTop,
        scrollHeight,
        clientHeight
      },
      context: getPageContext()
    };
    
    userInteractions.push(interaction);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'userInteraction',
      interaction
    }).catch(error => {
      console.log('Failed to send scroll event to background:', error);
    });
  }
}

// Observe URL changes for SPA navigation
function observeURLChanges() {
  let currentURL = window.location.href;
  
  // Check for URL changes periodically
  setInterval(() => {
    if (window.location.href !== currentURL) {
      const interaction = {
        type: 'navigation',
        timestamp: Date.now(),
        navigation: {
          from: currentURL,
          to: window.location.href
        },
        context: getPageContext()
      };
      
      userInteractions.push(interaction);
      currentURL = window.location.href;
      
      // Notify background script
      chrome.runtime.sendMessage({
        action: 'userInteraction',
        interaction
      }).catch(error => {
        console.log('Failed to send navigation to background:', error);
      });
    }
  }, 1000);
}

// Get current page context
function getPageContext() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    pathname: window.location.pathname,
    search: window.location.search,
    timestamp: Date.now()
  };
}

// Intercept fetch requests to capture API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options = {}] = args;
  
  // Capture request details
  const requestInfo = {
    url: typeof url === 'string' ? url : url.url,
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body,
    timestamp: Date.now()
  };
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'fetchRequest',
    request: requestInfo
  }).catch(error => {
    console.log('Failed to send fetch request to background:', error);
  });
  
  // Execute original fetch
  return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest to capture API calls
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._apiDiscoveryMethod = method;
  this._apiDiscoveryUrl = url;
  return originalXHROpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(data) {
  if (this._apiDiscoveryUrl) {
    const requestInfo = {
      url: this._apiDiscoveryUrl,
      method: this._apiDiscoveryMethod,
      body: data,
      timestamp: Date.now()
    };
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'xhrRequest',
      request: requestInfo
    }).catch(error => {
      console.log('Failed to send XHR request to background:', error);
    });
  }
  
  return originalXHRSend.apply(this, [data]);
};

// Auto-start observing when content script loads
startObserving();
