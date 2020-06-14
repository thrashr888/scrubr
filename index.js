// cli
const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "src", type: String, defaultOption: true, defaultValue: "TEST.md" },
];
const options = commandLineArgs(optionDefinitions);

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

// terminal
var blessed = require("blessed");
var screen = blessed.screen({
  smartCSR: true,
});
screen.title = "scrubr";
let textBox = blessed.box({
  top: "center",
  left: "center",
  width: "100%",
  height: "100%",
  content: "SCRUBR",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "#f0f0f0",
    },
    scrollbar: {
      bg: "blue",
    },
  },
});
screen.append(textBox);
textBox.focus();
screen.render();
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

function tagName(commit) {
  if (!commit.refs.includes("tag: ")) return;
  return commit.refs.substr(5);
}

let SHOW_CACHE = {};
async function printCommit(commit, filename, index) {
  let tag = tagName(commit);
  let header = `{bold}${filename}{/bold} #${index + 1} ${
    tag ? tag + " " : ""
  }({green-fg}${commit.hash.substr(0, 6)}{/green-fg})\n${commit.message}\n\n`;

  try {
    let key = `${commit.hash}:${filename}`;
    let show = SHOW_CACHE[key] ? SHOW_CACHE[key] : await git.show(key);

    textBox.setContent(header + marked(show), true);
  } catch (e) {
    textBox.setContent(header + e.message, true);
    // console.error(e.message);
  }
  screen.render();
}

async function printIndex(log, filename) {
  let logs = log.map((l, i) => {
    return `#${i + 1}: {bold}${l.message}{/bold} ({green-fg}${l.hash.substr(
      0,
      6
    )}{/green-fg})`;
  });
  textBox.setContent(`{bold}${filename}{/bold}\n\n${logs.join("\n")}`);
  screen.render();
}

async function main(filename) {
  let log = await git.log({ file: filename });
  let commits = log.all;
  printIndex(commits, filename);

  let index = -1;
  let commit = commits[index];

  screen.key(["right", "left"], async function (ch, key) {
    if (key.name === "right") {
      index++;
      if (index > commits.length - 1) {
        index = commits.length - 1;
        return;
      }
    }
    if (key.name === "left") {
      index--;
      if (index < 0) {
        index = 0;

        printIndex(commits, filename);
        return;
      }
    }

    commit = commits[index];
    printCommit(commit, filename, index);
  });
}
main(options.src);
