
class MyClass {
  constructor() {
    console.log(this);
  }

  * generatorMethod() {
    let i = 0;

    while (i < 10)
      yield i++;

    return 'done';
  }
}

const myClass = new MyClass();
console.log([...myClass.generatorMethod()]);
