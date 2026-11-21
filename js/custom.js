/*---------------------------------------------------------------------
    File Name: custom.js
---------------------------------------------------------------------*/

document.addEventListener('DOMContentLoaded', function () {
	"use strict";

	/* Preloader */
	setTimeout(function () {
		var loaderBg = document.querySelector('.loader_bg');
		if (loaderBg) {
			loaderBg.style.transition = 'opacity 0.4s ease';
			loaderBg.style.opacity = '0';
			setTimeout(function () {
				loaderBg.style.display = 'none';
			}, 400);
		}
	}, 450);

	/* Feature Of Application:
	   - Laptop & Tablet (>= 768px): scroll-driven switch from points 1-5 to 6-10 in the same section
	   - Mobile (< 768px): single point auto-sliding right-to-left every 1s (1 -> 10 loop) */
	(function initFeatureSection() {
		var track = document.getElementById('featureScrollTrack');
		var pagesWrap = document.getElementById('desktopFeaturePages');
		var controlsBar = document.getElementById('featurePageControls');
		var mobileTrack = document.getElementById('mobileFeatureTrack');
		var mobileDots = document.getElementById('mobileFeatureDots');

		if (!track || !pagesWrap) return;

		var page1 = pagesWrap.querySelector('.feature-page-1');
		var page2 = pagesWrap.querySelector('.feature-page-2');
		var pageBtns = controlsBar ? controlsBar.querySelectorAll('.feature-page-btn') : [];
		var activePage = 1;

		function setDesktopPage(pageNum) {
			if (activePage === pageNum) return;
			activePage = pageNum;
			pagesWrap.setAttribute('data-active-page', String(pageNum));
			if (page1) page1.classList.toggle('is-active', pageNum === 1);
			if (page2) page2.classList.toggle('is-active', pageNum === 2);
			for (var i = 0; i < pageBtns.length; i++) {
				var target = Number(pageBtns[i].getAttribute('data-target-page'));
				pageBtns[i].classList.toggle('is-active', target === pageNum);
			}
		}

		var manualOverride = false;

		function updateDesktopScrollPage() {
			if (window.innerWidth < 768) return;
			var rect = track.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) {
				manualOverride = false;
				return;
			}
			if (manualOverride) return;
			if (rect.top <= 120 && rect.bottom >= 260) {
				setDesktopPage(2);
			} else if (rect.top > 180) {
				setDesktopPage(1);
			}
		}

		for (var b = 0; b < pageBtns.length; b++) {
			pageBtns[b].addEventListener('click', function () {
				manualOverride = true;
				var targetPage = Number(this.getAttribute('data-target-page'));
				setDesktopPage(targetPage);
			});
		}

		window.addEventListener('scroll', updateDesktopScrollPage, { passive: true });
		window.addEventListener('resize', updateDesktopScrollPage);
		updateDesktopScrollPage();

		/* Mobile 1-second right-to-left single-point slider */
		if (mobileTrack && mobileDots) {
			var totalPoints = 10;
			var currentIndex = 0;
			var slideTimer = null;
			var isTransitioning = false;

			// Build 10 indicator dots
			mobileDots.innerHTML = '';
			var dotEls = [];
			for (var d = 0; d < totalPoints; d++) {
				(function (idx) {
					var btn = document.createElement('button');
					btn.type = 'button';
					btn.className = 'mobile-feature-dot' + (idx === 0 ? ' is-active' : '');
					btn.setAttribute('aria-label', 'Feature ' + (idx + 1));
					btn.addEventListener('click', function () {
						goToMobileSlide(idx);
						restartMobileTimer();
					});
					mobileDots.appendChild(btn);
					dotEls.push(btn);
				})(d);
			}

			function updateDots(activeIdx) {
				var normalized = activeIdx % totalPoints;
				for (var i = 0; i < dotEls.length; i++) {
					dotEls[i].classList.toggle('is-active', i === normalized);
				}
			}

			function goToMobileSlide(idx) {
				if (isTransitioning) return;
				currentIndex = idx;
				mobileTrack.style.transition = 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
				mobileTrack.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
				updateDots(currentIndex);

				if (currentIndex === totalPoints) {
					isTransitioning = true;
					setTimeout(function () {
						mobileTrack.style.transition = 'none';
						currentIndex = 0;
						mobileTrack.style.transform = 'translateX(0%)';
						// Force reflow before re-enabling transition
						void mobileTrack.offsetWidth;
						isTransitioning = false;
					}, 430);
				}
			}

			function startMobileTimer() {
				if (slideTimer) clearInterval(slideTimer);
				if (window.innerWidth >= 768) return;
				slideTimer = setInterval(function () {
					if (window.innerWidth >= 768) return;
					goToMobileSlide(currentIndex + 1);
				}, 1000);
			}

			function restartMobileTimer() {
				startMobileTimer();
			}

			window.addEventListener('resize', function () {
				if (window.innerWidth < 768 && !slideTimer) {
					startMobileTimer();
				} else if (window.innerWidth >= 768 && slideTimer) {
					clearInterval(slideTimer);
					slideTimer = null;
				}
			});

			/* Allow manual touch swipe left/right on mobile feature points */
			var featureViewport = mobileTrack.parentElement;
			if (featureViewport) {
				var fStartX = 0;
				var fStartY = 0;
				var fDeltaX = 0;
				var fDragging = false;
				var fHorizontal = false;

				featureViewport.addEventListener('touchstart', function (e) {
					if (window.innerWidth >= 768 || isTransitioning) return;
					fStartX = e.touches[0].clientX;
					fStartY = e.touches[0].clientY;
					fDeltaX = 0;
					fDragging = true;
					fHorizontal = false;
					if (slideTimer) clearInterval(slideTimer);
				}, { passive: true });

				featureViewport.addEventListener('touchmove', function (e) {
					if (!fDragging || window.innerWidth >= 768) return;
					var dx = e.touches[0].clientX - fStartX;
					var dy = e.touches[0].clientY - fStartY;
					if (!fHorizontal) {
						if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
							fHorizontal = true;
							mobileTrack.style.transition = 'none';
						} else if (Math.abs(dy) > 10) {
							fDragging = false;
							startMobileTimer();
							return;
						}
					}
					if (fHorizontal) {
						fDeltaX = dx;
						var basePercent = -(currentIndex * 100);
						mobileTrack.style.transform = 'translateX(calc(' + basePercent + '% + ' + fDeltaX + 'px))';
					}
				}, { passive: true });

				featureViewport.addEventListener('touchend', function () {
					if (!fDragging) return;
					fDragging = false;
					if (fHorizontal && Math.abs(fDeltaX) > 40) {
						if (fDeltaX < 0) {
							goToMobileSlide(currentIndex + 1);
						} else {
							var prevIdx = currentIndex === 0 ? totalPoints - 1 : currentIndex - 1;
							goToMobileSlide(prevIdx);
						}
					} else if (fHorizontal) {
						goToMobileSlide(currentIndex);
					}
					fHorizontal = false;
					startMobileTimer();
				});
			}

			startMobileTimer();
		}
	})();

	/* 3 Fanned Phone Screenshots: Click/tap any of the 3 screens (1, 2, 3) to bring it smoothly to the front */
	(function initFanCardFocus() {
		var fan = document.getElementById('featureScreensFan');
		if (!fan) return;
		var cards = fan.querySelectorAll('.screen-card');

		function bringCardToFront(targetCard) {
			for (var i = 0; i < cards.length; i++) {
				cards[i].classList.toggle('is-front', cards[i] === targetCard);
			}
		}

		for (var i = 0; i < cards.length; i++) {
			(function (card) {
				card.addEventListener('click', function () {
					bringCardToFront(card);
				});
				card.addEventListener('keydown', function (e) {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						bringCardToFront(card);
					}
				});
			})(cards[i]);
		}
	})();

	/* Experience App & Features: Mobile right-to-left auto slider + smooth manual left/right swipe */
	(function initAmezingScreensSlider() {
		var track = document.getElementById('amezingScreensTrack');
		var dotsWrap = document.getElementById('amezingScreenDots');
		if (!track || !dotsWrap) return;

		var viewport = track.parentElement;
		var totalSlides = 5;
		var currentSlide = 0;
		var timer = null;
		var isWrapping = false;

		dotsWrap.innerHTML = '';
		var dotEls = [];
		for (var i = 0; i < totalSlides; i++) {
			(function (idx) {
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'amezing-screen-dot' + (idx === 0 ? ' is-active' : '');
				btn.setAttribute('aria-label', 'Screen ' + (idx + 1));
				btn.addEventListener('click', function () {
					goToSlide(idx);
					startTimer();
				});
				dotsWrap.appendChild(btn);
				dotEls.push(btn);
			})(i);
		}

		function updateDots(idx) {
			var norm = ((idx % totalSlides) + totalSlides) % totalSlides;
			for (var k = 0; k < dotEls.length; k++) {
				dotEls[k].classList.toggle('is-active', k === norm);
			}
		}

		function goToSlide(idx) {
			if (isWrapping || window.innerWidth >= 768) return;
			currentSlide = idx;
			track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
			track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
			updateDots(currentSlide);

			if (currentSlide === totalSlides) {
				isWrapping = true;
				setTimeout(function () {
					track.style.transition = 'none';
					currentSlide = 0;
					track.style.transform = 'translateX(0%)';
					void track.offsetWidth;
					isWrapping = false;
				}, 460);
			}
		}

		function goPrevSlide() {
			if (isWrapping || window.innerWidth >= 768) return;
			if (currentSlide === 0) {
				isWrapping = true;
				track.style.transition = 'none';
				currentSlide = totalSlides;
				track.style.transform = 'translateX(-' + (totalSlides * 100) + '%)';
				void track.offsetWidth;
				requestAnimationFrame(function () {
					track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
					currentSlide = totalSlides - 1;
					track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
					updateDots(currentSlide);
					setTimeout(function () {
						isWrapping = false;
					}, 460);
				});
			} else {
				goToSlide(currentSlide - 1);
			}
		}

		function startTimer() {
			if (timer) clearInterval(timer);
			if (window.innerWidth >= 768) return;
			timer = setInterval(function () {
				if (window.innerWidth >= 768) return;
				goToSlide(currentSlide + 1);
			}, 1800);
		}

		/* Smooth Touch & Mouse Drag Left/Right Support */
		if (viewport) {
			var startX = 0;
			var startY = 0;
			var deltaX = 0;
			var isDragging = false;
			var isHorizontal = false;

			function onDragStart(clientX, clientY) {
				if (window.innerWidth >= 768 || isWrapping) return;
				startX = clientX;
				startY = clientY;
				deltaX = 0;
				isDragging = true;
				isHorizontal = false;
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
			}

			function onDragMove(clientX, clientY) {
				if (!isDragging || window.innerWidth >= 768) return;
				var dx = clientX - startX;
				var dy = clientY - startY;
				if (!isHorizontal) {
					if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
						isHorizontal = true;
						track.style.transition = 'none';
					} else if (Math.abs(dy) > 10) {
						isDragging = false;
						startTimer();
						return;
					}
				}
				if (isHorizontal) {
					deltaX = dx;
					var basePct = -(currentSlide * 100);
					track.style.transform = 'translateX(calc(' + basePct + '% + ' + deltaX + 'px))';
				}
			}

			function onDragEnd() {
				if (!isDragging) return;
				isDragging = false;
				if (isHorizontal) {
					if (deltaX < -40) {
						goToSlide(currentSlide + 1);
					} else if (deltaX > 40) {
						goPrevSlide();
					} else {
						goToSlide(currentSlide);
					}
				}
				isHorizontal = false;
				startTimer();
			}

			viewport.addEventListener('touchstart', function (e) {
				onDragStart(e.touches[0].clientX, e.touches[0].clientY);
			}, { passive: true });
			viewport.addEventListener('touchmove', function (e) {
				onDragMove(e.touches[0].clientX, e.touches[0].clientY);
			}, { passive: true });
			viewport.addEventListener('touchend', onDragEnd);
			viewport.addEventListener('touchcancel', onDragEnd);

			viewport.addEventListener('mousedown', function (e) {
				onDragStart(e.clientX, e.clientY);
			});
			window.addEventListener('mousemove', function (e) {
				if (isDragging) onDragMove(e.clientX, e.clientY);
			});
			window.addEventListener('mouseup', function () {
				if (isDragging) onDragEnd();
			});
		}

		function handleResize() {
			if (window.innerWidth >= 768) {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
				track.style.transition = '';
				track.style.transform = '';
				currentSlide = 0;
				updateDots(0);
			} else if (!timer) {
				startTimer();
			}
		}

		window.addEventListener('resize', handleResize);
		startTimer();
	})();

	/* Scroll Progress Bar, Active Nav Highlight & Back-to-Top Button */
	(function initScrollEffects() {
		var progressBar = document.getElementById('scrollProgressBar');
		var backToTopBtn = document.getElementById('backToTopBtn');
		var navLinks = document.querySelectorAll('.header-nav a[href^="#"], .mobile-subnav a[href^="#"]');
		var sections = [
			{ id: 'feature', el: document.getElementById('feature') },
			{ id: 'about', el: document.getElementById('about') },
			{ id: 'contact', el: document.getElementById('contact') }
		];

		function updateOnScroll() {
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var docHeight = document.documentElement.scrollHeight - window.innerHeight;
			var progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

			if (progressBar) {
				progressBar.style.width = progress + '%';
			}

			if (backToTopBtn) {
				backToTopBtn.classList.toggle('is-visible', scrollTop > 320);
			}

			var activeId = '';
			var offsetMark = scrollTop + 160;
			for (var i = 0; i < sections.length; i++) {
				var sec = sections[i];
				if (sec.el) {
					var top = sec.el.offsetTop;
					var height = sec.el.offsetHeight;
					if (offsetMark >= top && offsetMark < top + height) {
						activeId = sec.id;
					}
				}
			}

			for (var j = 0; j < navLinks.length; j++) {
				var href = navLinks[j].getAttribute('href');
				navLinks[j].classList.toggle('is-active', activeId !== '' && href === '#' + activeId);
			}
		}

		window.addEventListener('scroll', updateOnScroll, { passive: true });
		window.addEventListener('resize', updateOnScroll);
		updateOnScroll();

		if (backToTopBtn) {
			backToTopBtn.addEventListener('click', function () {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});
		}

		/* Smooth Scroll Reveal */
		var revealEls = document.querySelectorAll('.reveal-on-scroll');
		if (revealEls.length) {
			if ('IntersectionObserver' in window) {
				var observer = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-revealed');
							observer.unobserve(entry.target);
						}
					});
				}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

				revealEls.forEach(function (el) {
					observer.observe(el);
				});
			} else {
				revealEls.forEach(function (el) {
					el.classList.add('is-revealed');
				});
			}
		}
	})();
});