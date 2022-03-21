import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Axios from "axios";

const Dashboard = () => {
  let navigate = useNavigate();

  // user info
  const [userInfo, setUserInfo] = useState("");

  // Check if user logged in if not send back to login screen
  useEffect(() => {
    Axios.post("http://localhost:5000/api/google-login", {
      token: localStorage.getItem("tokenId"),
    })
      .then((result) => {
        setUserInfo(result.data);
      })
      .catch((err) => {
        console.log(err);
        navigate("/dashboard");
      });
  }, []);

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem("tokenId");
    navigate("/login");
  };

  // keep track of form inputs
  const [passNumber, setPassNumber] = useState("");
  const [githubAccount, setGithubAccount] = useState("");
  const [classGroup, setClassGroup] = useState("1a");

  // handle button post user info

  const handleSendInfo = () => {
    if (passNumber !== "" && githubAccount !== "" && classGroup !== "") {
      console.log({ passNumber, githubAccount, classGroup });
      Axios.post("http://localhost:5000/sendAccountInfo", {
        token: localStorage.getItem("tokenId"),
        passNumber,
        githubAccount,
        classGroup,
      }).then((res) => {
        console.log(res);
      });
    }
  };

  let name = "name";
  return (
    <div id="dashboardContainer">
      <h2>Hello {userInfo.name}!</h2>
      <div className="form">
        <h3>Account Info</h3>
        <select
          onChange={(e) => {
            setClassGroup(e.target.value);
          }}
        >
          <option value="1a">1A (Test)</option>
          <option value="1b">1B (Test)</option>
          <option value="1c">1C (Test)</option>
          <option value="1d">1D (Test)</option>
        </select>
        <label>Pass Number</label>
        <input
          onChange={(e) => {
            setPassNumber(e.target.value);
          }}
        />
        <label>Github Account</label>
        <input
          onChange={(e) => {
            setGithubAccount(e.target.value);
          }}
        />
        <button onClick={handleSendInfo}>Confirm Account Info</button>
      </div>
      <button className="logOutButton" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
