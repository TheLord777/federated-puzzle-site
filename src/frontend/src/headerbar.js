import React from 'react';
import {
  Link,
  useHistory,
  useLocation
} from "react-router-dom";
import './styles.css';
import Cookies from "js-cookie";

// Returns a headerbar containing links to home and login pages
function HeaderBar() {

  const history = useHistory();

  return (
	  <div className="header-bar">
      <div className="headerSide left">
        {HomeButton()}
        {SearchButton()}
        {CreateButton()}
      </div>
      
      <img id="headerlogo" src={process.env.PUBLIC_URL + '/bannerlogo.jpg'} onClick={() => history.push("/")}></img>

      <div className="headerSide right">
        {AccountButton()}
        {LoginButton()}
      </div>
    </div>
  );
}

// Returns a Home button when current user is authenticated
function HomeButton() {
  function loginAlert() {
    if (!Cookies.get("authenticated")) { 
      alert("You must be logged in to access this page.");
      return;
    }
  }

  // Returns an empty html element if not authenticated
  let button = Cookies.get("authenticated")  ? 
  <div className="home">
    <Link onClick={loginAlert} to="/" className="material-icons">home</Link>
  </div>
  : 
  null

  return button;
}

// Returns a Create button when current role is a Creator or Admin
function CreateButton() {
  // Returns an empty html element if not authenticated or if not a creator/admin, else returns the create button
  let button = Cookies.get("authenticated") && (localStorage.getItem("currentrole") == "creator" || localStorage.getItem("currentrole") == "administrator")  ? 
  <div className="submit">
      <Link to="/submit">Create</Link>
  </div>
  : 
  null

  return button;
}

// Returns a Search button when current user is authenticated
function SearchButton() {
  // Returns an empty html element if not authenticated
  let button = Cookies.get("authenticated")  ? 
  <div className="search">
      <Link to="/search" className="material-icons">search</Link>
  </div>
  : 
  null

  return button;
}

// Returns an Account button when on a PrivateRoute
function AccountButton() {

  const history = useHistory();

  // Using location makes this component stateful, re-renders on location change
  // DO NOT DELETE despite not being referenced
  const { pathname } = useLocation();

  // Navigates to the account page if appropriate
  async function accountClick() {
    if (!Cookies.get("authenticated")) { 
      alert("You are not logged in");
      return;
    }

    // Fetches account details from server
    fetch('/api/accountDetails')
    .then(async (response) =>  {
      if (!response.ok) {
        throw new Error();
      }
      let responseJson = await response.json();
      history.push("/account/" + responseJson.user_id);
    }).catch(err => {
      alert("Error: Unable to retrieve account details");
    })
  }

  // Returns an empty html element if not authenticated, else returns the account button
  let button = !Cookies.get("authenticated") ? 
  null
  : 
  <div className="account">
    <Link onClick={accountClick} to="#">My Account</Link>
  </div> 

  return (button);
}

// Returns a Login button when on the Login page, otherwise a Logout
function LoginButton() {

  const history = useHistory();

  // Using location makes this component stateful, re-renders on location change
  // DO NOT DELETE despite not being referenced
  const { pathname } = useLocation();

  // Function to log user out of the site
  async function logout() {
    if (!Cookies.get("authenticated")) { 
      alert("You are not logged in");
      return;
    }

    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }

    // Sends request to logout route, which clears the cookies that store auth
    fetch('/api/logout')
    .then((response) =>  {
      if (!response.ok) {
        throw new Error();
      }
      // Cookies have been deleted by server - clear authenticated cookie just to be safe
      Cookies.remove('authenticated');
      localStorage.removeItem("currentrole");
      history.push("/login")
    }).catch(err => {
      console.log(err);
      alert("Error: Unable to log out")
    })
  }

  // Returns the login button if unauthenticated, else returns the logout button
  let button = !Cookies.get("authenticated") ? 
  null
  : 
  <div className="logout">
    <div onClick={logout}>Logout</div>
  </div>

  return (button);
}

export default HeaderBar;