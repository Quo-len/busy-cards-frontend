import { getRectOfNodes, useReactFlow, getTransformForBounds } from "reactflow";
import { toast } from "react-toastify";
import { toPng } from "html-to-image";
import useCanvasStore from "../../store/useCanvasStore";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import jsPDF from "jspdf";
import "../styles/MindmapSerializer.css";

const nodeFields = {
	custom: {
		fields: ["label", "description", "color", "status", "priority", "options", "comments"],
	},
	actor: {
		fields: ["label", "description", "color", "priority", "options", "comments"],
	},
	image: {
		fields: ["label", "description", "image", "comments"],
	},
	note: {
		fields: ["label", "color", "comments"],
	},
	mygroup: {
		fields: ["label", "description", "options", "comments"],
	},
};

const MindmapSerializer = ({ mindmap, isVisible, isEditable }) => {
	const fileInputRef = useRef(null);

	const { addNode, addEdge, getNodesArray, getEdgesArray } = useCanvasStore();
	const reactFlowInstance = useReactFlow();

	const exportToPng = () => {
		const nodes = getNodesArray();

		if (nodes.length === 0) {
			toast.error("Відсутні вузли для експорту.");
			return;
		}

		reactFlowInstance.fitView({
			padding: 0.2,
			includeHiddenNodes: true,
			duration: 0,
		});

		const nodesBounds = getRectOfNodes(nodes);
		const padding = Math.max(nodesBounds.width, nodesBounds.height) * 0.1;

		const expandedBounds = {
			x: nodesBounds.x - padding,
			y: nodesBounds.y - padding,
			width: nodesBounds.width + padding * 2,
			height: nodesBounds.height + padding * 2,
		};

		const imageWidth = Math.max(expandedBounds.width, 800);
		const imageHeight = Math.max(expandedBounds.height, 600);

		const transform = getTransformForBounds(expandedBounds, imageWidth, imageHeight, 0.5, 2);

		return new Promise((resolve, reject) => {
			toPng(document.querySelector(".react-flow__viewport"), {
				backgroundColor: "#ffffff",
				width: imageWidth + 50,
				height: imageHeight + 50,
				style: {
					width: `${imageWidth}px`,
					height: `${imageHeight}px`,
					transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
				},
				filter: (node) => {
					return !node.classList || !node.classList.contains("edgebutton");
				},
				cacheBust: true,
				pixelRatio: 2,
			})
				.then((dataUrl) => {
					resolve(dataUrl);
				})
				.catch((error) => {
					console.error("Error generating image:", error);
					reject(error);
				});
		});
	};

	function downloadImage(dataUrl, fileName) {
		const a = document.createElement("a");
		const formattedName = fileName
			? `${fileName.replace(/[^\u0400-\u04FFa-zA-Z0-9\s\-_]/g, " ").replace(/\s+/g, " ")}.png`
			: "mindmap.png";
		a.setAttribute("download", formattedName);
		a.setAttribute("href", dataUrl);
		a.click();

		toast.success("Успішний ескпорт.");
	}

	const exportToJSONFile = (fileName = "mindmap.json") => {
		const currentNodes = getNodesArray();
		const currentEdges = getEdgesArray();

		if (currentNodes.length === 0) {
			toast.error("На карті відсутні вузли.");
			return;
		}

		const data = {
			nodes: currentNodes,
			edges: currentEdges,
			metadata: {
				title: mindmap?.title || "Untitled Mindmap",
				exportedAt: new Date().toISOString(),
				version: "1.0",
			},
		};

		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
		a.click();

		URL.revokeObjectURL(url);

		toast.success("Успішний експорт у JSON.");
	};

	const exportToPdf = async (fileName = "mindmap") => {
		const nodes = getNodesArray();
		if (nodes.length === 0) {
			toast.error("Відсутні вузли для експорту.");
			return;
		}

		try {
			const dataUrl = await exportToPng(fileName);
			const pdf = new jsPDF({
				orientation: "landscape",
				unit: "mm",
				format: "a4",
			});

			pdf.addFont("/fonts/NotoSans-Regular.ttf", "NotoSans", "normal");
			pdf.addFont("/fonts/NotoSans-Bold.ttf", "NotoSans", "bold");
			pdf.setFont("NotoSans");

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const imgProps = pdf.getImageProperties(dataUrl);
			const imgWidth = pdfWidth - 20;
			const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
			const yOffset = Math.max(10, (pdfHeight - imgHeight) / 2);

			pdf.addImage(dataUrl, "PNG", 10, yOffset, imgWidth, imgHeight);

			const title = mindmap?.title || "Untitled Mindmap";
			pdf.setFontSize(16);
			pdf.setTextColor(0, 0, 0);
			pdf.text(title, pdfWidth / 2, 10, { align: "center" });

			pdf.addPage("a4", "portrait");
			const contentPageWidth = pdf.internal.pageSize.getWidth();
			const contentPageHeight = pdf.internal.pageSize.getHeight();

			pdf.setFontSize(18);
			pdf.text(title, contentPageWidth / 2, 15, { align: "center" });
			pdf.setFontSize(14);
			pdf.text("Вміст вузлів", contentPageWidth / 2, 25, { align: "center" });
			pdf.setFontSize(12);

			let yPosition = 35;
			const checkAndAddPage = (height) => {
				if (yPosition + height > contentPageHeight - 15) {
					pdf.addPage("a4", "portrait");
					yPosition = 20;
				}
			};

			nodes.forEach((node, index) => {
				checkAndAddPage(15);

				pdf.setFont("NotoSans", "bold");
				pdf.text(`${index + 1}. ${node.data.label || "Unnamed Node"}`, 10, yPosition);
				yPosition += 8;

				pdf.setFont("NotoSans", "normal");
				pdf.setFontSize(8);
				pdf.setTextColor(100, 100, 100);
				pdf.text(`Ідентифікатор: ${node.id} | Тип: ${node.type || "default"}`, 15, yPosition);
				yPosition += 8;

				pdf.setFontSize(12);
				pdf.setTextColor(0, 0, 0);

				const nodeType = node.type || "custom";
				const allowedFields = nodeFields[nodeType]?.fields || nodeFields.custom.fields;

				const relevantData = {};
				allowedFields.forEach((field) => {
					if (node.data && node.data[field] !== undefined) {
						relevantData[field] = node.data[field];
					}
				});

				Object.keys(relevantData).forEach((key) => {
					if (key === "label") return;

					checkAndAddPage(10);

					const value = relevantData[key];
					let displayValue;

					if (typeof value === "object" && value !== null) {
						displayValue = JSON.stringify(value, null, 2);
					} else {
						displayValue = String(value);
					}

					pdf.setFont("NotoSans", "bold");
					pdf.setFontSize(10);

					const fieldTranslations = {
						description: "Опис",
						color: "Колір",
						status: "Статус",
						priority: "Пріоритет",
						options: "Опції",
						image: "Зображення",
						comments: "Коментарі",
					};

					const fieldLabel = fieldTranslations[key] || key;

					if (key === "comments" && Array.isArray(value)) {
						pdf.setFont("NotoSans", "bold");
						pdf.text(`${fieldLabel}:`, 15, yPosition);
						yPosition += 8;

						if (value.length > 0) {
							value.forEach((comment, commentIndex) => {
								checkAndAddPage(20);

								pdf.setFont("NotoSans", "bold");
								pdf.setFontSize(9);
								pdf.text(`Коментар ${commentIndex + 1}:`, 20, yPosition);
								yPosition += 5;

								pdf.setFont("NotoSans", "normal");
								pdf.setFontSize(8);
								pdf.setTextColor(80, 80, 80);

								const timestamp = new Date(comment.timestamp).toLocaleString("uk-UA");
								let authorInfo = `Автор: ${comment.author || "Невідомий"} | Дата: ${timestamp}`;

								if (comment.edited && comment.editTimestamp) {
									const editTimestamp = new Date(comment.editTimestamp).toLocaleString("uk-UA");
									authorInfo += ` | Відредаговано: ${editTimestamp}`;
								}

								pdf.text(authorInfo, 25, yPosition);
								yPosition += 5;

								pdf.setFont("NotoSans", "normal");
								pdf.setFontSize(10);
								pdf.setTextColor(0, 0, 0);

								const commentLines = pdf.splitTextToSize(comment.text, contentPageWidth - 35);
								pdf.text(commentLines, 25, yPosition);
								yPosition += commentLines.length * 5 + 5;
							});
						} else {
							pdf.setFont("NotoSans", "normal");
							pdf.setFontSize(9);
							pdf.setTextColor(80, 80, 80);
							pdf.text("Коментарі відсутні", 20, yPosition);
							yPosition += 8;
							pdf.setTextColor(0, 0, 0);
						}
					} else {
						pdf.text(`${fieldLabel}:`, 15, yPosition);
						yPosition += 5;

						pdf.setFont("NotoSans", "normal");
						pdf.setFontSize(10);
						const valueLines = pdf.splitTextToSize(displayValue, contentPageWidth - 25);
						pdf.text(valueLines, 20, yPosition);
						yPosition += valueLines.length * 5 + 3;
					}
				});

				if (node.position) {
					checkAndAddPage(5);
					pdf.setFontSize(9);
					pdf.setTextColor(80, 80, 80);
					pdf.text(`Позиція: x=${Math.round(node.position.x)}, y=${Math.round(node.position.y)}`, 15, yPosition);
					pdf.setFontSize(12);
					pdf.setTextColor(0, 0, 0);
					yPosition += 8;
				}

				if (index < nodes.length - 1) {
					checkAndAddPage(5);
					pdf.setDrawColor(200, 200, 200);
					pdf.line(10, yPosition, contentPageWidth - 10, yPosition);
					yPosition += 10;
				}
			});

			const totalPages = pdf.internal.getNumberOfPages();
			for (let i = 1; i <= totalPages; i++) {
				pdf.setPage(i);
				pdf.setFontSize(8);
				pdf.setTextColor(100, 100, 100);
				const currentDate = new Date().toLocaleDateString();
				const currentPageWidth = pdf.internal.pageSize.getWidth();
				const currentPageHeight = pdf.internal.pageSize.getHeight();
				pdf.text(
					`Експортовано: ${currentDate} | Сторінка ${i} з ${totalPages}`,
					currentPageWidth / 2,
					currentPageHeight - 5,
					{ align: "center" }
				);
			}

			const formattedName = fileName
				? `${fileName.replace(/[^\u0400-\u04FFa-zA-Z0-9\s\-_]/g, " ").replace(/\s+/g, " ")}.pdf`
				: "mindmap.pdf";
			pdf.save(formattedName);
			toast.success("Успішний експорт в PDF.");
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error("Невдача експорту інтелект-карти в PDF.");
		}
	};

	const importFromJSON = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const jsonData = JSON.parse(event.target.result);
					if (!jsonData.nodes || !Array.isArray(jsonData.nodes) || !jsonData.edges || !Array.isArray(jsonData.edges)) {
						toast.error("Невірний формат файлу.");
						reject(new Error("Невірний формат"));
						return;
					}
					const shouldAdd = window.confirm("Ви впевнені, що дійсно хочете виконати імпорт?");
					if (!shouldAdd) {
						return;
					}
					const nodeIdMap = new Map();
					const importedNodes = jsonData.nodes.map((node) => {
						const newId = uuidv4();
						nodeIdMap.set(node.id, newId);
						return {
							...node,
							id: newId,
						};
					});
					const importedEdges = jsonData.edges.map((edge) => {
						return {
							...edge,
							id: uuidv4(),
							source: nodeIdMap.get(edge.source),
							target: nodeIdMap.get(edge.target),
						};
					});
					importedNodes.forEach((node) => addNode(node));
					importedEdges.forEach((edge) => addEdge(edge));
					resolve({
						nodeCount: importedNodes.length,
						edgeCount: importedEdges.length,
					});
				} catch (error) {
					toast.error(`Помилка зчитування JSON: ${error.message}`);
					reject(new Error(`Failed to parse JSON: ${error.message}`));
				}
			};

			reader.onerror = () => {
				toast.error(`Помилка при читанні файлу.`);
				reject(new Error("Error reading file"));
			};

			reader.readAsText(file);
		});
	};

	const handleFileImport = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.type !== "application/json") {
			toast.error("Будь ласка, виберіть файл формату JSON!");
			return;
		}

		importFromJSON(file)
			.then((result) => {
				toast.success(`Успішно додано ${result.nodeCount} вузлів та ${result.edgeCount} зв'язків.`);
				reactFlowInstance.fitView({
					includeHiddenNodes: true,
					minZoom: 0.1,
					maxZoom: 1,
				});
			})
			.catch((error) => {
				toast.error(`Помилка імпорту: ${error.message}`);
			});

		e.target.value = null;
	};

	const triggerImportFile = () => {
		fileInputRef.current.click();
	};

	return (
		<>
			<div className={`mindmap-serializer-container ${isVisible ? "visible" : "hidden"}`}>
				<div className="mindmap-serializer-header">
					<h3>Імпорт/Експорт</h3>
					<span>{isVisible ? "▼" : "▲"}</span>
				</div>

				<div className="mindmap-serializer-content">
					<input type="file" ref={fileInputRef} accept=".json" onChange={handleFileImport} />

					<div className="mindmap-serializer-buttons">
						<button className="mindmap-serializer-button" onClick={triggerImportFile} disabled={!isEditable}>
							Імпорт із JSON
						</button>

						<button className="mindmap-serializer-button" onClick={() => exportToJSONFile(mindmap?.title)}>
							Експорт в JSON
						</button>

						<button
							className="mindmap-serializer-button"
							onClick={() => exportToPng().then((dataUrl) => downloadImage(dataUrl, mindmap?.title))}
						>
							Експорт в PNG
						</button>

						<button className="mindmap-serializer-button" onClick={() => exportToPdf(mindmap?.title)}>
							Експорт в PDF
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MindmapSerializer;
