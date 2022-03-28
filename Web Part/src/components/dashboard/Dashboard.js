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
  const [errorPassNumber, setErrorPassNumber] = useState("");

  // function letterCheck
  const containsAnyLetter = (str) => {
    return /[a-zA-Z]/.test(str);
  };

  const handleSendInfo = () => {
    // validate if pass number contains letters
    if (containsAnyLetter(String(passNumber))) {
      setErrorPassNumber("Pass Number can't contain letters.");
      return setTimeout(() => {
        setErrorPassNumber("");
      }, 2000);
    }

    // validate if pass number is 9 numbers long
    if (String(passNumber).length < 9 || String(passNumber).length > 9) {
      setErrorPassNumber("pass number needs to have 9 numbers.");
      return setTimeout(() => {
        setErrorPassNumber("");
      }, 2000);
    }

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

  return (
    <div id="dashboardContainer">
      <h2>Hello {userInfo.name}!</h2>
      <p>Almost ready, We only need your account info.</p>
      <div className="form">
        <h3>Setup Account Info</h3>
        <label>Cohort</label>
        <select
          onChange={(e) => {
            setClassGroup(e.target.value);
          }}
        >
          <option value="1a">8 </option>
          <option value="1b">9 </option>
          <option value="1c">0 </option>
          <option value="1d">1 </option>
        </select>
        <label>Klas</label>
        <select
          onChange={(e) => {
            setClassGroup(e.target.value);
          }}
        >
          <option value="1a">A</option>
          <option value="1b">B</option>
          <option value="1c">C</option>
          <option value="1d">D</option>
        </select>
        <label>Pass Number</label>
        <input
          placeholder="Enter pass number"
          type="number"
          maxLength={9}
          value={passNumber}
          onChange={(e) => {
            if (
              e.nativeEvent.data !== "e" &&
              (String(passNumber).length !== 9 ||
                e.nativeEvent.inputType == "deleteContentBackward")
            ) {
              console.log(e);
              setPassNumber(String(e.target.value));
            }
          }}
        />
        {errorPassNumber && <p className="errorText">{errorPassNumber}</p>}
        <label>Github Account</label>
        <input
          placeholder="Enter Github account"
          onChange={(e) => {
            setGithubAccount(e.target.value);
          }}
        />
        <button onClick={handleSendInfo}>Confirm Account Info</button>
      </div>
      <button className="logOutButton" onClick={handleLogout}>
        Logout
      </button>
      <img width={200} src="./roclogo.png" />
    </div>
  );
};

export default Dashboard;
