const mongoose = require('mongoose');

const uri = "mongodb+srv://nidafatima0526_db_user:gKCPQ6zT1QRuNXzY@cluster0.h2osr5p.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED:", err.message);
    process.exit(1);
  });
