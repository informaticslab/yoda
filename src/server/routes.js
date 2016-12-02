const router = require('express').Router();
const four0four = require('./utils/404')();
const elastic = require('./controllers/elastic')();
const search = require('./controllers/search')();

router.get('/autocomplete/:query', search.basicSearch);
router.get('/smartSearch/:query/:page/:sort?/:filter?', search.smartSearch);
router.get('/findById/:id', search.findById);

router.get('/getMostRecent/:maxCount', elastic.getMostRecent);
router.get('/getFeatured/:maxCount', elastic.getFeatured);
router.get('/getCommon/:maxCount', elastic.getCommon);
router.get('/termSearch/:query', elastic.termSearch);
router.get('/getPreparedResponsebyId/:id', elastic.getPrepareResposeById);
// router.get('/search/:query/:page/:sort?/:filter?', elastic.fuzzySearch3);
router.get('/questions/:query', elastic.getQuestions);
router.get('/*', four0four.notFoundMiddleware);
router.post('/updatePositiveRating/:id', elastic.updatePositiveRating);
router.post('/updateNegativeRating/:id', elastic.updateNegativeRating);

module.exports = router;











