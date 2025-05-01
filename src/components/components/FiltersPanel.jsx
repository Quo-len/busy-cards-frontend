import React from "react";
import "../styles/FiltersPanel.css";

const FiltersPanel = ({
	title = "Фільтри",
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
	itemsPerPage,
	setItemsPerPage,
	className = "",
	sortOptions = [
		{ value: "updatedAt-desc", label: "Останні зміни" },
		{ value: "updatedAt-asc", label: "Найстаріші зміни" },
		{ value: "createdAt-desc", label: "Нещодавно створені" },
		{ value: "createdAt-asc", label: "Найстаріші створення" },
		{ value: "title-asc", label: "Назва (А-Я)" },
		{ value: "title-desc", label: "Назва (Я-А)" },
	],
	pageSizeOptions = [5, 10, 20],
	additionalFilters = null,
}) => {
	return (
		<div className={`filters-panel ${className}`}>
			<h3 className="filters-title">{title}</h3>
			<div className="filters-group">
				<div className="filter-item">
					<label htmlFor="sort-filter">Сортування:</label>
					<select
						id="sort-filter"
						value={`${sortBy}-${sortOrder}`}
						onChange={(e) => {
							const [newSortBy, newSortOrder] = e.target.value.split("-");
							setSortBy(newSortBy);
							setSortOrder(newSortOrder);
						}}
					>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<div className="filter-item">
					<label htmlFor="items-per-page">Елементів на сторінці:</label>
					<select
						id="items-per-page"
						value={itemsPerPage}
						onChange={(e) => {
							setItemsPerPage(parseInt(e.target.value));
						}}
					>
						{pageSizeOptions.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</div>

				{additionalFilters}
			</div>
		</div>
	);
};

export default FiltersPanel;
