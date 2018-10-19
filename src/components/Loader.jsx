import React from "react";

export default function Loader() {
	return (
		<div className="Loader">
			<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
			<p>Loading...</p>
		</div>
	);
}