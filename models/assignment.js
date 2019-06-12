/*
 * Course Schema and data accessor methods
 */

const { ObjectId, GridFSBucket  } = require('mongodb');
const fs = require('fs');
const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: {required: true }
};
exports.AssignmentSchema = AssignmentSchema;

const PhotoSchema = {
  assignmentId: { required: true },
  studentId: {required:true},
};
exports.PhotoSchema = PhotoSchema;

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
exports.saveImageFile = function (image) {
   return new Promise((resolve, reject) => {
     const db = getDBReference();
     const bucket = new GridFSBucket(db, { bucketName: 'images' });
     const metadata = {
       contentType: image.contentType,
       assignmentId: image.assignmentId,
       studentId: image.studentId
     };

     const uploadStream = bucket.openUploadStream(
       image.filename,
       { metadata: metadata }
     );

     fs.createReadStream(image.path)
       .pipe(uploadStream)
       .on('error', (err) => {
         reject(err);
       })
       .on('finish', (result) => {
         resolve(result._id);
       });
   });
 };
 exports.getImageInfoById = async function (id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket.find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
};

getImageInfoByAssignmentId = async function (id, page) {
 const db = getDBReference();
 const bucket = new GridFSBucket(db, { bucketName: 'images' });
 if (!ObjectId.isValid(id)) {
   return null;
 } else {
           
        // .skip(offset)
        // .limit(pageSize)
        // .toArray();
   const results = await bucket.find({ "metadata.assignmentId" : id })
     .sort({ _id: 1 });
     const pageSize = 4;
   const offset = (page - 1) * pageSize;
   const results2 = results.skip(offset).limit(pageSize).toArray();
   return results2;
 }
};
async function getPhotoById(id) {
  const db = getDBReference();
  const collection = db.collection('photos');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getPhotoById = getPhotoById;

function getImageDownloadStreamByFilename(filename) {
  const db = getDBReference();
  const bucket =
    new GridFSBucket(db, { bucketName: 'images' });
  return bucket.openDownloadStreamByName(filename);
}
exports.getImageDownloadStreamByFilename = getImageDownloadStreamByFilename;

exports.getSubmissionsPage = async function (page, id) {

  var results = await getImageInfoByAssignmentId(id, page);
    const count = results.length;


    const pageSize = 4;
    console.log("count: ", count);
    console.log("results.count:", results.count);
    const lastPage = Math.ceil(results.length / pageSize);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * pageSize;

    for(var i = 0; i < results.length; i++){
      results[i].url =`/assignments/media/${results[i].filename}`
    }

    return {
        submissions: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    };
};
