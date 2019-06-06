/* 
 * Course Schema and data accessor methods 
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const CourseSchema = {
  subjectCode: { required: true },
  number: { required: true },
  title: { required: true },
  instructor: { required: true },
  students: {required: false }
};
exports.CourseSchema = CourseSchema;

exports.getCoursesPage = async function (page) {
    const db = getDBReference();

    const collection = db.collection('courses');
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
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    };
};

exports.insertNewCourse = async function (course) {
  course = extractValidFields(course, CourseSchema);
  const db = getDBReference(); 
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
};
