javascript: (() => {
	try {
		// Document alias and state containers
		const d = document,
			badges = [],  // array of badge DOM elements overlaying images
			items = [];   // array of image metadata
		let n = 1,       // image counter (for numbering)
			badgeSize = 26,
			vGap = 6,    // vertical gap between badges
			margin = 6;  // margin from window edges

		// Cleanup from a previous run if already active
		if (window._imgData?.cleanup) window._imgData.cleanup();
		window._imgData = {
			badges,
			badgesVisible: true,
			cleanup() {
				try {
					// Remove badges and event listeners
					badges.forEach(b => b.box?.remove());
					badges.length = 0;
					if (this.scrollHandler) removeEventListener("scroll", this.scrollHandler);
					if (this.resizeHandler) removeEventListener("resize", this.resizeHandler);
					if (this.interval) clearInterval(this.interval);
					if (this.overlay) this.overlay.remove();
				} catch (e) {
					console.warn("Cleanup error", e);
				}
			}
		};

		/* ---------------- Small Helper Functions ---------------- */

		// Convert bytes into human-readable file size string
		const formatSize = b => {
			if (!b) return "Unknown";
			if (b < 1024) return b + " B";
			let kb = b / 1024;
			if (kb < 1024) return kb.toFixed(1) + " KB";
			return (kb / 1024).toFixed(1) + " MB";
		};

		// Check if a string looks like an image URL
		const looksLikeImageURL = u => {
			if (!u) return false;
			u = String(u).trim();
			if (u.startsWith('data:') || u.startsWith('blob:')) return true;
			try {
				// Normalize URL (handles relative paths)
				const parsed = new URL(u, location.href);
				u = parsed.href;
			} catch (e) {}
			return (/\.(jpe?g|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i).test(u);
		};

		// From a srcset, pick the largest "w" candidate
		const pickFromSrcset = srcset => {
			if (!srcset) return null;
			const parts = srcset.split(',').map(p => p.trim()).filter(Boolean);
			if (!parts.length) return null;
			let best = null, bestW = -1;
			for (const p of parts) {
				const m = p.match(/^\s*(\S+)(?:\s+(\d+)w)?\s*$/);
				if (m) {
					const url = m[1];
					const w = m[2] ? parseInt(m[2], 10) : -1;
					if (w > bestW) {
						bestW = w;
						best = url;
					}
					if (bestW === -1) best = url; // fallback if no widths
				}
			}
			return best || null;
		};

		// Get a value from dataset or attributes
		const getDataAttr = (img, keys) => {
			for (const k of keys) {
				if (img.dataset && img.dataset[k]) return img.dataset[k];
				const attr = img.getAttribute && img.getAttribute(k);
				if (attr) return attr;
			}
			return null;
		};

		// Best guess for full-size image URL
		const getBestFullURL = img => {
			// 1) parent anchor href
			const a = img.closest && img.closest("a");
			const aHref = a?.href;
			if (aHref && looksLikeImageURL(aHref)) return aHref;

			// 2) common data-* attributes
			const cand = getDataAttr(img, ['full', 'fullsrc', 'original', 'src', 'large_image', 'fullsrcset', 'data-src', 'data-original', 'data-full', 'data-large', 'data-full-url']);
			if (cand && looksLikeImageURL(cand)) return cand;

			// 3) browser-chosen srcset candidate
			if (img.currentSrc && looksLikeImageURL(img.currentSrc)) return img.currentSrc;

			// 4) parse srcset manually
			const srcset = img.getAttribute && img.getAttribute('srcset');
			const fromSrcset = pickFromSrcset(srcset);
			if (fromSrcset && looksLikeImageURL(fromSrcset)) {
				try {
					return new URL(fromSrcset, location.href).href;
				} catch (e) {
					return fromSrcset;
				}
			}

			// 5) fallback to src
			if (img.src) return img.src;

			// last resort: anchor href or empty string
			return aHref || img.src || "";
		};

		/* ---------------- Collect & Process Images ---------------- */

		// Filter out non-images (QR codes, inline data URIs)
		const imgs = [...d.images].filter(e => {
			const s = (e.src || "").toLowerCase(),
				alt = (e.alt || "").toLowerCase();
			return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
		});

		// Create badge element for each image
		const createBadge = (img, index) => {
			const badge = d.createElement("div");
			badge.textContent = index;
			Object.assign(badge.style, {
				position: "absolute",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#FFA500",
				color: "#000",
				fontWeight: "700",
				fontSize: "14px",
				border: "2px solid #000",
				width: badgeSize + "px",
				height: badgeSize + "px",
				lineHeight: badgeSize + "px",
				userSelect: "none",
				borderRadius: "4px",
				boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
				zIndex: 2147483648
			});
			d.body.appendChild(badge);
			badges.push({ img, box: badge });
		};

		// Build metadata items for each image
		for (const img of imgs) {
			const name = (img.src.split("/").pop().split("?")[0]) || "";
			if (!name) continue;
			img.id = `imgData_${n}`;
			const caption = (img.closest("figure")?.querySelector(".caption")?.innerText || "").trim();
			const guessedFull = getBestFullURL(img);
			items.push({
				name,
				anchorId: img.id,
				url: img.src,
				caption,
				alt: img.alt || "None",
				rendered: `${img.width}×${img.height}`,         // displayed size
				thumbDim: `${img.naturalWidth}×${img.naturalHeight}`, // intrinsic size
				thumbWidth: img.naturalWidth,
				thumbHeight: img.naturalHeight,
				fullURL: guessedFull,
				fullDim: "Fetching...", // will be updated later
				fullWidth: null,
				fullHeight: null,
				size: "Fetching..."
			});
			createBadge(img, n);
			n++;
		}

		/* ---------------- Badge Positioning ---------------- */

		const updateBadgePositions = () => {
			const placed = [];
			for (const b of badges) {
				try {
					const r = b.img.getBoundingClientRect();
					// place near top-left of image, constrained within page
					let x = Math.max(margin, Math.min(d.documentElement.scrollWidth - badgeSize - margin, Math.round(r.left + window.scrollX - 8)));
					let y = Math.max(margin, Math.min(d.documentElement.scrollHeight - badgeSize - margin, Math.round(r.top + window.scrollY - 8)));

					// avoid overlapping other badges (push down if needed)
					for (const p of placed) {
						if (Math.abs(p.x - x) < badgeSize + 8 && !((y + badgeSize + vGap < p.y) || y > p.y + p.bh + vGap)) {
							y = p.y + p.bh + vGap;
							y = Math.min(y, d.documentElement.scrollHeight - badgeSize - margin);
						}
					}

					// apply position
					Object.assign(b.box.style, {
						left: x + "px",
						top: y + "px",
						display: window._imgData.badgesVisible ? "flex" : "none"
					});
					placed.push({ x, y, bw: badgeSize, bh: badgeSize });
				} catch (e) {}
			}
		};
		updateBadgePositions();
		setTimeout(updateBadgePositions, 80);
		window._imgData.scrollHandler = updateBadgePositions;
		window._imgData.resizeHandler = updateBadgePositions;
		addEventListener("scroll", window._imgData.scrollHandler);
		addEventListener("resize", window._imgData.resizeHandler);
		window._imgData.interval = setInterval(updateBadgePositions, 300);

		/* ---------------- Overlay UI ---------------- */

		const o = d.createElement("div");
		o.id = "img-data-overlay";
		window._imgData.overlay = o;
		Object.assign(o.style, {
			position: "fixed",
			top: "10px",
			right: "0",
			width: "520px",
			height: "240px",
			maxHeight: "95vh",
			display: "flex",
			flexDirection: "column",
			background: "#f8f9fa",
			font: "12px Arial, sans-serif",
			zIndex: 2147483647,
			border: "1px solid #ccc",
			borderRadius: "10px",
			boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
			overflow: "hidden"
		});

		// header/footer heights
		const headerH = 56,
			footerH = 14;

		// Make draggable bars (header and footer)
		const mkbar = pos => { /* ... unchanged ... */ };

		// Main content container for image metadata
		const txt = d.createElement("div");
		Object.assign(txt.style, {
			padding: "10px",
			overflow: "auto",
			flex: "1",
			background: "#fff",
			textAlign: "left",
			color: "#333"
		});

		// Auto-resize overlay height
		const autosize = () => {
			o.style.height = Math.max(140, Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9 * innerHeight))) + "px";
		};

		/* ---------------- Metadata Update Renderer ---------------- */

		const update = () => { /* ... unchanged rendering logic ... */ };

		o.append(mkbar("top"), txt, mkbar("bottom"));
		d.body.appendChild(o);
		update();

		/* ---------------- Sequential Full-Size Loading ---------------- */

		function loadFullSizeSequentially(index = 0) {
			if (index >= items.length) return;
			const it = items[index];
			const fullImg = new Image();

			fullImg.onload = () => {
				it.fullWidth = fullImg.naturalWidth;
				it.fullHeight = fullImg.naturalHeight;
				it.fullDim = `${it.fullWidth}×${it.fullHeight}`;
				update();
				loadFullSizeSequentially(index + 1); // process next
			};
			fullImg.onerror = () => {
				it.fullDim = "Unavailable";
				update();
				loadFullSizeSequentially(index + 1);
			};
			fullImg.src = it.fullURL;

			// Fetch file size via HEAD, fallback to blob if needed
			fetch(it.fullURL, { method: "HEAD" })
				.then(r => {
					const cl = r.headers.get("content-length");
					it.size = cl ? formatSize(parseInt(cl, 10)) : "Unknown";
					update();
				})
				.catch(() => {
					fetch(it.fullURL).then(r => r.blob()).then(b => {
						it.size = formatSize(b.size);
						update();
					}).catch(() => {
						it.size = "Unavailable";
						update();
					});
				});
		}
		loadFullSizeSequentially();

		/* ---------------- Preload Images (dimensions + size) ---------------- */
		items.forEach(it => { /* ... unchanged preload logic ... */ });

		setTimeout(updateBadgePositions, 150);

		/* ---------------- Dragging Logic ---------------- */
		let drag = null;
		const startDrag = e => { /* ... unchanged ... */ };
		const onDrag = e => { /* ... unchanged ... */ };
		const endDrag = () => { drag = null; };

		d.addEventListener("pointermove", onDrag);
		d.addEventListener("pointerup", endDrag);
		d.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = startDrag);

	} catch (e) {
		console.error(e);
	}
})();
