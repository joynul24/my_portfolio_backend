const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://devjoynul26.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- MongoDB ---------------- */

const uri = `mongodb+srv://${process.env.MONGODB_NAME}:${process.env.MONGODB_PASS}@cluster0.svgbh.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

/* ---------------- DB CONNECTION (FIXED) ---------------- */

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("portfolioDB");
  }
  return db;
}

/* ---------------- Async Handler ---------------- */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  });
};

/* ---------------- ADMIN LOGIN ---------------- */

app.post("/admin/login", asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    return res.send({
      success: true,
      token: "admin-token",
    });
  }

  res.status(401).send({
    success: false,
    message: "Invalid password",
  });
}));

/* ---------------- SKILLS ---------------- */

app.get("/skills", asyncHandler(async (req, res) => {
  const db = await getDB();
  const result = await db.collection("skills").find().toArray();
  res.send(result);
}));

app.post("/skills", asyncHandler(async (req, res) => {
  const db = await getDB();
  const skill = req.body;

  const result = await db.collection("skills").insertOne(skill);

  res.send({
    success: true,
    insertedId: result.insertedId,
  });
}));

app.delete("/skills/:id", asyncHandler(async (req, res) => {
  const db = await getDB();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({
      success: false,
      message: "Invalid ID",
    });
  }

  const result = await db.collection("skills").deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
}));

/* ---------------- PROJECTS ---------------- */

// ১. প্রজেক্ট গেট করা (সর্ট করা আছে)
app.get("/projects", asyncHandler(async (req, res) => {
  const db = await getDB();
  const result = await db.collection("projects").find().sort({ order: 1 }).toArray();
  res.send(result);
}));

// ২. নতুন প্রজেক্ট তৈরি করা
app.post("/projects", asyncHandler(async (req, res) => {
  const db = await getDB();
  const project = req.body;
  const result = await db.collection("projects").insertOne(project);
  res.send({
    success: true,
    insertedId: result.insertedId,
  });
}));

// 🌟 ৩. রিঅর্ডার রাউট (আইডি ওয়ালা রাউটের উপরে থাকতে হবে)
app.put('/projects/reorder', asyncHandler(async (req, res) => {
  const db = await getDB();
  const { sortedProjects } = req.body;

  if (!Array.isArray(sortedProjects)) {
    return res.status(400).json({ success: false, message: "Invalid array data" });
  }

  const bulkOperations = sortedProjects.map((project, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(project._id) },
      update: { $set: { order: index } }
    }
  }));

  const result = await db.collection("projects").bulkWrite(bulkOperations);
  res.status(200).json({ success: true, message: "Order updated successfully", result });
}));

// 🌟 ৪. নির্দিষ্ট প্রজেক্ট আপডেট (আইডি ওয়ালা ডাইনামিক রাউট নিচে থাকবে)
app.put("/projects/:id", asyncHandler(async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  const updatedData = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({
      success: false,
      message: "Invalid ID",
    });
  }

  delete updatedData._id;

  const result = await db.collection("projects").updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );

  res.send(result);
}));

// ৫. প্রজেক্ট ডিলিট করা
app.delete("/projects/:id", asyncHandler(async (req, res) => {
  const db = await getDB();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({
      success: false,
      message: "Invalid ID",
    });
  }

  const result = await db.collection("projects").deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
}));

/* ---------------- PROFILE ---------------- */

app.get("/profile", asyncHandler(async (req, res) => {
  const db = await getDB();

  const result = await db.collection("profile").findOne({});

  if (!result) {
    return res.send({
      title: "",
      description1: "",
      description2: "",
      experience: "",
      projects: "",
    });
  }

  res.send(result);
}));

app.put("/profile", asyncHandler(async (req, res) => {
  const db = await getDB();
  const profileData = req.body;

  const result = await db.collection("profile").updateOne(
    {},
    { $set: profileData },
    { upsert: true }
  );

  res.send(result);
}));

/* ---------------- ROOT ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("Portfolio server is running...");
});

// লোকাল হোস্টে রান করানোর সুবিধার্থে এবং Vercel সেফটির জন্য পোর্ট লিসেনার
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;













// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// dotenv.config();

// const app = express();

// app.use(cors({
//   origin: ["http://localhost:5173", "https://devjoynul26.vercel.app"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type"]
// }));

// app.use(express.json());

// /* ---------------- MongoDB ---------------- */

// const uri = `mongodb+srv://${process.env.MONGODB_NAME}:${process.env.MONGODB_PASS}@cluster0.svgbh.mongodb.net/?appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// let db;

// /* ---------------- DB CONNECTION (FIXED) ---------------- */

// async function getDB() {
//   if (!db) {
//     await client.connect();
//     db = client.db("portfolioDB");
//   }
//   return db;
// }

// /* ---------------- Async Handler ---------------- */

// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch((err) => {
//     res.status(500).send({
//       success: false,
//       message: err.message,
//     });
//   });
// };

// /* ---------------- ADMIN LOGIN ---------------- */

// app.post("/admin/login", asyncHandler(async (req, res) => {
//   const { password } = req.body;

//   if (password === process.env.ADMIN_PASSWORD) {
//     return res.send({
//       success: true,
//       token: "admin-token",
//     });
//   }

//   res.status(401).send({
//     success: false,
//     message: "Invalid password",
//   });
// }));

// /* ---------------- SKILLS ---------------- */

// app.get("/skills", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const result = await db.collection("skills").find().toArray();
//   res.send(result);
// }));

// app.post("/skills", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const skill = req.body;

//   const result = await db.collection("skills").insertOne(skill);

//   res.send({
//     success: true,
//     insertedId: result.insertedId,
//   });
// }));

// app.delete("/skills/:id", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const id = req.params.id;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).send({
//       success: false,
//       message: "Invalid ID",
//     });
//   }

//   const result = await db.collection("skills").deleteOne({
//     _id: new ObjectId(id),
//   });

//   res.send(result);
// }));

// /* ---------------- PROJECTS ---------------- */

// // app.get("/projects", asyncHandler(async (req, res) => {
// //   const db = await getDB();
// //   const result = await db.collection("projects").find().toArray();
// //   res.send(result);
// // }));

// app.get("/projects", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const result = await db.collection("projects").find().toArray();
//   res.send(result);
// }));

// app.post("/projects", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const project = req.body;

//   const result = await db.collection("projects").insertOne(project);

//   res.send({
//     success: true,
//     insertedId: result.insertedId,
//   });
// }));

// app.put("/projects/:id", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const id = req.params.id;
//   const updatedData = req.body;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).send({
//       success: false,
//       message: "Invalid ID",
//     });
//   }

//   const result = await db.collection("projects").updateOne(
//     { _id: new ObjectId(id) },
//     { $set: updatedData }
//   );

//   res.send(result);
// }));

// app.delete("/projects/:id", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const id = req.params.id;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).send({
//       success: false,
//       message: "Invalid ID",
//     });
//   }

//   const result = await db.collection("projects").deleteOne({
//     _id: new ObjectId(id),
//   });

//   res.send(result);
// }));

// // PUT: /api/projects/reorder
// router.put('/projects/reorder', async (req, res) => {
//   try {
//     const { sortedProjects } = req.body;

//     // Use bulkWrite to update multiple documents in a single DB request
//     const bulkOperations = sortedProjects.map((project, index) => ({
//       updateOne: {
//         filter: { _id: project._id },
//         update: { $set: { order: index } } // Assign new array index as the project order
//       }
//     }));

//     await Project.bulkWrite(bulkOperations);
//     res.status(200).json({ success: true, message: "Order updated successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// /* ---------------- PROFILE ---------------- */

// app.get("/profile", asyncHandler(async (req, res) => {
//   const db = await getDB();

//   const result = await db.collection("profile").findOne({});

//   if (!result) {
//     return res.send({
//       title: "",
//       description1: "",
//       description2: "",
//       experience: "",
//       projects: "",
//     });
//   }

//   res.send(result);
// }));

// app.put("/profile", asyncHandler(async (req, res) => {
//   const db = await getDB();
//   const profileData = req.body;

//   const result = await db.collection("profile").updateOne(
//     {},
//     { $set: profileData },
//     { upsert: true }
//   );

//   res.send(result);
// }));

// /* ---------------- ROOT ROUTE ---------------- */

// app.get("/", (req, res) => {
//   res.send("Portfolio server is running...");
// });

// module.exports = app;