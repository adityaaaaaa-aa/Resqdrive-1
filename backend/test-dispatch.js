const fetch = require('node-fetch'); // wait node 18 has fetch builtin
fetch('http://localhost:5000/api/accident', {
  method: 'POST', 
  headers: {'Content-Type':'application/json'}, 
  body: JSON.stringify({vehicle_id:'V2',location:{lat:10,lng:20},severity:'Critical'})
}).then(r => r.json()).then(console.log).catch(console.error);
