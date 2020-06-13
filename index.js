import "regenerator-runtime";

import React from "react";
import ReactDOM from "react-dom";

// import simpleGit from "isomorphic-git";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

const WORKING_DIR_PATH = "./";
const READ_FILE = "TEST.md";
// const git = simpleGit(WORKING_DIR_PATH);

console.log(`Using isomorphic-git version: ${git.version()}`);
git
  .getRemoteInfo({
    http,
    url: "https://github.com/isomorphic-git/isomorphic-git.git",
  })
  .then((data) => {
    if (data && data.refs && data.refs.heads) {
      console.log("List of remote branches");
      console.log(Object.keys(data.refs.heads));
    }
  });

async function main() {
  // let l = await git.log({ file: READ_FILE });
  // console.log(l);
}
main();

class App extends React.Component {
  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
