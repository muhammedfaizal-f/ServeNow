// Central export for all models
// Usage: const { User, Provider, Booking } = require("./models");

const User = require("./User");
const Provider = require("./Provider");
const Service = require("./Service");
const Booking = require("./Booking");
const Review = require("./Review");

module.exports = { User, Provider, Service, Booking, Review };