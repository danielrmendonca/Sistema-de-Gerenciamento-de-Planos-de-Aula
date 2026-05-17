// ----------ROTAS DE SMART ASSIST (IA)----------
const { Router } = require('express');
const validate = require('../middlewares/validate');
const controller = require('../controllers/ai.controller');
const { smartAssistBodySchema } = require('../validators/ai.schema');

const router = Router();

router.post(
  '/smart-assist',
  validate({ body: smartAssistBodySchema }),
  controller.generateRecommendations,
);

module.exports = router;