const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect.js');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;
// const { notFound, errorHandler } = require('./middlerwares/errorHandlers.js');

const qrcodeRouter = require('./routes/qrcodeRoute.js')
const userRouter = require('./routes/userRoute')
const qrdataRouter = require('./routes/qrdataRoute.js')
const addstockRouter = require('./routes/addstockRoute.js')
const salesorderRouter = require('./routes/salesorderRoute.js')
const customernameRouter = require('./routes/customernameRoute.js')
const salespersonRouter = require('./routes/salespersonRoute.js')
const grreturnsRouter = require('./routes/grreturnsRoute')
dbConnect();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use((req, res, next) => res.on('finish', () => console.log(`[${res.statusCode}] ${req.method} ${req.originalUrl}`)) && next());

app.get('/', async(req, res) => {
  res.send('hello from server')
})

app.use('/api/user', userRouter)
app.use('/api/qrcode', qrcodeRouter)
app.use('/api/qrdata', qrdataRouter)
app.use('/api/addstock', addstockRouter)
app.use('/api/salesorder', salesorderRouter)
app.use('/api/customername', customernameRouter)
app.use('/api/salesperson', salespersonRouter)
app.use('/api/grreturns', grreturnsRouter)



// app.use(notFound);
// app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is starting on ${PORT}`)
});