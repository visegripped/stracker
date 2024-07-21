import fs from "fs";

const indexDestPath = "./doc_root/public_html/stracker/index.html";


fs.stat(indexDestPath, function (err, stats) {
  // console.log(stats);//here we got all information of file in stats variable
  if (err) {
    return console.error(err);
  }

  fs.unlinkSync(indexDestPath, (err) => {
    if (err) throw err;
  });

  fs.copyFile("./dist/index.html", indexDestPath, (err) => {
    if (err) throw err;
    console.log("index moved");
    fs.readFile(indexDestPath, "utf8", (err, content) => {
      if (err) throw err;
      let newContent = content.toString();
      // newContent.replaceAll("/assets/", "assets/");
      newContent.replace("WIP Stracker", "Docker Stracker");
      fs.writeFile(indexDestPath, newContent, function (err) {
        if (err) throw err;
        console.log(" -> changed assets ref to relative path");
      });
    });
  });
});



fs.cp(
  "./dist/assets/",
  "./doc_root/public_html/stracker/assets/",
  { recursive: true },
  (err) => {
    if (err) {
      console.error(err);
    }
    console.log("assets moved");
  }
);
