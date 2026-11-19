// import { writeFileSync } from "fs";
import { appendFileSync } from "fs";
import { createInterface } from "readline";

const readline = createInterface({
  input: stdin.process,
  output: stdout.process,
});

class Person {
  constructor(name = "", number = "", email = "") {
    this.name = name;
    this.number = number;
    this.email = email;
  }

  saveToCSV() {
    const content = `${this.name} ,${this.number} , ${this.email}`;
    try {
      appendFileSync("./contact.csv", content);
      console.log(`${this.name} is saved`);
    } catch (err) {
      console.error(err);
    }
  }
}

const readLineSync = (message) =>
  new Promise((resolve) => readline.question(message, resolve));

// i wrote this code for testing purpose .
// const content =
//   "this is a test message to check if i can create a file using writeFileSync"; // this is synchronous so it blocks everything till it finishes

// try {
//   writeFileSync("./test.txt", content);
// } catch (err) {
//   console.log(err);
// }

const startApp = async () => {
  let shouldCountinue = true;
  while (shouldCountinue) {
    const name = await readLineSync("Enter a name: ");
    const number = await readLineSync("Enter a number: ");
    const email = await readLineSync("Enter a email: ");

    const person = new Person(name, number, email);
    person.saveToCSV();

    const response = await readLineSync(
      "Do you want to add another contact? (y/n): ",
    );
    shouldCountinue = response.toLowerCase() === "y";
  }
  readline.close();
};

startApp();
