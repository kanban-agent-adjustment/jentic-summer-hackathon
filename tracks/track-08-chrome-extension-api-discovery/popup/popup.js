/**
 * Popup Script for API Discovery Extension
 * Controls API discovery and displays results
 */

// DOM elements
let startButton, stopButton, apiList, status, progress, exportButton, clearButton;
let currentTabId = null;
let isDiscoveryActive = false;
let discoveredAPIs = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Popup loaded - initializing...');
    
    // Get DOM elements
    startButton = document.getElementById('startDiscovery');
    stopButton = document.getElementById('stopDiscovery');
    apiList = document.getElementById('apiList');
    status = document.getElementById('status');
    progress = document.getElementById('progress');
    exportButton = document.getElementById('exportOpenAPI');
    clearButton = document.getElementById('clearResults');
    
    // Set up event listeners
    startButton.addEventListener('click', startDiscovery);
    stopButton.addEventListener('click', stopDiscovery);
    exportButton.addEventListener('click', exportOpenAPISpec);
    clearButton.addEventListener('click', clearResults);
    
    // Initialize UI
    initializePopup();
});

// Initialize popup state
async function initializePopup() {
    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTabId = tab.id;
        
        // Get current state from background script
        const response = await chrome.runtime.sendMessage({ action: 'getState' });
        
        if (response) {
            isDiscoveryActive = response.isDiscoveryActive;
            discoveredAPIs = response.discoveredAPIs || [];
            
            updateUI();
        }
        
        // Load saved results from storage
        const storage = await chrome.storage.local.get(['discoveredAPIs']);
        if (storage.discoveredAPIs && storage.discoveredAPIs.length > 0) {
            discoveredAPIs = storage.discoveredAPIs;
            updateAPIList(discoveredAPIs);
        }
        
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        showStatus('Failed to initialize extension', 'error');
    }
}

// Start API discovery
async function startDiscovery() {
    try {
        console.log('🚀 Starting API discovery...');
        
        const response = await chrome.runtime.sendMessage({
            action: 'startDiscovery',
            tabId: currentTabId
        });
        
        if (response && response.success) {
            isDiscoveryActive = true;
            discoveredAPIs = [];
            updateUI();
            showStatus('API discovery started! Navigate and interact with the page', 'success');
        } else {
            showStatus('Failed to start discovery', 'error');
        }
        
    } catch (error) {
        console.error('Failed to start discovery:', error);
        showStatus('Failed to start discovery', 'error');
    }
}

// Stop API discovery
async function stopDiscovery() {
    try {
        console.log('⏹️ Stopping API discovery...');
        
        const response = await chrome.runtime.sendMessage({
            action: 'stopDiscovery'
        });
        
        if (response && response.success) {
            isDiscoveryActive = false;
            updateUI();
            showStatus(`Discovery stopped. Found ${discoveredAPIs.length} APIs`, 'info');
        } else {
            showStatus('Failed to stop discovery', 'error');
        }
        
    } catch (error) {
        console.error('Failed to stop discovery:', error);
        showStatus('Failed to stop discovery', 'error');
    }
}

// Update API list display
function updateAPIList(apis) {
    console.log('📋 Updating API list with', apis.length, 'APIs');
    
    // Clear current list
    apiList.innerHTML = '';
    
    if (apis.length === 0) {
        // Show empty state
        apiList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📡</span>
                <p>No APIs discovered yet</p>
                <p class="empty-hint">Start discovery to capture API calls</p>
            </div>
        `;
        return;
    }
    
    // Create API items
    apis.forEach(api => {
        const apiItem = createAPIItem(api);
        apiList.appendChild(apiItem);
    });
    
    // Update progress
    updateProgress(apis.length);
}

// Create API item element
function createAPIItem(api) {
    const item = document.createElement('div');
    item.className = 'api-item';
    
    const methodClass = api.method.toLowerCase();
    const statusClass = api.statusCode >= 200 && api.statusCode < 300 ? 'success' : 'error';
    
    item.innerHTML = `
        <div class="api-header">
            <span class="api-method ${methodClass}">${api.method}</span>
            <span class="api-status ${statusClass}">${api.statusCode}</span>
            <span class="api-count">${api.count || 1}x</span>
        </div>
        <div class="api-url">${truncateURL(api.url)}</div>
        <div class="api-meta">
            <span class="api-hostname">${api.hostname}</span>
            <span class="api-path">${api.path}</span>
        </div>
    `;
    
    // Add click handler to show details
    item.addEventListener('click', () => showAPIDetails(api));
    
    return item;
}

// Show API details in a modal or expand the item
function showAPIDetails(api) {
    console.log('🔍 API Details:', api);
    
    // For now, just log to console
    // In a full implementation, you could show a modal with full details
    alert(`API Details:\n\nMethod: ${api.method}\nURL: ${api.url}\nStatus: ${api.statusCode}\nHostname: ${api.hostname}\nPath: ${api.path}\nCount: ${api.count || 1}`);
}

// Update progress bar
function updateProgress(count) {
    const progressFill = progress.querySelector('.progress-fill');
    const progressText = progress.querySelector('.progress-text');
    
    // Simple progress calculation (could be more sophisticated)
    const percentage = Math.min(count * 10, 100);
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${count} requests captured`;
    
    if (count > 0) {
        progress.classList.remove('hidden');
    }
}

// Export OpenAPI specification
async function exportOpenAPISpec() {
    try {
        console.log('📄 Exporting OpenAPI specification...');
        
        showStatus('Generating OpenAPI specification...', 'info');
        
        const response = await chrome.runtime.sendMessage({
            action: 'generateOpenAPI'
        });
        
        if (response && response.success && response.spec) {
            // Download the specification
            downloadFile(response.spec, 'openapi-spec.json');
            showStatus('OpenAPI specification exported successfully!', 'success');
        } else {
            showStatus(response?.error || 'Failed to generate specification', 'error');
        }
        
    } catch (error) {
        console.error('Failed to export OpenAPI spec:', error);
        showStatus('Failed to export specification', 'error');
    }
}

// Clear all results
async function clearResults() {
    try {
        console.log('🗑️ Clearing results...');
        
        const response = await chrome.runtime.sendMessage({
            action: 'clearResults'
        });
        
        if (response && response.success) {
            discoveredAPIs = [];
            updateAPIList([]);
            updateUI();
            showStatus('Results cleared', 'info');
        } else {
            showStatus('Failed to clear results', 'error');
        }
        
    } catch (error) {
        console.error('Failed to clear results:', error);
        showStatus('Failed to clear results', 'error');
    }
}

// Update UI based on current state
function updateUI() {
    // Update button states
    startButton.disabled = isDiscoveryActive;
    stopButton.disabled = !isDiscoveryActive;
    exportButton.disabled = discoveredAPIs.length === 0;
    clearButton.disabled = discoveredAPIs.length === 0;
    
    // Update status
    if (isDiscoveryActive) {
        status.innerHTML = `
            <span class="status-icon">🔍</span>
            <span class="status-text">Discovering APIs...</span>
        `;
        progress.classList.remove('hidden');
    } else {
        status.innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text">Ready to discover APIs</span>
        `;
        progress.classList.add('hidden');
    }
    
    // Update API list
    updateAPIList(discoveredAPIs);
}

// Handle messages from background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('📨 Popup received message:', message);
    
    switch (message.action) {
        case 'apiDiscovered':
            // Add new API to list
            if (message.api) {
                const existingIndex = discoveredAPIs.findIndex(api => 
                    api.method === message.api.method && api.url === message.api.url
                );
                
                if (existingIndex >= 0) {
                    discoveredAPIs[existingIndex] = message.api;
                } else {
                    discoveredAPIs.push(message.api);
                }
                
                updateAPIList(discoveredAPIs);
            }
            break;
            
        case 'discoveryStatus':
            // Update discovery status
            isDiscoveryActive = message.isActive;
            updateUI();
            break;
            
        case 'resultsCleared':
            // Handle results cleared
            discoveredAPIs = [];
            updateUI();
            break;
            
        default:
            console.log('Unknown message action:', message.action);
    }
});

// Utility functions

function showStatus(message, type = 'info') {
    console.log(`Status (${type}):`, message);
    
    // Update status text
    const statusText = status.querySelector('.status-text');
    statusText.textContent = message;
    
    // Update status icon based on type
    const statusIcon = status.querySelector('.status-icon');
    switch (type) {
        case 'success':
            statusIcon.textContent = '✅';
            break;
        case 'error':
            statusIcon.textContent = '❌';
            break;
        case 'warning':
            statusIcon.textContent = '⚠️';
            break;
        default:
            statusIcon.textContent = '⏳';
    }
    
    // Auto-clear status after 3 seconds
    setTimeout(() => {
        if (statusText.textContent === message) {
            updateUI(); // Reset to default status
        }
    }, 3000);
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function truncateURL(url, maxLength = 60) {
    if (url.length <= maxLength) return url;
    
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const search = urlObj.search;
    
    if (path.length > maxLength - 10) {
        return `${urlObj.origin}${path.substring(0, maxLength - 10)}...`;
    }
    
    return `${urlObj.origin}${path}${search}`;
}