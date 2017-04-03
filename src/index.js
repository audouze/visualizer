fetch('assets/test.json')
  .then(function(response) {
    if (!response.ok) return new Error(response);
    return response.json();
  })
  .then(function(json) {
    console.log(json);
  });


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
