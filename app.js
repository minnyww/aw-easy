import express from 'express';

const app = express();
const port = 6336;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render("index", {});
});

app.listen(port, () => {
  console.log("Starting Server. port "+port);
  console.log("http://localhost:"+port);
});
