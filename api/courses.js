/*
 * API Subroute for /courses 
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');

const { CourseSchema, 
        getCoursesPage 
} = require('../models/course');


/* 
 * Route to return paginated list of courses 
 */
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

/*
 * Route to create new courses 
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    try {
      const id = await insertNewCourse(req.body);
      res.status(200).send({
        id: id,
	links: {
	  course: `/courses/${id}`
	}
      });
    } catch (err) {
      console.error(errr);
      res.status(500).send({
        error: "Error inserting course into DB. Try again later. "
      });
    }
  }
  else {
    res.status(400).send({
      error: "Request body is not a valid course object. "
    });
  }
});
  
module.exports = router;
