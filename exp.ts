import Clipboard from "./index.js";

// const text = getText();

// console.log(text);

// const dog = new Animal("dog", 5);
// console.log(dog.name);
// dog.changeName("dog 2");
// console.log(dog.name);

// console.log(Animal.getText());

// console.log(availableFormats());
// console.log(await Clipboard.getText());
// console.log(await Clipboard.getHtml());
// console.log(Clipboard.hasImage());
// console.log(await Clipboard.getImageBase64());

// Clipboard.watch();
Clipboard.callThreadsafeFunction((x: any) => {
    console.log(x);
    
})