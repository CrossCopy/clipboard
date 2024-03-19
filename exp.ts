import { getText, getImageBase64, Animal, asyncGetText } from "./index.js";
import Clipboard from "./index.js";

// const text = getText();

// console.log(text);

// const dog = new Animal("dog", 5);
// console.log(dog.name);
// dog.changeName("dog 2");
// console.log(dog.name);

// console.log(Animal.getText());

console.log(Clipboard.getText());
asyncGetText().then(console.log);
