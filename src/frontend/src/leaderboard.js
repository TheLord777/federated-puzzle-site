import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { withRouter, Link } from "react-router-dom";

// Leaderboard React Functional Component
function Leaderboard(props) {
    // State contains list of top users
    const [users, setUsers] = useState(null);

    const firstRender = useRef(true);

    // On render, if this is the first render, perform search
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            fetch('/api/leaderboard').then(async (res) => {
                let resJson = await res.json();
                // If error notify user
                if (res.status !== 200) {
                    if (res.status === 404) {
                        // Set null posts
                        setUsers(null);
                    } else {
                        alert("Error\n" + resJson.message + "\n");
                        console.log(resJson.message);
                    }
                } else {
                    // Set new posts on page
                    setUsers(resJson.users);
                }
            });
            // Fetches logged in user's account details from server
            fetch('/api/accountDetails')
                .then(async (res) =>  {
                if (!res.ok) {
                    throw new Error();
                }
                let resJson = await res.json();
                localStorage.setItem("currentrole", resJson.role);
                }).catch(err => {
                console.log("Error: Unable to retrieve account details");
                })
        }
    })

    // If users not loaded, return a div with loading statement
    // Else return a Leaderboard constructed using the users loaded
    return (<>{users === null ? <div>Loading Leaderboard...</div> : <LeaderboardTable users={users} />}</>);
}

// LeaderboardTable Component containing the table, headers, and takes a set of entries to the leaderboard and creates Entry components
function LeaderboardTable(props) {
    let entries = [];

    for (let i = 0; i < props.users.length; i++) {
        entries.push(<Entry placement={i + 1} username={props.users[i].username} user_id={props.users[i].user_id} num={props.users[i].nopuzzlessolved} ></Entry>)
    }

    return (
        <div className="leaderboard">
            <h2>The Sudoku29 Top 29</h2>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Username</th>
                        <th>Solves</th>
                    </tr>
                </thead>
                <tbody>
                    {entries}
                </tbody>
            </table>
        </div>
    )
}

// Entry Component containing the table row for a given user
function Entry(props) {

    const history = useHistory();

    let placementText = props.placement <= 3 ? <span id={`top${props.placement}`} className="medalCell"><span className="material-icons">workspace_premium</span> <span>{props.placement}</span></span>  : <span className="noMedal">{props.placement}</span> ;

    return (
        <tr onClick={() => {history.push(`/account/${props.user_id}`)}}>
            <td className="placementCell">{placementText}</td>
            <td className="userCell">{props.username} ({props.user_id.slice(0,3)})</td>
            <td className="solvesCell" style={props.placement === 1 ? {fontWeight: "800"} : null}>{props.num}</td>
        </tr>
    )
}

export default Leaderboard;
