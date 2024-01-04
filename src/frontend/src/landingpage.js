import React from 'react';
import { withRouter, Link } from "react-router-dom";
import { convertISOtoDate, convertISOtoTime } from "./util.js";
import Leaderboard from './leaderboard.js';

class LandingPageApp extends React.Component {
  // When loads, fetches account details to set 
  componentDidMount() {
    // Fetch and update role
    fetch('/api/accountDetails')
    .then(async (response) =>  {
      if (!response.ok) {
        throw new Error();
      }
      let responseJson = await response.json();
      // this.setState({current_user_id: responseJson.user_id});
      localStorage.setItem("currentrole", responseJson.role);
    }).catch(err => {
      console.log(err);
    })
  }

  render () {
    document.title = "Home"
    return (
      <main className="content">
		  <img id="landingLogo" src={process.env.PUBLIC_URL + '/bannerlogo.jpg'}></img>
        <div className="contentWrapper">
          <PostListBox history={this.props.history} />
          <Leaderboard />
        </div>
      </main>
    );
  }
}

// Main component for landing page containing list of posts
class PostListBox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      posts: "",
    };
  }

  // When loads, performs api call to get recent posts, if fails then renders an error block
  // Also fetches account details to set 
  componentDidMount() {
    fetch('/api/recentPosts')
    .then(async (response) =>  {
      if (!response.ok) {
        let resJson = await response.json();
        alert("Error: " + resJson.message);
        throw new Error();
      }
      return response.json();
    })
    .then(postdata => {
        document.title = "Home"; // Set document title to Home
        this.setState(postdata);
    }).catch(err => {
        this.setState({error : true}); // Set error in state
    })
  }

  render () {
    // Create list of posts
    const postComponents = [];
    for (let i = 0; i < this.state.posts.length; i++) {
        postComponents.push(<PuzzlePost num_on_page={i}
										post_id={this.state.posts[i].post_id}
                    post_title={this.state.posts[i].post_title} 
                    post_author={this.state.posts[i].post_author}
                    post_time={this.state.posts[i].post_time} 
                    post_author_id={this.state.posts[i].post_author_id}
                    solved_by_user={this.state.posts[i].solved_by_user}
                    post_type={this.state.posts[i].post_type}/>)
    }

    // Return element
    if (this.state.error) {
      return(
        <div className="postListBox">
          <h2>Recent Puzzles</h2>
          <p>Error encountered, please try again</p>
        </div>
      );
    } else {
      return (
        <div className="postListBox">
          <h2>Recent Puzzles</h2>
          <ul className="postList">
              {postComponents}
          </ul>
        </div>
      );
    }
  }
}

// Individual component for a puzzle post in the list
class PuzzlePost extends React.Component {
    render () {
      // Create path string to navigate to post
      const path = `/post/${ this.props.post_id }`;

      let date = convertISOtoDate(this.props.post_time);
      let time = convertISOtoTime(this.props.post_time);

      // Dynamic ID and Style allows each post to be uniquely styled
      const dynamicID = `puzzlePost-${this.props.num_on_page}`;
      const dynamicStyle = `0.5s visible ${this.props.num_on_page * 0.25}s forwards`

      // Return post element
      return (
        <div id={dynamicID} className="puzzlePost" style={{animation: dynamicStyle}}>
          <div>
            <Link className="postTitle" to={path}>{this.props.post_title}</Link>
            {this.props.solved_by_user ?  <span className="postSolved" style={{verticalAlign: "top"}}>
                                              <span className="material-icons">done</span>
                                              <span>  Solved!</span>
                                          </span> 
            : null }
          </div>
          <span className="postType">
              {this.props.post_type.charAt(0).toUpperCase() + this.props.post_type.slice(1)}
          </span>
          <div className="postDescription">
            <span>Posted {date} at {time} by </span>
            <a className="postAuthor" href={"/account/" + this.props.post_author_id}>{this.props.post_author + " (" + this.props.post_author_id.slice(0,3) + ")"}</a>
          </div>
        </div>
      )
    }
}

export default withRouter(LandingPageApp);

