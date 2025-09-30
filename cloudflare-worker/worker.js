// Personal URL Shortener - Cloudflare Worker
// 請將 go.yourdomain.com 替換成你的實際網域
// 需要設定環境變數:
// - API_SECRET: 你的 API 密鑰
// - LINKS: KV 命名空間綁定

// URL Shortener Worker for go.yourdomain.com
// Version: 0.2 - With API Secret Protection


export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Strict CORS headers - only allow specific origins
      const allowedOrigins = [
        'https://docs.google.com',
        'https://script.google.com'
      ];
      
      const origin = request.headers.get('Origin');
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Secret',
      };
      
      // Handle OPTIONS (preflight)
      if (request.method === 'OPTIONS') {
        return new Response(null, { 
          status: 204,
          headers: corsHeaders 
        });
      }
      
      // API: Create short URL (protected)
      if (path === '/api/shorten' && request.method === 'POST') {
        return handleShorten(request, env, corsHeaders);
      }
      
      // API: Sync config (protected)
      if (path === '/api/config' && request.method === 'POST') {
        return handleConfig(request, env, corsHeaders);
      }
      
      // API: Check if alias exists (protected)
      if (path === '/api/exists' && request.method === 'GET') {
        return handleExists(request, env, corsHeaders);
      }
      
      // API: Disable short URL (protected)
      if (path === '/api/disable' && request.method === 'POST') {
        return handleDisable(request, env, corsHeaders);
      }
      
      // Redirect: /:code (public)
      if (path.length > 1 && !path.startsWith('/api/')) {
        return handleRedirect(path.slice(1), env);
      }
      
      // Default response
      return new Response('URL Shortener API', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  };
  
  // Verify API Secret
  function verifyApiSecret(request, env) {
    const apiSecret = request.headers.get('X-API-Secret');
    return apiSecret === env.API_SECRET;
  }
  
  // Create short URL
  async function handleShorten(request, env, corsHeaders) {
    // Check API Secret
    if (!verifyApiSecret(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }
    
    try {
      const body = await request.json();
      const { longUrl, alias, ttlDays = 0 } = body;
      
      if (!longUrl) {
        return jsonResponse({ error: 'longUrl is required' }, 400, corsHeaders);
      }
      
      // Validate URL
      try {
        new URL(longUrl);
      } catch {
        return jsonResponse({ error: 'Invalid URL format' }, 400, corsHeaders);
      }
      
      // Get config
      const config = await getConfig(env);
      
      // Generate or validate alias
      let code;
      if (alias) {
        const validation = validateAlias(alias, config);
        if (!validation.valid) {
          return jsonResponse({ error: validation.error }, 400, corsHeaders);
        }
        code = config.case_sensitive ? alias : alias.toLowerCase();
      } else {
        code = await generateCode(config.default_alias_length || 6, env);
      }
      
      // Check if code exists
      const existing = await env.LINKS.get(`links:${code}`);
      if (existing) {
        return jsonResponse({ error: 'Alias already exists' }, 409, corsHeaders);
      }
      
      // Create link object
      const linkData = {
        longUrl,
        createdAt: new Date().toISOString(),
        createdBy: 'api',
        disabled: false,
        clicks: 0
      };
      
      if (ttlDays > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + ttlDays);
        linkData.expiresAt = expiresAt.toISOString();
      }
      
      // Save to KV
      await env.LINKS.put(`links:${code}`, JSON.stringify(linkData));
      
      // Return short URL
      const shortUrl = `https://go.yourdomain.com/${code}`;
      
      return jsonResponse({
        shortUrl,
        code,
        longUrl,
        createdAt: linkData.createdAt
      }, 200, corsHeaders);
      
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
  
  // Handle redirect
  async function handleRedirect(code, env) {
    try {
      const data = await env.LINKS.get(`links:${code}`);
      
      if (!data) {
        return new Response('Short URL not found', { status: 404 });
      }
      
      const link = JSON.parse(data);
      
      // Check if disabled
      if (link.disabled) {
        return new Response('This short URL has been disabled', { status: 410 });
      }
      
      // Check if expired
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return new Response('This short URL has expired', { status: 410 });
      }
      
      // Update click count (fire and forget)
      link.clicks = (link.clicks || 0) + 1;
      env.LINKS.put(`links:${code}`, JSON.stringify(link));
      
      // Redirect
      return Response.redirect(link.longUrl, 302);
      
    } catch (error) {
      return new Response('Error processing redirect', { status: 500 });
    }
  }
  
  // Sync config
  async function handleConfig(request, env, corsHeaders) {
    // Check API Secret
    if (!verifyApiSecret(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }
    
    try {
      const config = await request.json();
      await env.LINKS.put('config', JSON.stringify(config));
      return jsonResponse({ success: true, message: 'Config synced' }, 200, corsHeaders);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
  
  // Check if alias exists
  async function handleExists(request, env, corsHeaders) {
    // Check API Secret
    if (!verifyApiSecret(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }
    
    try {
      const url = new URL(request.url);
      const alias = url.searchParams.get('alias');
      
      if (!alias) {
        return jsonResponse({ error: 'alias parameter required' }, 400, corsHeaders);
      }
      
      const config = await getConfig(env);
      const code = config.case_sensitive ? alias : alias.toLowerCase();
      const existing = await env.LINKS.get(`links:${code}`);
      
      return jsonResponse({ exists: !!existing }, 200, corsHeaders);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
  
  // Disable short URL
  async function handleDisable(request, env, corsHeaders) {
    // Check API Secret
    if (!verifyApiSecret(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }
    
    try {
      const { alias, reason } = await request.json();
      
      if (!alias) {
        return jsonResponse({ error: 'alias is required' }, 400, corsHeaders);
      }
      
      const data = await env.LINKS.get(`links:${alias}`);
      if (!data) {
        return jsonResponse({ error: 'Short URL not found' }, 404, corsHeaders);
      }
      
      const link = JSON.parse(data);
      link.disabled = true;
      link.disabledAt = new Date().toISOString();
      link.disabledReason = reason || '';
      
      await env.LINKS.put(`links:${alias}`, JSON.stringify(link));
      
      return jsonResponse({ success: true, message: 'Short URL disabled' }, 200, corsHeaders);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
  
  // Get config from KV or return defaults
  async function getConfig(env) {
    try {
      const configData = await env.LINKS.get('config');
      if (configData) {
        return JSON.parse(configData);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    
    // Default config
    return {
      alias_min_length: 4,
      alias_max_length: 12,
      default_alias_length: 6,
      allow_uppercase: false,
      case_sensitive: false,
      allowed_chars: 'abcdefghijklmnopqrstuvwxyz0123456789-',
      reserved_aliases: ['api', 'admin', 'login', 'logout', 'config', 'healthz', 'qr', 'p', 'preview', 'assets', 'static', 'robots.txt', 'sitemap.xml'],
      allow_custom_alias: true,
      default_ttl_days: 0,
      enable_preview: true
    };
  }
  
  // Validate alias
  function validateAlias(alias, config) {
    if (alias.length < config.alias_min_length || alias.length > config.alias_max_length) {
      return { valid: false, error: `Alias must be between ${config.alias_min_length} and ${config.alias_max_length} characters` };
    }
    
    const normalizedAlias = config.case_sensitive ? alias : alias.toLowerCase();
    
    if (config.reserved_aliases.includes(normalizedAlias)) {
      return { valid: false, error: 'This alias is reserved' };
    }
    
    const allowedCharsRegex = new RegExp(`^[${config.allowed_chars}]+$`);
    if (!allowedCharsRegex.test(normalizedAlias)) {
      return { valid: false, error: `Alias can only contain: ${config.allowed_chars}` };
    }
    
    return { valid: true };
  }
  
  // Generate random code
  async function generateCode(length, env) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code;
    let attempts = 0;
    
    do {
      code = '';
      for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      attempts++;
      
      if (attempts > 10) {
        length++;
        attempts = 0;
      }
      
    } while (await env.LINKS.get(`links:${code}`));
    
    return code;
  }
  
  // Helper: JSON response
  function jsonResponse(data, status = 200, corsHeaders = {}) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
