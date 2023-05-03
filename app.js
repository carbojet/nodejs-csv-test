const express = require("express");
const axios = require("axios");
const app = express();
const fs = require("fs");
const csv = require("csv-parser");
const bodyParser = require("body-parser");

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/populate", async function (req, res) {
  const savedCsvDataFile = "csvData.csv";
  const responce = await axios.get(
    "https://jsonplaceholder.typicode.com/comments"
  );
  let csvData = responce.data;
  //console.log(csvData);
  if (!fs.existsSync(savedCsvDataFile)) {
    //prepare data for csv file creation
    const header = ["post Id", "ID", "Name", "Email", "Body"];
    const csvWriter = fs.createWriteStream("csvdata.csv");
    //header inserted to csv file
    csvWriter.write(header.join(",") + "\n");

    //data insert into csv file
    csvData.forEach(function (item) {
      csvWriter.write(
        item.postId +
          "," +
          item.id +
          "," +
          item.name +
          "," +
          item.email +
          "," +
          item.body.replace(/\n(?!\s)/g, "") +
          "\n"
      );
    });
    csvWriter.end();
    res.send(csvData);
  } else {
    //if file exist
    const searchResult = [];
    fs.createReadStream(savedCsvDataFile)
      .pipe(csv())
      .on("data", (data) => {
        searchResult.push(data);
      })
      .on("end", () => {
        res.send(searchResult);
      });
  }
});
app.post("/search", async (req, res) => {
  try {
    const savedCsvDataFile = "csvData.csv";
    const name = req.body.name;
    const email = req.body.email;
    const body = req.body.body;
    const searchResult = [];
    fs.createReadStream(savedCsvDataFile)
      .pipe(csv())
      .on("data", (data) => {
        if (data.Name == name || data.Email == email || data.body == body) {
          searchResult.push(data);
        }
      })
      .on("end", () => {
        res.send(searchResult);
      });
  } catch (error) {
    console.log(error);
  }
});
app.listen(5000, function () {
  console.log("server is running in 5000 port");
});
