/*
 * API Subroute for /assignment
 */
const router = require('express').Router();
const {getCourseByID, findStudent} = require('../models/course');
const { AssignmentSchema,
        getAssignmentsPage,
        getAssignmentByID,
        insertNewAssignment,
        replaceAssignmentById,
        deleteAssignmentById,
        getSubmissionsPage
      } = require('../models/assignment');
const stringify = require('csv-stringify');
const { requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const {
  PhotoSchema,
  saveImageFile,
  getImageInfoById,
  getPhotoById,
  getImageDownloadStreamByFilename,
  getImageInfoByAssignmentId
} = require('../models/assignment');
const { getUserById} = require('../models/user');
const multer = require('multer');
const crypto = require('crypto');
const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = imageTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype])
  }
});
 function removeUploadedFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}



router.get('/', async (req, res) => {
  try {
    const assignmentsPage = await getAssignmentsPage(parseInt(req.query.page) || 1);
    assignmentsPage.links = {};

    if (assignmentsPage.page < assignmentsPage.totalPages) {
      assignmentsPage.links.nextPage = `/assignments?page=${assignmentsPage.page + 1}`;
      assignmentsPage.links.lastPage = `/assignments?page=${assignmentsPage.totalPages}`;
    }
    if (assignmentsPage.page > 1) {
      assignmentsPage.links.prevPage = `/assignments?page=${assignmentsPage.page - 1}`;
      assignmentsPage.links.firstPage = '/assignments?page=1';
    }

    res.status(200).send(assignmentsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching assignments list. Please try again later. "
    });
  }
});

/*
 * Route to fetch info about a specific assignment.
 */
router.get('/:id', async (req, res, next) => {
  try {
    var assignment = await getAssignmentByID(req.params.id);
    const submissions = await getImageInfoByAssignmentId(req.params.id);
    if (assignment) {
      assignment.sub = submissions;
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    });
  }
});


router.post('/', requireAuthentication, async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const authenticatedUser = await getUserById(req.user);
      const course = await getCourseByID(req.body.courseId);
      console.log(course);
      if(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user)){
        const id = await insertNewAssignment(req.body);
        res.status(200).send({
          id: id,
  	      links: {
  	         assignment: `/assignments/${id}`
  	      }
        });
      } else{
        res.status(403).send({
          error: "You must be either an admin or course instructor in order to post a new course."
        });
      }
    } catch (err) {
      console.error(errr);
      res.status(500).send({
        error: "Error inserting assignment into DB. Try again later. "
      });
    }
  }
  else {
    res.status(400).send({
      error: "Request body is not a valid assignment object. "
    });
  }
});

router.patch('/:id', requireAuthentication, async (req, res, next) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const authenticatedUser = await getUserById(req.user);
      const course = await getCourseByID(req.body.courseId);
      console.log(course);
      if(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user)){
      const id = req.params.id;
      console.log("id:", id);
      const updateSuccessful = await replaceAssignmentById(id, req.body);
      if (updateSuccessful) {
	res.status(200).send({
	  links: {
	    assignment: `/assignments/${id}`
	  }
	});
      }
      else {
	console.log("updateSuccessful failed, next()");
	next();
      }
    } else{
      res.status(403).send({
        error: "You must be either an admin or course instructor in order to post a new course."
      });
    }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update specified assignment. Try again later. "
      });
    }
  }
});

router.delete('/:id', requireAuthentication, async (req, res, next) => {
  const authenticatedUser = await getUserById(req.user);
  const assignment = await getAssignmentByID(req.params.id);
  const course = await getCourseByID(assignment.courseId);
  console.log(course);
  if(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user)){
  const id = req.params.id;
  const deleteSuccessful = await deleteAssignmentById(id);
  if(deleteSuccessful){
    res.status(204).send();
  }else{
    res.status(500).send({
      error: "Unable to delete specified assignment. Try again later. "
    });
  }
} else{
  res.status(403).send({
    error: "You must be either an admin or course instructor in order to post a new course."
  });
}
});
router.post('/:id/submission', requireAuthentication, upload.single('image'), async (req, res, next) => {
  const authenticatedUser = await getUserById(req.user);

  var assignment = await getAssignmentByID(req.params.id);
  const course = await getCourseByID(assignment.courseId);
  console.log(course);
  if(authenticatedUser.role == "admin" || (authenticatedUser.role == "student" && findStudent(assignment.courseId, req.user))){
    if (req.file && req.body && req.body.assignmentId) {
      try {
        const image = {
          path: req.file.path,
          filename: req.file.filename,
          contentType: req.file.mimetype,
          assignmentId: req.body.assignmentId,
          studentId: req.body.studentId,
          timestamp: Date.now()
        };
        const id = await saveImageFile(image);

        assignment.submissions= id;
        const updateSuccessful = replaceAssignmentById(req.body.assignmentId, assignment);

        res.status(200).send({ id: id });
      } catch (err) {
        console.log(err);
      }
    } else {
      res.status(400).send({
        err: "Needs image and assignment id, and student id."
      });
    }
  } else{
    res.status(403).send({
      error: "You must be either an admin or course instructor in order to post a new course."
    });
  }
});

router.get('/:id/submission', requireAuthentication, async (req, res, next) => {
  try {
      const authenticatedUser = await getUserById(req.user);
      const assignment = await getAssignmentByID(req.params.id);
      const course = await getCourseByID(assignment.courseId);

      if (!(authenticatedUser.role == "admin" || (authenticatedUser.role == "instructor" && course.instructorID == req.user))) {
        res.status(403).send({
	  error: "Only admin or course instructor can view submissions "
        }); 
      }

    const assignmentsPage = await getSubmissionsPage(parseInt(req.query.page) || 1, req.params.id);
    assignmentsPage.links = {};

    console.log("page: ", assignmentsPage.page);
    console.log("total pages:", assignmentsPage.totalPages);
    if (assignmentsPage.page < assignmentsPage.totalPages) {
      assignmentsPage.links.nextPage = `/assignments?page=${assignmentsPage.page + 1}`;
      assignmentsPage.links.lastPage = `/assignments?page=${assignmentsPage.totalPages}`;
    }
    if (assignmentsPage.page > 1) {
      assignmentsPage.links.prevPage = `/assignments?page=${assignmentsPage.page - 1}`;
      assignmentsPage.links.firstPage = '/assignments?page=1';
    }

    res.status(200).send(assignmentsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching assignments list. Please try again later. "
    });
  }
  // try {
  //     const image = await getImageInfoByAssignmentId(req.params.id);
  //     console.log("image", image.length);
  //     // if (image) {
  //     //   const responseBody = {
  //     //     _id: image._id,
  //     //     url: `/media/images/${image.filename}`,
  //     //     contentType: image.metadata.contentType,
  //     //     assignmentId: image.metadata.assignmentId,
  //     //     studentId: image.metadata.studentId
  //     //   };
  //       res.status(200).send("KDJSKL");
  //     // } else {
  //     //   next();
  //     // }
  //   } catch (err) {
  //     next(err);
  //   }
});

router.get('/media/:filename', (req, res, next) => {
  getImageDownloadStreamByFilename(req.params.filename)
  .on('error', (err) =>{
    if(err.code === 'ENOENT'){
      next();
    } else{
      next(err);
    }
  })
  .on('file',(file)=>{
    res.status(200).type(file.metadata.contentType);
  })
  .pipe(res);
});
module.exports = router;
