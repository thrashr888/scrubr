// cli
const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "src", type: String, defaultOption: true, defaultValue: "TEST.md" },
];
const options = commandLineArgs(optionDefinitions);

// terminal
const term = require("terminal-kit").terminal;

// git
const simpleGit = require("simple-git");
const WORKING_DIR_PATH = "./";
const git = simpleGit(WORKING_DIR_PATH);

// markdown
const marked = require("marked");
const TerminalRenderer = require("marked-terminal");
marked.setOptions({
  renderer: new TerminalRenderer(),
});

function printLog(log) {
  return log.all.map((l, i) => {
    return `${i}: ${l.message} (${l.hash.substr(0, 6)})`;
  });
}

function tagName(commit) {
  if (!commit.refs.includes("tag: ")) return;

  return commit.refs.substr(5);
}

async function printCommit(commit, filename, index) {
  let tag = tagName(commit);
  console.log(`--- ${filename} ${tag || ""} ${index} ${commit.message}`);

  try {
    let show = await git.show(`${commit.hash}:${filename}`);
    console.log(marked(show));
  } catch (e) {
    console.error(e.message);
  }
}

async function main(filename) {
  let log = await git.log({ file: filename });
  let commits = log.all;
  console.log(printLog(log));

  let index = 0;
  let commit = commits[index];

  printCommit(commit, filename, index);

  term.grabInput();

  term.on("key", async function (name, matches, data) {
    if (name === "CTRL_C") {
      process.exit();
    }

    if (name === "RIGHT" || name === "DOWN") {
      index++;
      if (index >= commits.length - 1) index = commits.length - 1;
    }

    if (name === "LEFT" || name === "UP") {
      index--;
      if (index <= 0) index = 0;
    }

    commit = commits[index];
    printCommit(commit, filename, index);
  });
}
main(options.src);
