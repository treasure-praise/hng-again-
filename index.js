require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;
const API = process.env.OPEN_API_KEY;

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Visitor";

  // Getting IP address from request headers or connection
  let clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Handling IPv6 loopback address
  if (clientIp === "::1") {
    clientIp = "127.0.0.1";
  }

  // Fetching public IP for local testing
  if (clientIp === "127.0.0.1") {
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    clientIp = ipResponse.data.ip;
  }

  try {
    // Fetch location based on IP
    const locationResponse = await axios.get(
      `http://ip-api.com/json/${clientIp}`
    );
    const locationData = locationResponse.data;
    const city = locationData.city;

    // Fetch weather based on city
    const weatherResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API}`
    );
    const weatherData = weatherResponse.data;
    const temperature = weatherData.main.temp;

    res.json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
