"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  MessageCircle,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { AuthModal } from "@/components/auth-modal";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

/* ---------- scroll-film frames (extracted from pizzasbreakdown.mp4) ---------- */
// Stop at 205 before the "FINAL HERO SHOT" text banner
const FRAME_COUNT = 205;
const SRC_W = 1280;
const SRC_H = 720;
const frameUrl = (i: number) => `/frames/f${String(i + 1).padStart(3, "0")}.webp`;

/* ---------- design tokens ---------- */
const GRAD = "bg-gradient-to-b from-white via-[#FFF4E5] to-[#F5A623] bg-clip-text text-transparent";
const GLASS = "border border-white/10 bg-[#1A1412]/85 shadow-xl shadow-black/40";
const EYEBROW = "text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#F5A623]";

const NAV = [
  { label: "Home", id: "home" },
  { label: "Signature Menu", id: "menu" },
  { label: "How Ordering Works", id: "journey" },
  { label: "Location", id: "contact" },
];

// The 6 Signature Albertoz Pizza Flavors with authentic imagery and flavor profiles
const PIZZAS = [
  {
    name: "Albertoz Hawaiian Delight",
    badge: "Sweet & Savory",
    tagline: "A classic favorite for every family.",
    desc: "Juicy pineapple, smoky ham, mozzarella cheese, and rich signature pizza sauce.",
    profile: "Sweet, cheesy, smoky, and tangy.",
    img: "/hawaiiandelight.jpg",
    accent: "from-amber-500/25 via-red-500/10 to-transparent",
  },
  {
    name: "Albertoz All-Meat Supreme",
    badge: "Meaty & Hearty",
    tagline: "For customers who love a fully loaded pizza.",
    desc: "Loaded with pepperoni, ham, sausage, ground beef, mozzarella, and signature sauce.",
    profile: "Savory, smoky, rich, and cheesy.",
    img: "/allmeatsupreme.jpg",
    accent: "from-red-600/30 via-amber-600/10 to-transparent",
  },
  {
    name: "Albertoz Creamy Garlic Chicken",
    badge: "Creamy & Rich",
    tagline: "A premium signature flavor with a modern twist.",
    desc: "Tender chicken, creamy garlic sauce, mushrooms, mozzarella, and a light sprinkle of herbs.",
    profile: "Creamy, garlicky, buttery, and savory.",
    img: "/creamygarlicchicken.jpg",
    accent: "from-yellow-500/25 via-stone-500/10 to-transparent",
  },
  {
    name: "Albertoz Spicy Overload",
    badge: "Spicy Kick",
    tagline: "Perfect for customers who want a little heat.",
    desc: "Spicy beef, pepperoni, red bell peppers, chili flakes, mozzarella, and a bold spicy pizza sauce.",
    profile: "Spicy, smoky, meaty, and cheesy.",
    img: "/spicyoverlaod.jpg",
    accent: "from-rose-600/30 via-orange-600/10 to-transparent",
  },
  {
    name: "Albertoz Bacon Cheese Pizza",
    badge: "Cheesy & Bold",
    tagline: "A unique flavor customers can associate with Albertoz.",
    desc: "Seasoned ground beef, crispy bacon, cheddar, mozzarella, onions, and a special tangy house sauce.",
    profile: "Smoky bacon, juicy beef, creamy cheese, and tangy sauce.",
    img: "/baconcheeseburger.jpg",
    accent: "from-orange-500/30 via-yellow-600/15 to-transparent",
  },
  {
    name: "Albertoz Sweet & Smoky Bacon",
    badge: "Sweet & Smoky",
    tagline: "A fun alternative to ordinary Hawaiian pizza.",
    desc: "Bacon, ham, pineapple, sweet corn, mozzarella, and a drizzle of barbecue sauce.",
    profile: "Sweet, smoky, salty, and creamy.",
    img: "/sweetandsmokybacon.jpg",
    accent: "from-amber-600/30 via-red-600/15 to-transparent",
  },
];

// 6-step ordering journey: structured as a connected dynamic process pipeline
const STEPS = [
  {
    step: "01",
    tag: "Interactive Menu",
    title: "Browse & Select Your Cravings",
    desc: "Explore fresh, handcrafted pizzas tailored to your appetite. Choose your favorite crust, customize portions, and add sides with zero fuss.",
    highlights: ["Live Real-Time Menu", "Portion & Crust Choice", "Instant Cart Summary"],
    img: "/1-browse-and-choose.png",
    alt: "Customer browsing pizza menu on smartphone",
  },
  {
    step: "02",
    tag: "Kitchen Prep",
    title: "Handmade Upon Every Order",
    desc: "No pre-made frozen crusts under heat lamps. Every dough is hand-stretched and freshly topped when you hit confirm.",
    highlights: ["Artisan Hand-Stretched Dough", "Herb-Swirled Tomato Sauce", "Generous 100% Mozzarella"],
    img: "/2-freshly-made.png",
    alt: "Handcrafted pizza preparation with fresh toppings",
  },
  {
    step: "03",
    tag: "Stone-Baked Hearth",
    title: "Baked to Golden Crisp Perfection",
    desc: "Fired in intense, even heat until the crust turns golden-brown with that satisfying crisp bite and gooey melted cheese.",
    highlights: ["High-Heat Stone Oven", "Golden Blistered Edges", "Rich Bubbling Cheese"],
    img: "/3-baked-to-perfection.png",
    alt: "Fresh pizza baking inside high-heat commercial oven",
  },
  {
    step: "04",
    tag: "Insulated Box",
    title: "Sealed Hot & Packed With Care",
    desc: "Straight out of the stone oven into insulated safety packaging to trap the aroma, crispness, and piping heat.",
    highlights: ["Thermal Steam-Vent Box", "Aroma & Crisp Preservation", "Tamper-Evident Seal"],
    img: "/4-packed-with-care.png",
    alt: "Hot fresh pizza safely packaged in branded delivery box",
  },
  {
    step: "05",
    tag: "Express Dispatch",
    title: "Fast Local Riders On The Move",
    desc: "Our dedicated delivery team navigates Koronadal streets swiftly, keeping transit times tight and orders upright.",
    highlights: ["Local Koronadal Express", "Insulated Delivery Carrier", "Careful Smooth Handling"],
    img: "/5-on-the-way.png",
    alt: "Albertoz delivery rider on motorcycle on the way to delivery",
  },
  {
    step: "06",
    tag: "Doorstep Arrival",
    title: "Steaming Fresh At Your Table",
    desc: "Delivered straight to your hands with all the cheese pulls intact. Your comfort food feast begins the second you open the box.",
    highlights: ["Piping Hot Delivery", "Irresistible Cheese Pull", "Ready To Share & Enjoy"],
    img: "/6-delivered-to-you.png",
    alt: "Happy customer receiving piping hot pizza at their door",
  },
];

const STATS = [
  {
    target: 299,
    prefix: "₱",
    suffix: "",
    title: "Pizzas Starting At",
    desc: "Premium stone-baked pizza crafted without gourmet markup prices.",
    icon: Flame,
  },
  {
    target: 6,
    prefix: "",
    suffix: "",
    title: "Steps From Tap to Doorstep",
    desc: "A seamless live-tracked delivery flow engineered for speed.",
    icon: Clock,
  },
  {
    target: 100,
    prefix: "",
    suffix: "%",
    title: "Freshly Made to Order",
    desc: "Zero frozen shortcuts. Hand-stretched upon order confirmation.",
    icon: ShieldCheck,
  },
];

// Scroll chapters aligned with the pizza build canvas
const CHAPTERS = [
  {
    eyebrow: "Albertoz Pizza · Koronadal",
    title: ["Pizza Reimagined.", "Delivered Sizzling."],
    body: "Freshly hand-stretched dough, stone-baked and sped straight to your doorstep across Koronadal City.",
  },
  {
    eyebrow: "Phase 01 · Handcrafted Foundation",
    title: ["Signature Dough.", "Rich Tomato Sauce."],
    body: "Every single pie starts fresh. Artisan dough hand-stretched and swirled with herb-infused sauce.",
  },
  {
    eyebrow: "Phase 02 · The Cheese Blanket",
    title: ["100% Mozzarella.", "Bubbling & Melted."],
    body: "Loaded with genuine stretchy cheese that bakes into that iconic golden blistered pull.",
  },
  {
    eyebrow: "Phase 03 · Savory Toppings",
    title: ["Generously Loaded.", "Never Skimped."],
    body: "Crisp savory meats, fresh peppers, and pineapple slices layered thick for deep flavor in every bite.",
  },
  {
    eyebrow: "Phase 04 · Ready For You",
    title: ["Baked Perfection.", "Straight To You."],
    body: "Hot out of the oven and packed for Koronadal City. Tap below to satisfy your pizza cravings.",
  },
];

const SHOWCASE_WORDS = ["Cheese,", "pulled", "to", "perfection."];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Preload frame sequence
  useEffect(() => {
    let loaded = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const im = new window.Image();
      im.decoding = "async";
      const onDone = () => {
        loaded++;
        setProgress(loaded / FRAME_COUNT);
        if (loaded >= FRAME_COUNT) finish();
      };
      im.onload = onDone;
      im.onerror = onDone;
      im.src = frameUrl(i);
      imgs.push(im);
    }
    imgsRef.current = imgs;
    const fallback = window.setTimeout(finish, 12000);
    return () => window.clearTimeout(fallback);
  }, []);

  // Re-measure every trigger once all images/fonts have loaded (they change page height)
  useEffect(() => {
    if (!ready) return;
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      const t = window.setTimeout(refresh, 300);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, [ready]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    gsap.to(window, {
      scrollTo: id === "home" ? 0 : `#${id}`,
      duration: 1.2,
      ease: "power3.inOut",
    });
  };

  // Opening: curtain parts while the hero cross-dissolves in underneath (no pop)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!ready) return;
        const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, delay: 0.2 });

        tl.to(".curtain-ui", { scale: 1.05, opacity: 0, duration: 0.45, ease: "power2.in" }, 0)
          // hero starts fading in behind the closed curtain, so it's already glowing when it opens
          .fromTo(
            ".hero-stage-fade",
            { opacity: 0, scale: 1.04 },
            { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" },
            0.4
          )
          .to(".curtain-l", { xPercent: -105, duration: 1.5 }, 0.5)
          .to(".curtain-r", { xPercent: 105, duration: 1.5 }, 0.5)
          .to(".curtain-valance", { yPercent: -100, duration: 0.7 }, 1.1)
          // fade the curtain layer out instead of cutting it with display:none
          .to(".curtain", { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.7)
          .set(".curtain", { display: "none" })
          .fromTo(
            ".chapter-0 .ch-line",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" },
            1.9
          )
          .fromTo(
            ".chapter-0 .ch-rest",
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" },
            2.1
          )
          .fromTo(
            ".nav-item",
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out" },
            2.1
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".curtain", { display: "none" });
        gsap.set(".hero-stage-fade", { opacity: 1 });
      });
    },
    { scope: root, dependencies: [ready] }
  );

  // General scroll timelines
  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Menu cards staggered intro
        gsap.from(".menu-head > *", {
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".menu-head", start: "top 80%" },
        });
        // Bottom order button
        gsap.from(".menu-cta > *", {
          y: 30,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".menu-cta", start: "top 92%" },
        });

        // Signature flavors: one by one. Photo wipes open, zooms out, name rises from a mask, details cascade.
        gsap.utils.toArray<HTMLElement>(".flavor-row").forEach((row, i) => {
          const flipped = i % 2 === 1;
          const q = gsap.utils.selector(row);

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: row, start: "top 78%", toggleActions: "play none none none" },
          });

          tl.fromTo(
            q(".flavor-frame"),
            { clipPath: flipped ? "inset(0% 0% 0% 100% round 2.2rem)" : "inset(0% 100% 0% 0% round 2.2rem)" },
            { clipPath: "inset(0% 0% 0% 0% round 2.2rem)", duration: 1.1, ease: "power4.inOut" },
            0
          )
            .fromTo(q(".flavor-img"), { scale: 1.4 }, { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
            .fromTo(q(".flavor-glow"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.2)
            .fromTo(
              q(".flavor-badge"),
              { opacity: 0, scale: 0.6, y: -10 },
              { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(2)" },
              0.8
            )
            .fromTo(q(".flavor-name"), { yPercent: 110 }, { yPercent: 0, duration: 0.9 }, 0.3)
            .fromTo(q(".flavor-bit"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.7 }, 0.5);

          // gentle float while it passes through the viewport
          gsap.fromTo(
            q(".flavor-visual"),
            { yPercent: 4 },
            {
              yPercent: -4,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });

        // 6-step pipeline: each step animates in on scroll (image + content slide from opposite sides)
        const desktop = window.matchMedia("(min-width: 1024px)").matches;
        const dx = desktop ? 90 : 0;
        const dy = desktop ? 0 : 50;

        gsap.utils.toArray<HTMLElement>(".journey-step-card").forEach((card, idx) => {
          const flipped = idx % 2 === 1; // image sits on the right when flipped
          const visual = card.querySelector(".journey-visual");
          const content = card.querySelector(".journey-content");
          const ring = card.querySelector(".journey-ring");
          const hl = card.querySelectorAll(".journey-hl");
          const imgEl = card.querySelector(".journey-img-inner");

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          tl.fromTo(
            visual,
            { opacity: 0, x: flipped ? dx : -dx, y: dy, scale: 0.92 },
            { opacity: 1, x: 0, y: 0, scale: 1, duration: 1 },
            0
          )
            .fromTo(
              content,
              { opacity: 0, x: flipped ? -dx : dx, y: dy },
              { opacity: 1, x: 0, y: 0, duration: 1 },
              0.15
            )
            .fromTo(
              ring,
              { opacity: 0, scale: 0 },
              { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" },
              0.3
            )
            .fromTo(
              hl,
              { opacity: 0, x: -18 },
              { opacity: 1, x: 0, stagger: 0.1, duration: 0.5 },
              0.6
            );

          // Parallax: stays zoomed in so the edges never show
          if (imgEl) {
            gsap.fromTo(
              imgEl,
              { scale: 1.18, yPercent: -6 },
              {
                scale: 1.18,
                yPercent: 6,
                ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
              }
            );
          }
        });

        // Animate the vertical pipeline track glowing line
        gsap.fromTo(
          ".journey-line-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".journey-track",
              start: "top 70%",
              end: "bottom 80%",
              scrub: 1,
            },
          }
        );

        // Product showcase expansion
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".showcase",
              start: "top top",
              end: "+=180%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              refreshPriority: 1,
            },
          })
          .fromTo(
            ".showcase-card",
            { scale: 0.6, borderRadius: "3.5rem" },
            { scale: 1, borderRadius: "0rem", duration: 1.2, ease: "power2.out" },
            0
          )
          .fromTo(".showcase-img", { scale: 1.35 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0)
          .fromTo(".showcase-dim", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.6)
          .fromTo(".sc-eyebrow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.9)
          .fromTo(".sw", { opacity: 0.15, y: 24 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.5 }, 1.0)
          .fromTo(".sc-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.9)
          .to({}, { duration: 0.6 });

        // Stats section animation
        gsap.from(".stat-card", {
          y: 60,
          opacity: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".stats", start: "top 75%" },
        });
        gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
          const target = Number(el.dataset.target ?? 0);
          const o = { v: 0 };
          gsap.to(o, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            snap: { v: 1 },
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => {
              el.textContent = String(o.v);
            },
          });
        });

        // Moments reveal
        gsap.fromTo(
          ".moments-card",
          { scale: 0.92 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: ".moments", start: "top 90%", end: "top 15%", scrub: true },
          }
        );
        gsap.fromTo(
          ".moments-img",
          { yPercent: -10, scale: 1.3 },
          {
            yPercent: 10,
            scale: 1.3,
            ease: "none",
            scrollTrigger: { trigger: ".moments", start: "top bottom", end: "bottom top", scrub: true },
          }
        );
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: ".moments", start: "top 45%", toggleActions: "play none none none" },
          })
          .from(".moments-pill", { opacity: 0, y: 20, scale: 0.9, duration: 0.7 })
          .from(".mo-line", { yPercent: 110, stagger: 0.14, duration: 1 }, "-=0.3")
          .from(".moments-sub", { opacity: 0, y: 24, duration: 0.8 }, "-=0.5");

        // Section headers: eyebrow, title and intro rise in one after another
        gsap.utils.toArray<HTMLElement>(".sec-head").forEach((h) => {
          gsap.from(h.children, {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: h, start: "top 85%" },
          });
        });

        // Stat icons pop in with a little spin
        gsap.from(".stat-icon", {
          scale: 0,
          rotate: -25,
          stagger: 0.15,
          duration: 0.7,
          ease: "back.out(2)",
          scrollTrigger: { trigger: ".stats", start: "top 75%" },
        });

        // Contact cards
        gsap.from(".contact-card", {
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".contact", start: "top 80%" },
        });

        // CTA banner
        gsap.from(".cta-inner", {
          scale: 0.93,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".cta", start: "top 85%" },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".menu-head > *, .sec-head > *, .stat-icon, .moments-pill, .moments-sub, .flavor-bit, .flavor-badge, .flavor-glow, .menu-cta > *, .stat-card, .contact-card, .cta-inner, .journey-visual, .journey-content, .journey-ring, .journey-hl",
          { opacity: 1, x: 0, y: 0, scale: 1 }
        );
        gsap.set(".flavor-frame", { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(".flavor-name, .mo-line", { yPercent: 0 });
      });
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  // Canvas hero scroll film timeline
  useGSAP(
    () => {
      if (!ready) return;
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d", { alpha: false });
      if (!ctx) return;

      const state = { f: 0 };
      let lastIdx = -1;

      // Dynamic offscreen patch for frame watermark
      let patchCanvas: HTMLCanvasElement | null = null;
      let patchPattern: CanvasPattern | null = null;
      let lastPatchSrc: HTMLImageElement | null = null;

      const getPatch = (img: HTMLImageElement) => {
        if (patchCanvas && patchPattern && lastPatchSrc === img) return { patchCanvas, patchPattern };
        if (!patchCanvas) {
          patchCanvas = document.createElement("canvas");
          patchCanvas.width = 120;
          patchCanvas.height = 120;
        }
        const pctx = patchCanvas.getContext("2d");
        if (!pctx) return null;
        pctx.drawImage(img, 1020, 560, 120, 120, 0, 0, 120, 120);
        patchPattern = ctx.createPattern(patchCanvas, "repeat");
        lastPatchSrc = img;
        return { patchCanvas, patchPattern };
      };

      const render = (force = false) => {
        const idx = Math.min(Math.max(Math.round(state.f), 0), FRAME_COUNT - 1);
        if (idx === lastIdx && force !== true) return;
        const img = imgsRef.current[idx];
        if (!img || !img.complete) return;

        const cw = cvs.width;
        const ch = cvs.height;
        if (cw === 0 || ch === 0) return;

        const scale = Math.max(cw / SRC_W, ch / SRC_H);
        const dw = SRC_W * scale;
        const dh = SRC_H * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.drawImage(img, dx, dy, dw, dh);
        lastIdx = idx;

        // Soft feather patch over lower right watermark
        const patch = getPatch(img);
        if (patch && patch.patchPattern) {
          const wmX = dx + 1156 * scale;
          const wmY = dy + 600 * scale;
          const wmR = 64 * scale;

          ctx.save();
          ctx.beginPath();
          ctx.arc(wmX, wmY, wmR, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = patch.patchPattern;
          ctx.fill();

          const grad = ctx.createRadialGradient(wmX, wmY, wmR * 0.4, wmX, wmY, wmR);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(16,13,11,0.9)");
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        }
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const rect = cvs.getBoundingClientRect();
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (cvs.width !== w || cvs.height !== h) {
          cvs.width = w;
          cvs.height = h;
          render(true);
        }
      };

      resize();
      window.addEventListener("resize", resize);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = gsap.utils.toArray<HTMLElement>(".film-dot");
        const ACTIVE = "#F5A623";
        const IDLE = "rgba(255,244,229,0.35)";

        gsap.set(dots, { backgroundColor: IDLE, scale: 1 });
        if (dots[0]) gsap.set(dots[0], { backgroundColor: ACTIVE, scale: 1.4 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".film",
            start: "top top",
            end: "+=480%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            refreshPriority: 2,
            onUpdate: () => render(),
          },
        });

        tl.to(state, { f: FRAME_COUNT - 1, duration: 10, ease: "none" }, 0);
        tl.fromTo(".film-progress", { scaleX: 0 }, { scaleX: 1, duration: 10, ease: "none" }, 0);
        tl.fromTo(".film-fade", { opacity: 0 }, { opacity: 0.6, duration: 2, ease: "power2.in" }, 8);

        const chDur = 1.8;
        CHAPTERS.forEach((_, i) => {
          if (i === 0) {
            tl.to(".chapter-0 .ch-line", { y: -40, opacity: 0, stagger: 0.05, duration: 0.5, ease: "power2.in" }, 1.3);
            tl.to(".chapter-0 .ch-rest", { y: -20, opacity: 0, duration: 0.4 }, 1.3);
            tl.to(dots[0], { scale: 1, backgroundColor: IDLE, duration: 0.2 }, 1.3);
          } else {
            const start = i * chDur + 0.3;
            tl.set(`.chapter-${i}`, { autoAlpha: 1 }, start);
            tl.fromTo(
              dots[i],
              { scale: 1, backgroundColor: IDLE },
              { scale: 1.4, backgroundColor: ACTIVE, duration: 0.2 },
              start
            );
            tl.fromTo(
              `.chapter-${i} .ch-line`,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" },
              start
            );
            tl.fromTo(
              `.chapter-${i} .ch-rest`,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power3.out" },
              start + 0.1
            );
            tl.to(
              `.chapter-${i} .ch-line`,
              { y: -40, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.in" },
              start + 1.4
            );
            tl.to(`.chapter-${i} .ch-rest`, { y: -20, opacity: 0, duration: 0.3 }, start + 1.4);
            tl.set(`.chapter-${i}`, { autoAlpha: 0 }, start + 1.8);
            tl.to(dots[i], { scale: 1, backgroundColor: IDLE, duration: 0.2 }, start + 1.8);
          }
        });

      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        state.f = 120;
        render(true);
        gsap.set(".chapter", { autoAlpha: 0 });
        gsap.set(".chapter-0", { autoAlpha: 1 });
      });

      return () => window.removeEventListener("resize", resize);
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="relative isolate overflow-x-clip bg-[#100D0B] text-[#FFF4E5]">
      {/* AMBIENT BACKGROUND GLOW: unified warm luxury atmosphere */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="blob blob-a absolute -left-[20vw] -top-[25vh] h-[95vh] w-[95vh] rounded-full bg-[radial-gradient(closest-side,rgba(184,32,37,0.45),transparent)] will-change-transform" />
        <div className="blob blob-b absolute -right-[25vw] bottom-[-30vh] h-[100vh] w-[100vh] rounded-full bg-[radial-gradient(closest-side,rgba(245,166,35,0.25),transparent)] will-change-transform" />
        <div className="blob blob-c absolute left-[30vw] top-[30vh] h-[75vh] w-[75vh] rounded-full bg-[radial-gradient(closest-side,rgba(140,24,28,0.4),transparent)] will-change-transform" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#100D0B_100%)]" />
      </div>

      {/* OPENING CURTAIN */}
      <div className="curtain fixed inset-0 z-[100] overflow-hidden bg-[#0d0908]">
        <div
          className="curtain-panel curtain-l absolute inset-y-0 left-0 w-[50.5%] border-r-4 border-[#F5A623]/70"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 35%, transparent 65%, rgba(0,0,0,0.55)), repeating-linear-gradient(90deg,#5c0b0f 0px,#a31a20 22px,#6d0e13 44px,#4a080b 62px)",
          }}
        />
        <div
          className="curtain-panel curtain-r absolute inset-y-0 right-0 w-[50.5%] border-l-4 border-[#F5A623]/70"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 35%, transparent 65%, rgba(0,0,0,0.55)), repeating-linear-gradient(90deg,#4a080b 0px,#6d0e13 18px,#a31a20 40px,#5c0b0f 62px)",
          }}
        />
        <div className="curtain-valance absolute inset-x-0 top-0 z-10 h-10 border-b-4 border-[#F5A623] bg-gradient-to-b from-[#3a0609] to-[#7a1216] shadow-xl shadow-black/60" />

        <div className="curtain-ui absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
          <div className="rounded-2xl bg-[#FFD400] p-3 shadow-2xl shadow-black/60 ring-4 ring-[#F5A623]/60">
            <Image src="/albertozlogo.png" alt="Albertoz Pizza" width={275} height={125} priority className="h-24 w-auto md:h-32" />
          </div>
          <div className="w-56">
            <div className="h-1 w-full overflow-hidden rounded bg-white/20">
              <div
                className="h-full bg-[#F5A623] transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#FFF4E5]/70">
              Preheating the oven
            </p>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#100D0B]/92">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-12">
          <a href="#home" onClick={(e) => go(e, "home")} className="nav-item flex items-center gap-3">
            <Image src="/albertozlogo.png" alt="Albertoz Pizza" width={275} height={125} className="h-10 w-auto rounded-md shadow-md" />
            <span className="hidden rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#F5A623] sm:inline-block">
              Koronadal City
            </span>
          </a>

          <nav className="hidden gap-8 text-sm font-medium text-[#FFF4E5]/80 md:flex">
            {NAV.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
                className="nav-item relative py-1 transition hover:text-[#F5A623]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="nav-item rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-[#100D0B]"
            >
              Login
            </a>
            <a
              href="/signup"
              className="nav-item rounded-full bg-gradient-to-r from-[#B82025] to-[#D42B31] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#B82025]/30 transition hover:brightness-110"
            >
              Sign Up
            </a>
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="nav-item ml-1 flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span className={`h-0.5 w-5 bg-[#FFF4E5] transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-[#FFF4E5] transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-[#FFF4E5] transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-6 pb-4 pt-2 md:hidden bg-[#100D0B]/95">
            {NAV.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="py-2.5 font-medium text-[#FFF4E5]/90">
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* HERO SCROLL FILM: Canvas sequence with smooth cinematic fade-in */}
      <section id="home" className="film relative h-dvh w-full overflow-hidden bg-[#100D0B]">
        <div className="hero-stage-fade absolute inset-0 opacity-0 will-change-[opacity,transform]">
          <div className="film-frame absolute inset-0 will-change-transform">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#100D0B]/95 via-[#100D0B]/20 to-[#100D0B]/50" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#100D0B]/80 via-transparent to-transparent" />
          <div className="film-fade pointer-events-none absolute inset-0 bg-[#100D0B] opacity-0" />
        </div>

        <div className="absolute inset-0 mx-auto max-w-7xl">
          {CHAPTERS.map((c, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <div
                key={c.eyebrow}
                className={`chapter chapter-${i} absolute bottom-8 sm:bottom-12 md:bottom-14 lg:bottom-16 left-6 right-6 max-w-3xl md:left-12 ${
                  i > 0 ? "invisible opacity-0" : ""
                }`}
              >
                <div className="ch-rest mb-2.5 sm:mb-3.5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <span className={EYEBROW}>{c.eyebrow}</span>
                </div>
                <Heading className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
                  {c.title.map((t, k) => (
                    <span key={t} className="block overflow-hidden pb-1 sm:pb-2">
                      <span className={`ch-line block ${k === 1 ? "text-[#F5A623]" : ""}`}>{t}</span>
                    </span>
                  ))}
                </Heading>
                <p className="ch-rest mt-3 sm:mt-4 md:mt-5 max-w-lg text-sm sm:text-base md:text-lg text-[#FFF4E5]/80">
                  {c.body}
                </p>
                {(i === 0 || i === CHAPTERS.length - 1) && (
                  <div className="ch-rest mt-4 sm:mt-6 md:mt-7 flex flex-wrap gap-2.5 sm:gap-4">
                    <a
                      href="#menu"
                      onClick={(e) => go(e, "menu")}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B82025] to-[#D42B31] px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-xl shadow-[#B82025]/40 transition hover:scale-105 hover:brightness-110"
                    >
                      <span>Explore Signature Pizzas</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="#journey"
                      onClick={(e) => go(e, "journey")}
                      className="rounded-full border border-white/30 bg-white/5 px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold transition hover:bg-white hover:text-[#100D0B]"
                    >
                      How It Works
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-4 md:right-12">
          {CHAPTERS.map((c) => (
            <span key={c.eyebrow} className="film-dot block h-2 w-2 rounded-full bg-[#FFF4E5]/40" />
          ))}
        </div>

        <div className="scroll-hint absolute bottom-8 right-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#FFF4E5]/80 md:right-12">
          Scroll to explore <span className="animate-bounce">↓</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div className="film-progress h-full origin-left scale-x-0 bg-[#F5A623]" />
        </div>
      </section>

      {/* SIGNATURE FLAVORS: Prominently placed right after the Hero */}
      <section id="menu" className="menu relative z-10 px-6 py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="menu-head flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-10">
            <div>
              <span className={EYEBROW}>Handcrafted Fresh Daily in Koronadal</span>
              <h2 className={`mt-2 text-4xl font-black tracking-tight md:text-7xl ${GRAD}`}>
                Signature Flavors.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[#FFF4E5]/70 md:text-base">
                Authentic Albertoz recipes baked stone-oven hot. Loaded generously with premium meats, cheese, and signature sauces.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#journey"
                onClick={(e) => go(e, "journey")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623] hover:underline"
              >
                <span>See How We Make It</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Each flavor gets its own spotlight, revealed one by one as you scroll */}
          <div className="flavor-list mt-20 space-y-24 lg:space-y-36">
            {PIZZAS.map((p, i) => {
              const flipped = i % 2 === 1;
              return (
                <article key={p.name} className="flavor-row relative">
                  <div
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${flipped ? "lg:grid-flow-dense" : ""
                      }`}
                  >
                    {/* Photo */}
                    <div className={`flavor-visual relative will-change-transform ${flipped ? "lg:col-start-2" : ""}`}>
                      <div
                        className={`flavor-glow absolute -inset-6 rounded-[3rem] bg-gradient-to-br ${p.accent}`}
                      />
                      <div className="flavor-frame relative aspect-[16/11] w-full overflow-hidden rounded-[2.2rem] border border-white/15 bg-black/50 shadow-2xl shadow-black/70">
                        <Image
                          src={p.img}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 560px, 92vw"
                          className="flavor-img object-cover will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="flavor-badge absolute left-4 top-4 rounded-full border border-white/20 bg-black/70 px-3.5 py-1.5 text-xs font-semibold text-[#F5A623]">
                          {p.badge}
                        </span>
                      </div>
                    </div>

                    {/* Copy */}
                    <div className={`relative ${flipped ? "lg:col-start-1" : ""}`}>
                      <span className="flavor-bit font-mono text-xs font-bold tracking-widest text-[#F5A623]/80">
                        {String(i + 1).padStart(2, "0")} / {String(PIZZAS.length).padStart(2, "0")}
                      </span>
                      <h3 className="mt-3 text-3xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
                        <span className="block overflow-hidden pb-1.5">
                          <span className="flavor-name block">{p.name}</span>
                        </span>
                      </h3>
                      <p className="flavor-bit mt-3 text-sm font-semibold italic text-[#F5A623]/90 md:text-base">
                        {p.tagline}
                      </p>
                      <p className="flavor-bit mt-4 max-w-md text-sm leading-relaxed text-[#FFF4E5]/75 md:text-base">
                        {p.desc}
                      </p>
                      <div className="flavor-bit mt-6 w-fit max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#F5A623]">
                          Flavor Profile
                        </span>
                        <p className="mt-1 text-sm font-medium text-[#FFF4E5]/90">{p.profile}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* One clear call to action at the very bottom of the showcase */}
          <div className="menu-cta mt-16 flex flex-col items-center gap-4 text-center">
            <p className="max-w-md text-sm text-[#FFF4E5]/70 md:text-base">
              Found your flavor? Pick your size, crust, and add-ons when you order.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#B82025] to-[#D42B31] px-12 py-5 text-base font-bold text-white shadow-xl shadow-[#B82025]/40 transition hover:scale-105 hover:brightness-110"
            >
              <span>Order Now</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* HOW ORDERING WORKS: 6-STEP CONNECTED DYNAMIC PIPELINE (NOT A SLIDESHOW) */}
      <section id="journey" className="journey relative z-10 px-6 py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="sec-head mb-16 text-center">
            <span className={EYEBROW}>The Albertoz Experience</span>
            <h2 className={`mt-2 text-4xl font-black tracking-tight md:text-7xl ${GRAD}`}>
              How Ordering Works.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[#FFF4E5]/75 md:text-base leading-relaxed">
              From the moment you browse our signature menu to that first steaming cheese pull at your doorstep in Koronadal City—engineered for speed, precision, and mouthwatering freshness.
            </p>

            {/* Quick jump step pill bar */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {STEPS.map((s) => (
                <a
                  key={s.step}
                  href={`#step-${s.step}`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-[#FFF4E5]/80 transition hover:border-[#F5A623] hover:bg-[#F5A623]/10 hover:text-[#F5A623]"
                >
                  <span className="mr-1.5 font-bold text-[#F5A623]">{s.step}</span>
                  <span>{s.tag}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Interactive Connected Pipeline Track */}
          <div className="journey-track relative mt-8">
            {/* Center glowing SVG spine for large screens */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-12 left-1/2 top-12 hidden -translate-x-1/2 w-1 bg-white/10 lg:block"
            >
              <div className="journey-line-fill h-full w-full origin-top bg-gradient-to-b from-[#B82025] via-[#F5A623] to-[#B82025] shadow-[0_0_15px_rgba(245,166,35,0.6)]" />
            </div>

            {/* Step cards list */}
            <div className="space-y-16 lg:space-y-28">
              {STEPS.map((s, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <div
                    key={s.step}
                    id={`step-${s.step}`}
                    className="journey-step-card relative scroll-mt-28"
                  >
                    {/* Center junction milestone ring on desktop */}
                    <div className="journey-ring pointer-events-none absolute left-1/2 top-10 z-20 hidden -translate-x-1/2 lg:flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F5A623] bg-[#100D0B] shadow-xl shadow-black/80">
                      <span className="font-mono text-sm font-black text-[#F5A623]">{s.step}</span>
                    </div>

                    <div
                      className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${isEven ? "lg:grid-flow-dense" : ""
                        }`}
                    >
                      {/* Visual Card */}
                      <div className={`journey-visual relative group ${isEven ? "lg:col-start-2" : ""}`}>
                        <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-[#B82025]/30 to-[#F5A623]/30 opacity-60 blur-xl transition group-hover:opacity-100" />
                        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[2rem] border border-white/15 bg-black/60 shadow-2xl shadow-black/80">
                          <div className="journey-img-inner absolute inset-0 will-change-transform">
                            <Image
                              src={s.img}
                              alt={s.alt}
                              fill
                              sizes="(min-width: 1024px) 540px, 90vw"
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                          {/* Step watermark */}
                          <span className="absolute bottom-4 right-5 font-mono text-xs font-semibold uppercase tracking-widest text-white/50 px-2.5 py-1 rounded-md bg-black/40">
                            Albertoz Step {s.step}
                          </span>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div
                        className={`journey-content rounded-[2.2rem] p-8 md:p-10 ${GLASS} ${isEven ? "lg:col-start-1" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5A623]/15 font-mono text-xs font-bold text-[#F5A623] lg:hidden">
                            {s.step}
                          </span>
                          <span className="inline-block rounded-lg border border-[#F5A623]/25 bg-[#F5A623]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#F5A623]">
                            {s.tag}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-black text-white md:text-4xl">
                          {s.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-[#FFF4E5]/75 md:text-base">
                          {s.desc}
                        </p>

                        {/* Feature bullets */}
                        <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                          {s.highlights.map((h) => (
                            <div key={h} className="journey-hl flex items-center gap-2.5 text-xs text-[#FFF4E5]/90 font-medium">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#F5A623]" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between pt-2">
                          <a
                            href="/login"
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5A623] transition hover:translate-x-1 hover:underline"
                          >
                            <span>Experience in ordering app</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section className="showcase relative flex h-dvh items-center justify-center overflow-hidden">
        <div className="showcase-card relative h-full w-full overflow-hidden will-change-transform">
          <div className="showcase-img absolute inset-0 will-change-transform">
            <Image
              src="/cheese.jpg"
              alt="A slice of pizza lifted from the pie, trailing strings of melted cheese"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="showcase-dim absolute inset-0 bg-gradient-to-t from-[#100D0B] via-[#100D0B]/60 to-[#100D0B]/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className={`sc-eyebrow mb-6 ${EYEBROW}`}>Fresh From Our Kitchen</p>
            <h2 className="text-5xl font-black leading-[1.02] tracking-tight md:text-8xl">
              {SHOWCASE_WORDS.map((w) => (
                <span key={w} className="sw mr-[0.25em] inline-block">
                  {w}
                </span>
              ))}
            </h2>
            <p className="sc-sub mt-6 max-w-md text-base text-[#FFF4E5]/80 md:text-lg">
              Stone-baked high temperature seals every slice with that irresistible cheese pull.
            </p>
          </div>
        </div>
      </section>

      {/* STATS HIGHLIGHTS: Premium Glass Cards */}
      <section className="stats relative z-10 px-6 py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="sec-head mb-14 text-center">
            <span className={EYEBROW}>Why Koronadal Loves Albertoz</span>
            <h2 className={`mt-2 text-4xl font-black tracking-tight md:text-6xl ${GRAD}`}>
              Quality In Every Metric.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`stat-card group relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 transition duration-500 hover:-translate-y-2 hover:border-[#F5A623]/40 ${GLASS}`}
                >
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-[#B82025]/20 to-transparent blur-2xl group-hover:scale-150 transition duration-700" />

                  <div className="stat-icon mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#F5A623] shadow-inner">
                    <Icon className="h-7 w-7" />
                  </div>

                  <p className={`text-6xl font-black tracking-tight md:text-7xl ${GRAD}`}>
                    {s.prefix}
                    <span className="stat-num" data-target={s.target}>
                      {s.target}
                    </span>
                    {s.suffix}
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#FFF4E5]/65">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MOMENTS: Warm lifestyle banner */}
      <section className="moments relative h-dvh min-h-[560px] overflow-hidden">
        <div className="moments-card absolute inset-0 overflow-hidden will-change-transform">
          <div className="moments-img absolute inset-0 will-change-transform">
            <Image
              src="/moments.jpg"
              alt="Person enjoying pizza moments with family and friends"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#100D0B] via-[#100D0B]/60 to-[#100D0B]" />
        </div>
        <div className="moments-copy relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center md:px-12">
          <div className="moments-pill mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1">
            <HeartHandshake className="h-4 w-4 text-[#F5A623]" />
            <span className={EYEBROW}>Shared Moments</span>
          </div>
          <h2 className="text-4xl font-black leading-[1.05] tracking-tight md:text-7xl">
            <span className="block overflow-hidden pb-2">
              <span className="mo-line block">Every box brings</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="mo-line block text-[#F5A623]">Koronadal together.</span>
            </span>
          </h2>
          <p className="moments-sub mt-6 max-w-lg text-base text-[#FFF4E5]/80 md:text-lg">
            From late-night cravings to family celebrations, Albertoz brings hot, freshly-baked comfort right to your table.
          </p>
        </div>
      </section>

      {/* CONTACT / LOCATION IN KORONADAL CITY */}
      <section id="contact" className="contact relative z-10 px-6 py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="sec-head mb-14 text-center">
            <span className={EYEBROW}>Serving South Cotabato</span>
            <h2 className={`mt-2 text-4xl font-black tracking-tight md:text-6xl ${GRAD}`}>
              Visit Us in Koronadal City.
            </h2>
            <p className="mt-3 text-sm text-[#FFF4E5]/70 md:text-base">
              Drop by for hot take-out or order directly through our system for prompt doorstep delivery.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={`contact-card group relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 transition duration-500 hover:border-[#F5A623]/40 ${GLASS}`}>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[#F5A623]">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#F5A623]">Store Hub</span>
              <h3 className="mt-2 text-2xl font-black text-white">Koronadal City Branch</h3>
              <p className="mt-2 text-sm text-[#FFF4E5]/70 leading-relaxed">
                South Cotabato, Philippines · Hot stone-oven baking daily for walk-ins, pick-ups, and city-wide deliveries.
              </p>
              <div className="mt-6 flex items-center gap-3 text-xs text-[#FFF4E5]/50">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Open for orders daily: 10:00 AM – 9:00 PM</span>
              </div>
            </div>

            <div className={`contact-card group relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 transition duration-500 hover:border-[#F5A623]/40 ${GLASS}`}>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[#F5A623]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#F5A623]">Community & Updates</span>
              <h3 className="mt-2 text-2xl font-black text-white">Connect With Albertoz</h3>
              <p className="mt-2 text-sm text-[#FFF4E5]/70 leading-relaxed">
                Have questions or branch inquiries? Check promos and reach out via our official community channels:
              </p>
              <div className="mt-5 space-y-2">
                <a
                  href="https://www.facebook.com/albertospizza"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-[#F5A623]"
                >
                  <span>facebook.com/albertospizza</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="http://www.albertospizza.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-[#F5A623]"
                >
                  <span>albertospizza.ph (Official Portal)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta relative z-10 px-6 pb-28 md:px-12">
        <div className="cta-inner mx-auto max-w-6xl overflow-hidden rounded-[3rem] border border-white/15 bg-gradient-to-b from-[#1E1715] to-[#120E0D] shadow-2xl shadow-black/80">
          <Image
            src="/7-from-our-kitchen.png"
            alt="Albertoz Pizza: from our kitchen to your doorstep"
            width={1312}
            height={412}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="h-auto w-full border-b border-white/10"
          />
          <div className="px-8 py-16 text-center">
            <span className={EYEBROW}>Fresh From The Hearth</span>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">
              Cravings Won&apos;t Wait. Order Now.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-[#FFF4E5]/70 md:text-base">
              Register or login to track your pizza live as our kitchen bakes and your rider delivers across Koronadal City.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/signup"
                className="rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFBF43] px-10 py-4 font-bold text-[#100D0B] shadow-xl shadow-[#F5A623]/25 transition hover:scale-105"
              >
                Create Account
              </a>
              <a
                href="/login"
                className="rounded-full border border-white/30 bg-white/5 px-10 py-4 font-bold text-white transition hover:bg-white hover:text-[#100D0B]"
              >
                Sign In & Order
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 flex flex-col items-center gap-4 border-t border-white/10 bg-[#0C0A09] px-6 py-12 text-center text-sm text-[#FFF4E5]/50">
        <Image src="/albertozlogo.png" alt="Albertoz Pizza" width={275} height={125} className="h-10 w-auto rounded-md shadow-md" />
        <p className="text-xs text-[#FFF4E5]/40">
          © {new Date().getFullYear()} Albertoz Pizza · Koronadal City, South Cotabato. Built for fast local food ordering.
        </p>
      </footer>

      {/* Login & Customer Sign-Up Modal */}
      <AuthModal />
    </div>
  );
}