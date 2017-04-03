fetch('assets/data.json')
  .then(function(response) {
    if (!response.ok) return new Error(response);
    return response.json();
  })
  .then(function(json) {
    console.log(json);
  });


