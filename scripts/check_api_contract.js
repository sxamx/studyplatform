const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const apiPath = path.join(root, 'frontend', 'functions', 'api', '[[path]].ts');
const source = fs.readFileSync(apiPath, 'utf8');

// These are state-changing endpoints invoked by visible controls in the web app.
// Keeping the contract next to the build prevents another local/Cloudflare API drift.
const requiredRoutes = [
  "path === '/auth/theme' && (method === 'PATCH' || method === 'PUT')",
  "path === '/courses' && method === 'POST'",
  "path.startsWith('/courses/') && path.endsWith('/enroll') && method === 'POST'",
  "/^\\/courses\\/[^/]+$/.test(path) && method === 'PUT'",
  "/^\\/courses\\/[^/]+$/.test(path) && method === 'DELETE'",
  "path === '/modules' && method === 'POST'",
  "/^\\/modules\\/[^/]+$/.test(path) && method === 'PUT'",
  "/^\\/modules\\/[^/]+$/.test(path) && method === 'DELETE'",
  "path === '/lessons' && method === 'POST'",
  "/^\\/lessons\\/[^/]+$/.test(path) && method === 'PUT'",
  "/^\\/lessons\\/[^/]+$/.test(path) && method === 'DELETE'",
  "path === '/upload/json' && method === 'POST'",
  "path.startsWith('/marketplace/courses/') && path.endsWith('/buy') && method === 'POST'",
  "path.startsWith('/marketplace/courses/') && path.endsWith('/reviews') && method === 'POST'",
  "path === '/progress' && method === 'POST'",
  "path === '/preferences/status' && method === 'POST'",
  "path.startsWith('/admin/users/') && path.endsWith('/role') && method === 'PATCH'",
  "path.startsWith('/admin/users/') && path.endsWith('/status') && method === 'PATCH'",
  "path.startsWith('/admin/users/') && path.endsWith('/ai-access') && method === 'PATCH'",
  "path === '/creator/apply' && method === 'POST'",
  "path === '/creator/application/messages' && method === 'POST'",
  "path.startsWith('/courses/') && path.endsWith('/collaborators/invite') && method === 'POST'",
  "path.startsWith('/courses/') && path.includes('/collaborators/') && method === 'DELETE'",
  "path.startsWith('/creator/invitations/') && path.endsWith('/respond') && method === 'POST'",
  "path.startsWith('/creator/courses/') && path.endsWith('/request-review') && method === 'POST'",
  "path.startsWith('/admin/course-reviews/') && path.endsWith('/decision') && method === 'PATCH'",
  "path.startsWith('/notifications/') && path.endsWith('/read') && method === 'PATCH'",
  "path === '/notifications/read-all' && method === 'PATCH'",
  "path === '/notifications/preferences' && method === 'PUT'",
  "path.startsWith('/ai/courses/') && path.endsWith('/chat') && method === 'POST'",
  "path === '/admin/ai-config' && method === 'PUT'",
];

const normalizedSource = source.replace(/\s+/g, ' ');
const missing = requiredRoutes.filter((condition) => !normalizedSource.includes(condition));

if (missing.length > 0) {
  console.error('Cloudflare API contract is missing visible UI actions:');
  for (const condition of missing) console.error(`- ${condition}`);
  process.exit(1);
}

console.log(`Cloudflare API contract OK (${requiredRoutes.length} state-changing routes checked).`);
