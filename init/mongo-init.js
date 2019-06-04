/*
 * MongoDB Initialization File 
*/
db.createUser({
    user: 'findabusiness',
    pwd: 'hunter2',
    roles: [ { role: "readWrite", db: "findabusiness" } ]
});

db.businesses.insertMany([
    {
        "id": 0,
        "ownerid": 0,
        "name": "Block 15",
        "address": "300 SW Jefferson Ave.",
        "city": "Corvallis",
        "state": "OR",
        "zip": "97333",
        "phone": "541-758-2077",
        "category": "Restaurant",
        "subcategory": "Brewpub",
        "website": "http://block15.com"
    },
    {
        "id": 1,
        "ownerid": 1,
        "name": "Corvallis Brewing Supply",
        "address": "119 SW 4th St.",
        "city": "Corvallis",
        "state": "OR",
        "zip": "97333",
        "phone": "541-758-1674",
        "category": "Shopping",
        "subcategory": "Brewing Supply",
        "website": "http://www.lickspigot.com"
      },
      {
        "id": 2,
        "ownerid": 2,
        "name": "Robnett's Hardware",
        "address": "400 SW 2nd St.",
        "city": "Corvallis",
        "state": "OR",
        "zip": "97333",
        "phone": "541-753-5531",
        "category": "Shopping",
        "subcategory": "Hardware"
      },
      {
        "id": 3,
        "ownerid": 3,
        "name": "First Alternative Co-op North Store",
        "address": "2855 NW Grant Ave.",
        "city": "Corvallis",
        "state": "OR",
        "zip": "97330",
        "phone": "541-452-3115",
        "category": "Shopping",
        "subcategory": "Groceries"
      }
]);

db.reviews.insertMany([
    {
        "id": 0,
        "userid": 7,
        "businessid": 8,
        "dollars": 1,
        "stars": 4.5,
        "review": "Cheap, delicious food."
      },
      {
        "id": 1,
        "userid": 25,
        "businessid": 2,
        "dollars": 1,
        "stars": 4,
        "review": "How many fasteners can one room hold?"
      },
      {
        "id": 2,
        "userid": 26,
        "businessid": 1,
        "dollars": 1,
        "stars": 5,
        "review": "Joel, the owner, is super friendly and helpful."
      },
      {
        "id": 3,
        "userid": 21,
        "businessid": 14,
        "dollars": 2,
        "stars": 4
      },
      {
        "id": 4,
        "userid": 28,
        "businessid": 18,
        "dollars": 1,
        "stars": 4,
        "review": "Good beer, good food, though limited selection."
      },
      {
        "id": 5,
        "userid": 21,
        "businessid": 9,
        "dollars": 1,
        "stars": 5,
        "review": "A Corvallis gem."
      },
      {
        "id": 6,
        "userid": 26,
        "businessid": 8,
        "dollars": 1,
        "stars": 5,
        "review": "Yummmmmmm!"
      }
]);

db.photos.insertMany([
    {
        "id": 0,
        "userid": 7,
        "businessid": 8,
        "caption": "This is my dinner."
      },
      {
        "id": 1,
        "userid": 25,
        "businessid": 2
      },
      {
        "id": 2,
        "userid": 26,
        "businessid": 1,
        "caption": "Hops"
      },
      {
        "id": 3,
        "userid": 21,
        "businessid": 14
      },
      {
        "id": 4,
        "userid": 28,
        "businessid": 18,
        "caption": "Sticky Hands"
      }
]);

