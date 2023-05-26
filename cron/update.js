const axios = require("axios");
const dotenv = require("dotenv");
const { XMLParser } = require("fast-xml-parser");

const db = require("../utils/db");

dotenv.config();

const update = async () => {
  await updateAlerts();
  await updateDestinations();
};

const updateAlerts = async () => {
  try {
    const config = await db.get("config");

    const response = await axios.get(config.value.alerts.gddkiaEndpoint);

    const dataXML = response.data;
    const parser = new XMLParser();
    const data = parser.parse(dataXML);

    const alerts = data.utrudnienia.utr.filter((alert) => {
      return (
        (alert.nr_drogi === "A4" || alert.nr_drogi === "A8e") && alert.km < 278
      );
    });

    const updates = {
      value: { updated: new Date(), alerts },
    };

    await db.update(updates, "alerts");
  } catch (error) {
    console.log(error);
  }
};

const updateDestinations = async () => {
  try {
    const config = await db.get("config");

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          key: process.env.GOOGLE_API_KEY,
          language: "pl",
          departure_time: "now",
          origins: `place_id:${config.value.destinations.originId}`,
          destinations: `place_id:${config.value.destinations.place1.id}|place_id:${config.value.destinations.place2.id}|place_id:${config.value.destinations.place3.id}`,
        },
      }
    );

    const destinations = [
      {
        name: config.value.destinations.place1.name,
        imgSrc: config.value.destinations.place1.imgSrc,
        distance: parseInt(
          response.data.rows[0].elements[0].distance.value / 1000
        ),
        duration: response.data.rows[0].elements[0].duration.value,
        durationInTraffic:
          response.data.rows[0].elements[0].duration_in_traffic.value,
      },
      {
        name: config.value.destinations.place2.name,
        imgSrc: config.value.destinations.place2.imgSrc,
        distance: parseInt(
          response.data.rows[0].elements[1].distance.value / 1000
        ),
        duration: response.data.rows[0].elements[1].duration.value,
        durationInTraffic:
          response.data.rows[0].elements[1].duration_in_traffic.value,
      },
      {
        name: config.value.destinations.place3.name,
        imgSrc: config.value.destinations.place3.imgSrc,
        distance: parseInt(
          response.data.rows[0].elements[2].distance.value / 1000
        ),
        duration: response.data.rows[0].elements[2].duration.value,
        durationInTraffic:
          response.data.rows[0].elements[2].duration_in_traffic.value,
      },
    ];

    const updates = {
      value: { updated: new Date(), destinations },
    };

    await db.update(updates, "destinations");
  } catch (error) {
    console.log(error);
  }
};

module.exports = update;
