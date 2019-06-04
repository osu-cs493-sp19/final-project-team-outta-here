/*
 * MongoDB Initialization File 
*/
db.createUser({
    user: 'tarpaulin',
    pwd: 'hunter2',
    roles: [ { role: "readWrite", db: "tarpaulin" } ]
});

db.users.insertMany([
  {
    id: 1,
    role: "Instructor"

  },
  {
    id: 2,
    role: "Student"
  }
]);

db.courses.insertMany([
  {
    id: 1,
    subjectCode: "CS 493",
    number: 1,
    title: "Cloud Software Computing",
    instructor: "Rob Hess",
    students: []
  }
]);

db.assignments.insertMany([
  {
    title: "Final",
    dueDate: "6/14/19",
    studentSubs: []
  }
]);

db.submissions.insertMany([
  {
    studentId: 2,
    filePath: ""
  }
]);

