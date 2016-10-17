var router = require('express').Router();
var four0four = require('./utils/404')();
var users = require('./controllers/users');
var auth = require('./controllers/auth');
var elastic = require('./controllers/elastic')();

router.get('/users', users.index);
router.post('/login', auth.login);

router.get('/isLoggedIn', function (req, res) {
  if (req.isAuthenticated()) {
    res.send({ state: 'success', user: req.user });
  } else {
    res.send({ state: 'fail', user: null });
  }
});

router.post('/logout', function (req, res) {
  req.logout();
  res.end();
});

router.get('/getMostRecent/:maxCount', elastic.getMostRecent);
router.get('/getFeatured/:maxCount', elastic.getFeatured);
router.get('/getCommon/:maxCount', elastic.getCommon);
router.get('/termSearch/:query', elastic.termSearch);
router.get('/getPreparedResponsebyId/:id', elastic.getPrepareResposeById);
router.get('/search/:query/:page', elastic.fuzzySearch3);
router.get('/questions/:query', elastic.getQuestions);
router.get('/*', four0four.notFoundMiddleware);
router.post('/updatePositiveRating/:id', elastic.updatePositiveRating);
router.post('/updateNegativeRating/:id', elastic.updateNegativeRating);

module.exports = router;











