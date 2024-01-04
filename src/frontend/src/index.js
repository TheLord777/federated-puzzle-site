import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory
} from "react-router-dom";
import ReactDOM from 'react-dom/client';
import './styles.css';
import LoginPageApp from './loginpage.js';
import LandingPageApp from './landingpage.js';
import PuzzlePageApp from './puzzlepage.js';
import PuzzleSubmissionApp from './puzzleSubmission.js';
import Cookies from "js-cookie";
import HeaderBar from './headerbar.js';
import AccountPage from './accountPage.js';
import SearchPage from './searchpage.js';
import config from "./config.json";



// Private route - https://melih193.medium.com/react-with-react-router-5-9bdc9d427bfd
// Only allows users to access these routes if they are authenticated
function PrivateRoute({component: Component, ...rest}) {
  return (
    <Route
      {...rest}
      render={props =>
        Cookies.get("authenticated") ? (
          <Component {...props} key={window.location.pathname}/>
        ) : (
          <Redirect
            to={{
              pathname: "/login"
            }}
          />
        )
      }
    />
  )
}

// Protected route
// Only allows users to access these routes if they have roles above Solver (i.e. Creator or Administrator)
function ProtectedRoute({component: Component, ...rest}) {
  return (
    <Route
      {...rest}
      render={props =>
        (localStorage.getItem("currentrole") == "creator" || localStorage.getItem("currentrole") == "administrator") ? (
          <Component {...props} key={window.location.pathname}/>
        ) : (
          <Redirect
            to={{
              pathname: "/"
            }}
          />
        )
      }
    />
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <Router> 
        <div className="page">
          <header>
            <HeaderBar />
          </header>
          <Switch>
            <PrivateRoute path="/post/:id?" component={PuzzlePageApp} />
            <ProtectedRoute  path="/submit" component={PuzzleSubmissionApp} />
            <PrivateRoute path="/search" component={SearchPage} />
            <PrivateRoute path="/account/:id?" component={AccountPage} />
            <Route path="/login" component={LoginPageApp} />
            {/*Redirects authorize route to the login page preserving the location*/}
            <Route path="/auth/authorize" component={({ location }) => (
              <Redirect to={{...location, pathname: "/login"}} />
              )}
            />
            <PrivateRoute exact path="/" component={LandingPageApp} />
            {/*Fallback to 404 for no matches*/}
            <PrivateRoute component={Page404}/>
          </Switch>
          {Footer()}
        </div>
      </Router>
    </React.StrictMode>
);

// React Functional Component for the 404 Page
function Page404() {

  const history = useHistory();

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

  // Returns an empty html element if not authenticated or if not a creator/admin, else returns the create button
  let createText = Cookies.get("authenticated") && (localStorage.getItem("currentrole") == "creator" || localStorage.getItem("currentrole") == "administrator")  ? 
  <>
    , but if you're feeling bold, you could even <a href="/submit">create</a> your own path
  </>
  : 
  null;

  // Set the document title
  document.title = "404 Page Not Found";

  return (
    <main className="content">
      <div id="Page404">
        <h1><i>"This is not the page you're looking for..." - Obi Wan Sudoku</i></h1>
        <p>The page you're trying to reach doesn't exist on Sudoku29!</p>
        <hr></hr>
        <h3>If you're lost, just take a moment and <a href="/search">search</a> your surroundings; knowing <a onClick={() => accountClick()} href="#">who you are</a> always helps you know where you are and where you're trying to go. The way back <a href="/">home</a> is always closer than you think{createText}.</h3>
        <h4>- apm29 (2023)</h4>
      </div>
    </main>
  )
}

// Footer element for the page containing links to the rest of the site
function Footer() {
  return (
    <footer>
      <hr style={{marginTop: "0"}}></hr>
      <div>
        <p>Attributions</p>
        <p>Profile Pictures by <a href="https://www.freepik.com/free-vector/fun-pack-monsters-avatars_1258310.htm#page=2&query=avatar&position=25&from_view=search&track=sph">Freepik</a></p>
        <br/>
        <p className="centered">Check out the other sites in our federation!</p>
        <p className="centered">
          <a href={config.GROUP_20_URL.slice(0, 46)}>G20</a>
          •
          <a href={config.GROUP_21_URL.slice(0, 46)}>G21</a>
          •
          <a href={config.GROUP_22_URL.slice(0, 46)}>G22</a>
          •
          <a href={config.GROUP_23_URL.slice(0, 46)}>G23</a>
          •
          <a href={config.GROUP_24_URL.slice(0, 46)}>G24</a>
          •
          <a href={config.GROUP_25_URL.slice(0, 46)}>G25</a>
          •
          <a href={config.GROUP_26_URL.slice(0, 46)}>G26</a>
          •
          <a href={config.GROUP_27_URL.slice(0, 46)}>G27</a>
          •
          <a href={config.GROUP_28_URL.slice(0, 46)}>G28</a>
        </p>
        <p className="centered" style={{color: "rgb(132, 132, 132)"}}>Sudoku29 v12.3.23</p>
      </div>
    </footer>
  )
}