import * as React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Globe from "react-globe.gl";
import axios from "axios";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import "./IPMapPage.scss";

function IPMapPage() {
  React.useEffect(() => {
    getIPMapData(0);
  }, []);

  const [ivl, setIvL] = React.useState([]);

  const getIPMapData = (days) => {
    axios.get(`/api/data/ipmap/${days}`).then((response) => {
      setIvL(massageLocationData(response.data.ivl));
    });
  };

  const massageLocationData = (data) => {
    let output = [];
    let colors = ["green", "red", "blue"];
    data.forEach((element, index) => {
      let label = `
        <ul>
          <li>IP: ${element.ip} </li>
          <li>Country: ${element.location.country} </li>
          <li>Region: ${element.location.region} </li>
          <li>City: ${element.location.city} </li>
        </ul>
      `;
      output.push({
        lat: element.location.ll[0] + Math.random() * 0.5,
        lng: element.location.ll[1] + Math.random() * 0.5,
        size: 0.15,
        color: colors[index % colors.length],
        label: label,
      });
    });
    return output;
  };

  return (
    <div>
      <div className="date-form">
        <FormControl>
          <InputLabel>Date Range</InputLabel>
          <Select
            label="Date Range"
            className="date-input"
            defaultValue={0}
            onChange={(event) => {
              console.log(event.target.value);
              getIPMapData(event.target.value);
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
      <Globe
        globeImageUrl="https://upload.wikimedia.org/wikipedia/commons/b/ba/The_earth_at_night.jpg"
        pointsData={ivl}
        pointAltitude="size"
        pointColor="color"
        pointLabel="label"
      />
    </div>
  );
}

export default IPMapPage;
