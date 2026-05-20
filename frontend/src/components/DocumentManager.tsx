import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Search, Filter, Download, Trash2, MoreVertical, Cloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type DocumentStatus = "ready" | "indexing" | "error";

interface Document {
	id: string;
	filename: string;
	size: string;
	uploadDate: string;
	status: DocumentStatus;
	progress?: number;
}

interface DocumentManagerProps {
	isOpen: boolean;
	onClose: () => void;
	documents: Document[];
	onUpload?: (file: File) => void;
	onDelete?: (docId: string) => void;
}

export function DocumentManager({ isOpen, onClose, documents, onUpload, onDelete }: DocumentManagerProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
	const [filterStatus, setFilterStatus] = useState<DocumentStatus | "all">("all");
	const [isDragging, setIsDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragZoneRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		// Prevent body scroll when modal is open
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";
		document.body.style.paddingRight = `${scrollbarWidth}px`;

		return () => {
			document.body.style.overflow = "";
			document.body.style.paddingRight = "";
		};
	}, [isOpen]);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			Array.from(files).forEach((file) => {
				if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
					handleFileSelect(file);
				} else {
					toast.error(`${file.name} is not a PDF file`);
				}
			});
		}
	};

	const handleFileSelect = async (file: File) => {
		setUploading(true);
		try {
			if (onUpload) {
				await onUpload(file);
			}
			toast.success(`${file.name} uploaded successfully`);
		} catch (error) {
			toast.error(`Failed to upload ${file.name}`);
		} finally {
			setUploading(false);
		}
	};

	const filteredDocuments = documents
		.filter((doc) => {
			const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.filename.localeCompare(b.filename);
				case "size":
					return parseInt(a.size) - parseInt(b.size);
				case "date":
				default:
					return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
			}
		});

	const getStatusIcon = (status: DocumentStatus) => {
		switch (status) {
			case "ready":
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case "indexing":
				return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
			case "error":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
		}
	};

	const getStatusLabel = (status: DocumentStatus) => {
		switch (status) {
			case "ready":
				return "Ready";
			case "indexing":
				return "Indexing...";
			case "error":
				return "Error";
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
					className="bg-card rounded-xl border border-border shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-border">
						<div>
							<h2 className="text-2xl font-display font-bold text-foreground">Document Vault</h2>
							<p className="text-sm text-muted-foreground mt-1">Manage your indexed documents</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="text-muted-foreground hover:text-foreground"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					{/* Tabs */}
					<div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-card/50">
						<button className="text-sm font-medium text-foreground border-b-2 border-accent pb-1">
							Documents
						</button>
						<button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1">
							Indexing Queue
						</button>
					</div>

					{/* Toolbar */}
					<div className="flex items-center justify-between gap-4 px-6 py-4 bg-card/30 flex-wrap">
						<div className="flex items-center gap-3 flex-1 min-w-[200px]">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search documents..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-input border-border h-9"
							/>
						</div>

						<div className="flex items-center gap-2">
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as any)}
								className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
							>
								<option value="date">Sort by date</option>
								<option value="name">Sort by name</option>
								<option value="size">Sort by size</option>
							</select>

							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value as any)}
								className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
							>
								<option value="all">All status</option>
								<option value="ready">Ready</option>
								<option value="indexing">Indexing</option>
								<option value="error">Error</option>
							</select>
						</div>

						<Button
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className="gap-2"
						>
							<Upload className="h-4 w-4" />
							{uploading ? "Uploading..." : "Upload"}
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf"
							className="hidden"
							onChange={(e) => {
								const file = e.currentTarget.files?.[0];
								if (file) handleFileSelect(file);
								e.currentTarget.value = "";
							}}
						/>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto">
						{documents.length === 0 ? (
							<motion.div
								ref={dragZoneRef}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								className={`flex flex-col items-center justify-center h-full p-8 transition-colors ${
									isDragging ? "bg-accent/10 border-2 border-dashed border-accent" : "border-2 border-dashed border-border"
								}`}
							>
								<Cloud className="h-12 w-12 text-muted-foreground/50 mb-4" />
								<h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
								<p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
									Drag and drop PDF files here or click the upload button to add documents to your knowledge base.
								</p>
								<Button onClick={() => fileInputRef.current?.click()} className="gap-2">
									<Upload className="h-4 w-4" />
									Choose files
								</Button>
								<p className="text-xs text-muted-foreground mt-4">Supported format: PDF</p>
							</motion.div>
						) : (
							<div className="divide-y divide-border">
								{/* Table Header */}
								<div className="flex items-center gap-4 px-6 py-3 bg-card/30 text-sm font-semibold text-muted-foreground sticky top-0">
									<div className="flex-1 min-w-0">Name</div>
									<div className="w-24">Size</div>
									<div className="w-28">Upload Date</div>
									<div className="w-20">Status</div>
									<div className="w-8"></div>
								</div>

								{/* Table Rows */}
								<AnimatePresence>
									{filteredDocuments.length === 0 ? (
										<div className="px-6 py-8 text-center text-muted-foreground">
											No documents match your filters
										</div>
									) : (
										filteredDocuments.map((doc, index) => (
											<motion.div
												key={doc.id}
												initial={{ opacity: 0, y: -8 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -8 }}
												transition={{ delay: index * 0.05 }}
												className="flex items-center gap-4 px-6 py-4 hover:bg-card/50 transition-colors group"
											>
												<div className="flex-1 min-w-0 flex items-center gap-3">
													<FileText className="h-4 w-4 text-accent flex-shrink-0" />
													<span className="text-sm font-medium text-foreground truncate">{doc.filename}</span>
												</div>
												<div className="w-24 text-sm text-muted-foreground">{doc.size}</div>
												<div className="w-28 text-sm text-muted-foreground">{doc.uploadDate}</div>
												<div className="w-20 flex items-center gap-2">
													{getStatusIcon(doc.status)}
													<span className="text-xs text-muted-foreground">{getStatusLabel(doc.status)}</span>
												</div>
												{doc.progress && doc.status === "indexing" && (
													<div className="w-full max-w-xs h-1 bg-border rounded-full overflow-hidden">
														<motion.div
															className="h-full bg-accent"
															initial={{ width: 0 }}
															animate={{ width: `${doc.progress}%` }}
															transition={{ duration: 0.3 }}
														/>
													</div>
												)}
												<div className="opacity-0 group-hover:opacity-100 transition-opacity">
													<button className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-card">
														<MoreVertical className="h-4 w-4" />
													</button>
												</div>
											</motion.div>
										))
									)}
								</AnimatePresence>
							</div>
						)}
					</div>

					{/* Footer */}
					{documents.length > 0 && (
						<div className="px-6 py-3 border-t border-border bg-card/30 text-xs text-muted-foreground flex items-center justify-between">
							<span>Showing {filteredDocuments.length} of {documents.length} documents</span>
							{documents.length > 5 && (
								<Button variant="outline" size="sm">
									Load more
								</Button>
							)}
						</div>
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
