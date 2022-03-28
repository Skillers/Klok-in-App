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
      <img width={300} src="./roclogo.png" />
      <h2>Welcome to the Clock In App! </h2>

      <div className="test">
        <h1>Login with google</h1>
        <p>To use the application you need to login with google.</p>
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          buttonText="Login with Google"
          onSuccess={handleLogin}
          onFailure={handleFailure}
          cookiePolicy={"single_host_origin"}
          hostedDomain={"roc-dev.com"}
        ></GoogleLogin>
      </div>
    </div>
  );
}

export default Login;
