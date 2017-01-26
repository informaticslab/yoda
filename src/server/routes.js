const router = require('express').Router();
const four0four = require('./utils/404')();
const elastic = require('./controllers/elastic')();
const search = require('./controllers/search')();

router.get('/autocomplete/:query', search.basicSearch);
router.get('/smartSearch/:query/:page/:sort?/:filter?', search.smartSearch);
router.get('/findById/:id', search.findById);
router.get('/getStats', search.getStats);
// router.get('/getMostRecent/:maxCount', elastic.getMostRecent);
// router.get('/getFeatured/:maxCount', elastic.getFeatured);
// router.get('/getCommon/:maxCount', elastic.getCommon);
// router.get('/termSearch/:query', elastic.termSearch);
router.get('/*', four0four.notFoundMiddleware);
// router.post('/updatePositiveRating/:id', elastic.updatePositiveRating);
// router.post('/updateNegativeRating/:id', elastic.updateNegativeRating);

module.exports = router;











