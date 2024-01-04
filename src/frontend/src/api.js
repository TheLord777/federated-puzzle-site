// This file is where all fetch functions will be refactored to in the future, for now only holds submitPost

// Function to submit a post to the correct api route
export async function submitPost(post_title,puzzleVariant, puzzleProblem,puzzleSolution){

    // Put puzzle in correct json format
    let puzzle = {
      "puzzle-type" : puzzleVariant,
      "values" : puzzleProblem,
      "solution": puzzleSolution
    }
    // Fetch POST request to the api, sending the required data
    let res = await fetch("../api/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_title: post_title,
          puzzle: JSON.stringify(puzzle)
        }),
      });
      let resJson = await res.json();
      console.log(resJson);
      // If error notify user, otherwise reload page to clear submission
      if (res.status !== 200) {
        alert("Error with submission: \n" + resJson.message + "\n");
        console.log(resJson.message);
      } else {
        alert("Puzzle submitted!");
        window.location.reload();
      }
}

