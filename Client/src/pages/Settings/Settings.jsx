import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProfileCard from "./ProfileCard";
import SettingsCard from "./SettingsCard";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const theme = createTheme();

const Settings = () => {
  const [text, setText] = useState("");

  const mainUser = {
    // DEFAULT VALUES
    title: "Head of School",
    dt1: 32,
    dt2: 40,
    dt3: 50,
    firstName: "Victor",
    lastName: "Wong",
    // midName: "Baker",
    gender: "male",
    phone: "12345678",
    email: "janedoe@gmail.com",
    pass: "password123"
  };

  const fullName = `${mainUser.firstName} ${mainUser.lastName}`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        {/* BACKGROUND */}
        <Grid container direction="column" sx={{ overflowX: "hidden" }}>
          <Grid item xs={12} md={6}>
            <img
              alt="avatar"
              style={{
                width: "100vw",
                height: "80vh",
                objectFit: "cover",
                objectPosition: "50% 50%",
                position: "relative",
              }}
              src="https://iris2.gettimely.com/images/default-cover-image.jpg"
            />
          </Grid>

          {/* COMPONENTS */}
          <Grid
            container
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{
              position: "absolute",
              top: "20vh",
              px: { xs: 0, md: 7 }
            }}
          >
            {/* PROFILE CARD */}
            <Grid item md={3}>
              <ProfileCard
                name={fullName}
                sub={mainUser.title}
                dt1={mainUser.dt1}
                dt2={mainUser.dt2}
                dt3={mainUser.dt3}
              ></ProfileCard>
            </Grid>

            {/* SETTINGS CARD */}
            <Grid item md={5.5}>
              <SettingsCard
                expose={(v) => setText(v)}
                firstName={mainUser.firstName}
                lastName={mainUser.lastName}
                midName={mainUser.midName}
                phone={mainUser.phone}
                email={mainUser.email}
                pass={mainUser.pass}
                gender={mainUser.gender}
              ></SettingsCard>
            </Grid>

          </Grid>
        </Grid>
      </CssBaseline>
    </ThemeProvider>
  );
};

export default Settings;