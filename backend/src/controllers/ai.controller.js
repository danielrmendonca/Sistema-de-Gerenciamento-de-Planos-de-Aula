// endpoint /ai/recommendations

// ----------CONTROLLER DE SMART ASSIST (IA)----------
const aiService = require('../services/ai.service');

async function generateRecommendations(req, res) {
  const result = await aiService.generateRecommendations(req.body);
  return res.json(result);
}

module.exports = { generateRecommendations };
