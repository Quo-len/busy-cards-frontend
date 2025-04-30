import { useState } from "react";
import { FiLink, FiBold, FiItalic, FiList, FiAlignLeft } from "react-icons/fi";
import LinkDialog from "./LinkDialog";
import "../styles/BioSection.css";

const BioSection = ({ user, handleFieldSubmit }) => {
	const [bio, setBio] = useState(user?.bio || "");
	const [bioPreview, setBioPreview] = useState(user?.bio || "");
	const [isPreviewActive, setIsPreviewActive] = useState(false);
	const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
	const [selectedText, setSelectedText] = useState("");

	const formatText = (format) => {
		const textarea = document.getElementById("bio-textarea");
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = bio.substring(start, end);
		let formattedText = "";
		let newCursorPos = end;

		switch (format) {
			case "bold":
				formattedText = `**${selectedText}**`;
				newCursorPos = end + 4;
				break;
			case "italic":
				formattedText = `*${selectedText}*`;
				newCursorPos = end + 2;
				break;
			case "link":
				// Open the link dialog instead of using prompt
				setSelectedText(selectedText);
				setIsLinkDialogOpen(true);
				return; // Exit early since we'll handle this in the dialog
				break;
			case "list":
				formattedText = `\n- ${selectedText}`;
				newCursorPos = end + 3;
				break;
			case "heading":
				formattedText = `\n### ${selectedText}`;
				newCursorPos = end + 5;
				break;
			default:
				break;
		}

		const newBio = bio.substring(0, start) + formattedText + bio.substring(end);
		setBio(newBio);

		// Set cursor position after formatting is applied
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	};

	const togglePreview = () => {
		if (!isPreviewActive) {
			setBioPreview(formatBioForPreview(bio));
		}
		setIsPreviewActive(!isPreviewActive);
	};

	const formatBioForPreview = (bioText) => {
		// Format bold text
		let formattedBio = bioText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

		// Format italic text
		formattedBio = formattedBio.replace(/\*(.*?)\*/g, "<em>$1</em>");

		// Format links with proper URL handling
		formattedBio = formattedBio.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
			// Ensure URL has protocol
			const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
			return `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
		});

		// Format lists
		formattedBio = formattedBio.replace(/^- (.*?)$/gm, "<li>$1</li>").replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");

		// Format headings
		formattedBio = formattedBio.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

		// Replace new lines with <br>
		formattedBio = formattedBio.replace(/\n/g, "<br>");

		return formattedBio;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handleFieldSubmit(e, "bio", bio);
	};

	const handleLinkSave = (text, url) => {
		const textarea = document.getElementById("bio-textarea");
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		// Create markdown link
		const linkMarkdown = `[${text}](${url})`;

		// Insert the link at cursor position or replace selected text
		const newBio = bio.substring(0, start) + linkMarkdown + bio.substring(end);
		setBio(newBio);

		// Set focus back to textarea
		setTimeout(() => {
			textarea.focus();
			const newPosition = start + linkMarkdown.length;
			textarea.setSelectionRange(newPosition, newPosition);
		}, 10);
	};

	return (
		<section className="settings-section bio-section">
			<h2>Про себе</h2>
			<p className="settings-description">
				Розкажіть про себе. Ви можете використовувати форматування тексту та додавати посилання.
			</p>

			<div className="bio-toolbar">
				<button type="button" onClick={() => formatText("bold")} title="Жирний текст">
					<FiBold />
				</button>
				<button type="button" onClick={() => formatText("italic")} title="Курсив">
					<FiItalic />
				</button>
				<button
					type="button"
					onClick={() => {
						const textarea = document.getElementById("bio-textarea");
						const selectedText = bio.substring(textarea.selectionStart, textarea.selectionEnd);
						setSelectedText(selectedText);
						setIsLinkDialogOpen(true);
					}}
					title="Посилання"
				>
					<FiLink />
				</button>
				<button type="button" onClick={() => formatText("list")} title="Список">
					<FiList />
				</button>
				<button type="button" onClick={() => formatText("heading")} title="Заголовок">
					<FiAlignLeft />
				</button>
				<button type="button" className={`preview-toggle ${isPreviewActive ? "active" : ""}`} onClick={togglePreview}>
					{isPreviewActive ? "Редагування" : "Перегляд"}
				</button>
			</div>

			{isPreviewActive ? (
				<div className="bio-preview" dangerouslySetInnerHTML={{ __html: bioPreview }} />
			) : (
				<form onSubmit={handleSubmit} className="settings-form">
					<div className="form-group">
						<textarea
							id="bio-textarea"
							className="form-textarea"
							placeholder="Напишіть щось про себе..."
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={6}
						/>
					</div>
					<div className="bio-help">
						<p>
							<strong>Підказка:</strong>
						</p>
						<ul className="bio-formatting-help">
							<li>
								<strong>Жирний текст:</strong> **текст**
							</li>
							<li>
								<strong>Курсив:</strong> *текст*
							</li>
							<li>
								<strong>Посилання:</strong> [назва посилання](https://example.com)
							</li>
							<li>
								<strong>Список:</strong> - елемент списку
							</li>
							<li>
								<strong>Заголовок:</strong> ### Назва заголовку
							</li>
						</ul>
						<p className="link-note">
							<strong>Примітка:</strong> Обов'язково додавайте "https://" на початку URL для коректної роботи посилань.
						</p>
					</div>
					<button type="submit" className="btn-primary">
						Зберегти
					</button>
				</form>
			)}

			<LinkDialog
				isOpen={isLinkDialogOpen}
				onClose={() => setIsLinkDialogOpen(false)}
				onSave={handleLinkSave}
				selectedText={selectedText}
			/>
		</section>
	);
};

export default BioSection;
