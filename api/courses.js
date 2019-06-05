/*
 * API Subroute for /courses 
 */

const router = require('express').Router();
const { getCoursesPage } = require('../models/course');

router.get('/', async (req, res) => {
  try {
    const coursesPage = await getCoursesPage(parseInt(req.query.page) || 1);

    res.status(200).send(coursesPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses list. Please try again later. "
    });
  }
});

module.exports = router;
