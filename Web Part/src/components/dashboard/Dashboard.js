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
        console.log(result, "resultwetwe");
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
  const [classGroup, setClassGroup] = useState("8");
  const [cohort, setCohort] = useState("A");
  const [errorPassNumber, setErrorPassNumber] = useState("");
  const [errorGithub, setErrorGithub] = useState("");

  // function letterCheck
  const containsAnyLetter = (str) => {
    return /[a-zA-Z]/.test(str);
  };

  const handleSendInfo = () => {
    // check if input is empty github account
    if (String(githubAccount).length == 0) {
      setErrorGithub("You need a github account.");
    } else {
      setErrorGithub("");
    }

    // check if github account exists
    if (String(githubAccount).length !== 0) {
      Axios.get(`http://api.github.com/users/${githubAccount}`)
        .then((res) => {
          console.log(res);
          setErrorGithub("");
        })
        .catch((err) => {
          setErrorGithub("Invalid Github Account.");
        });
    }

    // validate if pass number contains letters
    if (containsAnyLetter(String(passNumber))) {
      setErrorPassNumber("Pass Number can't contain letters.");
    } else {
      setErrorPassNumber("");
    }

    // validate if pass number is 9 numbers long
    if (String(passNumber).length < 9 || String(passNumber).length > 9) {
      setErrorPassNumber("pass number needs to have 9 numbers.");
    } else {
      setErrorPassNumber("");
    }

    if (
      passNumber !== "" &&
      githubAccount !== "" &&
      classGroup !== "" &&
      errorGithub == "" &&
      errorPassNumber == ""
    ) {
      Axios.post("https://softwareondersteunt.nl/API/create_user.php", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      }).then((res) => {
        console.log(res);
      });
    }
  };

  return (
    <div id="dashboardContainer">
      <h2>
        Hello {userInfo.given_name} {userInfo.family_name}!
      </h2>
      <p>Almost ready, We only need your account info.</p>
      <div className="form">
        <h3>Setup Account Info</h3>
        <label>Cohort</label>
        <select
          onChange={(e) => {
            setClassGroup(e.target.value);
          }}
        >
          <option value="8">8 </option>
          <option value="9">9 </option>
          <option value="0">0 </option>
          <option value="1">1 </option>
        </select>
        <label>Klas</label>
        <select
          onChange={(e) => {
            setCohort(e.target.value);
          }}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <div className="inputContainer">
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
                setPassNumber(String(e.target.value));
              }
            }}
          />
          {errorPassNumber && <p className="errorText">{errorPassNumber}</p>}
        </div>
        <div className="inputContainer">
          <label>Github Account</label>
          <input
            placeholder="Enter Github account"
            onChange={(e) => {
              setGithubAccount(e.target.value);
            }}
          />
          {errorGithub && <p className="errorText">{errorGithub}</p>}
        </div>
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
