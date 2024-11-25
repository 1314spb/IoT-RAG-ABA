// IMPORTS
import React, { useState } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CustomInput from "./CustomInput";

//APP
export default function SettingsCard(props: any) {
  //TAB STATES
  const [value, setValue] = React.useState("one");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  // GENDER SELECT STATES
  const genderSelect = [
    {
      value: "male",
      label: "Male"
    },
    {
      value: "female",
      label: "Female"
    }
  ];

  // FORM STATES
  const [user, setUser] = useState({
    // DEFAULT VALUES
    firstName: props.firstName,
    lastName: props.lastName,
    midName: props.midName,
    gender: props.gender,
    phone: props.phone,
    email: props.email,
    pass: props.pass,
    showPassword: false
  });

  const changeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  //BUTTON STATES
  const [edit, update] = useState({
    required: true,
    disabled: true,
    isEdit: true
  });

  // EDIT -> UPDATE
  const changeButton = (event: any) => {
    event.preventDefault();
    user.showPassword = false;
    edit.disabled = !edit.disabled;
    edit.isEdit = !edit.isEdit;
    update({ ...edit });
    console.log("user: ", user);
  };

  // TOGGLE PASSWORD VISIBILITY
  const handlePassword = () => {
    user.showPassword = !user.showPassword;
    setUser({ ...user });
  };

  //RETURN
  return (
    <Card variant="outlined" sx={{ height: "100%", width: "100%" }}>
      {/* TABS */}
      <br></br>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab value="one" label="Account" />
        {/* <Tab value="two" label="Tab 2" />
        <Tab value="three" label="Tab 3" /> */}
      </Tabs>
      <Divider></Divider>

      {/* MAIN CONTENT CONTAINER */}
      <form>
        <CardContent
          sx={{
            p: 3,
            maxHeight: { md: "60vh" },
            textAlign: { xs: "center", md: "start" }
          }}
        >
          {/* FIELDS */}
          <FormControl fullWidth>
            <Grid
              container
              direction={{ xs: "column", md: "row" }}
              columnSpacing={5}
              rowSpacing={3}
            >
              {/* ROW 1: FIRST NAME */}
              <Grid component="form" item xs={6}>
                <CustomInput
                  id="firstName"
                  name="firstName"
                  value={user.firstName}
                  onChange={changeField}
                  title="First Name"
                  dis={edit.disabled}
                  req={edit.required}
                ></CustomInput>
              </Grid>

              {/* ROW 1: LAST NAME */}
              <Grid component="form" item xs={6}>
                <CustomInput
                  id="lastName"
                  name="lastName"
                  value={user.lastName}
                  onChange={changeField}
                  title="Last Name"
                  dis={edit.disabled}
                  req={edit.required}
                ></CustomInput>
              </Grid>

              {/* ROW 2: MIDDLE NAME */}
              {/* <Grid item xs={6}>
                <CustomInput
                  id="midName"
                  name="midName"
                  value={user.midName}
                  onChange={changeField}
                  title="Middle Name"
                  dis={edit.disabled}
                  req={edit.required}
                ></CustomInput>
              </Grid> */}

              {/* ROW 2: GENDER */}
              <Grid item xs={6}>
                <CustomInput
                  select
                  id="gender"
                  name="gender"
                  value={user.gender}
                  onChange={changeField}
                  title="Gender"
                  dis={edit.disabled}
                  req={edit.required}
                  //MAP THRU OPTIONS
                  content={genderSelect.map((option) => (
                    <MenuItem value={option.value}>{option.label}</MenuItem>
                  ))}
                ></CustomInput>
              </Grid>

              {/* ROW 3: PHONE */}
              <Grid item xs={6}>
                <CustomInput
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={changeField}
                  title="Phone Number"
                  dis={edit.disabled}
                  req={edit.required}
                  //DIALING CODE
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+852</InputAdornment>
                    )
                  }}
                ></CustomInput>
              </Grid>

              {/* ROW 3: EMAIL */}
              <Grid item xs={6}>
                <CustomInput
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={changeField}
                  title="Email Address"
                  dis={edit.disabled}
                  req={edit.required}
                ></CustomInput>
              </Grid>

              {/* ROW 4: PASSWORD */}
              <Grid item xs={6}>
                <CustomInput
                  id="pass"
                  name="pass"
                  value={user.pass}
                  onChange={changeField}
                  title="Password"
                  dis={edit.disabled}
                  req={edit.required}
                  type={user.showPassword ? "text" : "password"}
                  // PASSWORD ICON
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handlePassword}
                          edge="end"
                          disabled={edit.disabled}
                        >
                          {user.showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                ></CustomInput>
              </Grid>

              <Grid item xs={6}></Grid>

              {/* BUTTON */}
              <Grid
                container
                justifyContent={{ xs: "center", md: "flex-end" }}
                item
                xs={6}
              >
                <Button
                  sx={{ p: "1rem 2rem", my: 2, height: "3rem" }}
                  component="button"
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={() => props.expose("hello")}
                >
                  {edit.isEdit === false ? "UPDATE" : "EDIT"}
                </Button>
              </Grid>
            </Grid>
          </FormControl>
        </CardContent>
      </form>
    </Card>
  );
}
