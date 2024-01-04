import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { getProfilePathFromID } from "./util.js";

//https://www.youtube.com/watch?v=HqEtwPP-ELw&t=587s Initial inspration from this youtube tutorial

function AccountPage(props) {
  // State containing the user's details and stats
  const [username, setName] = useState("Unknown User");
  const [accountTier, setAccountTier] = useState("Account Tier");
  const [groupNumber, setGroupNumber] = useState("Group Number");
  const [puzzlesSolved, setPuzzlesSolved] = useState("Puzzles Solved");
  const [puzzlesCreated, setPuzzlesCreated] = useState("Puzzles Created");
  const [bio, setBio] = useState("");
  // loadState of the page to handle pre-load and the result of a load
  const [loadState, setLoadState] = useState(0); // 0 - loading, 1 - loaded, 2 - failed
  // State containing whether or not the current user owns the account page
  const [owned, setOwned] = useState(false);
  
  // Using location makes this component stateful, re-renders on location change
  // DO NOT DELETE despite not being referenced
  const { pathname } = useLocation();

  // Truncates the bio if it exceeds 100 characters
  let biopreview = bio != null && bio.length > 97 ? 
    <div className="bioPreview">
      <p>{bio.substring(0,97)}...</p>
      <a href="#bio">Read {username}'s full bio</a>
    </div>
    :
    <div className="bioPreview full">
      <p>{bio == null || bio == "" ? `${username} doesn't have a bio yet, but we're sure they're a great person!` : bio }</p>
    </div>
  ;  

  let pageContent; // determine what is to be displayed
  switch(loadState) {
    case 1: // Loaded successfully
      pageContent = 
        <div className="content block">
          <div className="accountCard">
            <div className="profileBanner">
              <div className="profilePictureContainer">
                <img
                  src={process.env.PUBLIC_URL + getProfilePathFromID(props.match.params.id)}
                  alt=""
                  height="100px"
                  width="100px"
                />
              </div>
            </div>

            <div className="mainProfile">
              <h3> {username} </h3>
              <h5> {accountTier} </h5>
              <hr></hr>
              <h4>
                <span className="material-icons">group</span> 
                <span className="text"> Group Number: {groupNumber}</span>
                {"\t•\t"}
                <span className="material-icons">extension</span>
                <span className="text"> Puzzles Solved: {puzzlesSolved}</span>
                {accountTier != "Solver" ? "\t•\t" : null}
                {accountTier != "Solver" ? <span className="material-icons">construction</span> : null}
                {accountTier != "Solver" ? <span className="text"> Puzzles Created: {puzzlesCreated}</span> : null}
              </h4>
              {biopreview}
            </div>
          </div>

          <AccountCard id="bio" cardIconName="account_circle" content={<><p>{bio == null || bio == "" ? `${username} doesn't have a bio yet, but we're sure they're a great person!` : bio }</p></>}/>

          <PrivateSection owned={owned} groupNumber={groupNumber} user_id={props.match.params.id} username={username} bio={bio} puzzlesSolved={puzzlesSolved} role={accountTier} updateUsername={setName} updateBio={setBio} updateRole={setAccountTier}></PrivateSection>
        </div>
      ;
      break;
    case 2: // Failed to load
      pageContent = 
        <div className="content">
          <div className="accountCard noUser">
            <div className="profileBanner">
              <div className="profilePictureContainer">
                <img
                  src={process.env.PUBLIC_URL + '/favicon.ico'}
                  alt=""
                  height="100px"
                  width="100px"
                />
              </div>
            </div>

            <div className="mainProfile">
              <h3> User does not exist! </h3>
              <hr></hr>
              <h4>
                <span className="material-icons">group</span> 
                <span className="text"> Group Number: N/A</span>
                {"\t•\t"}
                <span className="material-icons">extension</span>
                <span className="text"> Puzzles Solved: N/A</span>
              </h4>
            </div>
          </div>
        </div>
      ;
      break;
    default: // Loading
      pageContent = 
        <div className="content">
          {/* Page Blank While Loading */}
        </div>
      ;
      // Fetches account details from server
      fetch("/api/account/" + props.match.params.id)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error();
          }
          let responseJson = await response.json();

          setName(responseJson.username);
          setGroupNumber(responseJson.group);
          setPuzzlesSolved(responseJson.noPuzzlesSolved);
          setPuzzlesCreated(responseJson.noPuzzlesCreated);
          setBio(responseJson.bio);
          setAccountTier(responseJson.role.charAt(0).toUpperCase() + responseJson.role.slice(1));
          let newLoadState = 1; // new reference for React to detect change
          setLoadState(newLoadState);
          document.title = responseJson.username; // set document title

          // Fetches logged in user's account details from server
          fetch('/api/accountDetails')
            .then(async (res) =>  {
              if (!res.ok) {
                throw new Error();
              }
              let resJson = await res.json();
              setOwned(pathname == ("/account/" + resJson.user_id)); // set owned state
              localStorage.setItem("currentrole", resJson.role);
            }).catch(err => {
              console.log("Error: Unable to retrieve account details");
            })
          })
        .catch((err) => {
          let newLoadState = 2; // new reference for React to detect change
          document.title = "User not found";
          setLoadState(newLoadState);
        });
      break;
  }

  return (pageContent);
}

/* 
 * props fields
 * id - id of the card container div, used for navigation
 * classNames - class names of the container div not including 'accountCard' (i.e. 'noUser')
 * isMainCard - is this the main card (the one containing a pfp and username)
 * profilePictureSRC - url to the source of the profile picture in the main-card
 * cardIconName - the name of the icon used for a non-main card
 * content - the content of the card
 */
function AccountCard(props) {
  return (
    <div id={props.id} className={`accountCard ${props.classNames ? props.classNames.join(" ") : ""}`}>
      <div className={`profileBanner${props.isMainCard ? "" : " short"}`}>
        {props.isMainCard ? 
          <div className="profilePictureContainer">
            <img
              src={props.profilePictureSRC}
              alt=""
              height="100px"
              width="100px"
            />
          </div>
          : 
          <div className="material-icons">{props.cardIconName}</div>
        }
      </div>
      <div className={props.isMainCard ? "mainProfile" : "cardContent"}>
        {props.content}
      </div>
    </div>
  )
}

function PrivateSection(props) {
  // State for whether or not currently in edit mode (true = editing)
  const [editing, updateEditing] = useState(false);

  // Ref for whether or not a delete has been triggered
  const deleteTriggered = useRef(false);

  // ID to be used for the delete modal's ID
  const deleteModalID = "deleteModal";

  // When rendered, if in edit mode, sizes the text areas appropriately
  useEffect(() => {
    if (editing) {
      if (props.groupNumber == 29) {
        updateTextArea("usernameEdit",false,25,3)
      }
      updateTextArea("bioEdit",true,200);
    }
  });

  // Handles toggling the edit mode on/off
  function editClick(e) {
    // If currently editing, means we stop editing and save to backend
    if (editing) {
      // Retrieve info
      let newusername = props.groupNumber == 29 ? document.getElementById("usernameEdit").value : props.username;
      let newbio = document.getElementById("bioEdit").value;
      let usernameChanged = props.groupNumber == 29 ? "changed" : "not changed";
      // Make patch request to backend
      fetch("/api/account", {
          method: "PATCH",
          headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
              username: newusername,
              bio: newbio,
              usernameChanged: usernameChanged
          }),
      }).then(async (res) => {
          let resJson = await res.json();
          // If error notify user
          if (res.status !== 200) {
              alert("Error\n" + resJson.message + "\n");
              console.log(resJson.message);
          } else { // Else success, update in state
              props.updateUsername(newusername);
              props.updateBio(newbio);
              updateEditing(false);
          }
      });
    } else {
      // Start editing
      updateEditing(true);
    }
  }

  // Resizes a textarea to fit the content in it vertically
  function updateTextArea(textareaID, isBio, maxChars, minChars) {
    // Determine info ID
    let infoSpanID = textareaID + "Info";
    // Resize the textarea
    let textarea = document.getElementById(textareaID); // find textarea to resize
    textarea.style.height = textarea.parentElement.style.height; // downscale to nothing
    textarea.style.height = (textarea.scrollHeight)+"px"; // adjust height to scroll height
    // Inform the user how many characters they have left once necessary
    let editLength = textarea.value.length;
    // Show number of characters remaining if <= 100 remaining
    if (maxChars != null && isBio && (maxChars - editLength) <= 100) {
      document.getElementById(infoSpanID).innerHTML = `${maxChars - editLength} characters remaining...`;
      document.getElementById(infoSpanID).classList.add("show");
    } else if (maxChars != null && !isBio && editLength > maxChars) {
      document.getElementById(infoSpanID).innerHTML = `Must be at most ${maxChars} characters in length`;
      document.getElementById(infoSpanID).classList.add("show");
    } else if (minChars != null && !isBio && editLength < minChars) {
      document.getElementById(infoSpanID).innerHTML = `Must be at least ${minChars} characters in length`;
      document.getElementById(infoSpanID).classList.add("show");
    } else {
      document.getElementById(infoSpanID).classList.remove("show");
    }
  }

  // Displays delete modal if button was triggered, else trigger button
  function deleteAccount(e) {
    // If the delete button has already been clicked once, and thus triggered
    if (deleteTriggered.current) {
      let modal = document.getElementById(deleteModalID);
      modal.style.display = "flex";
    } else { // Otherwise this is the first click of the delete button
      deleteTriggered.current = true;
      e.target.innerHTML = "Are You Sure?"
    }
  }

  // Untrigger delete
  function mouseOffDelete(e) {
    deleteTriggered.current = false
    e.target.innerHTML = "Delete Account";
  }

  // Update the role of the current user being viewed with a new role
  function updateRole(newrole) {
    // Make patch request to backend
    fetch("/api/changeRole", {
        method: "PATCH",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: props.user_id,
            role: newrole
        }),
    }).then(async (res) => {
        let resJson = await res.json();
        // If error notify user
        if (res.status !== 200) {
            alert("Error\n" + resJson.message + "\n");
            console.log(resJson.message);
        } else { // Else success, update state
            props.updateRole(resJson.role.charAt(0).toUpperCase() + resJson.role.slice(1));
        }
    });
  }

  // Div element containing the username
  // If in edit mode and a member of G29, gives a textarea
  // Otherwise just contains the username
  let displayedUsernameDiv = editing && (props.groupNumber == 29) ?
    <div className="accountEditDiv">
      <h4><span className="material-icons">account_box</span> Username</h4>
      <textarea id="usernameEdit" placeholder="Give yourself a username!" onKeyUpCapture={() => updateTextArea("usernameEdit",false,25,3)}>{props.username}</textarea>
      <span id="usernameEditInfo" className="editInfo"></span>
    </div>
  : 
    <div className="accountEditDiv">
      <h4><span className="material-icons">account_box</span><span> Username</span></h4>
      <p>{props.username}</p>
    </div>
  ;

  // Div element containing the bio
  // If in edit mode, gives a text area
  // Otherwise just contains the bio
  let displayedBioDiv = editing ?
    <div className="accountEditDiv">
      <h4><span className="material-icons">text_fields</span> Bio</h4>
      <textarea id="bioEdit" placeholder="Describe yourself in 200 characters..." onKeyUpCapture={() => updateTextArea("bioEdit",true,200)} maxLength={200}>{props.bio}</textarea>
      <span id="bioEditInfo" className="editInfo"></span>
    </div>
  : 
    <div className="accountEditDiv">
      <h4><span className="material-icons">text_fields</span><span> Bio</span></h4>
      <p>{props.bio == null || props.bio == "" ? "Empty" : props.bio }</p>
    </div>
  ;

  if (props.owned) { // if owned, (supercedes admin access)
    return (
      <div id="privateSection">
        <hr></hr>
        <h2>Private</h2>
        <div id="private" className="accountCard">
          <div className="profileBanner short">
            <div className="material-icons">badge</div>
          </div>
          <div className="cardContent">
            <h3>Your Account Details</h3>
            {displayedUsernameDiv}
            {displayedBioDiv}
            <button id="accountEdit" className="material-icons" onClick={editClick}>{editing ? "save_as" : "edit" }</button>
          </div>
        </div>

        <div id="permissions" className="accountCard">
          <div className="profileBanner short">
            <div className="material-icons">rule</div>
          </div>
          <div className="cardContent">
            <h3>Your Permissions</h3>
            <p>Different members of the Sudoku29 community have different permissions. You are currently {props.role == "Administrator" ? "an" : "a"} {props.role}</p>
            <p>{props.role == "Administrator" ? "You have great power, wield it wisely!" : props.role == "Solver" ? `Solve ${5 - props.puzzlesSolved} more puzzles to become a Creator!` : "Keep up the good work, and you may be trusted enough to become an Administrator!"}</p>
            <div>
              <div className={props.role == "Solver" ? " currentPermissions permissionDetails" : "permissionDetails" }>
                <h4>Solvers</h4>
                <p><span>Solve and download puzzles </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Create and upload puzzles </span><span className="material-icons noPermission">clear</span></p>
                <p><span>Post, edit and delete comments </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Manage other users' accounts and content </span><span className="material-icons noPermission">clear</span></p>
                <p><span>Access to other sites in the federation </span><span className="material-icons yesPermission">check</span></p>
              </div>
              <div className="verticalLine"></div>
              <div className={props.role == "Creator" ? " currentPermissions permissionDetails" : "permissionDetails" }>
                <h4>Creators</h4>
                <p><span>Solve and download puzzles </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Create and upload puzzles </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Post, edit and delete comments </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Manage other users' accounts and content </span><span className="material-icons noPermission">clear</span></p>
                <p><span>Access to other sites in the federation </span><span className="material-icons yesPermission">check</span></p>
              </div>
              <div className="verticalLine"></div>
              <div className={props.role == "Administrator" ? " currentPermissions permissionDetails" : "permissionDetails" }>
                <h4>Administrators</h4>
                <p><span>Solve and download puzzles </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Create and upload puzzles </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Post, edit and delete comments </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Manage other users' accounts and content </span><span className="material-icons yesPermission">check</span></p>
                <p><span>Access to other sites in the federation </span><span className="material-icons yesPermission">check</span></p>
              </div>
            </div>
          </div>
        </div>

        <button id="accountDelete" onClick={deleteAccount} onMouseLeave={mouseOffDelete}>Delete Account</button>
        {CreateModal(DeleteModal, deleteModalID, "If you are sure that you would like to delete your account, please type the below phrase (case-sensitive) and submit:", "I don't want to solve puzzles anymore", props.user_id)}
      </div>
    )
  } else if (localStorage.getItem("currentrole") == "administrator") { // if not owned but an admin, allow for deletion
    return (
      <div id="privateSection">
        <hr></hr>
        <h2>Administrative Access</h2>
        <div id="permissionsUpdate" className="accountCard">
          <div className="profileBanner short">
            <div className="material-icons">admin_panel_settings</div>
          </div>
          <div className="cardContent">
            <h3>Update This User's Permissions</h3>
            <p>They are currently {props.role == "Administrator" ? "an" : "a"} {props.role}</p>
            {props.role == "Administrator" ? <p>You cannot change another Administrator's role!</p> : 
              <>
              <p>Change their role to...</p> 
              <div>
                <div>
                  <h4><span className="material-icons">extension</span><span> Solver</span></h4>
                  <p>Make this user a regular solver, restricted to only the basic solving, comment posting and account functionality available on the site.</p>
                  {props.role != "Solver" ? <button className="permissionSelect material-icons" onClick={() => updateRole("solver")}>ads_click</button> : <p>This is their current role</p>}
                </div>
                <div className="verticalLine"></div>
                <div>
                  <h4><span className="material-icons">construction</span><span> Creator</span></h4>
                  <p>Make this user a creator, capable of creating and uploading puzzles to the site.</p>
                  {props.role != "Creator" ? <button className="permissionSelect material-icons" onClick={() => updateRole("creator")}>ads_click</button> : <p>This is their current role</p>}
                </div>
                <div className="verticalLine"></div>
                <div>
                  <h4><span className="material-icons">add_moderator</span><span> Administrator</span></h4>
                  <p>Make this user an administrator, capable of changing other users' content. Be <span style={{fontWeight: 600, color: "#ff0000"}}>careful</span>, as you will not be able to reverse this on your own!</p>
                  {props.role != "Administrator" ? <button className="permissionSelect material-icons" onClick={() => updateRole("administrator")}>ads_click</button> : <p>This is their current role</p>}
                </div>
              </div>
              </>
            }
          </div>
        </div>
        <button id="accountDelete" onClick={deleteAccount} onMouseLeave={mouseOffDelete}>Delete Account</button>
        {CreateModal(DeleteModal, deleteModalID, "If you are sure that you would like to delete this account, please type the below phrase (case-sensitive) and submit:", "Delete this user", props.user_id)}
      </div>
    )
  } else { // if not owned, do not display private section
    return null
  }
}

/* Function used to create a modal with certain values
*
 * Component - A component for the modal
 * containerID - The id of the div element that will contain the modal
 * message - The message to be displayed
 * phrase - The phrase to be typed for confirmation
 * user_id - The user_id of the account being deleted
 */
function CreateModal(Component, containerID, message, phrase, user_id) {

  // Closes the modal by hiding its container
  function closeModal() {
    let container = document.getElementById(containerID)
    container.style.display = "none";
  }

  return (
    <div id={containerID} className="modalContainer">
      <Component closeModal={closeModal} message={message} typedPhrase={phrase} user_id={user_id}/>
    </div>
  )
}

// A Modal Component for deleting accounts
function DeleteModal(props) {

  const history = useHistory();

  const inputID = "deleteModalInput";

  // Submit the input text, if correct then delete account
  function submit() {
    if (document.getElementById("deleteModalInput").value == props.typedPhrase){
      fetch("/api/account/" + props.user_id, {
        method: "DELETE",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then(async (res) => {
        let resJson = await res.json();
        // If error notify user
        if (res.status !== 200) {
            alert("Error\n" + resJson.message + "\n");
            console.log(resJson.message);
        } else {
            window.location.reload(false);
            props.closeModal();
        }
      });
    }
  }

  return (
    <div className="modal">
      <h2>Account Deletion Confirmation <span className="material-icons closeModal" style={{float: "right"}} onClick={props.closeModal}>close</span></h2>
      <hr></hr>
      <p>{props.message}</p>
      <p style={{fontWeight: 600}}>{props.typedPhrase}</p>
      <input id={inputID} type="text" style={{margin: '6px 0'}}></input>
      <div>
        <button onClick={submit}>Submit</button>
      </div>
    </div>
  )
}

export default AccountPage;
