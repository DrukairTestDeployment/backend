const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet")
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

app.use(helmet());

app.use(
  helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  })
);

app.use(cors({
    origin: 'https://helistaging.drukair.com.bt',
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
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">PAYMENT CONFIRMATION (<span style="color: #E87111;">DRUKAIR HELI-RESERVATION</span>)</h2>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
        
        <div style="margin-bottom: 20px;">
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Agent Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Name:</strong> <span id="name"></span></p>
                <p style="margin: 5px 0;"><strong>Agent CID:</strong> <span id="cid"></span></p>
                <p style="margin: 5px 0;"><strong>Booking Reference:</strong> <span id="id"></span></p>
                <p style="margin: 5px 0;"><strong>Issued Through:</strong> <span id="type"></span></p>
            </div>
        </div>

        <div>
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Fare Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Transaction Status:</strong> Payment Cancelled</p>
                <p style="margin: 5px 0;"><strong>Flight Fare:</strong> <span id="price"></span> <span>BTN</span></p>
                <p style="margin: 5px 0;"><strong>Transaction Description:</strong> DrukAir Heli Reservation System Payment</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button 
                onclick="window.location.href='/'" 
                style="background-color: #1E3166; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; cursor: pointer;">
                OK
            </button>
        </div>
    </div>
</body>
<script>
    document.addEventListener("DOMContentLoaded", async function () {
        const id = sessionStorage.getItem("bID");
        try {
            const getbooking = await axios({
                method: "GET",
                url: \`https://heli.drukair.com.bt/api/bookings/\${id}\`
            });
    
            const booking = getbooking.data.data;
            document.getElementById("name").textContent = booking.agent_name;
            document.getElementById("cid").textContent = booking.agent_cid;
            document.getElementById("id").textContent = booking.bookingID;
            document.getElementById("type").textContent = booking.booking_type;
            document.getElementById("price").textContent = booking.bookingPriceBTN;
        } catch (err) {
            console.log(err);
        }
    });      
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.1.3/axios.min.js"></script>
</html>
`);
});

app.post('/failurermapayment', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">PAYMENT CONFIRMATION (<span style="color: #E87111;">DRUKAIR HELI-RESERVATION</span>)</h2>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
        
        <div style="margin-bottom: 20px;">
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Agent Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Name:</strong> <span id="name"></span></p>
                <p style="margin: 5px 0;"><strong>Agent CID:</strong> <span id="cid"></span></p>
                <p style="margin: 5px 0;"><strong>Booking Reference:</strong> <span id="id"></span></p>
                <p style="margin: 5px 0;"><strong>Issued Through:</strong> <span id="type"></span></p>
            </div>
        </div>

        <div>
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Fare Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Transaction Status:</strong> Payment Failed</p>
                <p style="margin: 5px 0;"><strong>Flight Fare:</strong> <span id="price"></span> <span>BTN</span></p>
                <p style="margin: 5px 0;"><strong>Transaction Description:</strong> DrukAir Heli Reservation System Payment</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button 
                onclick="window.location.href='/'" 
                style="background-color: #1E3166; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; cursor: pointer;">
                OK
            </button>
        </div>
    </div>
</body>
<script>
    document.addEventListener("DOMContentLoaded", async function () {
        const id = sessionStorage.getItem("bID");
        try {
            const getbooking = await axios({
                method: "GET",
                url: \`https://heli.drukair.com.bt/api/bookings/\${id}\`
            });
    
            const booking = getbooking.data.data;
            document.getElementById("name").textContent = booking.agent_name;
            document.getElementById("cid").textContent = booking.agent_cid;
            document.getElementById("id").textContent = booking.bookingID;
            document.getElementById("type").textContent = booking.booking_type;
            document.getElementById("price").textContent = booking.bookingPriceBTN;
        } catch (err) {
            console.log(err);
        }
    });      
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.1.3/axios.min.js"></script>
</html>
`)
});

app.post('/successrmapayment', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">PAYMENT CONFIRMATION (<span style="color: #E87111;">DRUKAIR HELI-RESERVATION</span>)</h2>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">
        
        <div style="margin-bottom: 20px;">
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Agent Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Name:</strong> <span id="name"></span></p>
                <p style="margin: 5px 0;"><strong>Agent CID:</strong> <span id="cid"></span></p>
                <p style="margin: 5px 0;"><strong>Booking Reference:</strong> <span id="id"></span></p>
                <p style="margin: 5px 0;"><strong>Issued Through:</strong> <span id="type"></span></p>
            </div>
        </div>

        <div>
            <div style="background-color: #1E3166; color: white; padding: 10px; font-weight: bold; text-transform: uppercase;">Fare Information</div>
            <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Transaction Status:</strong> Payment Successful</p>
                <p style="margin: 5px 0;"><strong>Flight Fare:</strong> <span id="price"></span> <span>BTN</span></p>
                <p style="margin: 5px 0;"><strong>Transaction Description:</strong> DrukAir Heli Reservation System Payment</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button 
                onclick="window.location.href='/'" 
                style="background-color: #1E3166; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; cursor: pointer;">
                OK
            </button>
        </div>
    </div>
</body>
<script>
    const update = async (id, booking) => {
        try {
          const res = await axios({
            method: "PATCH",
            url: \`https://heli.drukair.com.bt/api/bookings/\${id}\`,
            data: {
                payment_status: "Paid",
                cType: "BTN",
                price: booking?.bookingPriceBTN
            },
          });
        } catch (err) {
          console.log(err);
        }
    };      
    document.addEventListener("DOMContentLoaded", async function () {
        const id = sessionStorage.getItem("bID");
        try {
            const getbooking = await axios({
                method: "GET",
                url: \`https://heli.drukair.com.bt/api/bookings/\${id}\`
            });
    
            const booking = getbooking.data.data;
            document.getElementById("name").textContent = booking.agent_name;
            document.getElementById("cid").textContent = booking.agent_cid;
            document.getElementById("id").textContent = booking.bookingID;
            document.getElementById("type").textContent = booking.booking_type;
            document.getElementById("price").textContent = booking.bookingPriceBTN;
            update(id, booking);
        } catch (err) {
            console.log(err);
        }
    });      
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.1.3/axios.min.js"></script>
</html>
`)
});

module.exports = app;
