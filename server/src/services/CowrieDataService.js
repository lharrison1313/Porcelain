const moment = require("moment");
const geoip = require("geoip-lite");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const GET_SESSION_BY_DATE = {
  starttime: { $gte: "", $lte: "" },
};

const GET_UNIQUE_SESSIONS_BY_DATE = [
  {
    $match: {
      starttime: { $gte: "", $lte: "" },
    },
  },
  {
    $group: {
      _id: "$src_ip",
      starttime: { $first: "$starttime" },
    },
  },
  {
    $project: {
      _id: 0,
      src_ip: "$_id",
      starttime: "$starttime",
    },
  },
];

const AGGREGATE_INPUT_COUNTS_BY_IP_AND_DATE = [
  {
    $match: {
      timestamp: { $gte: "", $lte: "" },
    },
  },
  {
    $group: {
      _id: "$src_ip",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      src_ip: "$_id",
      commands: "$count",
    },
  },
];

const AGGREGATE_SESSION_COUNTS_BY_IP_AND_DATE = [
  {
    $match: {
      starttime: { $gte: "", $lte: "" },
    },
  },
  {
    $group: {
      _id: "$src_ip",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      src_ip: "$_id",
      sessions: "$count",
    },
  },
];

const AGGREGATE_INPUTS_BY_IP_AND_DATE = [
  {
    $match: {
      timestamp: { $gte: "", $lte: "" },
    },
  },
  {
    $group: {
      _id: "$session",
      commands: { $push: { input: "$input", timestamp: "$timestamp" } },
      src_ip: { $first: "$src_ip" },
      timestamp: { $first: "$timestamp" },
    },
  },
  {
    $project: {
      _id: 0,
      session_id: "$_id",
      src_ip: 1,
      commands: 1,
      timestamp: 1,
    },
  },
];

async function buildOverviewData(req, res) {
  try {
    let db = req.app.locals.db;
    let days = req.params.days;

    if (!isNaN(days) && days >= 0) {
      let startDate = moment().subtract("day", days).startOf("day");
      let endDate = moment().endOf("day");

      //getting all sessions within date range
      let collection = db.collection("sessions");
      GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$gte = `${startDate.toISOString()}`;
      GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$lte = `${endDate.toISOString()}`;
      let sessions = await collection.aggregate(GET_UNIQUE_SESSIONS_BY_DATE).toArray();
      //getting sum of all inputs aggregated by ip
      collection = db.collection("input");
      AGGREGATE_INPUT_COUNTS_BY_IP_AND_DATE[0].$match.timestamp.$gte = `${startDate.toISOString()}`;
      AGGREGATE_INPUT_COUNTS_BY_IP_AND_DATE[0].$match.timestamp.$lte = `${endDate.toISOString()}`;
      let ivi = await collection.aggregate(AGGREGATE_INPUT_COUNTS_BY_IP_AND_DATE).toArray();

      //building session time chart
      let svt = getSvT(sessions, days);

      //building session locations chart
      let cvs = getCvS(sessions);

      //sending built data
      let data = { sessions: sessions.length, svt: svt, ivi: ivi, cvs: cvs };
      res.json(data);
    } else {
      throw "no days given";
    }
  } catch (error) {
    console.log(error);
    res.send();
  }
}

async function buildIPMapData(req, res) {
  try {
    let db = req.app.locals.db;
    let days = req.params.days;

    if (!isNaN(days) && days >= 0) {
      let startDate = moment().subtract("day", days).startOf("day");
      let endDate = moment().endOf("day");

      //getting all sessions within date range
      let collection = db.collection("sessions");
      GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$gte = `${startDate.toISOString()}`;
      GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$lte = `${endDate.toISOString()}`;
      let sessions = await collection.aggregate(GET_UNIQUE_SESSIONS_BY_DATE).toArray();

      //building ip vs location
      let ipList = [];
      //getting unique ips
      sessions.forEach((session) => {
        if (!ipList.includes(session.src_ip)) {
          ipList.push(session.src_ip);
        }
      });

      let ivl = [];
      ipList.forEach((ip) => {
        let location = geoip.lookup(ip);
        if (location != null) {
          ivl.push({ ip: ip, location: location });
        }
      });

      //sending built data
      let data = { unique_ips: ivl.length, ivl: ivl };
      res.json(data);
    } else {
      throw "no days given";
    }
  } catch (error) {
    console.log(error);
    res.send();
  }
}

async function buildSessionData(req, res) {
  try {
    let db = req.app.locals.db;
    let days = req.params.days;

    if (!isNaN(days) && days >= 0) {
      let startDate = moment().subtract("day", days).startOf("day");
      let endDate = moment().endOf("day");

      collection = db.collection("input");
      AGGREGATE_INPUTS_BY_IP_AND_DATE[0].$match.timestamp.$gte = `${startDate.toISOString()}`;
      AGGREGATE_INPUTS_BY_IP_AND_DATE[0].$match.timestamp.$lte = `${endDate.toISOString()}`;
      let sessions = await collection.aggregate(AGGREGATE_INPUTS_BY_IP_AND_DATE).toArray();

      let data = { total_sessions: sessions.length, sessions: sessions };
      res.json(data);
    } else {
      throw "no days given";
    }
  } catch (error) {
    console.log(error);
    res.send();
  }
}

async function buildHoneyBotData(startTime, endTime, db) {
  try {
    let collection = db.collection("sessions");
    GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$gte = `${startTime.toISOString()}`;
    GET_UNIQUE_SESSIONS_BY_DATE[0].$match.starttime.$lte = `${endTime.toISOString()}`;
    let uniqueSessions = await collection.aggregate(GET_UNIQUE_SESSIONS_BY_DATE).toArray();
    let cvs = getCvS(uniqueSessions);

    GET_SESSION_BY_DATE.starttime.$gte = `${startTime.toISOString()}`;
    GET_SESSION_BY_DATE.starttime.$lte = `${endTime.toISOString()}`;
    let totalSessions = await collection.count(GET_SESSION_BY_DATE);

    AGGREGATE_SESSION_COUNTS_BY_IP_AND_DATE[0].$match.starttime.$gte = `${startTime.toISOString()}`;
    AGGREGATE_SESSION_COUNTS_BY_IP_AND_DATE[0].$match.starttime.$lte = `${endTime.toISOString()}`;
    let sessions_by_ip = await collection.aggregate(AGGREGATE_SESSION_COUNTS_BY_IP_AND_DATE).toArray();

    cvs.sort((a, b) => {
      return b.uniqueSessions - a.uniqueSessions;
    });

    sessions_by_ip.sort((a, b) => {
      return b.sessions - a.sessions;
    });

    return {
      countries: cvs.slice(0, 5),
      unique_sessions: uniqueSessions.length,
      total_sessions: totalSessions,
      sessions_by_ip: sessions_by_ip.slice(0, 5),
    };
  } catch (error) {
    console.log(error);
  }
}

function getSvT(sessions, days) {
  //getting range for svt
  let range;
  if (days < 1) range = { unit: "hours", range: 23, format: "h:mm a" };
  else if (days >= 1 && days < 90) range = { unit: "days", range: days, format: "MM/DD/YYYY" };
  else range = { unit: "months", range: 11, format: "MMM, YYYY" };

  //building sessions vs. time chart [{time, connections}]
  let svt = [];
  for (i = 0; i <= range.range; i++) {
    switch (range.unit) {
      case "hours":
        svt.push({ time: moment().startOf("day").set({ hour: i }).toISOString(), connections: 0 });
        break;
      case "days":
        svt.unshift({
          time: moment().subtract(i, "day").startOf("day").toISOString(),
          connections: 0,
        });
        break;
      case "months":
        svt.push({
          time: moment().startOf("day").startOf("month").set({ month: i }).toISOString(),
          connections: 0,
        });
        break;
    }
  }

  //counting sessions between each time interval
  svt.forEach((element) => {
    let timeA = moment(element.time);
    let timeB = moment(element.time).add(1, range.unit);
    sessions.forEach((session) => {
      let starttime = moment(session.starttime);
      if (starttime.isSameOrAfter(timeA) && starttime.isBefore(timeB)) {
        element.connections++;
      }
    });
  });

  svt.forEach((element) => {
    element.time = moment(element.time).format(range.format);
  });

  return svt;
}

function getCvS(sessions) {
  let ipList = [];
  //getting unique ips
  sessions.forEach((session) => {
    if (!ipList.includes(session.src_ip)) {
      ipList.push(session.src_ip);
    }
  });

  //getting locations for each unique ip
  let countryList = [];
  let countryData = {};
  ipList.forEach((ip) => {
    let location = geoip.lookup(ip);
    let country = location === null ? "unknown" : regionNames.of(location.country);
    if (countryList.includes(country)) {
      countryData[country].sessions++;
    } else {
      countryData[country] = { sessions: 1 };
      countryList.push(country);
    }
  });
  let cvs = [];
  countryList.forEach((country) => {
    cvs.push({ country: country, sessions: countryData[country].sessions });
  });

  return cvs;
}

module.exports = { buildOverviewData, buildIPMapData, buildSessionData, buildHoneyBotData };
