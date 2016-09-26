exports.getUsers = function(req, res) {
  var collection = [
    {
      username: 'labuser',
      password: 'testwiththelab',
      type: 'testuser'
    },
    {
      username: 'labadmin',
      password: 'ihavethepower',
      type: 'testadmin'
    }
  ];

  res.send(collection);
}