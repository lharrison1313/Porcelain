import * as React from "react";
import "./HeaderMenu.css";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ChevronLeft, Home, Public, Terminal } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function HeaderMenu(props) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const menuItems = [
    { text: "Overview", icon: <Home color="ocean" />, location: "overview" },
    { text: "Sessions", icon: <Terminal color="ocean" />, location: "sessions" },
    { text: "IP Map", icon: <Public color="ocean" />, location: "ip-map" },
  ];

  const getMenuItems = () => {
    let items = [];
    menuItems.forEach((item) => {
      items.push(
        <ListItem
          button
          key={item.text}
          onClick={() => {
            navigate(item.location);
            setOpen(false);
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText color="contrast" primary={item.text} />
        </ListItem>
      );
    });
    return items;
  };

  return (
    <div>
      <Box>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton onClick={() => setOpen(true)} size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon color="ocean" />
            </IconButton>
            <Typography>Porcelain</Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Drawer variant="persistant" open={open} color="secondary">
        <div className="drawer-close">
          <IconButton
            color="terminal"
            size="large"
            onClick={() => {
              setOpen(false);
            }}
          >
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List>{getMenuItems()}</List>
      </Drawer>
    </div>
  );
}

export default HeaderMenu;
