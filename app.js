const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");

const roleRoutes = require('./routes/roleRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const refundRoutes = require('./routes/refundRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const charterRoutes = require('./routes/charterRoutes');
const userRoutes = require('./routes/userRoutes');
const routeRoutes = require('./routes/routeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const agentRoutes = require('./routes/agentRoutes');
const commisionRoutes = require('./routes/commisionRoutes')

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.static('public'))
app.use("/public/images", express.static(__dirname + "/public/images"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use("/api/roles", roleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/charter", charterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/commision", commisionRoutes);

app.post('/cancelrmapayment', (req, res) => {
    if(req.body === null){
        res.status(200).json({ message: 'Api called' });
        
    }
    console.log("im called")
    res.status(200).json({ message: 'Payment cancelled successfully' });
});

module.exports = app;
