  const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const date = new Date();

router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'username'] },
        { model: Comment, attributes: ['id', 'comment', 'user_id', 'date'] },
      ],
    });

    !posts ? res.status(404).json(new Error('Oops!')) : null;

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const added = await Post.create({
      title: req.body.title,
      description: req.body.description,
      user_id: req.session.userId,
      date: date.toDateString(),
    });

    console.log(req.session.userId);
    res.redirect('back');
    res.status(200).json(added);
  } catch (err) {
    res.status(500).json(err);
    console.error(err);
  }
});


  router.get('/:id', async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id, {
        include: [
          { model: User, attributes: ['id', 'username'] },
          { model: Comment, attributes: ['id', 'comment', 'user_id'] },
        ],
      });

      !post ? res.status(404).json(new Error('Oops!')) : null;

      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  })
  roter.delete('/:id', async (req, res) => {
    try {
      const deleted = await Post.destroy({ where: { id: req.params.id } });

      !deleted ? res.status(404).send(new Error('Oops!')) : null;

      res.status(200).json(deleted);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  
router.put('/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    console.log(req.session.userId);
    console.log(req.body);
    const updated = await Post.update(
      {
        title: req.body.title,
        description: req.body.description,
        user_id: req.session.userId,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Comment on a post
router.post('/:id/comment', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.status(400).end();
      return;
    }
    console.log(req.body.comment);
    const newComment = Comment.create({
      comment: req.body.comment,
      user_id: req.session.userId,
      post_id: req.params.id,
      date: date.toDateString(),
    });

    !newComment ? res.status(404).send(new Error('Oops!')) : null;

    res.status(200).json('Added comment!');
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;