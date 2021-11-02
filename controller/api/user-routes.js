const router = require('express').Router();
const { User, Post, Comment } = require('../../models');


// eror code 404 - N/A // N/A = Nothing Avaliable
// error code 400 - Bad request // User must put something incorrect 

router.get('/', async (req, res) => {
    try {
      const users = await User.findAll({
        include: [
          { model: Post, attributes: ['id', 'title', 'description'] },
          { model: Comment, attributes: ['id', 'post_id', 'comment'] },
        ],
      });

      !users ? res.status(404).send(new Error('N/A')) : null;

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  })

  router.post('/', async (req, res) => {
    try {
      const created = await User.create({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      });

      !created ? res.status(400).send(new Error('Check again.')) : null;

      req.session.save(() => {
        req.session.loggedIn = true;
        req.session.userId = created.dataValues.id;

        res.status(200).json({
          message: `Created user with username of ${created.username}`,
        });
      });
    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.get('/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          { model: Post, attributes: ['id', 'title', 'description'] },
          { model: Comment, attributes: ['id', 'post_id', 'comment'] },
        ],
      });

      !user ? res.status(404).send(new Error('Oops!')) : null;

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  })
  router.put('/:id', async (req, res) => {
    try {
      const updated = await User.update(
        {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );

      !updated ? res.status(404).send(new Error('N/A')) : null;

      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json(err);
    }
  })
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await User.destroy({ where: { id: req.params.id } });
      res.status(200).json(deleted);
    } catch (err) {
      res.status(400).json(err);
    }
  });

// Log in
router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    const isValid = await userData.checkPassword(req.body.password);
    if (!userData || !isValid) {
      res.status(400).json({ message: 'Wrong username/password! Try again' });
      return;
    }
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userId = userData.dataValues.id;

      res
        .status(200)
        .json({ message: `Now logged in as ${userData.username}!` });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Log out
router.post('/logout', async (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).redirect('/login');
    });
  } else {
    res.status(404).end();
  }
});


module.exports = router;