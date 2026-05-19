// ----------ROTAS DE PLANOS DE AULA----------
const { Router } = require('express');
const validate = require('../middlewares/validate');
const controller = require('../controllers/lesson-plans.controller');
const {
  lessonPlanBodySchema,
  listQuerySchema,
  idParamsSchema,
} = require('../validators/lesson-plans.schema');

const router = Router();

router.get('/', validate({ query: listQuerySchema }), controller.list);
router.get('/:id', validate({ params: idParamsSchema }), controller.getById);
router.post('/', validate({ body: lessonPlanBodySchema }), controller.create);
router.put(
  '/:id',
  validate({ params: idParamsSchema, body: lessonPlanBodySchema }),
  controller.update,
);
router.delete('/:id', validate({ params: idParamsSchema }), controller.remove);

module.exports = router;
