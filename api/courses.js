/*
 * API Subroute for /courses 
 */
const router = require('express').Router();
const { CourseSchema,
        getCoursesPage,
        getCourseByID,
        insertNewCourse,
        replaceCourseById,
        deleteCourseById } = require('../models/course');
const stringify = require('csv-stringify');
const { requireAuthentication } = require('../lib/auth');
const { getUserById} = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');

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
 * Route to fetch info about a specific course.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    delete course.assignments;
    delete course.students;
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to get roster of specific course
 */
router.get('/:id/roster', requireAuthentication, async (req, res, next) => {
  // Authenticate the user first 
  const authenticatedUser = await getUserById(req.user);
  const course = await getCourseByID(req.params.id);
  
  // User must be either an admin or instructor of the class in order to get course roster
  if (!(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user))) {
    res.status(403).send({
      error: "You must be either an admin or course instructor in order to obtain the course roster."
    });
  }  

  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      var roster = [];
      roster = course.students;
      // adding appropriate headers, so browsers can start downloading
      // file as soon as this request starts to get served
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');

      // stringify return a readable stream, that can be directly piped
      // to a writeable stream which is "res" (the response object from express.js)
      // since res is an abstraction over node http's response object which supports "streams"
      stringify(roster, { header: true })
        .pipe(res);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});


/*
 * Route to get list of students
 */
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
  //authenticate the user first
  const authenticatedUser = await getUserById(req.user);
  const course = await getCourseByID(req.params.id);

  //have to be an admin or the instructor of the class in order to get the course
  if (!(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user))) {
    res.status(403).send({
      error: "You have to be either an admin or the instructor of the course in order to get the course information."
    });
  }

  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      var students = course.students;
      const studentIDs = students.map(students => students.id);
      res.status(200).send({
        studentIds: studentIDs
      });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to get list of assignments
 */
router.get('/:id/assignments', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    if (course) {
      var assignments = course.assignments;
      res.status(200).send({
        assignmentIDs: assignments
      });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch course.  Please try again later."
    });
  }
});

/*
 * Route to create new courses 
 */
router.post('/', requireAuthentication, async (req, res) => {
  const authenticatedUser = await getUserById(req.user);

  if(authenticatedUser.role != "admin"){
    res.status(403).send({
      error: "Only an admin can post a new course."
    });
  }

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
      console.error(err);
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

/* 
 * Route to edit existing course 
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  //authenticate the user first
  const authenticatedUser = await getUserById(req.user);
  const course = await getCourseByID(req.params.id);

  //have to be an admin or the instructor of the class in order to modify the course
  if(!(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user))){
    res.status(403).send({
      error: "You have to be either an admin or the instructor of the course in order to modify the course."
    });
  }

  if (validateAgainstSchema(req.body, CourseSchema)) {
    try {
      const id = req.params.id;
      console.log("id:", id);
      const updateSuccessful = await replaceCourseById(id, req.body);
      if (updateSuccessful) {
	res.status(200).send({
	  links: {
	    course: `/courses/${id}`
	  }
	});
      }
      else {
	console.log("updateSuccessful failed, next()");
	next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update specified course. Try again later. "
      });
    }
  }
});

/* 
 * Route to delete existing course 
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  // Authenticate the user first 
  const authenticatedUser = await getUserById(req.user);
  const course = await getCourseByID(req.params.id);

  // User must be an admin in order to delete the course
  if (!(authenticatedUser.role == "admin")) {
    res.status(403).send({
      error: "Only admins can delete courses. " 
    });
  }
 
  const id = req.params.id;
  //todo: validation
  const deleteSuccessful = await deleteCourseById(id);
  if(deleteSuccessful){
    res.status(204).send();
  }else{
    res.status(500).send({
      error: "Unable to delete specified course. Try again later. "
    });
  }

});

module.exports = router;
