import "../styles/not-found.css"

function NotFound() {
	return (
		<div className="not-found-page-container">
			<h1 className="not-found-heading">404 not found</h1>
			<p>The page you were looking for was not found</p>
			<a className="home-page-link" href="/">Return to home page</a>
		</div>
	)
}

export default NotFound