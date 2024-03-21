const classRegex = /class\s+(\w+)/;
const fs = require("fs");

class Stack {
  constructor() {
    this.items = [];
  }
  push(element) {
    this.items.push(element);
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

function DoTheMagic(filePath) {
  data = fs.readFileSync(filePath, "utf8");
  const lines = data.split(/\r?\n/);
  const filtered = lines.filter(
    (line) =>
      (line.includes("public") ||
        line.includes("private") ||
        line.includes("}") ||
        line.includes("{") ||
        line.includes("internal")) &&
      !line.includes(" _")
  );

  const filterOverTab = filtered.map((line) => {
    return line.replace(/\t/g, " ");
  });

  //VARIABLE
  let index = 0;
  const indexWrapper = {
    value: index,
  };
  groupedLines = {};

  //BEGIN
  while (!filterOverTab[indexWrapper.value].includes(" class ")) {
    indexWrapper.value += 1;
  }

  const className = classRegex.exec(filterOverTab[indexWrapper.value])[1];
  groupedLines[className] = [];
  if (filterOverTab[indexWrapper.value].includes(" { ")) {
    indexWrapper.value += 1;
  } else {
    indexWrapper.value += 2;
  }

  const stack = new Stack();
  groupedLines[className] = [];
  stack.push("{");
  //END
  recusive(filterOverTab, indexWrapper, className, groupedLines, stack);
  return groupedLines;
}

function recusive(lines, index, className, groupedLines, stack) {
  if (lines[index.value].includes(" class ")) {
    const className = classRegex.exec(lines[index.value])[1];
    if (lines[index.value].includes(" { ")) {
      index.value += 1;
      const stack = new Stack();
      groupedLines[className] = [];
      stack.push("{");
      recusive(lines, index, className, groupedLines);
    } else {
      const stack = new Stack();
      groupedLines[className] = [];
      stack.push("{");
      index.value += 2;
      recusive(lines, index, className, groupedLines, stack);
    }
  } else {
    checkIfContain(lines[index.value], stack);
    if (stack.isEmpty()) {
      return;
    }
    extractClass(lines[index.value], groupedLines, className);
    index.value += 1;
    recusive(lines, index, className, groupedLines, stack);
  }
}

function extractClass(line, groupedLines, className) {
  if (line.includes("{") && line.includes("e")) {
    pushToClass(groupedLines[className], extractGetter(line));
  } else if (line.includes("(")) {
    pushToClass(groupedLines[className], extractFunction(line));
  } else if (line.includes("public") || line.includes("private")) {
    pushToClass(groupedLines[className], extractNormal(line));
  }
}

function checkIfContain(line, stack) {
  if (line.includes("{")) {
    stack.push("{");
  }
  if (line.includes("}")) {
    stack.pop();
  }
}

function extractNormal(line) {
  const privacy = line.includes("public") ? "+" : "-";
  const normalCut = line.split(" ");
  return privacy + " " + normalCut[normalCut.length - 1];
}

function extractGetter(line) {
  const privacy = line.includes("public") ? "+" : "-";
  const separateBySymbol = line.split("{")[0].split(" ");
  return privacy + " " + separateBySymbol[separateBySymbol.length - 2];
}

function extractFunction(line) {
  const privacy = line.includes("public") ? "+" : "-";
  const separateBySymbol = line.split("(")[0].split(" ");
  const result =
    separateBySymbol[separateBySymbol.length - 1] === ""
      ? separateBySymbol[separateBySymbol.length - 2]
      : separateBySymbol[separateBySymbol.length - 1];
  return privacy + " " + result + "()";
}

function pushToClass(groupedLines, value) {
  if (
    !groupedLines.filter((item) => item.toLowerCase() == value.toLowerCase())[0]
  ) {
    groupedLines.push(value);
  }
}

module.exports = {
  DoTheMagic,
};