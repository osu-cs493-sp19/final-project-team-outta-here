/*
 * Course Schema and data accessor methods
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: {required: true }
};
exports.AssignmentSchema = AssignmentSchema;

exports.getAssignmentsPage = async function (page) {
    const db = getDBReference();

    const collection = db.collection('assignments');
    const count = await collection.countDocuments();

    const pageSize = 4;
    const lastPage = Math.ceil(count / pageSize);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * pageSize;

    const results = await collection.find({})
        .sort({ _id: 1 })
        .skip(offset)
        .limit(pageSize)
        .toArray();

    return {
        assignments: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    };
};

exports.getAssignmentByID = async function (id) {
    const db = getDBReference();
    const collection = db.collection('assignments');
    if (!ObjectId.isValid(id)) {
        return null;
    } else {
        const results = await collection
            .find({ _id: new ObjectId(id) })
            .toArray();
        return results[0];
    }
};

exports.insertNewAssignment = async function (assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema);
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.insertOne(assignment);
  return result.insertedId;
};

exports.replaceAssignmentById = async function (id, assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema);
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.replaceOne(
    { _id: new ObjectId(id) },
    assignment
  );
  return result.matchedCount > 0;
};

exports.deleteAssignmentById = async function (id){
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.deleteOne({
    _id: new ObjectId(id)
  });
  return result.deletedCount > 0;
}
