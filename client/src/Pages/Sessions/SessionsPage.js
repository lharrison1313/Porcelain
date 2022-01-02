import * as React from "react";
import { Typography } from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import "./SessionPage.scss";
import axios from "axios";
import moment from "moment";
import { FormControl, InputLabel, MenuItem, Select, Pagination } from "@mui/material";
import { typography } from "@mui/system";

function SessionsPage() {
  React.useEffect(() => {
    getSessionData(0);
  }, []);

  const [sessions, setSessions] = React.useState([]);
  const [totalSessions, setTotalSessions] = React.useState(0);
  const itemsPerPage = 10;
  const [range, setRange] = React.useState([0, itemsPerPage]);

  const getSessionData = (days) => {
    axios.get(`/api/data/sessions/${days}`).then((response) => {
      setSessions(response.data.sessions);
      setTotalSessions(response.data.total_sessions);
    });
  };

  const buildSessionAccordions = (range) => {
    let accordions = [];
    let slicedSessions = sessions.slice(range[0], range[1]);
    slicedSessions.forEach((session) => {
      let date = moment(session.timestamp).format("MM/DD/YYYY hh:mm a");
      accordions.push(
        <MuiAccordion className="accordion-container">
          <MuiAccordionSummary>
            <Typography>{`${date} - ${session.src_ip}`}</Typography>
          </MuiAccordionSummary>
          <MuiAccordionDetails className="session-commands-container">
            {session.commands.map((command) => {
              let timestamp = moment(command.timestamp).format("HH:mm:ss");
              return <Typography variant="body2">{`${timestamp} > ${command.input}`}</Typography>;
            })}
          </MuiAccordionDetails>
        </MuiAccordion>
      );
    });
    return accordions;
  };

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <FormControl>
          <InputLabel>Date Range</InputLabel>
          <Select
            label="Date Range"
            className="date-input"
            defaultValue={0}
            onChange={(event) => {
              getSessionData(event.target.value);
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
      <div>
        {totalSessions == 0 ? (
          <div className="empty-sessions-container">
            <Typography>There are no sessions during this time period...</Typography>
          </div>
        ) : (
          buildSessionAccordions(range)
        )}
      </div>
      <div className="sessions-footer">
        <Pagination
          color="ocean"
          count={Math.ceil(totalSessions / itemsPerPage)}
          onChange={(event, value) => {
            setRange([(value - 1) * itemsPerPage, (value - 1) * itemsPerPage + itemsPerPage]);
            console.log([(value - 1) * itemsPerPage, (value - 1) * itemsPerPage + itemsPerPage]);
          }}
        />
      </div>
    </div>
  );
}

export default SessionsPage;
