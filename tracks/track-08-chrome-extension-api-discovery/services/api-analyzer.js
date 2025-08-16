/**
 * API Analyzer Library
 * Analyzes discovered APIs to identify patterns and generate insights
 */

// Analyze API patterns and group related endpoints
export function analyzeAPIPatterns(apis) {
    const analysis = {
        baseUrls: extractBaseUrls(apis),
        pathPatterns: analyzePathPatterns(apis),
        methodUsage: analyzeMethodUsage(apis),
        statusCodes: analyzeStatusCodes(apis),
        authentication: detectAuthentication(apis),
        rateLimiting: detectRateLimiting(apis),
        versioning: detectVersioning(apis),
        groups: groupRelatedAPIs(apis)
    };
    
    return analysis;
}

// Extract base URLs from discovered APIs
function extractBaseUrls(apis) {
    const baseUrls = new Map();
    
    apis.forEach(api => {
        try {
            const url = new URL(api.url);
            const baseUrl = `${url.protocol}//${url.hostname}`;
            
            if (!baseUrls.has(baseUrl)) {
                baseUrls.set(baseUrl, {
                    url: baseUrl,
                    count: 0,
                    paths: new Set()
                });
            }
            
            const base = baseUrls.get(baseUrl);
            base.count++;
            base.paths.add(url.pathname);
        } catch (error) {
            console.log('Invalid URL:', api.url);
        }
    });
    
    return Array.from(baseUrls.values()).map(base => ({
        ...base,
        paths: Array.from(base.paths)
    }));
}

// Analyze path patterns to identify API structure
function analyzePathPatterns(apis) {
    const patterns = new Map();
    
    apis.forEach(api => {
        try {
            const url = new URL(api.url);
            const path = url.pathname;
            
            // Extract path segments
            const segments = path.split('/').filter(segment => segment.length > 0);
            
            // Identify common patterns
            if (segments.length >= 2) {
                // Check for REST patterns like /api/v1/users/{id}
                const pattern = segments.map((segment, index) => {
                    if (segment.match(/^[0-9a-f]{8,}$/i) || segment.match(/^\d+$/)) {
                        return '{id}';
                    }
                    if (segment.match(/^v\d+$/)) {
                        return '{version}';
                    }
                    return segment;
                }).join('/');
                
                if (!patterns.has(pattern)) {
                    patterns.set(pattern, {
                        pattern,
                        count: 0,
                        methods: new Set(),
                        examples: []
                    });
                }
                
                const patternInfo = patterns.get(pattern);
                patternInfo.count++;
                patternInfo.methods.add(api.method);
                patternInfo.examples.push(path);
            }
        } catch (error) {
            console.log('Error analyzing path pattern:', error);
        }
    });
    
    return Array.from(patterns.values()).map(pattern => ({
        ...pattern,
        methods: Array.from(pattern.methods),
        examples: pattern.examples.slice(0, 3) // Keep only first 3 examples
    }));
}

// Analyze HTTP method usage
function analyzeMethodUsage(apis) {
    const methods = new Map();
    
    apis.forEach(api => {
        const method = api.method.toUpperCase();
        
        if (!methods.has(method)) {
            methods.set(method, {
                method,
                count: 0,
                successRate: 0,
                successCount: 0,
                totalCount: 0
            });
        }
        
        const methodInfo = methods.get(method);
        methodInfo.count++;
        methodInfo.totalCount++;
        
        if (api.statusCode >= 200 && api.statusCode < 300) {
            methodInfo.successCount++;
        }
    });
    
    // Calculate success rates
    methods.forEach(methodInfo => {
        methodInfo.successRate = (methodInfo.successCount / methodInfo.totalCount) * 100;
    });
    
    return Array.from(methods.values());
}

// Analyze status codes
function analyzeStatusCodes(apis) {
    const statusCodes = new Map();
    
    apis.forEach(api => {
        const status = api.statusCode;
        
        if (!statusCodes.has(status)) {
            statusCodes.set(status, {
                status: status,
                count: 0,
                methods: new Set(),
                urls: []
            });
        }
        
        const statusInfo = statusCodes.get(status);
        statusInfo.count++;
        statusInfo.methods.add(api.method);
        statusInfo.urls.push(api.url);
    });
    
    return Array.from(statusCodes.values()).map(status => ({
        ...status,
        methods: Array.from(status.methods),
        urls: status.urls.slice(0, 5) // Keep only first 5 examples
    }));
}

// Detect authentication patterns
function detectAuthentication(apis) {
    const authPatterns = {
        bearer: 0,
        apiKey: 0,
        basic: 0,
        oauth: 0,
        none: 0
    };
    
    apis.forEach(api => {
        const headers = api.requestHeaders || [];
        
        // Check for common auth headers
        const authHeader = headers.find(h => 
            h.name.toLowerCase() === 'authorization'
        );
        
        if (authHeader) {
            const value = authHeader.value.toLowerCase();
            
            if (value.startsWith('bearer ')) {
                authPatterns.bearer++;
            } else if (value.startsWith('basic ')) {
                authPatterns.basic++;
            } else {
                authPatterns.oauth++;
            }
        } else {
            // Check for API key patterns
            const hasApiKey = headers.some(h => 
                h.name.toLowerCase().includes('key') ||
                h.name.toLowerCase().includes('token') ||
                h.name.toLowerCase().includes('auth')
            );
            
            if (hasApiKey) {
                authPatterns.apiKey++;
            } else {
                authPatterns.none++;
            }
        }
    });
    
    return authPatterns;
}

// Detect rate limiting patterns
function detectRateLimiting(apis) {
    const rateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset',
        'retry-after'
    ];
    
    let hasRateLimiting = false;
    const rateLimitInfo = {};
    
    apis.forEach(api => {
        const headers = api.responseHeaders || [];
        
        rateLimitHeaders.forEach(headerName => {
            const header = headers.find(h => 
                h.name.toLowerCase() === headerName
            );
            
            if (header) {
                hasRateLimiting = true;
                rateLimitInfo[headerName] = header.value;
            }
        });
    });
    
    return {
        hasRateLimiting,
        headers: rateLimitInfo
    };
}

// Detect API versioning patterns
function detectVersioning(apis) {
    const versionPatterns = {
        urlPath: 0,    // /api/v1/
        header: 0,     // Accept: application/vnd.api+json;version=1
        queryParam: 0, // ?version=1
        none: 0
    };
    
    apis.forEach(api => {
        const url = api.url.toLowerCase();
        const headers = api.requestHeaders || [];
        
        // Check URL path versioning
        if (url.includes('/v1/') || url.includes('/v2/') || url.includes('/v3/')) {
            versionPatterns.urlPath++;
        }
        // Check header versioning
        else if (headers.some(h => 
            h.name.toLowerCase().includes('version') ||
            h.value.toLowerCase().includes('version')
        )) {
            versionPatterns.header++;
        }
        // Check query parameter versioning
        else if (url.includes('version=') || url.includes('v=')) {
            versionPatterns.queryParam++;
        }
        else {
            versionPatterns.none++;
        }
    });
    
    return versionPatterns;
}

// Group related APIs by functionality
function groupRelatedAPIs(apis) {
    const groups = new Map();
    
    apis.forEach(api => {
        try {
            const url = new URL(api.url);
            const path = url.pathname;
            const segments = path.split('/').filter(segment => segment.length > 0);
            
            // Identify resource type from path
            let resourceType = 'unknown';
            
            if (segments.length > 0) {
                // Common resource patterns
                const resourcePatterns = [
                    'users', 'user', 'accounts', 'account',
                    'posts', 'post', 'articles', 'article',
                    'products', 'product', 'items', 'item',
                    'orders', 'order', 'transactions',
                    'comments', 'comment', 'reviews',
                    'files', 'file', 'uploads', 'media',
                    'search', 'query', 'filter'
                ];
                
                for (const pattern of resourcePatterns) {
                    if (segments.some(segment => segment.toLowerCase().includes(pattern))) {
                        resourceType = pattern;
                        break;
                    }
                }
            }
            
            if (!groups.has(resourceType)) {
                groups.set(resourceType, {
                    name: resourceType,
                    apis: [],
                    methods: new Set(),
                    baseUrls: new Set()
                });
            }
            
            const group = groups.get(resourceType);
            group.apis.push(api);
            group.methods.add(api.method);
            group.baseUrls.add(`${url.protocol}//${url.hostname}`);
        } catch (error) {
            console.log('Error grouping API:', error);
        }
    });
    
    return Array.from(groups.values()).map(group => ({
        ...group,
        methods: Array.from(group.methods),
        baseUrls: Array.from(group.baseUrls),
        count: group.apis.length
    }));
}

// Generate API insights and recommendations
export function generateInsights(analysis) {
    const insights = [];
    
    // Base URL insights
    if (analysis.baseUrls.length > 1) {
        insights.push({
            type: 'multiple_base_urls',
            message: `Found ${analysis.baseUrls.length} different base URLs`,
            severity: 'info'
        });
    }
    
    // Method usage insights
    const methodUsage = analysis.methodUsage;
    const getRequests = methodUsage.find(m => m.method === 'GET');
    const postRequests = methodUsage.find(m => m.method === 'POST');
    
    if (getRequests && getRequests.successRate < 80) {
        insights.push({
            type: 'low_get_success_rate',
            message: `GET requests have ${getRequests.successRate.toFixed(1)}% success rate`,
            severity: 'warning'
        });
    }
    
    if (postRequests && postRequests.successRate < 70) {
        insights.push({
            type: 'low_post_success_rate',
            message: `POST requests have ${postRequests.successRate.toFixed(1)}% success rate`,
            severity: 'warning'
        });
    }
    
    // Authentication insights
    const auth = analysis.authentication;
    if (auth.none > auth.bearer + auth.apiKey + auth.basic) {
        insights.push({
            type: 'no_authentication',
            message: 'Most APIs don\'t require authentication',
            severity: 'info'
        });
    }
    
    // Rate limiting insights
    if (analysis.rateLimiting.hasRateLimiting) {
        insights.push({
            type: 'rate_limiting_detected',
            message: 'API implements rate limiting',
            severity: 'info'
        });
    }
    
    // Versioning insights
    const versioning = analysis.versioning;
    if (versioning.urlPath > 0) {
        insights.push({
            type: 'url_versioning',
            message: 'API uses URL path versioning',
            severity: 'info'
        });
    }
    
    return insights;
}

// Validate API data structure
export function validateAPI(api) {
    const errors = [];
    
    if (!api.method) {
        errors.push('Missing HTTP method');
    }
    
    if (!api.url) {
        errors.push('Missing URL');
    } else {
        try {
            new URL(api.url);
        } catch (error) {
            errors.push('Invalid URL format');
        }
    }
    
    if (!api.statusCode) {
        errors.push('Missing status code');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
