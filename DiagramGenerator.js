const fs = require("fs");
const path = require("path");
const { DoTheMagic } = require(".\\DoTheMagic");
const { FormatPU } = require(".\\FormatPU");

function getListOfFiles(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

async function Exec(folderPath, fileList, blackList) {
  for (const fileName of fileList) {
    if (blackList.includes(fileName)) {
      continue;
    }
    const result = DoTheMagic(path.join(folderPath, fileName));

    const resultFolderSplit = folderPath.split("\\");
    const resultFolder = resultFolderSplit[resultFolderSplit.length - 1];

    const toPlantUML = await FormatPU(result);

    try {
      fs.mkdirSync(`.\\result\\${resultFolder}`, { recursive: true });
      fs.writeFileSync(
        `.\\result\\${resultFolder}\\${fileName.replace(".cs", ".pu")}`,
        toPlantUML
      );
      console.log("  File written successfully!");
    } catch (error) {
      console.error("Error writing file:", error);
    }
  }
}

function DiagramGenerator(folderNames, sourcePath, blackList) {
  for (const folderName of folderNames) {
    const folderPath = path.join(sourcePath, folderName);
    const fileList = getListOfFiles(folderPath);
    Exec(folderPath, fileList, blackList, folderName);
  }
}

// const folderNames = ["Models"];
// const sourcePath = ""
// const blackList = ["ISetting.cs", "BoolConverter.cs", "Constants.cs"];
// DiagramGenerator(folderNames, sourcePath, blackList);

module.exports = DiagramGenerator;
