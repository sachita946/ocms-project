import { Router } from 'express';
const router = Router();

// basic API root / health
router.get('/', (req, res) => res.json({ ok: true, message: 'API root' }));
router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// try to dynamically mount sub-routers if they exist (non-fatal if missing)
async function tryMount(relPath, mountPath) {
  try {
    const mod = await import(relPath);
    if (mod && mod.default) router.use(mountPath, mod.default);
  } catch (err) {
    // missing router file — ignore so server still starts
    // console.debug(`Router ${relPath} not mounted:`, err.message);
  }
}

// mount common routers (adjust names if your files differ)
await tryMount('./users.routes.js', '/users');
await tryMount('./courses.routes.js', '/courses');
await tryMount('./lessons.routes.js', '/lessons');
await tryMount('./enrollments.routes.js', '/enrollments');
await tryMount('./quizzes.routes.js', '/quizzes');
await tryMount('./performance.routes.js', '/performance');

export default router;