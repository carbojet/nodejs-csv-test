const express = require("express");
const axios = require("axios");
const app = express();
const fs = require("fs");
const csv = require("csv-parser");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/populate", function (req, res) {
  //read this link https://jsonplaceholder.typicode.com/comments
  let csvData = [];
  const savedCsvDataFile = "csvData.csv";
  axios
    .get("https://jsonplaceholder.typicode.com/comments")
    .then(function (responce) {
      const result = responce.data.map(function (item) {
        csvData.push(item);
        return item;
      });
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
        res.send(result);
      } else {
        csvData = fs.readFileSync(savedCsvDataFile, "utf-8");
        res.send(csvData);
      }
    });
});

app.post("/search", async (req, res) => {
  try {
    const savedCsvDataFile = "csvData.csv";
    //console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const body = req.body.body;
    const searchResult = [];
    fs.createReadStream(savedCsvDataFile)
      .pipe(csv())
      .on("data", (data) => {
        //console.log(data);
        if (data.name == name) {
          searchResult.push(data);
        }
      })
      .on("end", () => {
        //console.log(searchResult);
        res.send(searchResult);
      });
  } catch (error) {
    console.log(error);
  }
});
app.listen(5000, function () {
  console.log("server is running in 5000 port");
});
