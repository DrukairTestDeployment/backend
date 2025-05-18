const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "PASSWORD",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((con) => {
    console.log("Database Connection Successful");
  })
  .catch((error) => console.log(error));

const port = 4001;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
