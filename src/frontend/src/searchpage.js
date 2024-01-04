import React, { useState, useEffect, useRef } from "react";
import { withRouter, Link } from "react-router-dom";
import { convertISOtoDate, convertISOtoTime } from "./util.js";

function SearchPage(props) {
    // State contains filters and order for search
    const [searchParams, setSearchParams] = useState({type: "all", order: "recent", ascending: false});
    // State contains posts for the page
    const [posts, setPosts] = useState(null);
    // Need a hook to update posts based on search requests or new page, call when either happens
    // State contains total number of pages (within filter)
    const [totalPages, setTotalPages] = useState(1);
    // Need a hook to update number based on search requests, pass to SearchBar
    // State contains current page number (within filter), 1-index
    const [currentPage, setCurrentPage] = useState(1);
    // Need a hook to update page number, passed to PageChanger components
    // This hook needs to also trigger a new request for the next subsection of posts

    const firstRender = useRef(true);

    // On render, if this is the first render, perform search
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            document.title = "Search";
            const params = new URLSearchParams({
                type: searchParams.type,
                exclude: searchParams.exclude,
                order: searchParams.order,
                ascending: searchParams.ascending,
                datefrom: searchParams.datefrom,
                dateto: searchParams.dateto,
                page: currentPage
            }).toString();
            fetch(`/api/searchPosts?` + params, {
                method: "GET",
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                },
            }).then(async (res) => {
                let resJson = await res.json();
                // If error notify user
                if (res.status !== 200) {
                    alert("Error\n" + resJson.message + "\n");
                    console.log(resJson.message);
                } else {
                    setPosts(resJson.posts);
                    setTotalPages(resJson.total_pages);
                }
            });
        }
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
    })

    function newSearchParams(newParams) {
        const params = new URLSearchParams({
            type: newParams.type,
            exclude: newParams.exclude,
            order: newParams.order,
            ascending: newParams.ascending,
            datefrom: newParams.datefrom,
            dateto: newParams.dateto,
            page: 1
        }).toString();
        // Search with searchParams and page number 0, make request
        fetch(`/api/searchPosts?` + params, {
            method: "GET",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
        }).then(async (res) => {
            let resJson = await res.json();
            // If error notify user
            if (res.status !== 200) {
                if (res.status === 404) {
                    // Update new params
                    setSearchParams(newParams);
                    // Update currentPage to 1
                    setCurrentPage(1);
                    // Set null posts
                    setPosts(null);
                    // Set total pages to 1
                    setTotalPages(1);
                } else {
                    alert("Error\n" + resJson.message + "\n");
                    console.log(resJson.message);
                }
            } else {
                // Update new params
                setSearchParams(newParams);
                // Update currentPage to 1
                setCurrentPage(1);
                // Set new posts on page
                setPosts(resJson.posts);
                // Set total pages
                setTotalPages(resJson.total_pages);
            }
        });
    }

    function newSearchPage(newPage) {
        const params = new URLSearchParams({
            type: searchParams.type,
            exclude: searchParams.exclude,
            order: searchParams.order,
            ascending: searchParams.ascending,
            datefrom: searchParams.datefrom,
            dateto: searchParams.dateto,
            page: newPage
        }).toString();
        // Search with new page number and searchParams make request
        fetch(`/api/searchPosts?` + params, {
            method: "GET",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
        }).then(async (res) => {
            let resJson = await res.json();
            // If error notify user
            if (res.status !== 200) {
                alert("Error\n" + resJson.message + "\n");
                console.log(resJson.message);
            } else {
                // Update to new page
                setCurrentPage(newPage);
                // Set new posts on page
                setPosts(resJson.posts);
                // Set total pages
                setTotalPages(resJson.total_pages);
            }
        });
    }

    return (
        <div className="content">
            <SearchBar updateParams={newSearchParams}/>
            <PageChanger currentPage={currentPage} totalPages={totalPages} updatePage={newSearchPage}/>
            <SearchGrid posts={posts} />
            <PageChanger currentPage={currentPage} totalPages={totalPages} updatePage={newSearchPage}/>
        </div>
    );
}

function SearchBar(props) {
    // Parameters to render as, given by props
    // Filters
    const [variant, setVariant] = useState("all");  // all, sudoku, x-sudoku
    const [completed, setCompleted] = useState(null);  // all (null), uncompleted (yes)
    const [startDate, setStartDate] = useState(null);  // any (null), Date
    const [endDate, setEndDate] = useState(null);  // any (null), Date
    // Order
    const [sortOn, setSortOn] = useState("recent"); // recent, popular
    const [ascending, setAscending] = useState(false); // ascending, descending

    // variant button clicks between states
    let variantButton = null;
    switch(variant) {
        case "sudoku":
            variantButton = <div className="filterButton active" onClick={() => setVariant("x-sudoku")}>
                                <span>Classic Only</span>
                            </div>;
          break;
        case "x-sudoku":
            variantButton = <div className="filterButton active" onClick={() => setVariant("all")}>
                                <span>X-Sudoku Only</span>
                            </div>;
          break;
        default:
            variantButton = <div className="filterButton" onClick={() => setVariant("sudoku")}>
                                <span>All Types</span>
                            </div>;
    }
    // completed button clicks between states
    let completedButton = null;
    switch(completed) {
        case "yes":
            completedButton = <div className="filterButton active" onClick={() => setCompleted(null)}>
                                <span>Unsolved Puzzles</span>
                            </div>;
          break;
        default:
            completedButton = <div className="filterButton" onClick={() => setCompleted("yes")}>
                                <span>All Puzzles</span>
                            </div>;
    }
    // startDate gives date select
    let startDateButton = dateFilter(true);

    // endDate gives date select
    let endDateButton = dateFilter(false);

    // True/False for startDate/endDate
    function dateFilter(start) {
        const today = new Date();
        const todayYMD = `${today.getUTCFullYear()}-${today.getUTCMonth() < 9 ? "0" + (today.getUTCMonth() + 1) : (today.getUTCMonth() + 1) }-${today.getUTCDate() < 10 ? "0" + today.getUTCDate() : today.getUTCDate()}`;

        if (start) {
            if (startDate == null) {
                // Return just date input
                return  <div className="filterButton" onClick={() => setStartDate(endDate != null && Date.parse("2022-01-01") > Date.parse(endDate) ? endDate : "2022-01-01")}>
                            <span>From Any Date</span>
                        </div>;
            } else {
                // Return date input and reset button
                return  <>
                            <input type="date" id="startDate" name="startDate" value={startDate} min="2022-01-01" max={ endDate != null && Date.parse(todayYMD) > Date.parse(endDate) ? endDate : todayYMD } onChange={(event) => setStartDate(event.target.value)} />
                            <div className="filterButton material-icons" onClick={() => setStartDate(null)}>close</div>
                        </>;
            }
        } else {
            if (endDate == null) {
                // Return just date input
                return  <div className="filterButton" onClick={() => setEndDate(todayYMD)}>
                            <span>To Any Date</span>
                        </div>;
            } else {
                // Return date input and reset button
                return  <>
                            <input type="date" id="endDate" name="endDate" value={endDate} min={ startDate != null ? startDate : "2022-01-01" } max={todayYMD} onChange={(event) => setEndDate(event.target.value)} />
                            <div className="filterButton material-icons" onClick={() => setEndDate(null)}>close</div>
                        </>;
            }
        }
    }

    // sortOn 3 different radio buttons
    let sortOnDate = sortButton("date", "recent");
    let sortOnPopularity = sortButton("popularity", "popular");
    
    // Function to make a sort button
    function sortButton(sortFilter, sortValue) {
        if (sortValue == sortOn) {
            if (ascending) {
                return (
                    <div className="filterButton active" onClick={() => {setAscending(false); submitSearchPreState(sortValue, false)}}>
                        <span className="material-icons">expand_less</span>
                        <span>{sortFilter.charAt(0).toUpperCase() + sortFilter.slice(1)}</span>
                    </div>
                )
            } else {
                return (
                    <div className="filterButton active" onClick={() => {setAscending(true); submitSearchPreState(sortValue, true)}}>
                        <span className="material-icons">expand_more</span>
                        <span>{sortFilter.charAt(0).toUpperCase() + sortFilter.slice(1)}</span>
                    </div>
                )
            }
        } else {
            return (
                <div className="filterButton" onClick={() => {setSortOn(sortValue); setAscending(false); submitSearchPreState(sortValue, false)}}>
                    {sortFilter.charAt(0).toUpperCase() + sortFilter.slice(1)}
                </div>
            )
        }
    }

    // Submit a new search with specific filters before a state change occurs
    // Used for the auto-search for sortButtons
    function submitSearchPreState(sortValue, ascOrder) {
        // Get ISO format startDate (from start of the day)
        let startDateISO = startDate != null ? (new Date(startDate)).toISOString() : null;
        // Get ISO format endDate (set to end of date to be inclusive)
        let endDateISO = endDate != null ? (new Date(Date.parse(endDate) + 86399999)).toISOString() : null;

        props.updateParams({type: variant, exclude: completed, datefrom: startDateISO, dateto: endDateISO, order: sortValue, ascending: ascOrder});
    }

    // Submit a new search with the current filters
    function submitSearch() {
        // Get ISO format startDate (from start of the day)
        let startDateISO = startDate != null ? (new Date(startDate)).toISOString() : null;
        // Get ISO format endDate (set to end of date to be inclusive)
        let endDateISO = endDate != null ? (new Date(Date.parse(endDate) + 86399999)).toISOString() : null;

        props.updateParams({type: variant, exclude: completed, datefrom: startDateISO, dateto: endDateISO, order: sortOn, ascending: ascending});
    }

    return (
        <div className="searchBar">

            <span>Filter:</span>

            {variantButton}
            {completedButton}
            {startDateButton}
            {endDateButton}
            <div className="filterButton material-icons" onClick={() => submitSearch()}>
                search
            </div>

            <span>Sort By:</span>

            {sortOnDate}
            {sortOnPopularity}
        </div>
    )
}

// Expecting a 'posts' prop
// Could also take a second prop which tells if posts is null because failed to load, or no posts
function SearchGrid(props) {
    if (props.posts == null) {
        return (<div className="searchGrid empty">No posts found for given filters</div>)
    }

    return (
        <div className="searchGrid">
            {props.posts.map(singlepost => (<SearchPost post_id={singlepost.post_id} post_title={singlepost.post_title} post_author={singlepost.post_author} post_author_id={singlepost.post_author_id} post_time={singlepost.post_time} post_solves={singlepost.post_solves} solved_by_user={singlepost.solved_by_user} post_type={singlepost.post_type}/>))}
        </div>
    )
}

function SearchPost(props) {
    // Create path string to navigate to post
    const path = `/post/${props.post_id}`;

    let date = convertISOtoDate(props.post_time);
    let time = convertISOtoTime(props.post_time);

    return (
        <div className="searchPostEntry">
          <div>
            <Link className="postTitle" to={path}>{props.post_title}</Link>
          </div>

          <div>
            <span className="postActivity">
                <span className="material-icons">task_alt</span>
                <span>  {props.post_solves}</span>
            </span>
            {props.solved_by_user ? <span className="postSolved">
                                        <span className="material-icons">done</span>
                                        <span>  Solved!</span>
                                    </span> 
            : null }
          </div>

          <span className="postType">
              {props.post_type.charAt(0).toUpperCase() + props.post_type.slice(1)}
          </span>

          <div className="postDescription">
            <span>Posted {date} at {time} by </span>
            <a className="postAuthor" href={"/account/" + props.post_author_id}>{props.post_author_id != null ? props.post_author + " (" + props.post_author_id.slice(0,3) + ")" : "[deleted user]"}</a>
          </div>
        </div>
    )
}

// Expect a 'pages' prop
function PageChanger(props) {
    let pagesToShow = null;

    // Determine what pages are shown
    if (props.totalPages === 1) { // if totalPages is 1, then only show the one page
        pagesToShow = pageNumber(1);
    } else if (props.totalPages <= 5) { // if 5 or less pages, show all, else will have to hide some
        let pageArray = []
        for (let i = 1; i <= props.totalPages; i++) {
            pageArray.push(pageNumber(i));
        }
        pagesToShow = <>{pageArray}</>;
    } else if (props.currentPage <= 3) { // show first page, following 3 pages, hide, then show lastpage
        let pageArray = []
        for (let i = 1; i <= 4; i++) {
            pageArray.push(pageNumber(i));
        }
        pagesToShow = <>{pageArray}<span className="material-icons">more_horiz</span>{pageNumber(props.totalPages)}</>;
    } else if (props.currentPage > props.totalPages - 3) { // show first page, hide, and show last 3 pages before lastpage, then show lastpage
        let pageArray = []
        for (let i = props.totalPages - 3; i <= props.totalPages; i++) {
            pageArray.push(pageNumber(i));
        }
        pagesToShow = <>{pageNumber(1)}<span className="material-icons">more_horiz</span>{pageArray}</>;
    } else { // if none of the above, hide both ends, and show the middle
        let pageArray = []
        for (let i = props.currentPage - 1; i <= parseInt(props.currentPage) + 1; i++) {
            pageArray.push(pageNumber(i));
        }
        pagesToShow = <>{pageNumber(1)}<span className="material-icons">more_horiz</span>{pageArray}<span className="material-icons">more_horiz</span>{pageNumber(props.totalPages)}</>;
    }

    // Return a pageNumber element for the given number
    function pageNumber(number) {
        if (number == props.currentPage) {
            return (<span className="pageNumber current" onClick={() => props.updatePage(number)}>{number}</span>);
        } else {
            return (<span className="pageNumber" onClick={() => props.updatePage(number)}>{number}</span>);
        }
    }

    // Get array of page numbers in range of 1 to totalPages
    let pageNums = [];
    for (let i = 1; i <= props.totalPages; i++) {
        pageNums.push(i);
    }

    return (
        <div className="pageChanger">
            {pagesToShow}
            <select className="pageNumber" onChange={(event) => {props.updatePage(event.target.value)}}>{pageNums.map(num => <option value={num} selected={props.currentPage === num ? true : null}>{num}</option>)}</select>
        </div>
    )
}

export default SearchPage;
