/*
 * API Subroute for /assignment
 */
const router = require('express').Router();

const { AssignmentSchema,
        getAssignmentsPage,
        getAssignmentByID,
        insertNewAssignment,
        replaceAssignmentById,
        deleteAssignmentById
      } = require('../models/assignment');
const stringify = require('csv-stringify');


const { validateAgainstSchema } = require('../lib/validation');


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
    const assignment = await getAssignmentByID(req.params.id);
    if (assignment) {
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


router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body);
      res.status(200).send({
        id: id,
	links: {
	  assignment: `/assignments/${id}`
	}
      });
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

router.patch('/:id', async (req, res, next) => {
  // Implement user authentication later
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
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
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update specified assignment. Try again later. "
      });
    }
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  //todo: validation
  const deleteSuccessful = await deleteAssignmentById(id);
  if(deleteSuccessful){
    res.status(204).send();
  }else{
    res.status(500).send({
      error: "Unable to delete specified assignment. Try again later. "
    });
  }

});

module.exports = router;
