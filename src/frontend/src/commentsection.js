import React, { useState, useEffect, useRef } from 'react';
import {
  Link
} from "react-router-dom";
import './styles.css';
import { convertISOtoDate, convertISOtoTime, getProfilePathFromID } from "./util.js";

const MAX_CHARS_COMMENT = 500; // max length for characters
const INITIAL_RENDER_DEPTH = 3; // NOT 0-index

/*
* Comment Section Functional Component
* Takes an attribute props.toplevel that represents the unique identifier of the toplevel
*    - In the format 'Post<post_id>', this is used for rendering newly posted comments at the top level
*/
function CommentSection(props) {

    /*
    * State variables and their update functions
    * newposts   - Represents the ids of new posts (comments) made by the user since they opened this page, this makes it
    *              possible to render the "Load Comments" button when the comment section is devoid of OTHER USERS' comments
    * comments   - Represents the array of top-level comments in the comment section
    * loadFailed - Represents whether or not the load button has failed to load comments
    */
    const [newposts, updateNewPosts] = useState([]);
    const [comments, updateComments] = useState([]);
    const [loadFailed, updateLoadFailed] = useState(false);

    const firstRender = useRef(true);

    // Fetch top comments and update comments in state
    // automatic - if this was automatically run (i.e. initial render)
    function retrieveTopComments(automatic) {
        fetch('/api/comments/' + props.post_id)
            .then(async (response) =>  {
                if (!response.ok) {
                    if (!automatic){
                        updateLoadFailed(true);
                    }
                    throw new Error();
                }
                let responseJson = await response.json();
                // Update comments
                let newcomments = comments.concat(responseJson.filter(comment => !newposts.includes(comment.comment_id)).reverse());
                updateComments(newcomments);
            }).catch(err => {
                console.log("Failed to load comments");
            })
    }

    // Add new comment to existing comments
    function postNewComment(newcomment) {
        // Concat new comments to existing array of comments
        let newcomments = [newcomment].concat(comments);
        updateNewPosts(newposts.concat(newcomment.comment_id)); // increment newposts ids
        updateComments(newcomments); // update comment array
    }

    /* 
    *  Determine displayed components
    *  1. If there are no comments loaded, render the "Load Comments" button
    *  2. If they have been loaded, render the comments
    *  3. If only the user's newly posted comments are rendered, display both
    */
    let loadbuttontext = !loadFailed ? "Load Comments" : "No Comments Found, Click to Retry";
    let displayed = (comments != null && Array.isArray(comments) && comments.length > 0) ? 
        <div className="commentList">
            {comments.map(comment => <Comment data={comment} current_user_id={props.current_user_id} depth={2} key={comment.comment_id}/>)}
        </div>
        :
        loadFailed ? <p>Be the first to comment on this puzzle!</p> : null
    ;

    // On render, if this is the first render, load top comments
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            if (1 <= INITIAL_RENDER_DEPTH) { // if 1 (top-level comment depth) is within initial render depth, then load top comments
                retrieveTopComments(false);
            }
        }
    })

    return (
        <div className="commentSection">
            <h3>Discussion</h3>
            <hr></hr>
            <PostBox parent_comment_id={null} parent_name={"Post"+props.post_id} current_user_id={props.current_user_id} post_id={props.post_id} commentOrNot={true} pushToSiblings={postNewComment}/>
            {displayed}
        </div>
    )
}

/*
* PostBox Functional Component
* Functional Component that comprises the input area to post a new comment or reply
* Takes an attribute props.commentOrNot (true means comment, false means reply), used for conditional styling
* Takes an attribute props.parent_comment_id used for a unique ID for the textarea
*/
function PostBox(props) {

    // Specific type of the post being written
    const postType = props.commentOrNot ? 'Comment' : 'Reply';

    // Resizes a textarea to fit the content in it vertically
    function updateTextArea() {
        // Resize the textarea
        let textarea = document.getElementById(`replyTo${props.parent_name}`); // find textarea to resize
        textarea.style.height = textarea.parentElement.style.height; // downscale to nothing
        textarea.style.height = (textarea.scrollHeight)+"px"; // adjust height to scroll height
        // Inform the user how many characters they have left once they have <100 remaining
        let commentBody = document.getElementById(`replyTo${props.parent_name}`).value;
        let remainingChars = MAX_CHARS_COMMENT - commentBody.length;
        // Show number of characters remaining if <= 100 remaining
        if (remainingChars <= 100) {
            document.getElementById(`replyTo${props.parent_name}Count`).innerHTML = `${remainingChars} characters remaining...`;
            document.getElementById(`replyTo${props.parent_name}Count`).classList.add("show");
        } else {
            document.getElementById(`replyTo${props.parent_name}Count`).classList.remove("show");
        }
        // Disables the submit button if empty
        let submitButton = document.getElementById(`replyTo${props.parent_name}Submit`);
        if (commentBody.length === 0 || commentBody === "[comment deleted]") {
            submitButton.disabled = true;
        } else {
            submitButton.disabled = false;
            submitButton.onclick = sendPost;
        }
    }

    // Submit a new comment/reply post to the backend, and re-render the relevant list of comments/replies with the new post
    function sendPost() {
        let commentBody = document.getElementById(`replyTo${props.parent_name}`).value;
        // Check for null or empty (cannot do !commentBody as that includes '0' and 'NaN')
        if (commentBody === null || commentBody.length === 0) {
            // Error
            alert(`You cannot post an empty ${postType.toLowerCase()}`)
        // Check if comment being posted is not allowed
        } else if (commentBody == "[comment deleted]") {
            // Error
            alert(`You cannot post a ${postType.toLowerCase()} with this text`)
        } else {
            // Post to backend
            let newdate = new Date();
            // Fetch POST request to the api, sending the required data
            fetch("/api/comment", {
                method: "POST",
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                post_id: props.post_id,
                parent_comment_id: props.parent_comment_id,
                content: commentBody
                }),
            }).then(async (res) => {
                let resJson = await res.json();
                // If error notify user
                if (res.status !== 200) {
                    alert("Error\n" + resJson.message + "\n");
                    console.log(resJson.message);
                } else {
                    // Fetches account details to complete information needed to display
                    fetch('/api/accountDetails')
                    .then(async (response) =>  {
                        if (!response.ok) {
                            throw new Error();
                        }
                        let responseJson = await response.json();
                        let output = {comment_id:resJson.comment_id, user_id:responseJson.user_id, username:responseJson.username, date_posted:newdate, content:commentBody, post_id:props.post_id, hasReplies: 0};
                        // Update siblings on frontend and re-render the list it is inserted into
                        props.pushToSiblings(output);
                        document.getElementById(`replyTo${props.parent_name}`).value = "";
                    }).catch(err => {
                        console.log("Error: Unable to retrieve account details");
                    })
                }
                let submitButton = document.getElementById(`replyTo${props.parent_name}Submit`);
                submitButton.disabled = true;
            })
        }
    }

    return (
        <div className="commentPostBox">
            <img className="commentProfilePicture" src={process.env.PUBLIC_URL + getProfilePathFromID(props.current_user_id)} alt=""></img>
            <div>
                <textarea id={`replyTo${props.parent_name}`} placeholder={`${postType}...`} maxLength="500" onKeyUpCapture={() => updateTextArea()}>
                    
                </textarea>
                <span id={`replyTo${props.parent_name}Count`} className="replyCharactersRemaining"></span>
                <button id={`replyTo${props.parent_name}Submit`} className="textButton" onClick={() => sendPost()} disabled={true}>Submit {postType}</button>
            </div>
        </div>
    )
}

function Comment(props) {

    /*
    * State variables and their update functions
    * replying     - Represents whether or not a reply is being written to this comment (used to render or not render the PostBox)
    * editing      - Represents whether or not this comment is currently being edited
    * replies      - Represents the array of replies to this comment
    * newreplies   - Represents the number of new replies made by the user since they opened the replies to this comment, this makes
    *                it possible to render the "Load Replies" button when the replies section is devoid of OLD replies
    * contentState - Represents the state of the content in the comment, making it possible to re-render on edits
    * loadFailed   - Represents whether or not the load button has failed to load replies
    */
    const [replying, updateReplying] = useState(false);
    const [editing, updateEditing] = useState(false);
    const [replies, updateReplies] = useState([]);
    const [newreplies, updateNewReplies] = useState([]);
    const [contentState, updateContentState] = useState(props.data.content);
    const [loadFailed, updateLoadFailed] = useState(false);

    // Ref determining whether or not the component is being rendered for the first time (false after first render)
    const firstRender = useRef(true);

    let date = convertISOtoDate(props.data.date_posted);
    let time = convertISOtoTime(props.data.date_posted);

    // Determine whether or not to render the update buttons (only rendered if viewing own comment)
    let updateElement = (props.current_user_id == props.data.user_id || localStorage.getItem("currentrole") == "administrator") && contentState != "[comment deleted]" ? 
        <span>
            {props.current_user_id == props.data.user_id ? <button className="commentEditButton material-icons" onClick={() => updateEditing(true)}>edit</button> : null }
            {(props.current_user_id == props.data.user_id || localStorage.getItem("currentrole") == "administrator") ? <button className="commentDeleteButton material-icons" onClick={() => deleteComment()}>delete</button> : null}
        </span>
        :
        null
    ;

    // Resizes a textarea to fit the content in it vertically
    function updateTextArea() {
        // Resize the textarea
        let textarea = document.getElementById(`editing${props.data.comment_id}`); // find textarea to resize
        textarea.style.height = textarea.parentElement.style.height; // downscale to nothing
        textarea.style.height = (textarea.scrollHeight)+"px"; // adjust height to scroll height
        // Inform the user how many characters they have left once they have <100 remaining
        let commentBody = document.getElementById(`editing${props.data.comment_id}`).value;
        let remainingChars = MAX_CHARS_COMMENT - commentBody.length;
        // Render characters remaining if <= 100 remaining
        // Also render delete warning if edit is empty
        if (remainingChars <= 100) {
            document.getElementById(`editing${props.data.comment_id}Count`).innerHTML = `${remainingChars} characters remaining...`;
            document.getElementById(`editing${props.data.comment_id}Count`).classList.add("show");
        } else if (remainingChars == 500) {
            document.getElementById(`editing${props.data.comment_id}Count`).innerHTML = `WARNING: Saving an empty edit will DELETE your comment!`;
            document.getElementById(`editing${props.data.comment_id}Count`).classList.add("show");
        } else {
            document.getElementById(`editing${props.data.comment_id}Count`).classList.remove("show");
        }
    }

    // Updates a comment on the frontend and makes a PATCH request to the backend
    function updateComment() {
        let newcontent = document.getElementById(`editing${props.data.comment_id}`).value;
        // Check for null or empty (cannot do !commentBody as that includes '0' and 'NaN')
        if (newcontent === null || newcontent.length === 0) {
            // Delete if empty
            deleteComment();
        } else {
            fetch(`/api/comment/${props.data.comment_id}`, {
                method: "PATCH",
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: newcontent
                }),
            }).then(async (res) => {
                let resJson = await res.json();
                // If error notify user
                if (res.status !== 200) {
                    alert("Error\n" + resJson.message + "\n");
                    console.log(resJson.message);
                } else { // Else success, update state
                    updateContentState(newcontent);
                    updateEditing(false);
                }
            });
        }
    }

    // Delete a comment on the frontend and make DELETE request to backend
    function deleteComment() {
        fetch(`/api/comment/${props.data.comment_id}`, {
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
                updateContentState("[comment deleted]");
                updateEditing(false);
            }
        });
    }

    // Determine whether or not to render an editable view of content, or just regular view
    let contentElement = editing ? 
        <div className="commentEditBox">
            <textarea id={`editing${props.data.comment_id}`} placeholder={`Continue Writing...`} maxLength="500" onKeyUpCapture={() => updateTextArea()}>
                {contentState != "[comment deleted]" ? contentState : ""}
            </textarea>
            <span id={`editing${props.data.comment_id}Count`} className="replyCharactersRemaining"></span>
            <button className="textButton cancel" onClick={() => updateEditing(false)}>Cancel</button>
            <button className="textButton" onClick={() => updateComment()}>Save Changes</button>
        </div>
        :
        <div className="commentContent">
            <span className="commentText">{contentState}</span>
        </div>
    ;

    // Add new reply to existing replies
    function postNewReply(newreply) {
        // Add the new reply to the array of replies
        let newposts = [newreply].concat(replies);
        updateNewReplies(newreplies.concat(newreply.comment_id)); // update newreplies
        updateReplies(newposts); // update reply array
        updateReplying(false); // set replying to false, closing the reply box
    }

    // Determine the replyElement, dependent on replying
    // If replying is true, then the elements needed to submit a reply will be rendered
    // Else if it is false, then the button to open up the reply box will be rendered instead
    let replyElement = replying ? 
    <div>
        <PostBox commentOrNot={false} parent_comment_id={props.data.comment_id} current_user_id={props.current_user_id} parent_name={props.data.comment_id} post_id={props.data.post_id} pushToSiblings={postNewReply}/>
        <button className="textButton cancel" onClick={() => updateReplying(false)}>Cancel</button>
    </div>
    :
    <button className="textButton secondary" onClick={() => updateReplying(true)}>Reply</button>;

    // Fetch replies
    // automatic - if this was automatically run (i.e. initial render)
    function retrieveReplies(automatic) {
        fetch('/api/replies/' + props.data.comment_id)
            .then(async (response) =>  {
                if (!response.ok) {
                    if (!automatic){
                        updateLoadFailed(true);
                    }
                    throw new Error();
                }
                let responseJson = await response.json();
                // Update comments
                let loadedreplies = replies.concat(responseJson.filter(reply => !newreplies.includes(reply.comment_id)));
                updateReplies(loadedreplies);
            }).catch(err => {
                console.log("Failed to load replies");
            })
    }

    // Determine displayed components in list, or add a button prompt to load them
    let loadbuttontext = !loadFailed ? "Load Replies" : "No Replies Found, Click to Retry";
    let displayed = (replies != null && Array.isArray(replies) && replies.length > 0) ? 
        (replies.length - newreplies.length) > 0 ? 
            <div className="replyList">
                {replies.map(reply => <Comment data={reply} current_user_id={props.current_user_id} depth={props.depth + 1} key={reply.comment_id}/>)}
            </div>
            : 
            <div>
                {props.data.hasReplies > 0 ? <button className={`${!loadFailed ? "secondary" : "failed"} textButton`} onClick={() => retrieveReplies(false)}>{loadbuttontext}</button> : null }
                <div className="replyList">
                    {replies.map(reply => <Comment data={reply} current_user_id={props.current_user_id} depth={props.depth + 1} key={reply.comment_id}/>)}
                </div>
            </div>
        :
        props.data.hasReplies > 0 ? <button className={`${!loadFailed ? "secondary" : "failed"} textButton`} onClick={() => retrieveReplies(false)}>{loadbuttontext}</button> : null
    ;

    // On render, if this is the first render, load top replies
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            if (props.depth <= INITIAL_RENDER_DEPTH && props.data.hasReplies > 0) { // if current depth still within initial render depth and has replies, load top replies
                retrieveReplies(true);
            }
        }
    })

    return (
        <div className="comment">
            <div>
                <img className="commentProfilePicture" src={process.env.PUBLIC_URL + getProfilePathFromID(props.data.user_id)} alt=""></img>
                <div className="verticalLine"></div>
            </div>
            <div className={`commentBody${props.current_user_id == props.data.user_id ? " owned" : ""}`}>
                <div>
                    <Link to={"/account/" + props.data.user_id} className="commentUsername">{props.data.username ? `${props.data.username} (${props.data.user_id.substring(0, 3)})` : "[deleted user]"}</Link>
                    <span className="commentTimestamp">{date} at {time}</span>
                    {updateElement}
                </div>
                {contentElement}
                {replyElement}
                {displayed}
            </div>
        </div>
    )
}

export default CommentSection;