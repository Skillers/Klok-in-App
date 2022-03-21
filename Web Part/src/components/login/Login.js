import React, { useEffect } from "react";
import Axios from "axios";
import GoogleLogin from "react-google-login";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  let navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    Axios.post("http://localhost:5000/api/google-login", {
      token: localStorage.getItem("tokenId"),
    })
      .then((result) => {
        console.log(result);
        navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // if frontend login succesfully send the google idTokenID to verify the tokenId
  const handleLogin = (googleData) => {
    console.log(googleData);
    Axios.post("/api/google-login", {
      token: googleData.tokenId,
    }).then((data) => {
      console.log(data.data);
      localStorage.setItem("tokenId", googleData.tokenId);
      navigate("/dashboard");
    });
  };

  // if login failed, console.log(error)
  const handleFailure = (result) => {
    console.log(result);
  };

  return (
    <div id="loginContainer">
      <h2>Roc Software Developer Klok In App</h2>
      <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        buttonText="Log In with Google"
        onSuccess={handleLogin}
        onFailure={handleFailure}
        cookiePolicy={"single_host_origin"}
        hostedDomain={"roc-dev.com"}
      ></GoogleLogin>
    </div>
  );
}

export default Login;
