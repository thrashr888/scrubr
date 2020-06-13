const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "src", type: String, defaultOption: true, defaultValue: "TEST.md" },
];
const options = commandLineArgs(optionDefinitions);
const term = require("terminal-kit").terminal;
const simpleGit = require("simple-git");

const WORKING_DIR_PATH = "./";
const READ_FILE = "TEST.md";
const git = simpleGit(WORKING_DIR_PATH);

function printLog(log) {
  return log.all.map((l, i) => {
    return `${i}: ${l.hash}: ${l.message}`;
  });
}

function tagName(commit) {
  if (!commit.refs.includes("tag: ")) return;

  return commit.refs.substr(5);
}

async function printCommit(commit, filename) {
  let tag = tagName(commit);
  console.log(`--- ${filename} ${tag || ""} ${commit.message}`);
  let show = await git.show(`${commit.hash}:${filename}`);
  console.log(show);
}

async function main(filename) {
  let log = await git.log({ file: filename });
  let commits = log.all;
  console.log(printLog(log));

  let index = 0;
  let commit = commits[index];

  printCommit(commit, filename);

  term.grabInput();

  term.on("key", async function (name, matches, data) {
    if (name === "CTRL_C") {
      process.exit();
    }

    if (name === "RIGHT") {
      index++;
      if (index > commits.length - 1) index = commits.length - 1;
    }

    if (name === "LEFT") {
      index--;
      if (index <= 0) index = 0;
    }

    printCommit(commit, filename);
  });
}
main(options.src);
