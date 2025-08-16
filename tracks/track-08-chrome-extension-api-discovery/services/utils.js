/**
 * Utility Functions for API Discovery Extension
 * Common helper functions used across the extension
 */

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function to limit function calls
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function calls
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format bytes to human readable format
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format timestamp to readable format
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Truncate text to specified length
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Extract domain from URL
export function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return 'unknown';
    }
}

// Extract path from URL
export function extractPath(url) {
    try {
        return new URL(url).pathname;
    } catch (error) {
        return '/';
    }
}

// Check if URL is likely an API endpoint
export function isLikelyAPI(url) {
    const apiIndicators = [
        '/api/',
        '/rest/',
        '/graphql',
        '/v1/',
        '/v2/',
        '/v3/',
        'application/json',
        'application/xml'
    ];
    
    return apiIndicators.some(indicator => url.toLowerCase().includes(indicator));
}

// Check if content type is JSON
export function isJSONContentType(contentType) {
    return contentType && contentType.toLowerCase().includes('application/json');
}

// Check if content type is XML
export function isXMLContentType(contentType) {
    return contentType && (
        contentType.toLowerCase().includes('application/xml') ||
        contentType.toLowerCase().includes('text/xml')
    );
}

// Parse JSON safely
export function safeJSONParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
}

// Deep clone object
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// Merge objects deeply
export function deepMerge(target, source) {
    const result = deepClone(target);
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

// Generate color from string (for consistent coloring)
export function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    return colors[Math.abs(hash) % colors.length];
}

// Validate URL format
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

// Get HTTP method color
export function getMethodColor(method) {
    const colors = {
        GET: '#61affe',
        POST: '#49cc90',
        PUT: '#fca130',
        DELETE: '#f93e3e',
        PATCH: '#50e3c2',
        HEAD: '#9012fe',
        OPTIONS: '#0d5aa7'
    };
    
    return colors[method.toUpperCase()] || '#999999';
}

// Get status code color
export function getStatusCodeColor(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return '#49cc90';
    if (statusCode >= 300 && statusCode < 400) return '#fca130';
    if (statusCode >= 400 && statusCode < 500) return '#f93e3e';
    if (statusCode >= 500) return '#f93e3e';
    return '#999999';
}

// Sleep function for async operations
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(delay * Math.pow(2, i));
        }
    }
}

// Generate random string
export function randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Check if browser supports required APIs
export function checkBrowserSupport() {
    const support = {
        webRequest: typeof chrome !== 'undefined' && chrome.webRequest,
        storage: typeof chrome !== 'undefined' && chrome.storage,
        tabs: typeof chrome !== 'undefined' && chrome.tabs,
        runtime: typeof chrome !== 'undefined' && chrome.runtime
    };
    
    return {
        supported: Object.values(support).every(Boolean),
        details: support
    };
}

// Log with timestamp
export function logWithTimestamp(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        case 'debug':
            console.debug(logMessage);
            break;
        default:
            console.log(logMessage);
    }
}

// Create download link
export function createDownloadLink(content, filename, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Copy text to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// Sanitize HTML
export function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Escape HTML
export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Unescape HTML
export function unescapeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
}
