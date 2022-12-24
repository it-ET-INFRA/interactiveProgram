import * as readline from "readline";

const comment = {
  history: "コマンド一覧を表示する",
  "debug-on": "debug情報を表示にする",
  "debug-off": "debug情報を非表示にする",
  d: "debug情報を反転する",
  "-d , --debug": "debug情報を表示",
  "-v , --version": "バージョン情報",
  "-h , --help": "使い方",
} as const;

const autoComplete = (line: string) => {
  const completions = Object.keys(comment);
  const hits = completions.filter((c) => c.startsWith(line));

  // show all completions if none found
  return [hits.length ? hits : completions, line];
};

class Repl {
  rl: readline.Interface;
  version: string;
  debug: boolean;
  commandList: Map<string, string>;
  commandHistory: string[];
  constructor(version = "0.0.1") {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: autoComplete,
    });
    this.version = version;
    this.debug = false;
    this.commandList = new Map();
    this.commandHistory = [];
    this.usage();
  }

  usage() {
    for (const [k, v] of Object.entries(comment)) {
      this.commandList.set(k, v);
    }
  }

  async start() {
    while (1) {
      await this.readSyncLine("> ", async (text) => {
        if (text !== "") {
          this.commandHistory.push(text);
        }
        if (text === "-v" || text === "--version") {
          //バージョンを表示する
          console.log(this.version);
          return;
        }

        if (text === "?" || text === "--help" || text === "-h") {
          //使い方を表示する
          this.commandList.forEach((v, k) => {
            console.log(k, ":", v);
          });
          return;
        }

        if (text === "--debug" || text === "-d" || text === "d" || text === "debug-on" || text === "debug-off") {
          if (text === "d") {
            this.debug = !this.debug;
          }

          if (text === "debug-on") {
            this.debug = true;
          }

          if (text === "debug-off") {
            this.debug = false;
          }

          if (this.debug) {
            console.log("debug on");
            return;
          }
          console.log("debug off");
          return;
        }

        if (text === "history") {
          for (const [i, v] of this.commandHistory.entries()) {
            console.log(i + 1, ":", v);
          }
          return;
        }

        if (text !== "") {
          console.log(text);
          return;
        }
      });
    }
  }

  async readSyncLine(prompt: string, cb: (text: string) => void): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        cb(answer);
        resolve();
      });
    });
  }
}

const r = new Repl("10.0.0");

r.start();
