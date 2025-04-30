import React from "react";
import "../styles/FormattedBio.css";

const FormattedBio = ({ bioText }) => {
	if (!bioText) return null;

	const formatBio = (text) => {
		let formattedBio = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

		formattedBio = formattedBio.replace(/\*(.*?)\*/g, "<em>$1</em>");

		formattedBio = formattedBio.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
			const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
			return `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
		});

		formattedBio = formattedBio.replace(/^- (.*?)$/gm, "<li>$1</li>").replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");

		formattedBio = formattedBio.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

		formattedBio = formattedBio.replace(/\n/g, "<br>");

		return formattedBio;
	};

	return <div className="formatted-bio" dangerouslySetInnerHTML={{ __html: formatBio(bioText) }} />;
};

export default FormattedBio;
