import React from "react";
import { MdSavedSearch } from "react-icons/md";
import { IoNuclearSharp } from "react-icons/io5";
import { TbCircleArrowRight, TbCircleArrowLeft } from "react-icons/tb";
import "../styles/SearchBar.css";

const SearchBar = ({
	onSearch,
	onClear,
	onNavigatePrev,
	onNavigateNext,
	searchQuery,
	setSearchQuery,
	currentIndex,
	totalResults,
}) => {
	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			onSearch();
		}
	};

	return (
		<div className="search-sidebar-container">
			<div className="search-sidebar">
				<div className="search-sidebar-wrapper">
					<div className="search-sidebar-inner">
						<div className="search-input-container">
							<input
								className="search-sidebar-input"
								value={searchQuery}
								placeholder="Пошук по вузлах..."
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyPress={handleKeyPress}
							/>

							<div className="search-sidebar-controls">
								<button className="search-sidebar-button" onClick={onSearch} title="Search">
									<MdSavedSearch />
								</button>
								<button
									className="search-sidebar-button"
									onClick={onNavigatePrev}
									title="Previous"
									disabled={totalResults === 0}
								>
									<TbCircleArrowLeft />
								</button>
								<button
									className="search-sidebar-button"
									onClick={onNavigateNext}
									title="Next"
									disabled={totalResults === 0}
								>
									<TbCircleArrowRight />
								</button>
								<button className="search-sidebar-button" onClick={onClear} title="Clear">
									<IoNuclearSharp />
								</button>
							</div>
						</div>
						{totalResults > 0 && (
							<div className="search-sidebar-results">
								{currentIndex} із {totalResults}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchBar;
