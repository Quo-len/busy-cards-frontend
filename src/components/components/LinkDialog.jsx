import React, { useState, useEffect, useRef } from 'react';
import { FiLink, FiX } from 'react-icons/fi';
import '../styles/LinkDialog.css';

const LinkDialog = ({ isOpen, onClose, onSave, selectedText }) => {
	const [linkText, setLinkText] = useState(selectedText || '');
	const [linkUrl, setLinkUrl] = useState('https://');
	const textInputRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			setLinkText(selectedText || '');
			setLinkUrl('https://');
			// Focus the first input after dialog opens
			setTimeout(() => {
				if (textInputRef.current) {
					textInputRef.current.focus();
				}
			}, 10);
		}
	}, [isOpen, selectedText]);

	const handleSubmit = (e) => {
		e.preventDefault();

		// Ensure URL has protocol
		let url = linkUrl;
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			url = `https://${url}`;
		}

		onSave(linkText, url);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="link-dialog-overlay">
			<div className="link-dialog">
				<div className="link-dialog-header">
					<FiLink className="link-icon" />
					<h3>Додати посилання</h3>
					<button className="close-button" onClick={onClose}>
						<FiX />
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="link-text">Текст посилання:</label>
						<input
							ref={textInputRef}
							id="link-text"
							type="text"
							value={linkText}
							onChange={(e) => setLinkText(e.target.value)}
							required
							placeholder="Введіть текст посилання"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="link-url">URL:</label>
						<input
							id="link-url"
							type="text"
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							required
							placeholder="https://example.com"
						/>
					</div>

					<div className="dialog-buttons">
						<button type="button" className="cancel-button" onClick={onClose}>
							Скасувати
						</button>
						<button type="submit" className="save-button">
							Зберегти
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LinkDialog;
