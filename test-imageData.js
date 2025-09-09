(() => {
	try {
		const LSK = "imgDataOverlay_v1";

		if (window._imgData?.cleanup) window._imgData.cleanup();

		const d = document;
		const badges = [];
		const items = [];
		let n = 1,
			badgeSize = 26,
			vGap = 6,
			margin = 6;

		window._imgData = {
			badges,
			badgesVisible: true,
			cleanup() {
				try {
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

		// --- Create a floating numbered badge for each image ---
		function createBadge(img, num) {
			const box = d.createElement("div");
			Object.assign(box.style, {
				position: "absolute",
				left: "0px",
				top: "0px",
				display: window._imgData.badgesVisible ? "flex" : "none",
				width: badgeSize + "px",
				height: badgeSize + "px",
				alignItems: "center",
				justifyContent: "center",
				background: "#FFA500",
				color: "#000",
				fontWeight: "700",
				fontSize: "14px",
				border: "2px solid #000",
				borderRadius: "4px",
				boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
				cursor: "pointer",
				userSelect: "none",
				zIndex: 2147483647
			});
			box.textContent = num;
			box.title = "Scroll to image #" + num;
			box.setAttribute("data-img-badge", "1");

			// click -> scroll image into view
			box.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				try { img.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (err) {}
			});

			d.body.appendChild(box);
			const badge = { img, box };
			badges.push(badge);
			return badge;
		}

		// --- Gather images (prefer native/original URLs) ---
		function pickLargestFromSrcset(srcset) {
			try {
				const parts = srcset.split(',');
				let best = parts[0].trim();
				let bestNum = -1;
				for (const p of parts) {
					const seg = p.trim().split(/\s+/);
					const url = seg[0];
					const desc = seg[1] || '';
					let num = -1;
					if (desc.endsWith('w')) num = parseInt(desc.replace('w','')) || -1;
					else if (desc.endsWith('x')) num = Math.round((parseFloat(desc.replace('x',''))||1) * 1000);
					if (num > bestNum) { bestNum = num; best = url; }
				}
				return new URL(best, location.href).href;
			} catch {
				return srcset.split(',').slice(-1)[0].trim().split(/\s+/)[0];
			}
		}

		function getNativeUrl(img) {
			// dataset-based lazy loaders
			const datasetCandidates = ['src','original','originalSrc','lazySrc','dataSrc','dataSrcset','data_original'];
			for (const k of datasetCandidates) {
				const val = img.dataset?.[k] || img.getAttribute?.(k);
				if (val) {
					if (val.includes(',')) return pickLargestFromSrcset(val);
					return val;
				}
			}
			// srcset
			if (img.srcset) return pickLargestFromSrcset(img.srcset);
			// currentSrc
			if (img.currentSrc) return img.currentSrc;
			// CDN wrappers (Next.js etc.)
			try {
				const u = new URL(img.src, location.href);
				if (u.pathname.includes('/_next/image')) {
					const q = u.searchParams.get('url');
					if (q) return decodeURIComponent(q);
				}
				for (const paramName of ['url','src','u','image']) {
					const p = u.searchParams.get(paramName);
					if (p && (p.startsWith('http') || p.startsWith('//'))) return decodeURIComponent(p);
				}
			} catch {}
			// strip query
			const noQuery = (img.src || '').split('?')[0].split('#')[0];
			return noQuery || img.src;
		}

		const imgs = [...d.images].filter(e => {
			const s = (e.src || "").toLowerCase();
			const alt = (e.alt || "").toLowerCase();
			return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
		});
		

		// Load original image to get real dimensions
function fetchOriginalDimensions(url, callback) {
    const img = new Image();
    img.onload = () => callback({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => callback({ width: 0, height: 0 });
    img.src = url;
}
		

		for (const img of imgs) {
			const native = getNativeUrl(img) || img.src;
			let name;
			try {
				const nm = new URL(native, location.href).pathname.split('/').pop();
				name = nm || (img.src.split("/").pop().split("?")[0]);
			} catch {
				name = (img.src || "").split("/").pop().split("?")[0];
			}
			if (!name) continue;

			img.id = `imgData_${n}`;
			const caption = (img.closest("figure")?.querySelector(".caption")?.innerText || "").trim();

			items.push({
				name,
				dim: `${img.naturalWidth}×${img.naturalHeight} actual, ${img.width}×${img.height} rendered`,
				size: "Fetching...",
				alt: img.alt || "None",
				caption,
				url: native,        // <-- use native/original URL
				anchorId: img.id
			});
			createBadge(img, n);
			n++;
		}

		const updateBadgePositions = () => {
			const placed = [];
			for (const b of badges) {
				try {
					const r = b.img.getBoundingClientRect();
					// if image not in layout or has zero rect, hide badge
					if (!r || (r.width === 0 && r.height === 0)) {
						b.box.style.display = "none";
						continue;
					}
					// Use window.scrollX/Y explicitly
					const sx = window.scrollX || 0;
					const sy = window.scrollY || 0;
					let x = Math.max(margin, Math.min(d.documentElement.scrollWidth - badgeSize - margin, Math.round(r.left + sx - 8)));
					let y = Math.max(margin, Math.min(d.documentElement.scrollHeight - badgeSize - margin, Math.round(r.top + sy - 8)));
					for (const p of placed) {
						if (Math.abs(p.x - x) < badgeSize + 8 && !((y + badgeSize + vGap < p.y) || y > p.y + p.bh + vGap)) {
							y = p.y + p.bh + vGap;
							y = Math.min(y, d.documentElement.scrollHeight - badgeSize - margin);
						}
					}
					Object.assign(b.box.style, {
						left: x + "px",
						top: y + "px",
						display: window._imgData.badgesVisible ? "flex" : "none"
					});
					placed.push({
						x,
						y,
						bw: badgeSize,
						bh: badgeSize
					});
				} catch (err) {
					// ignore per-badge errors
				}
			}
		};

		updateBadgePositions();
		setTimeout(updateBadgePositions, 80);

		window._imgData.scrollHandler = updateBadgePositions;
		window._imgData.resizeHandler = updateBadgePositions;
		addEventListener("scroll", window._imgData.scrollHandler);
		addEventListener("resize", window._imgData.resizeHandler);
		window._imgData.interval = setInterval(updateBadgePositions, 300);

		// Overlay
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
			overflow: "hidden",
			left: "auto"
		});

		const headerH = 56,
			footerH = 14;

		// Top/Bottom bars
		const mkbar = pos => {
			const b = d.createElement("div");
			Object.assign(b.style, {
				height: pos === "top" ? headerH + "px" : footerH + "px",
				display: "flex",
				alignItems: "center",
				justifyContent: pos === "top" ? "space-between" : "flex-end",
				padding: pos === "top" ? "6px 10px" : "2px 8px",
				background: "#34495e",
				color: "#fff",
				fontWeight: 700,
				cursor: "grab",
				userSelect: "none"
			});

			if (pos === "top") {
				const title = d.createElement("h1");
				title.textContent = "Image Data";
				Object.assign(title.style, {
					margin: 0,
					color: "#fff",
					fontSize: "16px",
					textAlign: "left"
				});
				b.appendChild(title);

				const btns = d.createElement("div");
				btns.style.display = "flex";
				btns.style.alignItems = "center";
				btns.style.gap = "8px";

				const toggleGroup = d.createElement("div");
				const toggleHeight = badgeSize + 6;
				Object.assign(toggleGroup.style, {
					display: "flex",
					alignItems: "center",
					background: "#5D6D7E",
					color: "#fff",
					borderRadius: "6px",
					padding: "2px 6px",
					cursor: "pointer",
					userSelect: "none",
					height: toggleHeight + "px",
					boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
					transition: "background 0.2s ease, transform 0.2s ease"
				});

				const label = d.createElement("span");
				label.textContent = "Toggle Badges";
				Object.assign(label.style, {
					fontSize: "12px",
					marginRight: "6px"
				});
				toggleGroup.appendChild(label);

				const toggleBtn = d.createElement("button");
				toggleBtn.textContent = "🔢";
				toggleBtn.title = "Toggle Number Badges";
				Object.assign(toggleBtn.style, {
					border: "none",
					background: "transparent",
					fontSize: "14px",
					cursor: "pointer",
					color: "#fff"
				});
				toggleGroup.appendChild(toggleBtn);

				toggleGroup.onclick = e => {
					e.stopPropagation();
					window._imgData.badgesVisible = !window._imgData.badgesVisible;
					badges.forEach(bb => bb.box.style.display = window._imgData.badgesVisible ? "flex" : "none");
				};

				toggleGroup.addEventListener("mouseenter", () => {
					toggleGroup.style.background = "#4A5A6A";
					toggleGroup.style.transform = "scale(1.05)";
				});
				toggleGroup.addEventListener("mouseleave", () => {
					toggleGroup.style.background = "#5D6D7E";
					toggleGroup.style.transform = "scale(1)";
				});

				btns.appendChild(toggleGroup);

				const x = d.createElement("div");
				x.textContent = "×";
				Object.assign(x.style, {
					cursor: "pointer",
					fontSize: "14px",
					padding: "0",
					margin: "0 0 0 12px",
					borderRadius: "50%",
					width: "20px",
					height: "20px",
					background: "#e74c3c",
					color: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
				});
				x.title = "Close";
				x.setAttribute("data-drag-ignore", "1");
				x.onclick = e => {
					e.stopPropagation();
					o.remove();
					window._imgData.cleanup();
				};
				btns.appendChild(x);

				b.appendChild(btns);
			}

			b.setAttribute("data-drag-handle", "1");
			return b;
		};

		const txt = d.createElement("div");
		Object.assign(txt.style, {
			padding: "10px",
			overflow: "auto",
			flex: "1",
			background: "#fff",
			position: "relative",
			textAlign: "left",
			color: "#333333"
		});

		const scrollTopBtn = d.createElement("div");
		scrollTopBtn.textContent = "↑";
		Object.assign(scrollTopBtn.style, {
			position: "absolute",
			bottom: "10px",
			right: "10px",
			width: "30px",
			height: "30px",
			background: "#FFA500",
			color: "#000",
			display: "none",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: "50%",
			cursor: "pointer",
			fontSize: "16px",
			fontWeight: "bold",
			boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
			zIndex: "10",
			transition: "all 0.2s ease",
			userSelect: "none",
			pointerEvents: "auto"
		});

		scrollTopBtn.addEventListener("mouseenter", () => {
			scrollTopBtn.style.background = "#e67e22";
			scrollTopBtn.style.transform = "scale(1.1)";
		});
		scrollTopBtn.addEventListener("mouseleave", () => {
			scrollTopBtn.style.background = "#FFA500";
			scrollTopBtn.style.transform = "scale(1)";
		});
		scrollTopBtn.addEventListener("click", () => {
			txt.scrollTo({ top: 0, behavior: "smooth" });
		});

		o.appendChild(scrollTopBtn);

		txt.addEventListener("scroll", () => {
			if (txt.scrollTop > 20) {
				scrollTopBtn.style.display = "flex";
			} else {
				scrollTopBtn.style.display = "none";
			}
		});
		const checkScroll = () => {
			if (txt.scrollTop > 20) scrollTopBtn.style.display = "flex";
			else scrollTopBtn.style.display = "none";
		};
		txt.addEventListener("scroll", checkScroll);
		setTimeout(checkScroll, 100);

		const autosize = () => {
			const h = Math.max(140, Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9 * innerHeight)));
			o.style.height = h + "px";
		};

		const update = () => {
			[...txt.querySelectorAll(".img-entry, .img-separator")].forEach(el => el.remove());

			if (!items.length) {
				const noImagesText = d.createElement("div");
				noImagesText.textContent = "No images found.";
				txt.appendChild(noImagesText);
				return;
			}

			items.forEach((it, i) => {
				const entry = d.createElement("div");
				entry.className = "img-entry";
				entry.style.display = "flex";
				entry.style.alignItems = "flex-start";
				entry.style.padding = "4px 0";

				const badgeDiv = d.createElement("div");
				badgeDiv.style.flex = `0 0 ${badgeSize}px`;
				badgeDiv.style.display = "flex";
				badgeDiv.style.alignItems = "center";
				badgeDiv.style.justifyContent = "center";
				badgeDiv.style.paddingRight = "10px";

				const link = d.createElement("a");
				link.href = `#${it.anchorId}`;
				link.textContent = i + 1;
				Object.assign(link.style, {
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
					textAlign: "center",
					userSelect: "none",
					textDecoration: "underline",
					borderRadius: "4px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
					cursor: "pointer"
				});
				link.addEventListener("click", e => {
					e.preventDefault();
					const el = d.getElementById(it.anchorId);
					if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
				});

				badgeDiv.appendChild(link);
				entry.appendChild(badgeDiv);

				const infoDiv = d.createElement("div");
				infoDiv.style.flex = "1";
				infoDiv.style.textAlign = "left";
				infoDiv.innerHTML = `
    <div><strong>Name:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${it.name}</a></div>
    <div><strong>Dimensions:</strong> ${it.dim}</div>
    <div><strong>Size:</strong> ${it.size}</div>
    <div><strong>Alt:</strong> ${it.alt}</div>
    ${it.caption ? `<div><strong>Caption:</strong> ${it.caption}</div>` : ""}
`;
				entry.appendChild(infoDiv);

				txt.appendChild(entry);

				if (i < items.length - 1) {
					const hr = d.createElement("hr");
					hr.className = "img-separator";
					Object.assign(hr.style, {
						margin: "4px 0",
						border: "none",
						borderTop: "1px solid #ccc"
					});
					txt.appendChild(hr);
				}
			});

			autosize();
		};

		update();
		o.append(mkbar("top"), txt, mkbar("bottom"));
		d.body.appendChild(o);

// --- Fetch actual server dimensions and file size ---
items.forEach(it => {
    // Fetch true server dimensions first
    fetchOriginalDimensions(it.url, dims => {
        // Update the 'dim' field with actual dimensions
        it.dim = `${dims.width}×${dims.height} actual, ${it.width}×${it.height} rendered`;

        // Then fetch file size
        fetch(it.url, { method: "HEAD" })
            .then(r => {
                const cl = r.headers.get("content-length");
                it.size = cl ? (+cl / 1024).toFixed(1) + " KB" : "Unknown";
                update(); // refresh overlay after both are ready
            })
            .catch(() => {
                it.size = "Unknown";
                update();
            });
    });
});



		setTimeout(() => {
			updateBadgePositions();
			autosize();
		}, 150);

		// Drag logic
		let drag = null;
		const startDrag = (e) => {
			if (e.target.closest("[data-drag-ignore]")) return;
			const r = o.getBoundingClientRect();
			drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
			e.preventDefault();
		};
		const onDrag = (e) => {
			if (!drag) return;
			o.style.left = (e.clientX - drag.dx) + "px";
			o.style.top = (e.clientY - drag.dy) + "px";
			o.style.right = "auto";
		};
		const endDrag = () => { drag = null; };
		d.addEventListener("pointermove", onDrag);
		d.addEventListener("pointerup", endDrag);
		d.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = startDrag);

		// Resizers
		["n","s","e","w","ne","nw","se","sw"].forEach(dir => {
			const h = d.createElement("div");
			Object.assign(h.style, {
				position: "absolute",
				width: "8px",
				height: "8px",
				background: "#09f",
				opacity: "0.85",
				zIndex: "2147483648",
				borderRadius: "2px",
				cursor: dir + "-resize",
				transition: "box-shadow 0.15s, transform 0.15s"
			});
			if (dir.includes("n")) h.style.top = "0";
			if (dir.includes("s")) h.style.bottom = "0";
			if (dir.includes("e")) h.style.right = "0";
			if (dir.includes("w")) h.style.left = "0";
			if (["n","s"].includes(dir)) {
				h.style.left = "50%";
				h.style.marginLeft = "-4px";
			}
			if (["e","w"].includes(dir)) {
				h.style.top = "50%";
				h.style.marginTop = "-4px";
			}

			h.addEventListener("mouseenter", () => {
				h.style.boxShadow = "0 0 8px 2px rgba(0,150,255,0.9)";
				h.style.transform = "scale(1.2)";
			});
			h.addEventListener("mouseleave", () => {
				h.style.boxShadow = "none";
				h.style.transform = "scale(1)";
			});

			h.addEventListener("pointerdown", e => {
				e.preventDefault();
				e.stopPropagation();
				let startX = e.clientX, startY = e.clientY;
				const r = o.getBoundingClientRect();
				let startW = r.width, startH = r.height, startL = r.left, startT = r.top;
				const minW = 200, minH = 140;

				const onMove = me => {
					let dx = me.clientX - startX, dy = me.clientY - startY;
					let newTop = startT, newLeft = startL, newWidth = startW, newHeight = startH;

					if (dir.includes("e")) {
						newWidth = Math.min(window.innerWidth - startL, Math.max(minW, startW + dx));
					}
					if (dir.includes("w")) {
						newLeft = Math.max(0, startL + dx);
						newWidth = Math.max(minW, (startL + startW) - newLeft);
					}
					if (dir.includes("s")) {
						let bottom = Math.min(window.innerHeight, me.clientY);
						newHeight = Math.max(minH, bottom - startT);
					}
					if (dir.includes("n")) {
						let bottom = startT + startH;
						newTop = Math.max(0, me.clientY);
						newHeight = Math.max(minH, bottom - newTop);
					}

					o.style.width = newWidth + "px";
					o.style.height = newHeight + "px";
					o.style.left = newLeft + "px";
					o.style.top = newTop + "px";
					o.style.right = "auto";
				};

				const onUp = () => {
					d.removeEventListener("pointermove", onMove);
					d.removeEventListener("pointerup", onUp);
				};
				d.addEventListener("pointermove", onMove);
				d.addEventListener("pointerup", onUp);
			});

			o.appendChild(h);
		});

	} catch (e) {
		console.error(e);
	}
})();
