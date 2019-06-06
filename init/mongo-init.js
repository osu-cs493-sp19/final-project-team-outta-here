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
    number: 493,
    title: "Cloud Software Computing",
    instructor: "Rob Hess",
    students: [{
      "id": "abc123",
      "name": "Jane Doe",
      "email": "janeDoe@oregonstate.edu"
    },
    {
    "id": "decf654",
    "name": "John Doe",
    "email": "johnathanDoe@oregonstate.edu" 
    }],
    assignments: ["asdfa12",
    "ccaweda3"
    ]
  },
  {
    id: 2,
    subjectCode: "CS 161",
    number: 161,
    title: "Introduction to CS I",
    instructor: "Rob Hess",
    students: [],
    assignments: []
  },
  {
    id: 3,
    subjectCode: "CS 271",
    number: 271,
    title: "Introduction to Assembly Language",
    instructor: "Rob Hess",
    students: [],
    assignments: []
  },
  {
    id: 4,
    subjectCode: "CS 290",
    number: 290,
    title: "Introduction to Web Programming",
    instructor: "Rob Hess",
    students: [],
    assignments: []
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

