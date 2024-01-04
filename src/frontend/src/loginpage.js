import React from 'react';
import Cookies from "js-cookie";
import { withRouter } from "react-router-dom";
import queryString from "query-string";
import config from "./config.json";

// The entire login page
class LoginPageApp extends React.Component {
  // When loads, fetches account details to set 
  componentDidMount() {
    if (Cookies.get("authenticated")) {
      // Fetch and update role
      fetch('/api/accountDetails')
      .then(async (response) =>  {
        if (!response.ok) {
          throw new Error();
        }
        let responseJson = await response.json();
        localStorage.setItem("currentrole", responseJson.role);
      }).catch(err => {
        console.log(err);
      })
    } else {
      if (localStorage.getItem("currentrole")) {
        localStorage.removeItem("currentrole");
      }
    }
  }

  render () {
    document.title = "Login"
    return (
      <main className="content midsplit">
        <div className="loginWelcomeBox">
          <h1 id="loginTitle">Welcome To</h1>
          <img id="loginLogo" src={process.env.PUBLIC_URL + '/bannerlogo.jpg'}></img>
        </div>
        <div className="contentWrapper">
          <SignUpBox history={this.props.history} location={this.props.location}/>
        </div>
        <div className="contentWrapper">
          <SignInBox history={this.props.history} location={this.props.location}/>
        </div>
      </main>
    );
  }
}

// The sign up box of the login page
class SignUpBox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: "",
      email: "",
      password: "",
	   passwordRepeat: "",
    };

    // Set event handlers
    this.handleUsernameChange=this.handleUsernameChange.bind(this);
    this.handleEmailChange=this.handleEmailChange.bind(this);
    this.handlePasswordChange=this.handlePasswordChange.bind(this);
	  this.handlePasswordRepeatChange=this.handlePasswordRepeatChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
  }
  
  // Event handlers to keepm state updated with inputs
  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }
  handleEmailChange(event) {
    this.setState({email: event.target.value});
  }
  handlePasswordChange(event) {
    this.setState({password: event.target.value}, this.stylePasswordMatch);
  }
  handlePasswordRepeatChange(event) {
    this.setState({passwordRepeat: event.target.value}, this.stylePasswordMatch);
  }
  // Check password match and style accordingly
  stylePasswordMatch = function() {
	if (this.state.password !== this.state.passwordRepeat) {
		// Mismatch, add classname to style
		document.querySelector("#passwordSignUp").classList.add("incorrectInput");
		document.querySelector("#passwordRepeatSignUp").classList.add("incorrectInput");
		document.querySelector("#signupErrorPasswordMatch").classList.add("show");
		document.querySelector("#signupErrorPasswordRepeatMatch").classList.add("show");
	} else {
		// No mismatch, ensure no error styling
		document.querySelector("#passwordSignUp").classList.remove("incorrectInput");
		document.querySelector("#passwordRepeatSignUp").classList.remove("incorrectInput");
		document.querySelector("#signupErrorPasswordMatch").classList.remove("show");
		document.querySelector("#signupErrorPasswordRepeatMatch").classList.remove("show");
	}
  }

  // Frontend validation for registration submission
  validateSubmission()  {
	// Reset the error fields to default (not showing)
	["#signupErrorUsernameEmpty", "#signupErrorUsernameFormat", "#signupErrorEmailEmpty", "#signupErrorEmailFormat", "#signupErrorPasswordEmpty", "#signupErrorPasswordLength", "#signupErrorPasswordMatch", "#signupErrorPasswordRepeatEmpty", "#signupErrorPasswordRepeatMatch"].forEach(
		errorField => {
			document.querySelector(errorField).classList.remove("show");
		}
	);
    // Check empty fields
	let errorFields = [];
    if (this.state.username === "") {
	  errorFields.push("#signupErrorUsernameEmpty");
    }
    if (this.state.email === "") {
	  errorFields.push("#signupErrorEmailEmpty");
    }
    if (this.state.password === "") {
	  errorFields.push("#signupErrorPasswordEmpty");
    }
    if (this.state.passwordRepeat === "") {
	  errorFields.push("#signupErrorPasswordRepeatEmpty");
    }
    // Password check
    if (this.state.password !== this.state.passwordRepeat) {
	  errorFields.push("#signupErrorPasswordMatch");
	  errorFields.push("#signupErrorPasswordRepeatMatch");
    }
    // Ensure username is long enough
    if (this.state.username.length < 3 || this.state.username.length > 25) {
	  errorFields.push("#signupErrorUsernameFormat");
    }
    // Ensure email conforms to rough regex
    const re = new RegExp(/^[^@]+@[^@]+\.[^@]+$/) //https://stackoverflow.com/a/50343015
    if (!re.test(this.state.email)) {
		errorFields.push("#signupErrorEmailFormat");
    }
    // Ensure email is not too long
    if (this.state.email.length > 254) {
	  errorFields.push("#signupErrorEmailFormat");
    }
    // Ensure password is long enough
    if (this.state.password.length < 6) {
	  errorFields.push("#signupErrorPasswordLength");
    }
	// Show the error messages
	errorFields.forEach( errorField => {
		console.log(errorField)
		document.querySelector(errorField).classList.add("show");
	});

	// If there are any elements in the errorfields list, an error has occured
	// Therefore return true if there are no errors, false otherwise
	return (errorFields.length == 0);
  }

  //https://www.techomoro.com/submit-a-form-data-to-rest-api-in-a-react-app/
  async handleSubmit(e) {
    e.preventDefault();
    if (!this.validateSubmission()){  // validate submission before sending to backend
      return;
    }
    // Fetch request to attempt to register user
    let res = await fetch("api/register", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        email: this.state.email,
        password: this.state.password
      }),
    });
    // Get response and handle success or failure
    let resJson = await res.json();
    if (res.status !== 200) {
      alert("Error with Sign-up: \n" + resJson.message + "\nPlease resolve the issues and try again");
    } else {
      alert("User registered");
      // Resets state and input so user doesnt attempt to register multiple times
      e.target.reset();
      this.setState({username: ""});
      this.setState({email: ""});
      this.setState({password: ""});
      this.setState({passwordRepeat: ""});
    }
  }

  render () {
    return (
      <div className="signUpBox" id="signupForm">
        <form onSubmit={this.handleSubmit}>
            <h2>Sign Up</h2>
            <div>
                <label for="usernameSignUp">Username:</label>
                <input type="text" id="usernameSignUp" name="usernameSignUp" defaultValue="" onChange={this.handleUsernameChange} placeholder="Enter your username" autocomplete="new-username"/>
				<p id="signupErrorUsernameEmpty" className="inputErrorText">Please enter a username</p>
				<p id="signupErrorUsernameFormat" className="inputErrorText">Username must be between 3 and 25 characters</p>
            </div>
            <div>
                <label for="emailSignUp">Email:</label>
                <input type="text" id="emailSignup" name="emailSignup" defaultValue="" onChange={this.handleEmailChange} placeholder="Enter your email address"/>
				<p id="signupErrorEmailEmpty" className="inputErrorText">Please enter an email</p>
				<p id="signupErrorEmailFormat" className="inputErrorText">Please enter a valid email</p>
            </div>
            <div>
                <label for="passwordSignUp">Password:</label>
                <input type="password" id="passwordSignUp" name="passwordSignUp" defaultValue="" onChange={this.handlePasswordChange} placeholder="Enter a password" autocomplete="new-password"/>
				<p id="signupErrorPasswordEmpty" className="inputErrorText">Please enter a password</p>
				<p id="signupErrorPasswordLength" className="inputErrorText">Password needs to be at least 6 characters long</p>
				<p id="signupErrorPasswordMatch" className="inputErrorText">Please ensure passwords match</p>
            </div>
			<div>
                <label for="passwordRepeatSignUp">Confirm Password:</label>
                <input type="password" id="passwordRepeatSignUp" name="passwordRepeatSignUp" defaultValue="" onChange={this.handlePasswordRepeatChange} placeholder="Enter password again"/>
				<p id="signupErrorPasswordRepeatEmpty" className="inputErrorText">Please enter a password</p>
				<p id="signupErrorPasswordRepeatMatch" className="inputErrorText">Please ensure passwords match</p>
            </div>
            <button>Submit</button>
        </form>
      </div>
    );
  }
}

// The sign in box of the login page
class SignInBox extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      username: "",
      password: "",
      validRedirects: config.AUTHORIZED_REDIRECTS // Store all other groups redirects
    };

    // Set state handlers
    this.handleUsernameChange=this.handleUsernameChange.bind(this);
    this.handlePasswordChange=this.handlePasswordChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
  }
  
  // Update state on input changes
  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }
  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }
  handleGroupChange(event) {
    // Redirect user to other group in supergroups page
    const redirectString = "?redirect=https://cs3099user29.host.cs.st-andrews.ac.uk/auth/retrieveToken/"
    switch(event.target.value) {
      case "G20":
        // Redirect to G20
        window.location.href = config.GROUP_20_URL + redirectString;
        break;
      case "G21":
        // Redirect to G21
        window.location.href = config.GROUP_21_URL + redirectString;
        break;
      case "G22":
        // Redirect to G22
        window.location.href = config.GROUP_22_URL + redirectString;
        break;
      case "G23":
        // Redirect to G23
        window.location.href = config.GROUP_23_URL + redirectString;
        break;
      case "G24":
        // Redirect to G24
        window.location.href = config.GROUP_24_URL + redirectString;
        break;
      case "G25":
        // Redirect to G25
        window.location.href = config.GROUP_25_URL + redirectString;
        break;
      case "G26":
        // Redirect to G26
        window.location.href = config.GROUP_26_URL + redirectString;
        break;
      case "G27":
        // Redirect to G27
        window.location.href = config.GROUP_27_URL + redirectString;
        break;
      case "G28":
        // Redirect to G28
        window.location.href = config.GROUP_28_URL + redirectString;
        break;
      case "G29":
        // Redirect to G29 (for testing purposes)
        window.location.href = config.GROUP_29_URL + redirectString;
        break;
    }
  }

  // Frontend validation for registration submission
  validateSubmission()  {
    // Reset the error fields to default (not showing)
    ["#signinErrorUsernameEmpty", "#signinErrorPasswordEmpty"].forEach(
      errorField => {
        document.querySelector(errorField).classList.remove("show");
      }
    );
    let errorFields = [];
    // Check empty fields
    if (this.state.username === "") {
      errorFields.push("#signinErrorUsernameEmpty");
    }
    if (this.state.password === "") {
    errorFields.push("#signinErrorPasswordEmpty");
    }
    // Show the error messages
    errorFields.forEach( errorField => {
      console.log(errorField)
      document.querySelector(errorField).classList.add("show");
    });
    // Return true if no errors (i.e. all valid)
    return (errorFields.length == 0);
  }

  //https://www.techomoro.com/submit-a-form-data-to-rest-api-in-a-react-app/
  async handleSubmit(e) {
    e.preventDefault();
    if (!this.validateSubmission()){  // validate submission
      return;
    }
    // Fetch request to attempt to login
    let res = await fetch("api/login", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      }),
    });
    let resJson = await res.json();
    // Handle success or failure 
    if (res.status !== 200) {
      alert("Error with Sign-in: \n" + resJson.message + "\nPlease resolve the issues and try again");
      console.log(resJson.message);
    } else {
      // Logic to check if the log in should be redirected to another site, or sent to the front page
      let params = queryString.parse(this.props.location.search);

      // No redirect so just a normal login
      if(params.redirect == undefined) {
        // When loads, fetches account details to set 
        // Fetch and update role
        fetch('/api/accountDetails')
        .then(async (response) =>  {
          if (!response.ok) {
            throw new Error();
          }
          let responseJson = await response.json();
          localStorage.setItem("currentrole", responseJson.role);
          // Logging in sets auth cookies so should be able to access front page now
          this.props.history.push("/");
        }).catch(err => {
          console.log(err);
          // Send user to front page even if cant retrieve details
          this.props.history.push("/");
        })

      // Sends user to redirect with token if there is a redirect in URL
      } else {  
        // Ensures the site doesn't send the token to an untrusted site
        if (this.state.validRedirects.includes(params.redirect)){
          window.location.replace(params.redirect + resJson.token);
        } else {
          alert("Warning: Invalid redirect given in URL. \nYou will now be signed in but stay on this site.");
          this.props.history.push("/");
        }
        
      }      
    }
  }

  render() {
    return (
      <div className="signInBox">
        <form onSubmit={this.handleSubmit}>
          <h2>Sign In</h2>
          <div>
            <label htmlFor="usernameSignIn">Username:</label>
            <input type="text" id="usernameSignIn" name="usernameSignIn" defaultValue="" placeholder="Enter your username"
			onChange={this.handleUsernameChange}/>
			<p id="signinErrorUsernameEmpty" className="inputErrorText alternative">This field must not be empty</p>
          </div>
          <div>
            <label htmlFor="passwordSignIn">Password:</label>
            <input type="password" id="passwordSignIn" name="passwordSignIn" defaultValue="" placeholder="Enter your password"
			onChange={this.handlePasswordChange}/>
			<p id="signinErrorPasswordEmpty" className="inputErrorText alternative">This field must not be empty</p>
          </div>
          <div>
            <label htmlFor="groupSignIn">Here from somewhere else? Select your group:</label>
            <select name="groupSignIn" id="groupSignIn" form="signInForm" defaultValue={"G29"} onChange={this.handleGroupChange}>
              <option value="G20">G20</option>
              <option value="G21">G21</option>
              <option value="G22">G22</option>
              <option value="G23">G23</option>
              <option value="G24">G24</option>
              <option value="G25">G25</option>
              <option value="G26">G26</option>
              <option value="G27">G27</option>
              <option value="G28">G28</option>
              <option value="G29">G29</option>
            </select>
          </div>
          <button>Submit</button>
        </form>
      </div>
    );
  }
}

export default withRouter(LoginPageApp);

