/*
 * API Subroute for /courses 
 */

const router = require('express').Router();
const { getCoursesPage } = require('../models/course');

router.get('/', async (req, res) => {
  try {
    const coursesPage = await getCoursesPage(parseInt(req.query.page) || 1);
    coursesPage.links = {};

    if (coursesPage.page < coursesPage.totalPages) {
      coursesPage.links.nextPage = `/courses?page=${coursesPage.page + 1}`;
      coursesPage.links.lastPage = `/courses?page=${coursesPage.totalPages}`;
    }
    if (coursesPage.page > 1) {
      coursesPage.links.prevPage = `/courses?page=${coursesPage.page - 1}`;
      coursesPage.links.firstPage = '/courses?page=1';
    }

    res.status(200).send(coursesPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses list. Please try again later. "
    });
  }
});

module.exports = router;
