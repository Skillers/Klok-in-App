import logo from "./logo.svg";
import "./App.css";
import GoogleLogin from "react-google-login";
import { useEffect, useState } from "react";
import Axios from "axios";

function App() {
  const [loginData, setLoginData] = useState("");

  // localStorage to check if user already logged in when user opens page
  useEffect(() => {
    if (
      localStorage.getItem("tokenId") !== "" &&
      localStorage.getItem("tokenId") !== null
    ) {
      Axios.post("/api/google-login", {
        token: localStorage.getItem("tokenId"),
      }).then((data) => {
        console.log(data.data);
        setLoginData(data);
      });
    }
  }, []);

  // if login failed, console.log(error)
  const handleFailure = (result) => {
    console.log(result);
  };

  // if frontend login succesfully send the google idTokenID to verify the tokenId
  const handleLogin = (googleData) => {
    console.log(googleData);
    Axios.post("/api/google-login", {
      token: googleData.tokenId,
    }).then((data) => {
      console.log(data.data);
      setLoginData(data);
      localStorage.setItem("tokenId", googleData.tokenId);
    });
  };

  const handleLogout = () => {
    setLoginData(null);
    localStorage.removeItem("tokenId");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Login With Google</h1>
        {loginData ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3>You logged in as {loginData.data.email}</h3>
            <h4>Username: {loginData.data.name}</h4>
            <img width={100} src={loginData.data.picture} />
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Log In with Google"
            onSuccess={handleLogin}
            onFailure={handleFailure}
            cookiePolicy={"single_host_origin"}
            hostedDomain={"roc-dev.com"}
          ></GoogleLogin>
        )}
      </header>
    </div>
  );
}

export default App;
