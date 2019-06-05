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
  },
  {
    id: 2,
    subjectCode: "CS 161",
    number: 2,
    title: "Introduction to CS I",
    instructor: "Rob Hess",
    students: []
  },
  {
    id: 3,
    subjectCode: "CS 271",
    number: 3,
    title: "Introduction to Assembly Language",
    instructor: "Rob Hess",
    students: []
  },
  {
    id: 4,
    subjectCode: "CS 290",
    number: 4,
    title: "Introduction to Web Programming",
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

