import * as React from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import "./OverviewPage.scss";
import { colors } from "../../Theme.js";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import axios from "axios";

let chartColors = [colors.ocean, colors.contrast, colors.sun, colors.rose];

function OverviewPage(props) {
  React.useEffect(() => {
    getOverviewData(0);
  }, []);

  const getOverviewData = (days) => {
    axios.get(`/api/data/overview/${days}`).then((response) => {
      setSVT(response.data.svt);
      setIVI(response.data.ivi);
      setCVS(response.data.cvs);
      setSessions(response.data.sessions);
    });
  };

  const [svt, setSVT] = React.useState([]);
  const [ivi, setIVI] = React.useState([]);
  const [cvs, setCVS] = React.useState([]);
  const [sessions, setSessions] = React.useState(0);

  return (
    <div className="overview-container">
      <div className="overview-header">
        <FormControl>
          <InputLabel>Date Range</InputLabel>
          <Select
            label="Date Range"
            className="date-input"
            defaultValue={0}
            onChange={(event) => {
              console.log(event.target.value);
              getOverviewData(event.target.value);
            }}
          >
            <MenuItem value={0}>Today</MenuItem>
            <MenuItem value={6}>7 days</MenuItem>
            <MenuItem value={29}>30 days</MenuItem>
            <MenuItem value={89}>90 days</MenuItem>
            <MenuItem value={364}>Year</MenuItem>
          </Select>
        </FormControl>
      </div>
      {/* number of sessions throughout day week month (telnet and ssh)*/}
      <div className="session-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={svt}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={"time"} />
            <Tooltip />
            <YAxis allowDecimals={false} />
            <Line type={"monotone"} dataKey={"connections"} stroke={colors.contrast} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="charts-row">
        {/* top countries by session */}
        <div className="country-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                dataKey="sessions"
                nameKey="country"
                isAnimationActive={false}
                data={cvs}
                cx="50%"
                cy="50%"
                outerRadius={175}
                fill={colors.contrast}
                label
              >
                {cvs.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* total commands each session entered*/}
        <div className="commands-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ivi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="src_ip" />
              <YAxis dataKey="commands" />
              <Tooltip />
              <Legend />
              <Bar dataKey="commands" fill={colors.contrast} stro />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
