import React from "react";
import { Link } from "react-router-dom";
import {
  runAllSolutionTests,
  templateVerification,
  runAllTemplateTests,
} from "./puzzleMethodFrontend.js";
import { submitPost } from "./api.js";
import {PUZZLE_VARIANT, isXVariantCell} from "./models.js"
import {solve} from "./puzzleSolver.js"
//https://coder-coder.com/display-divs-side-by-side/

class PuzzleSubmissionApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzleTitle: "",
      puzzleProblem: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      puzzleSolution: [],
      puzzleVariant: PUZZLE_VARIANT.CLASSIC,
    };

    //https://typeofnan.dev/how-to-fix-undefined-this-state-in-react-class-components/
    this.setPuzzleTitle = this.setPuzzleTitle.bind(this);
    this.setPuzzleProblem = this.setPuzzleProblem.bind(this);
    this.setPuzzleSolution = this.setPuzzleSolution.bind(this);
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.switchPuzzleVariant = this.switchPuzzleVariant.bind(this);
    this.setPuzzleVariant = this.setPuzzleVariant.bind(this);
  }

  switchPuzzleVariant() {
    if (this.state.puzzleVariant == PUZZLE_VARIANT.CLASSIC) {
      this.setState({ puzzleVariant: PUZZLE_VARIANT.X_SUDOKU });
    }

    if (this.state.puzzleVariant == PUZZLE_VARIANT.X_SUDOKU) {
      this.setState({ puzzleVariant: PUZZLE_VARIANT.CLASSIC });
    }
  }

  getButtonVariant(){
    if (this.state.puzzleVariant == PUZZLE_VARIANT.CLASSIC) {
      return PUZZLE_VARIANT.X_SUDOKU ;
    }

    if (this.state.puzzleVariant == PUZZLE_VARIANT.X_SUDOKU) {
      return PUZZLE_VARIANT.CLASSIC ;
    }
  }

  // When loads, fetches account details to set 
  componentDidMount() {
    // Fetch and update role
    fetch('/api/accountDetails')
    .then(async (response) =>  {
      if (!response.ok) {
        throw new Error();
      }
      let responseJson = await response.json();
      localStorage.setItem("currentrole", responseJson.role);
    }).catch(err => {
      console.log("Error: Unable to retrieve account details");
    })
  }

  // Handlers to update state on changing values
  setPuzzleTitle(e) {
    const puzzleTitle = e.target.value;
    this.setState({ puzzleTitle: puzzleTitle }, () => {
      console.log(this.state);
    });
  }

  setPuzzleVariant(puzzleVariant) {
    this.setState({ puzzleVariant: puzzleVariant }, () => {
      console.log(this.state);
    });
  }

  setPuzzleProblem(puzzleProblem) {
    this.setState({ puzzleProblem: puzzleProblem }, () => {
      console.log(this.state);
    });
  }

  setPuzzleSolution(puzzleSolution) {
    this.setState({ puzzleSolution: puzzleSolution }, () => {
      console.log(this.state);
    });
  }

  onSubmitClick() {
    // On submission, first check that puzzle is all valid
    if (!runAllTemplateTests(this.state.puzzleProblem)) {
      alert(
        "Initial values do not form a valid problem, please try again\n Note: There must be between 17 and 80 initial values"
      );
      return;
    } 
    const result = solve(this.state.puzzleProblem, this.state.puzzleVariant);
    if (typeof result === "string"){
      alert(result);
      return;
    }
    this.state.puzzleSolution = result;
    if (this.state.puzzleTitle == "") {
      alert("Please name your puzzle");
    } else if (
      this.state.puzzleTitle.length < 3 ||
      this.state.puzzleTitle.length > 100
    ) {
      alert("Puzzle title must be between 3 and 100 characters");
    } else {
      // Attempt to submit the post to backend if all elements valid
      
      console.log(this.state);
      submitPost(
        this.state.puzzleTitle,
        this.state.puzzleVariant,
        this.state.puzzleProblem,
        this.state.puzzleSolution
      );
    }
  }

  onImportClick(setPuzzleProblem, setPuzzleSolution, setPuzzleVariant) {
    let input = document.getElementById('uploadPuzzleInput');
    let files = input.files;
    if (files.length <= 0) {
      return false;
    }
    let reader = new FileReader();

    reader.onload = function() {
      let puzzle = JSON.parse(reader.result);
      if (!puzzle.values || !runAllTemplateTests(puzzle.values) || !puzzle.solution || !runAllSolutionTests(puzzle.solution) || !puzzle["puzzle-type"]) {
        alert("Uploaded puzzle is invalid");
        input.value = '';
      } else {
        setPuzzleVariant(puzzle["puzzle-type"]);
        setPuzzleProblem(puzzle.values);
        setPuzzleSolution(puzzle.solution);
      }
    };
  
    reader.onerror = function() {
      console.log(reader.error);
    };

    reader.readAsText(files[0]);
  }

  render() {
    document.title = "Create";
    return (
      <>
        <h1 id="createHeader">Create a Puzzle</h1>
        <div class="content widesplit">
          <div className="childPuzzle">
            <PuzzleBox
              puzzleLayout={this.state.puzzleProblem}
              onPuzzleChange={this.setPuzzleProblem}
              title={"Enter Puzzle Problem"}
              variant={this.state.puzzleVariant}
            />
          </div>

          <div className="submissionExtras">
            <h3> Please enter a name for the puzzle </h3>
            <input
              id="submissionTitleInput"
              onChange={(e) => this.setPuzzleTitle(e)}
            />

            <h3>Change what type of puzzle you're making:</h3>
              <div className="variant">
                <button className="submitButton" onClick={this.switchPuzzleVariant}>             
                  {this.getButtonVariant() === "sudoku" ? "Switch to Sudoku" : "Switch to X-Sudoku"}
                </button>
              </div>

              <h3>Or Upload a File:</h3>
              <input id="uploadPuzzleInput" type="file" accept="application/JSON"></input>
              <button id="uploadPuzzleImport" className="submitButton" onClick={() => this.onImportClick(this.setPuzzleProblem, this.setPuzzleSolution, this.setPuzzleVariant)}>Import</button>
          </div>

          <div className="submissionBox">
            <button className="submitButton" onClick={this.onSubmitClick}>
              Submit
            </button>
          </div>
        </div>
      </>
    );
  }
}

// The boxes that the user inputs the puzzles into
class PuzzleBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzle: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    };
  }

  componentDidUpdate() {
    if (JSON.stringify(this.state.puzzle) !== JSON.stringify(this.props.puzzleLayout)){
      this.setState({puzzle: this.props.puzzleLayout});
    }
  }

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

    // Maps entire state to updated puzzle
    let newPuzzle = this.state.puzzle.map((row, rowIndex) => {
      return row.map((col, colIndex) => {
        if (rowIndex == rIndex && colIndex == cIndex) {
          return input;
        } else {
          return col;
        }
      });
    });

    this.props.onPuzzleChange(newPuzzle);
    this.setState({ puzzle: newPuzzle });
  }

  render() {
    return (
      <div className="Sudoku">
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
                        <input 
                          maxLength={1}
                          className={`cellInput ${isXVariantCell(this.props.variant, rIndex, cIndex) ? "highlightCell" : " " }` } 
                          onChange={(e) => this.onChange(e, rIndex, cIndex)}
                          value={col !== 0 ? col : "" }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PuzzleSubmissionApp;
