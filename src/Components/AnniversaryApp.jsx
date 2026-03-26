import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── FONTS (inject once) ────────────────────────────────────────────────── */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300;1,500&family=Nunito:wght@400;600;700;800&display=swap";

/* ─── PALETTE ────────────────────────────────────────────────────────────── */
const C = {
  cream:       "#FFF8EF",
  warm:        "#F5E6D3",
  rose:        "#C4687A",
  roseLight:   "#E8A0B0",
  burgundy:    "#7A2535",
  burgundyDk:  "#4E1520",
  gold:        "#D4A96A",
  dark:        "#2D1515",
  mid:         "#5A2E2E",
};

/* ─── SHARED: floating petals ────────────────────────────────────────────── */
function Petals({ n = 14 }) {
  const items = Array.from({ length: n }, (_, i) => ({
    id: i,
    x:    `${(i * 7.1 + 4) % 100}%`,
    size: 9 + (i * 5) % 13,
    delay: (i * 0.7) % 9,
    dur:  9 + (i * 1.3) % 7,
    ch:   ["♥","✦","·","✿","°"][i % 5],
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {items.map(p => (
        <motion.span
          key={p.id}
          style={{ position:"absolute", left:p.x, top:"-30px", fontSize:p.size, color:C.rose, opacity:0 }}
          animate={{ y:["0px","108vh"], opacity:[0,0.22,0.22,0] }}
          transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"linear" }}
        >{p.ch}</motion.span>
      ))}
    </div>
  );
}

/* ─── SHARED: button style ───────────────────────────────────────────────── */
const btn = (a, b, txt) => ({
  background:`linear-gradient(135deg,${a} 0%,${b} 100%)`,
  color: txt, border:"none", borderRadius:"50px",
  padding:"0.9rem 2.8rem", fontSize:"1rem",
  fontFamily:"'Nunito',sans-serif", fontWeight:800,
  cursor:"pointer", letterSpacing:"0.04em",
  boxShadow:"0 8px 28px rgba(122,37,53,0.28)",
});

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 0 — SPINNING NUMBER GAME
   ══════════════════════════════════════════════════════════════════════════ */
function SpinGame({ onWin }) {
  const [num,    setNum]    = useState(7);
  const [status, setStatus] = useState("idle"); // idle|spinning|win|lose
  const iRef  = useRef(null);
  const nRef  = useRef(7);

  const startSpin = () => {
    setStatus("spinning");
    iRef.current = setInterval(() => {
      const n = Math.floor(Math.random() * 9) + 1;
      nRef.current = n;
      setNum(n);
    }, 55);
  };

  const stopSpin = () => {
    clearInterval(iRef.current);
    const final = nRef.current;
    setNum(final);
    if (final === 1) {
      setStatus("win");
      setTimeout(onWin, 2100);
    } else {
      setStatus("lose");
    }
  };

  const reset = () => { setStatus("idle"); setNum(7); nRef.current = 7; };
  useEffect(() => () => clearInterval(iRef.current), []);

  return (
    <motion.div key="spin"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, y:-30 }}
      style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(150deg,${C.cream} 0%,${C.warm} 100%)`,
        padding:"2rem", position:"relative", overflow:"hidden",
      }}
    >
      <Petals n={12} />

      <motion.div
        initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ delay:0.3, duration:0.8 }}
        style={{ textAlign:"center", zIndex:1, maxWidth:"440px", width:"100%" }}
      >
        <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.rose,
          fontSize:"0.8rem", letterSpacing:"0.35em", textTransform:"uppercase", marginBottom:"0.8rem" }}>
          ✦ For My Sweetpea ✦
        </p>

        <h1 style={{ fontFamily:"'Playfair Display',serif", color:C.dark,
          fontSize:"clamp(1.7rem,5vw,2.6rem)", lineHeight:1.25, marginBottom:"1rem" }}>
          A little challenge<br />before I let you in…
        </h1>

        <p style={{ color:C.mid, fontSize:"0.95rem", lineHeight:1.75, marginBottom:"2rem",
          fontFamily:"'Nunito',sans-serif" }}>
          The number is spinning really fast.<br />
          <em style={{ color:C.burgundy, fontFamily:"'Cormorant Garamond',serif",
            fontSize:"1.1rem", fontStyle:"italic", fontWeight:500 }}>
            Stop it at the number of years we've been officially engaged 💍
          </em>
        </p>

        {/* Big number display */}
        <div style={{
          background:`linear-gradient(135deg,${C.burgundy} 0%,${C.burgundyDk} 100%)`,
          borderRadius:"20px", padding:"2rem 4rem",
          display:"inline-block", marginBottom:"2rem",
          boxShadow:"0 20px 60px rgba(122,37,53,0.4)",
          border:`1px solid rgba(212,169,106,0.3)`,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px",
            background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
          <AnimatePresence mode="popLayout">
            <motion.div key={num}
              initial={status==="spinning" ? { y:-40, opacity:0, scale:0.5 } : {}}
              animate={{ y:0, opacity:1, scale:1 }}
              exit={{ y:40, opacity:0 }}
              transition={{ duration:0.05 }}
              style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(5rem,15vw,7rem)",
                color:C.gold, lineHeight:1, fontWeight:700, userSelect:"none",
                textShadow:`0 0 40px rgba(212,169,106,0.45)` }}
            >{num}</motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div style={{ minHeight:"56px", display:"flex", justifyContent:"center", marginBottom:"0.5rem" }}>
          {status === "idle" && (
            <motion.button onClick={startSpin} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              initial={{ scale:0 }} animate={{ scale:1 }} style={btn(C.rose, C.burgundy, C.cream)}>
              Start Spinning! ✨
            </motion.button>
          )}
          {status === "spinning" && (
            <motion.button onClick={stopSpin}
              initial={{ scale:0 }} animate={{ scale:1 }}
              whileTap={{ scale:0.94 }}
              style={{ ...btn(C.gold,"#E8C060",C.dark),
                animation:"goldPulse 0.7s ease-in-out infinite" }}>
              STOP! 🛑
            </motion.button>
          )}
          {status === "lose" && (
            <motion.button onClick={reset} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              initial={{ scale:0 }} animate={{ scale:1 }} style={btn(C.rose, C.burgundy, C.cream)}>
              Try Again 🎲
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {status==="lose" && (
            <motion.p initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              style={{ color:C.rose, fontStyle:"italic", fontSize:"0.9rem",
                fontFamily:"'Cormorant Garamond',serif" }}>
              Hmm, that's not it Sweetpea 😋 Think harder…
            </motion.p>
          )}
          {status==="win" && (
            <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }}
              style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", color:C.burgundy,
                fontSize:"1.3rem", fontWeight:700 }}>
                That's right! 1 perfect year 💍✨
              </p>
              <p style={{ color:C.mid, fontSize:"0.85rem", marginTop:"0.3rem",
                fontFamily:"'Nunito',sans-serif" }}>Opening your surprise…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 1 — ENVELOPE + TYPED LETTER
   ══════════════════════════════════════════════════════════════════════════ */
const LETTER = `Hey Sweetpea,

Before I tell you where we're going tonight — I want you to remember something.

9 years ago, near railway tracks in Jogeshwari, I looked at you and something shifted. That moment? Only you and I know it. And I've held onto it ever since.

From Kolkata fights to Kolkata forever. From strangers to the person I want to grow old with.

And then — you said yes.

Still feels like a dream. Tonight, I want to celebrate the year we made it official. You deserve every bit of this.

Scroll on, love. ♥`;

function EnvelopeScene({ onNext }) {
  const [phase, setPhase] = useState("closed"); // closed|opening|letter
  const [typed, setTyped] = useState("");

  const openIt = () => {
    setPhase("opening");
    setTimeout(() => setPhase("letter"), 950);
  };

  useEffect(() => {
    if (phase !== "letter") return;
    let i = 0;
    const t = setInterval(() => {
      setTyped(LETTER.slice(0, i));
      i++;
      if (i > LETTER.length) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <motion.div key="envelope"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0,y:-20 }}
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(150deg,${C.cream} 0%,${C.warm} 100%)`,
        padding:"2rem", position:"relative", overflow:"hidden" }}
    >
      <Petals n={8} />

      <AnimatePresence mode="wait">

        {/* ── closed envelope ── */}
        {phase === "closed" && (
          <motion.div key="closed"
            initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0, scale:0.9 }}
            style={{ textAlign:"center", zIndex:1 }}
          >
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.rose,
              letterSpacing:"0.3em", fontSize:"0.8rem", textTransform:"uppercase", marginBottom:"2rem" }}>
              ✦ A note, just for you ✦
            </p>

            <motion.div onClick={openIt}
              whileHover={{ scale:1.04, y:-8 }} whileTap={{ scale:0.97 }}
              style={{ cursor:"pointer", display:"inline-block" }}
            >
              <svg width="280" height="192" viewBox="0 0 280 192">
                <rect x="8" y="60" width="264" height="124" rx="6"
                  fill={C.burgundy} stroke={C.gold} strokeWidth="0.8" strokeOpacity="0.4"/>
                <line x1="8" y1="184" x2="140" y2="120" stroke={C.gold} strokeWidth="0.8" opacity="0.25"/>
                <line x1="272" y1="184" x2="140" y2="120" stroke={C.gold} strokeWidth="0.8" opacity="0.25"/>
                <polygon points="8,60 272,60 140,130"
                  fill={C.rose} stroke={C.gold} strokeWidth="0.8" strokeOpacity="0.45"/>
                <circle cx="140" cy="102" r="17" fill={C.gold}/>
                <text x="140" y="108" textAnchor="middle" fontSize="15" fill={C.dark}>♥</text>
              </svg>
            </motion.div>

            <motion.p
              animate={{ y:[0,-6,0] }} transition={{ repeat:Infinity, duration:2.2 }}
              style={{ marginTop:"1.8rem", color:C.mid,
                fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", fontStyle:"italic" }}>
              Tap to open 💌
            </motion.p>
          </motion.div>
        )}

        {/* ── opening envelope ── */}
        {phase === "opening" && (
          <motion.div key="opening" style={{ zIndex:1 }}>
            <svg width="280" height="192" viewBox="0 0 280 192">
              <rect x="8" y="60" width="264" height="124" rx="6" fill={C.burgundy}/>
              <line x1="8" y1="184" x2="140" y2="120" stroke={C.gold} strokeWidth="0.8" opacity="0.25"/>
              <line x1="272" y1="184" x2="140" y2="120" stroke={C.gold} strokeWidth="0.8" opacity="0.25"/>
              <motion.polygon points="8,60 272,60 140,130" fill={C.rose}
                style={{ transformOrigin:"140px 60px" }}
                initial={{ rotateX:0 }} animate={{ rotateX:-170 }}
                transition={{ duration:0.75, ease:"easeInOut" }}
              />
              <circle cx="140" cy="102" r="17" fill={C.gold}/>
              <text x="140" y="108" textAnchor="middle" fontSize="15" fill={C.dark}>♥</text>
            </svg>
          </motion.div>
        )}

        {/* ── letter ── */}
        {phase === "letter" && (
          <motion.div key="letter"
            initial={{ opacity:0, scale:0.94, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
            style={{ zIndex:1, maxWidth:"500px", width:"100%" }}
          >
            <div style={{
              background:"#FFFEF9", borderRadius:"12px", padding:"2.5rem",
              boxShadow:"0 20px 60px rgba(122,37,53,0.18), 0 0 0 1px rgba(212,169,106,0.15)",
            }}>
              <div style={{ width:"60px", height:"1.5px", margin:"0 auto 1.5rem",
                background:`linear-gradient(90deg,transparent,${C.rose},transparent)` }} />

              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem",
                color:C.dark, lineHeight:1.95, whiteSpace:"pre-line", minHeight:"240px" }}>
                {typed}
                {typed.length < LETTER.length && (
                  <motion.span animate={{ opacity:[1,0] }}
                    transition={{ repeat:Infinity, duration:0.65 }}
                    style={{ color:C.rose }}>|</motion.span>
                )}
              </p>

              {typed.length >= LETTER.length && (
                <motion.button initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
                  onClick={onNext} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  style={{ ...btn(C.rose,C.burgundy,C.cream),
                    marginTop:"1.5rem", display:"block", marginLeft:"auto", marginRight:"auto" }}>
                  Take me there 🌸
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 2 — POLAROIDS
   ══════════════════════════════════════════════════════════════════════════ */
const MEMORIES = [
  {
    id:1, tag:"9 years ago 🚉",
    caption:"Near the railway tracks, Jogeshwari. You looked at me and something shifted. Our secret.",
    img:"/images/img-1.jpeg",
    rot:-4, bg:"#FFF3E0",
  },
  {
    id:2, tag:"Kolkata ✈️",
    caption:"From fighting about everything to choosing each other — every single day. Best plot twist of my life.",
    img:"/images/img-2.jpeg",
    rot:3, bg:"#FFF0F3",
  },
  {
    id:3, tag:"The big day 💍",
    caption:"Still feels like a dream. You said yes. The best decision I ever made — without a doubt.",
    img:"/images/img-3.jpeg",
    rot:-2, bg:"#F5F0FF",
  },
];

function PolaroidsScene({ onNext }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    MEMORIES.forEach((_, i) => setTimeout(() => setShown(i + 1), i * 560 + 300));
  }, []);

  return (
    <motion.div key="polaroids"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0,y:-20 }}
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(150deg,${C.warm} 0%,${C.cream} 100%)`,
        padding:"3rem 1.5rem", position:"relative", overflow:"hidden" }}
    >
      <Petals n={7} />

      <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ delay:0.2 }}
        style={{ textAlign:"center", marginBottom:"2.5rem", zIndex:1 }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.rose,
          letterSpacing:"0.25em", fontSize:"0.8rem", textTransform:"uppercase" }}>
          ✦ How we got here ✦
        </p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.dark,
          fontSize:"clamp(1.5rem,4vw,2.2rem)", marginTop:"0.5rem" }}>
          A few of my favourite memories
        </h2>
      </motion.div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:"1.5rem",
        justifyContent:"center", zIndex:1, maxWidth:"820px" }}>
        {MEMORIES.map((m, i) =>
          shown > i && (
            <motion.div key={m.id}
              initial={{ y:70, opacity:0, rotate:m.rot - 8 }}
              animate={{ y:0, opacity:1, rotate:m.rot }}
              whileHover={{ y:-12, rotate:0, scale:1.04, zIndex:10 }}
              transition={{ type:"spring", stiffness:175, damping:18 }}
              style={{ background:m.bg, padding:"1rem 1rem 1.8rem",
                boxShadow:"0 16px 45px rgba(0,0,0,0.14)", width:"280px",
                position:"relative", cursor:"default" }}
            >
              {/* tape */}
              <div style={{ position:"absolute", top:"-10px", left:"50%",
                transform:"translateX(-50%)", width:"52px", height:"18px",
                background:"rgba(212,169,106,0.35)", borderRadius:"2px" }} />
              {/* photo */}
              <img src={m.img} alt="" style={{ width:"100%", height:"450px",
                objectFit:"cover", display:"block",
                filter:"sepia(18%) contrast(96%) brightness(103%)" }} />
              {/* tag */}
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", color:C.rose,
                fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
                marginTop:"0.8rem", marginBottom:"0.3rem" }}>{m.tag}</p>
              {/* caption */}
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
                fontSize:"0.88rem", color:C.mid, lineHeight:1.6 }}>{m.caption}</p>
            </motion.div>
          )
        )}
      </div>

      {shown >= MEMORIES.length && (
        <motion.button initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          transition={{ delay:0.5 }} onClick={onNext}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
          style={{ ...btn(C.rose,C.burgundy,C.cream), marginTop:"2.5rem", zIndex:1, position:"relative" }}>
          But wait, there's more ✨
        </motion.button>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 3 — 365 DAYS (dark, dramatic)
   ══════════════════════════════════════════════════════════════════════════ */
function BigMomentScene({ onNext }) {
  return (
    <motion.div key="big"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(160deg,${C.burgundy} 0%,${C.burgundyDk} 55%,#160609 100%)`,
        padding:"2rem", textAlign:"center", position:"relative", overflow:"hidden" }}
    >
      {/* twinkling stars */}
      {Array.from({ length:28 }, (_,i) => (
        <motion.span key={i} style={{ position:"absolute",
          left:`${(i*3.8+2)%100}%`, top:`${(i*7.2+5)%90}%`,
          fontSize:`${4+(i%7)}px`, color:C.gold, opacity:0 }}
          animate={{ opacity:[0,0.9,0], scale:[0,1,0] }}
          transition={{ duration:1.5+(i%3), delay:i*0.23, repeat:Infinity, repeatDelay:1+(i%4) }}>
          ✦
        </motion.span>
      ))}

      <div style={{ position:"relative", zIndex:1, maxWidth:"520px" }}>
        <motion.p initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }}
          transition={{ delay:0.4 }}
          style={{ fontFamily:"'Cormorant Garamond',serif", color:C.gold,
            letterSpacing:"0.35em", fontSize:"0.8rem", textTransform:"uppercase", marginBottom:"1.5rem" }}>
          ✦ 1 Year ✦
        </motion.p>

        <motion.h1 initial={{ y:40,opacity:0 }} animate={{ y:0,opacity:1 }}
          transition={{ delay:0.65, type:"spring", stiffness:85 }}
          style={{ fontFamily:"'Playfair Display',serif", color:C.cream,
            fontSize:"clamp(3.5rem,12vw,8rem)", fontWeight:700, lineHeight:0.95, marginBottom:"1.2rem" }}>
          365<br />days.
        </motion.h1>

        <motion.p initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }}
          transition={{ delay:1.1 }}
          style={{ fontFamily:"'Cormorant Garamond',serif",
            color:"rgba(255,248,239,0.82)", fontSize:"clamp(1rem,2.8vw,1.35rem)",
            lineHeight:1.9, fontStyle:"italic" }}>
          365 days of choosing you.<br />
          365 mornings I'm glad we said yes.<br />
          Tonight —{" "}
          <span style={{ color:C.gold }}>tonight's just for us.</span>
        </motion.p>

        <motion.button initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:1 }}
          transition={{ delay:1.6, type:"spring" }}
          onClick={onNext} whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
          style={{ ...btn(C.gold,"#E8C060",C.dark), marginTop:"2.5rem",
            animation:"goldPulse 2s ease-in-out infinite" }}>
          Ready for tonight? 🌙
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 4 — BUILDUP
   ══════════════════════════════════════════════════════════════════════════ */
function BuildupScene({ onNext }) {
  return (
    <motion.div key="buildup"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(150deg,${C.cream} 0%,${C.warm} 100%)`,
        padding:"2rem", textAlign:"center", position:"relative", overflow:"hidden" }}
    >
      <Petals n={10} />

      <div style={{ zIndex:1, maxWidth:"500px" }}>
        {[
          { txt:"Tonight…",          italic:false, bold:false },
          { txt:"is entirely…",       italic:true,  bold:false },
          { txt:"yours, Sweetpea. 🌸", italic:false, bold:true  },
        ].map((l, i) => (
          <motion.h2 key={i}
            initial={{ x: i%2===0 ? -70 : 70, opacity:0 }}
            animate={{ x:0, opacity:1 }}
            transition={{ delay:0.3 + i*0.65, type:"spring", stiffness:90 }}
            style={{ fontFamily:"'Playfair Display',serif",
              color: l.bold ? C.burgundy : C.dark,
              fontSize:"clamp(1.8rem,5vw,3rem)",
              fontWeight: l.bold ? 700 : 400,
              fontStyle: l.italic ? "italic" : "normal",
              lineHeight:1.4, marginBottom:"0.2rem" }}>
            {l.txt}
          </motion.h2>
        ))}

        <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          transition={{ delay:2.3 }}
          style={{ fontFamily:"'Cormorant Garamond',serif", color:C.mid,
            fontSize:"1.1rem", marginTop:"1.5rem", fontStyle:"italic", lineHeight:1.75 }}>
          I've planned a surprise date for us in Mumbai.<br />
          And here's the fun part —{" "}
          <strong style={{ color:C.burgundy, fontStyle:"normal" }}>you get to pick where we go.</strong>
        </motion.p>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ delay:3.1 }}
          style={{ fontFamily:"'Nunito',sans-serif", color:C.rose,
            fontSize:"0.88rem", marginTop:"0.8rem" }}>
          6 mystery cards. Tap one to reveal your night. ✨
        </motion.p>

        <motion.button initial={{ opacity:0,scale:0 }} animate={{ opacity:1,scale:1 }}
          transition={{ delay:3.7, type:"spring" }}
          onClick={onNext} whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
          style={{ ...btn(C.rose,C.burgundy,C.cream), marginTop:"2rem" }}>
          Let me choose! 🎴
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCENE 5 — MYSTERY FLIP CARDS
   ══════════════════════════════════════════════════════════════════════════ */
const CARDS = [
  { id:1, emoji:"🌅", title:"Sunset Cruise",
    teaser:"Gateway of India, golden hour, the sea breeze in your hair…",        bg:"#7A2535" },
  { id:2, emoji:"🍽️", title:"Rooftop Dinner",
    teaser:"Bandra's best view, city lights twinkling far below…",                bg:"#8B3A50" },
  { id:3, emoji:"🎨", title:"Art Walk & Sundowner",
    teaser:"Kala Ghoda galleries, street art lanes, a tiny café just for us…",   bg:"#7A4035" },
  { id:4, emoji:"🎳", title:"Games Night",
    teaser:"Bowling, arcade chaos, big laughs, zero adulting required…",          bg:"#6B3A55" },
  { id:5, emoji:"🌃", title:"Old Bombay Night",
    teaser:"Colaba's vintage lanes, quiet charm, a legendary dinner…",            bg:"#5C2A40" },
  { id:6, emoji:"🛶", title:"Lakeside Evening",
    teaser:"Paddleboat at Powai, the whole city glittering on the water…",        bg:"#6B3040" },
];

function FlipCard({ card, flipped, dimmed, onFlip }) {
  return (
    <motion.div
      initial={{ y:60, opacity:0 }}
      animate={{ y:0, opacity: dimmed ? 0.32 : 1 }}
      transition={{ type:"spring", stiffness:110, damping:18 }}
      onClick={onFlip}
      whileHover={!flipped && !dimmed ? { y:-12, scale:1.05 } : {}}
      style={{ width:"200px", height:"260px",
        cursor: flipped||dimmed ? "default" : "pointer",
        perspective:"1000px", transition:"opacity 0.4s" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration:0.65, type:"spring", stiffness:72 }}
        style={{ width:"100%", height:"100%", position:"relative", transformStyle:"preserve-3d" }}
      >
        {/* ── BACK ── */}
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(135deg,${C.burgundy} 0%,${C.burgundyDk} 100%)`,
          borderRadius:"14px", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          boxShadow:"0 12px 40px rgba(0,0,0,0.32)",
          border:`1px solid rgba(212,169,106,0.3)`, overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px",
            background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
          <motion.span
            animate={{ rotate:[0,15,-15,0], scale:[1,1.15,1] }}
            transition={{ repeat:Infinity, duration:2.5+card.id*0.3 }}
            style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>✨
          </motion.span>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.gold,
            fontSize:"0.75rem", letterSpacing:"0.12em", textAlign:"center", padding:"0 1rem" }}>
            Tap to reveal
          </p>
        </div>

        {/* ── FRONT ── */}
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(160deg,${card.bg} 0%,${C.burgundyDk} 100%)`,
          borderRadius:"14px", backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          transform:"rotateY(180deg)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:"1.2rem 0.9rem", textAlign:"center",
          boxShadow:"0 20px 55px rgba(0,0,0,0.42)",
          border:`1px solid rgba(212,169,106,0.4)`, overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px",
            background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
          <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{card.emoji}</div>
          <p style={{ fontFamily:"'Playfair Display',serif", color:C.gold,
            fontSize:"0.9rem", fontWeight:700, marginBottom:"0.6rem" }}>{card.title}</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif",
            color:"rgba(255,248,239,0.85)", fontSize:"0.75rem",
            lineHeight:1.65, fontStyle:"italic", marginBottom:"0.8rem" }}>{card.teaser}</p>
          <p style={{ fontFamily:"'Nunito',sans-serif", color:C.roseLight,
            fontSize:"0.68rem", fontWeight:800 }}>ask him for the rest 😉</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardsScene() {
  const [flipped, setFlipped] = useState(null);

  return (
    <motion.div key="cards"
      initial={{ opacity:0 }} animate={{ opacity:1 }}
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(150deg,${C.cream} 0%,${C.warm} 100%)`,
        padding:"2rem 1rem 3rem", position:"relative", overflow:"hidden" }}
    >
      <Petals n={10} />

      <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }}
        transition={{ delay:0.2 }}
        style={{ textAlign:"center", marginBottom:"2rem", zIndex:1 }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.rose,
          letterSpacing:"0.25em", fontSize:"0.8rem", textTransform:"uppercase" }}>
          ✦ Your Surprise ✦
        </p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", color:C.dark,
          fontSize:"clamp(1.5rem,4vw,2.2rem)", marginTop:"0.5rem" }}>
          Pick your mystery card 🎴
        </h2>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", color:C.mid,
          fontSize:"0.95rem", fontStyle:"italic", marginTop:"0.3rem" }}>
          Wherever you point — that's where the night begins.
        </p>
      </motion.div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:"1.5rem",
        justifyContent:"center", maxWidth:"720px", zIndex:1 }}>
        {CARDS.map((card, i) => (
          <motion.div key={card.id}
            initial={{ opacity:0,y:50 }} animate={{ opacity:1,y:0 }}
            transition={{ delay:0.08*i+0.35 }}>
            <FlipCard
              card={card}
              flipped={flipped===card.id}
              dimmed={flipped!==null && flipped!==card.id}
              onFlip={() => flipped===null && setFlipped(card.id)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
            transition={{ delay:0.8 }}
            style={{ marginTop:"2.5rem", textAlign:"center", zIndex:1 }}>
            <p style={{ fontFamily:"'Playfair Display',serif", color:C.burgundy,
              fontSize:"1.2rem", fontStyle:"italic" }}>
              And so our night begins, Sweetpea 🌙
            </p>
            <p style={{ fontFamily:"'Nunito',sans-serif", color:C.rose,
              fontSize:"0.88rem", marginTop:"0.4rem" }}>
              Now come find me for the rest 💕
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT APP
   ══════════════════════════════════════════════════════════════════════════ */
export default function AnniversaryApp() {
  const [scene, setScene] = useState(0);
  const go = (n) => setScene(n);

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { overflow-x:hidden; }
        @keyframes goldPulse {
          0%,100% { box-shadow:0 0 20px rgba(212,169,106,0.3); }
          50%      { box-shadow:0 0 55px rgba(212,169,106,0.75); }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {scene===0 && <SpinGame      key="s0" onWin={()=>go(1)} />}
        {scene===1 && <EnvelopeScene key="s1" onNext={()=>go(2)} />}
        {scene===2 && <PolaroidsScene key="s2" onNext={()=>go(3)} />}
        {scene===3 && <BigMomentScene key="s3" onNext={()=>go(4)} />}
        {scene===4 && <BuildupScene  key="s4" onNext={()=>go(5)} />}
        {scene===5 && <CardsScene    key="s5" />}
      </AnimatePresence>
    </>
  );
}
