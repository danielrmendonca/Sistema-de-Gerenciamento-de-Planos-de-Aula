// ----------AGREGADOR DE ROTAS----------
const { Router } = require('express');
const healthRoutes = require('./health.routes');
const lessonPlansRoutes = require('./lesson-plans.routes');
const aiRoutes = require('./ai.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/lesson-plans', lessonPlansRoutes);
router.use('/ai', aiRoutes);

module.exports = router;