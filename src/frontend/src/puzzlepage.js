//https://www.youtube.com/watch?v=YzMEjfQPsfA
//While no code was used from the source above, I have looked at the video to see how one might approach the problem

import React, { useState } from "react";
import {
  runAllSolutionTests,
  templateVerification,
} from "./puzzleMethodFrontend.js";
import {
  Link,
  useHistory,
} from "react-router-dom";
import { PUZZLE_VARIANT, isXVariantCell } from "./models.js";
import CommentSection from "./commentsection.js";
import { convertISOtoDate, convertISOtoTime } from "./util.js";

const congratulationsModalID = "congratsModal";

// PuzzlePageApp is the parent component which  allows the users to solve a sudoku puzzle
class PuzzlePageApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metaData: [],
      puzzleVariant: null,
      values: [],
      puzzleSolution: [],
      current_user_id: null,
      notfound: false,
      solveStatus: false
    };
  }

  // When loads, performs api call to get post details. If it fails, it renders blank
  componentDidMount() {
    // Fetches post based on URL post ID
    fetch("/api/posts/" + this.props.match.params.id)
      .then(async (response) => {
        if (!response.ok) {
          // Displays error - likely due to invalid JWT if that occurs
          if (response.status != 404) {
            // Only display alert if error is other than post not found
            let resJson = await response.json();
            alert("Error: " + resJson.message);
          }
          throw new Error();
        }
        return response.json();
      })
      .then((postdata) => {
        // Sets state based on the returned data from the backend
        let puzzle = JSON.parse(postdata.puzzle);
        this.setState({
          metaData: postdata,
          puzzleProblem: puzzle.values,
          puzzleSolution: puzzle.solution,
          puzzleVariant: puzzle['puzzle-type'],
          solveStatus: postdata.solved_by_user
        });
      })
      .catch((err) => {
        this.setState({ notfound: true });
      });

    // Fetches account details to pass current user_id to comment section
    fetch('/api/accountDetails')
      .then(async (response) =>  {
          if (!response.ok) {
              throw new Error();
          }
          // Set state based on user_id of current user
          let responseJson = await response.json();
          this.setState({ current_user_id: responseJson.user_id });
          localStorage.setItem("currentrole", responseJson.role);
      }).catch(err => {
          console.err("Error: Unable to retrieve account details");
      })
  }

  render() {
    //Handles the error case in which the states can't be initialised when data can't be fetched from backend
    if (this.state.notfound) {
      return (
        <main className="content">
          <text> Post not found </text>
        </main>
      );
    } else {
		document.title = this.state.metaData.post_title;
    //Handles the success case in which the states are initialiesed, calls child components accordingly 
    return (
          <main className="content">
            <div className="puzzlecontent">
              <PuzzleBox {...this.state} post_id={this.props.match.params.id} current_user_id={this.state.current_user_id} solved_by_user={this.state.solveStatus}/>
            </div>
            {<CommentSection post_id={this.props.match.params.id} current_user_id={this.state.current_user_id}/>}
          </main>
      );
    }
  }
}

//PuzzleBox is a facilitator component that calls other child components after processing some of the props
class PuzzleBox extends React.Component {
  render() {
    // Checks if undefined as getting fetched after page load!
    let id;
    if (this.props.metaData.post_author != undefined) {
      id = " (" + this.props.metaData.post_author_id.substring(0, 3) + ")";
    } else {
      id = "";
    }
    
    let nameToDisplay = this.props.metaData.post_author ? this.props.metaData.post_author +  " (" + this.props.metaData.post_author_id.substring(0,3) + ")" : "[deleted user]";
    //Calls child components
    return (
      <div className="puzzlebox">
        <PuzzleDetails
          post_title={this.props.metaData.post_title}
          post_author={nameToDisplay}
          post_time={this.props.metaData.post_time}
          post_author_id={this.props.metaData.post_author_id}
        />
        <div className="sudokugrid">
          <PuzzleGame {...this.props} post_id={this.props.post_id} current_user_id={this.props.current_user_id} post_author_id={this.props.metaData.post_author_id} solved_by_user={this.props.solved_by_user}/>
        </div>
      </div>
    );
  }
}

// PuzzleDetails component displays the details of the post/puzzle
class PuzzleDetails extends React.Component {
  render() {
    let date = convertISOtoDate(this.props.post_time);
    let time = convertISOtoTime(this.props.post_time);

    return (
      <div className="detailbox">
        <div className="detail">
          <span className="material-icons">title</span>
          <span>{this.props.post_title}</span>
        </div>
        <div className="detail">
          <span className="material-icons">account_circle</span>
          <Link to={"/account/" + this.props.post_author_id}>{this.props.post_author}</Link>
        </div>
        <div className="detail">
          <span className="material-icons">schedule</span>
          <span>{`Posted ${date} at ${time}`}</span>
        </div>
      </div>
    );
  }
}

// The PuzzleGame components displays the actual puzzle grid as well as handling the backend call upon successful solution
class PuzzleGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variant:null,
      puzzle: [],
      solution: []
    };
  }

  //Initializes the state of the puzzle grid by the data passed from backend
  componentDidUpdate(prevProps) {
    //Return out of the function if props haven't changed
    if (this.props == prevProps) {
      return;
    }
    try {
      let puzzle = this.props.puzzleProblem.map((row) => {
        return row.map((col) => {
          return {
            given: col != 0,
            value: col,
          };
        });
      });

      this.setState({ puzzle: puzzle });
    } catch (err) {}
  }

  //Helper function to update the states when a user provides an input
  onChange(event, rIndex, cIndex) {
    let value = event.target.value;
    let input = event.target.value;

    // Try to turn strings into ints for submission
    try {
      input = parseInt(value);
    } catch (err) {
      input = value; // invalid string will be caught on submission
    }

    // Ensure if input is deleted, it is set to zero instead of empty string!
    if (value == "") {
      input = 0;
    } else if (isNaN(input) || input == 0) {
      // If input is NaN, set input to 0 and empty cell
      event.target.value = "";
      input = 0;
    }

    // Sets state to previous state but with changed value changed
    this.setState({
      puzzle: this.state.puzzle.map((row, rowIndex) => {
        return row.map((col, colIndex) => {
          if (rowIndex == rIndex && colIndex == cIndex) {
            return {
              given: false,
              value: input,
            };
          } else {
            return col;
          }
        });
      }),
    });
  }

  // Uses validation methods contained in puzzleMethod2.js to verifiy solution is valid
  async onSubmit() {
    console.log("submit called");
    // turn puzzle into array of numbers
    let submittedSolution = this.state.puzzle.map(function (row) {
      return row.map(function (cell) {
        return cell.value;
      });
    });

    // Ensure the solution is correct
    if (!templateVerification(this.props.puzzleProblem, submittedSolution)) {
      //alert("Given solution does not match the initial values");
      // Alert now provided by templateVerification
    } else if (!runAllSolutionTests(submittedSolution)) {
      //alert("Given solution is incorrect, please try again");
      // Alert now provided by runAllSolutionsTests
    } else {
      // send to submission route
      let res = await fetch("../api/submitSolve", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: this.props.post_id,
          solution: submittedSolution,
        }),
      });
      let resJson = await res.json();
      // Display message based on response from submitSolve
      if (res.status !== 200) {
        alert("Error with submission: \n" + resJson.message + "\n");
        console.log(resJson.message);
      } else {
        let modal = document.getElementById(congratulationsModalID);
        modal.style.display = "flex";
      }
    }
  }

  render() {
    return (
      <div className="gamebox">
        <table>
          <tbody>
            {this.state.puzzle.map((row, rIndex) => {
              return (
                <tr
                  key={rIndex}
                  className={(rIndex + 1) % 3 == 0 ? "rowBorder" : ""}
                >
                  {row.map((col, cIndex) => {
                    return (
                      <td
                        key={rIndex + cIndex}
                        className={(cIndex + 1) % 3 == 0 ? "colBorder" : ""}
                      >
                        {col.given ? (
                          <div
                            className={`knownValues ${
                              isXVariantCell(this.props.puzzleVariant, rIndex, cIndex)
                                ? "x-variant"
                                : " "
                            }`}
                          >
                            {" "}
                            {col.value}
                          </div>
                        ) : (
                          <input
                            className={`cellInput ${
                              isXVariantCell(this.props.puzzleVariant, rIndex, cIndex)
                                ? "x-variant"
                                : " "
                            }`}
                            onChange={(e) => this.onChange(e, rIndex, cIndex)}
                            maxLength={1}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="submissionBox">

          <button class="submitButton" onClick={() => this.onSubmit()} disabled={this.props.solved_by_user || (this.props.current_user_id == this.props.post_author_id) ? true : null}>
            {this.props.solved_by_user ? "ALREADY SOLVED" : this.props.current_user_id == this.props.post_author_id ? "YOUR PUZZLE" : "SUBMIT"}
          </button>

          <MoreOptionsBox post_id={this.props.post_id} puzzle={this.props.metaData.puzzle} post_title={this.props.metaData.post_title} current_user_id={this.props.current_user_id} post_author_id={this.props.post_author_id}/>

          {CreateModal(CongratulationsModal, congratulationsModalID, this.props.current_user_id)}
        </div>
      </div>
    );
  }
}

// Functional Component that handles the 'Show More' popup box beneath puzzles
// Contains the download and deletion functionalities
function MoreOptionsBox(props) {
  // State to determine whether or not the contents should currently be shown
  const [showing, updateShowing] = useState(false);
  // State for whether or not a delete of the puzzle has been triggered (using state to re-render)
  const [deleteTriggered, updateDeleteTriggered] = useState(false);

  const history = useHistory();

  // Handles the click of the Show More or Show Less button, applies the appropriate transition
  function handleClick(e) {
    if (showing) {
      transitionHiding(e);
    } else {
      transitionShowing(e);
    }
  }

  // Transition to showing the box
  function transitionShowing(e) {
    let box = document.getElementById('showMoreBox');
    // Style the height based on the role, as role determines contents
    // Start by padding the top using a margin
    e.target.style.marginTop = (props.current_user_id == props.post_author_id || localStorage.getItem("currentrole") == "administrator") ? "86px" : "46px";
    // Display after timeout and return margin to normal
    setTimeout(() => {
      box.style.height = (props.current_user_id == props.post_author_id || localStorage.getItem("currentrole") == "administrator") ? "103.5px" : "63.5px";
      e.target.style.transition = "all 0s";
      updateShowing(true);
      e.target.style.marginTop = "6px";
    }, 500);
  }

  // Transition to hiding the box
  function transitionHiding(e) {
    let box = document.getElementById('showMoreBox');
    // Style the margin based on the role, as role determines contents
    // Start by adding the margin (ensures the height is the same once contents are hidden)
    e.target.style.marginTop = (props.current_user_id == props.post_author_id || localStorage.getItem("currentrole") == "administrator") ? "86px" : "46px";
    updateShowing(false); // Hide the contents
    box.style.height = "fit-content"
    // Fade to close
    setTimeout(() => {
      e.target.style.transition = "all 0.45s";
      e.target.style.marginTop = "6px";
    }, 50);
  }

  // Handle delete button click, triggers on first click, delete on second click
  function deleteClick(e) {
    if (deleteTriggered) {
      fetch("/api/posts/" + props.post_id, {
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
            history.push("/"); // redirect to landing page
        }
      });
    } else {
      updateDeleteTriggered(true);
      e.target.classList.add("triggered");
    }
  }

  // Delete button styled based on whether or not it's been triggered
  const deleteButton =  <button id="postDeleteButton" className="material-icons" 
                          onClick={deleteClick}
                          onMouseLeave={(event) => {
                            updateDeleteTriggered(false);
                            event.target.classList.remove("triggered");
                          }}
                        >
                          {deleteTriggered ? "warning" : "delete_forever"}
                        </button>

  return (
    <div id="showMoreBox">
      {showing ? 
          <>
            <a id="downloadFileButton" className="material-icons"
            href={`data:text/json;charset=utf-8,${encodeURIComponent(props.puzzle)}`}
            download={`${props.post_title}.json`} >
              file_download
            </a>
            {props.current_user_id == props.post_author_id || localStorage.getItem("currentrole") == "administrator" ? deleteButton : null }
          </>
        : 
          null
      }
      <button id="showMoreButton" onClick={handleClick}>
        {showing ? "Show Less" : "Show More"}
      </button>
    </div>
  )
}

// Function to create a modal for congratulating the user
function CreateModal(Component, containerID, user_id) {

  // Refreshes the page when closed
  function closeModal() {
    window.location.reload(false);
  }

  return (
    <div id={containerID} className="modalContainer">
      <Component closeModal={closeModal} user_id={user_id}/>
    </div>
  )
}

// Simple congratulations modal when the puzzle is solved
function CongratulationsModal(props) {

  const history = useHistory();

  return (
    <div className="modal">
      <h2>Congratulations <span className="material-icons closeModal" style={{float: "right"}} onClick={props.closeModal}>close</span></h2>
      <hr></hr>
      <p>You solved the puzzle!</p>
    </div>
  )
}

export default PuzzlePageApp;
