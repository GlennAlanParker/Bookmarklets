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
			const datasetCandidates = ['src','original','originalSrc','lazySrc','dataSrc','dataSrcset','data_original'];
			for (const k of datasetCandidates) {
				const val = img.dataset?.[k] || img.getAttribute?.(k);
				if (val) {
					if (val.includes(',')) return pickLargestFromSrcset(val);
					return val;
				}
			}
			if (img.srcset) return pickLargestFromSrcset(img.srcset);
			if (img.currentSrc) return img.currentSrc;
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
			const noQuery = (img.src || '').split('?')[0].split('#')[0];
			return noQuery || img.src;
		}

		const imgs = [...d.images].filter(e => {
			const s = (e.src || "").toLowerCase();
			const alt = (e.alt || "").toLowerCase();
			return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
		});

		async function getServerImageDimensions(url) {
			try {
				const resp = await fetch(url);
				if (!resp.ok) throw new Error('Failed to fetch');
				const blob = await resp.blob();
				return await new Promise(resolve => {
					const img = new Image();
					img.onload = () => {
						resolve({ width: img.naturalWidth, height: img.naturalHeight });
						URL.revokeObjectURL(img.src);
					};
					img.onerror = () => resolve({ width: 0, height: 0 });
					img.src = URL.createObjectURL(blob);
				});
			} catch (e) {
				console.error("Error fetching image dimensions:", e);
				return { width: 0, height: 0 };
			}
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
				url: native,
				anchorId: img.id,
				renderedWidth: img.width,
				renderedHeight: img.height
			});
			createBadge(img, n);
			n++;
		}

		const updateBadgePositions = () => {
			const placed = [];
			for (const b of badges) {
				try {
					const r = b.img.getBoundingClientRect();
					if (!r || (r.width === 0 && r.height === 0)) {
						b.box.style.display = "none";
						continue;
					}
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
					placed.push({ x, y, bw: badgeSize, bh: badgeSize });
				} catch {}
			}
		};

		updateBadgePositions();
		setTimeout(updateBadgePositions, 80);

		window._imgData.scrollHandler = updateBadgePositions;
		window._imgData.resizeHandler = updateBadgePositions;
		addEventListener("scroll", window._imgData.scrollHandler);
		addEventListener("resize", window._imgData.resizeHandler);
		window._imgData.interval = setInterval(updateBadgePositions, 300);

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

		const headerH = 56, footerH = 14;

		const mkbar = pos => {
			const bar = d.createElement("div");
			bar.style.height = pos==="top"?headerH+"px":footerH+"px";
			bar.style.flex = "0 0 auto";
			bar.style.background = "#e9ecef";
			bar.style.display = "flex";
			bar.style.alignItems = "center";
			bar.style.justifyContent = "space-between";
			bar.style.padding = "0 8px";
			bar.style.fontWeight = "bold";
			bar.textContent = pos==="top"?"Image Data Overlay":"";
			return bar;
		};

		const txt = d.createElement("div");
		txt.style.flex = "1";
		txt.style.overflow = "auto";
		txt.style.padding = "4px 8px";
		txt.style.fontSize = "12px";
		txt.style.lineHeight = "1.4";

		const autosize = () => {
			if (!o) return;
			let total = 0;
			[...txt.children].forEach(el => { total += el.offsetHeight; });
			o.style.height = Math.min(window.innerHeight*0.9, headerH+footerH+total+24)+"px";
		};

		const update = () => {
			[...txt.querySelectorAll(".img-entry, .img-separator")].forEach(el => el.remove());
			if (!items.length) {
				const noImagesText = d.createElement("div");
				noImagesText.textContent = "No images found.";
				txt.appendChild(noImagesText);
				return;
			}
			items.forEach((it,i)=>{
				const entry = d.createElement("div");
				entry.className="img-entry";
				entry.style.marginBottom="4px";
				entry.innerHTML = `
<div><strong>#${i+1}</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.name}</a></div>
<div>Dimensions: ${it.dim}</div>
<div>Size: ${it.size}</div>
<div>Alt: ${it.alt}</div>
${it.caption?`<div>Caption: ${it.caption}</div>`:""}
				`;
				txt.appendChild(entry);
			});
			autosize();
		};

		o.append(mkbar("top"), txt, mkbar("bottom"));
		d.body.appendChild(o);
		update();

		// --- Optimized parallel fetch ---
		(async () => {
			await Promise.all(items.map(async it => {
				it.dim = "Fetching...";
				it.size = "Fetching...";
				update();

				const [dims,size] = await Promise.all([
					getServerImageDimensions(it.url),
					(async ()=>{
						try{
							const head = await fetch(it.url,{method:"HEAD"});
							const cl = head.headers.get("content-length");
							return cl?(+cl/1024).toFixed(1)+" KB":"Unknown";
						}catch{ return "Unknown"; }
					})()
				]);
				it.dim = `${dims.width}×${dims.height} actual, ${it.renderedWidth}×${it.renderedHeight} rendered`;
				it.size = size;
				update();
			}));
		})();

		setTimeout(()=>{ updateBadgePositions(); autosize(); }, 150);

	} catch(e){ console.error(e); }
})();
