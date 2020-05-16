const publicIp = require("public-ip");

var exports = (module.exports = {});

exports.checkGCP = async function () {
  let ip = await publicIp.v4();
  if (ip === process.env.GCP_IP) {
    ip = "Google Cloud";
  } else {
    ip = `Not From GCP Server ${ip}`;
  }
  return ip;
};

exports.getCurrentIp = async function () {
  let ip = await publicIp.v4();
  if (ip !== process.env.GCP_IP) {
    ip = "127.0.0.1";
  }
  return ip;
};
