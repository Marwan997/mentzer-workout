import { useState } from "react";

// jsDelivr serves GitHub files with proper CORS — <img> tags render these reliably.
const CDN = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

// Each exercise: ordered list of candidate folder IDs. The <img> tries each
// in turn (onError) until one loads. Confirmed IDs marked ✓.
const imagePaths = {
  "Pec Deck Flye":                      ["Butterfly", "Pec_Deck", "Leverage_Pec_Deck_Fly", "Cable_Crossover"],
  "Incline Barbell Press":              ["Barbell_Incline_Bench_Press_-_Medium_Grip", "Incline_Barbell_Bench_Press", "Barbell_Incline_Bench_Press"],
  "Barbell Curl":                       ["Barbell_Curl"], // ✓
  "Incline Dumbbell Curl":              ["Incline_Dumbbell_Curl", "Alternate_Incline_Dumbbell_Curl"], // ✓
  "Pullover Machine":                   ["Bent-Arm_Barbell_Pullover", "Straight-Arm_Dumbbell_Pullover", "Bent-Arm_Dumbbell_Pullover"], // ✓
  "Barbell Row":                        ["Bent_Over_Barbell_Row", "Bent_Over_Two-Arm_Long_Bar_Row", "Reverse_Grip_Bent-Over_Rows"],
  "Close-Grip Bench Press":            ["Close-Grip_Barbell_Bench_Press", "Close-Grip_EZ_Bar_Press"],
  "Cable Pushdown":                     ["Triceps_Pushdown", "Triceps_Pushdown_-_Rope_Attachment", "Triceps_Pushdown_-_V-Bar_Attachment"],
  "Leg Extension":                      ["Leg_Extensions", "Leg_Extension"],
  "Barbell Squat":                      ["Barbell_Squat", "Barbell_Full_Squat"], // ✓
  "Leg Curl":                           ["Lying_Leg_Curls", "Seated_Leg_Curl", "Leg_Curl"],
  "Lateral Raise Machine":              ["Side_Lateral_Raise", "Machine_Shoulder_Press", "Dumbbell_Lateral_Raise"],
  "Overhead Barbell Press":             ["Standing_Military_Press", "Barbell_Shoulder_Press", "Standing_Barbell_Press"],
  "Cable Crunch":                       ["Cable_Crunch", "Kneeling_Cable_Crunch"],
  "Weighted Decline Sit-Up":            ["Decline_Crunch", "Weighted_Crunches", "Janda_Sit-Up"],
  "Reverse Pec Deck (Rear Delt Flye)": ["Reverse_Machine_Flyes", "Seated_Bent-Over_Rear_Delt_Raise", "Reverse_Flyes"],
  "Barbell Shrug":                      ["Barbell_Shrug"], // ✓
  "Face Pull":                          ["Face_Pull", "Cable_Rear_Delt_Fly", "Standing_Cable_Lift"],
};

const guides = {
  "Pec Deck Flye":                      { muscles: "Pectoralis Major (inner chest)", steps: ["Sit tall with back flat against the pad, chest up.", "Grip handles with a slight, fixed elbow bend — maintain it throughout.", "Bring arms together and squeeze chest hard at peak for 1 second.", "Return slowly over 4 seconds to full stretch — chest fully opens.", "Shoulders stay down and back the whole time."], tip: "This is your pre-exhaust. Hit the press immediately after — zero rest." },
  "Incline Barbell Press":              { muscles: "Upper Pec, Front Delts, Triceps", steps: ["Set bench to 30–45°. Grip slightly wider than shoulder-width.", "Lower bar slowly over 4 seconds to upper chest.", "Press up without fully locking elbows to keep chest tension.", "Pre-exhausted chest means failure comes faster — that's the point."], tip: "Do NOT rest after the flye. The pre-exhaust only works if you attack this immediately." },
  "Barbell Curl":                       { muscles: "Biceps Brachii, Brachialis", steps: ["Stand upright with shoulder-width underhand grip.", "Curl bar to shoulder height — elbows pinned to sides throughout.", "Squeeze bicep hard at top for 1 second.", "Lower slowly over 4 seconds to full arm extension.", "No swinging — if you swing, the weight is too heavy."], tip: "Full extension at the bottom is where the growth stimulus begins. Never cut it short." },
  "Incline Dumbbell Curl":              { muscles: "Biceps Brachii (long head), Brachialis", steps: ["Set bench to ~60°. Arms hang straight down behind the body.", "Curl while supinating (rotating wrists outward) on the way up.", "Arms behind torso creates maximum stretch at the bottom.", "Lower all the way to full extension — let the bicep fully lengthen."], tip: "The stretched position is what makes this special. Never rush the negative." },
  "Pullover Machine":                   { muscles: "Latissimus Dorsi, Teres Major, Long Head of Triceps", steps: ["Adjust seat so shoulder joint aligns with the machine's rotation axis.", "Place elbows on pads — drive with elbows, not hands.", "Allow full stretch at top — arms pass behind your head.", "Drive down until elbows reach hip level. Squeeze lats hard.", "Return slowly to full overhead stretch over 4 seconds."], tip: "Think 'elbow drive' — your hands are just hooks. It's a lat contraction, not an arm pull." },
  "Barbell Row":                        { muscles: "Latissimus Dorsi, Rhomboids, Rear Delts, Biceps", steps: ["Hinge at hips until torso is nearly parallel to the floor.", "Pull bar to lower chest/abdomen — elbows drive straight back.", "Squeeze shoulder blades together hard at top for 1 second.", "Lower slowly, letting scapulae fully protract for a deep stretch.", "Keep spine neutral throughout — no rounding."], tip: "After pullover pre-exhaust, lats are already fatigued. Less weight, more failure." },
  "Close-Grip Bench Press":            { muscles: "Triceps Brachii, Front Delts, Inner Chest", steps: ["Grip bar at shoulder-width — narrower just stresses wrists.", "Lower to lower chest with elbows tucked at 30–45°.", "Press up in a slight arc toward your face.", "Stop just short of full lockout to keep tricep tension."], tip: "Shoulder-width grip is more effective than ultra-narrow. Keep elbows in at all times." },
  "Cable Pushdown":                     { muscles: "Triceps Brachii (all 3 heads)", steps: ["Stand at cable with rope or bar at head height.", "Pin elbows firmly against sides — they must NOT move.", "Push down to full lockout, squeeze triceps for 1 second.", "Return slowly over 4 seconds — full stretch at top."], tip: "Elbows are the pivot. If they drift forward or back, you lose isolation immediately." },
  "Leg Extension":                      { muscles: "Quadriceps (all 4 heads)", steps: ["Adjust pad to sit just above the ankle.", "Extend legs to full lockout — hold 1 second, squeezing quads.", "Lower slowly over 4 seconds to fully bent position.", "No swinging — pure quad isolation."], tip: "Pre-exhausts quads before squats. Expect the squat to feel brutal with less weight." },
  "Barbell Squat":                      { muscles: "Quadriceps, Glutes, Hamstrings, Erectors", steps: ["Bar on upper traps, feet shoulder-width, toes slightly out.", "Brace core hard. Big breath and hold (Valsalva maneuver).", "Descend over 4 seconds — below parallel, knees track toes.", "Drive through full foot on the way up. Chest stays up."], tip: "With quads pre-exhausted you won't need your normal weight. Chase failure, not numbers." },
  "Leg Curl":                           { muscles: "Hamstrings (Biceps Femoris, Semi-membranosus, Semitendinosus)", steps: ["Lie face down, pad just above the ankles.", "Curl heels toward glutes — full range of motion.", "Hold peak contraction for 1 second.", "Lower slowly over 4 seconds to full extension.", "Keep hips flat on the bench throughout."], tip: "Most people rush the eccentric. The 4-second negative is where hamstrings grow." },
  "Lateral Raise Machine":              { muscles: "Medial (Side) Deltoid", steps: ["Adjust seat so pivot point aligns exactly with your shoulder joint.", "Elbows slightly bent — maintain that bend throughout.", "Raise to shoulder height only — higher shifts work to traps.", "Lower over 4 seconds in a controlled arc.", "Shoulders down and back — no shrugging."], tip: "Pre-exhaust the medial delt so the overhead press finishes it off. No rest between the two." },
  "Overhead Barbell Press":             { muscles: "Medial Deltoid, Front Deltoid, Triceps, Upper Traps", steps: ["Standing or seated, grip just outside shoulders.", "Press straight up — tuck chin slightly to let bar pass.", "Full lockout at the top.", "Lower slowly over 4 seconds.", "No leg drive, no backward lean — strict form."], tip: "After lateral raises, the medial delt is toast. Even moderate weight causes rapid failure." },
  "Cable Crunch":                       { muscles: "Rectus Abdominis, Obliques", steps: ["Kneel below cable with rope at temples or behind head.", "Begin with slight arch in lower back (stretched position).", "Crunch by rounding spine — sternum toward hips, not head to floor.", "Hold peak contraction for 1 second.", "Return slowly to stretch over 4 seconds."], tip: "Key is spinal flexion. Just hinging at hips misses the abs entirely." },
  "Weighted Decline Sit-Up":            { muscles: "Rectus Abdominis, Hip Flexors", steps: ["Secure feet on decline bench, hold weight plate on chest.", "Lower all the way back — full stretch, shoulders near bench.", "Rise all the way to full spinal flexion.", "Control the descent over 4 seconds."], tip: "Full range of motion is non-negotiable. Half reps on abs are a complete waste." },
  "Reverse Pec Deck (Rear Delt Flye)": { muscles: "Posterior Deltoid, Rhomboids, Infraspinatus", steps: ["Face the machine, reversed handles so palms face inward.", "Slight, fixed bend in elbows throughout.", "Drive elbows back as far as possible — pinch shoulder blades.", "Hold peak contraction for 1 second.", "Return slowly to full stretch in front."], tip: "Too heavy = traps take over. Light weight, strict rear-delt-only form." },
  "Barbell Shrug":                      { muscles: "Upper Trapezius", steps: ["Hold barbell at hip height, overhand grip, shoulder-width.", "Shrug straight up — no rolling motion.", "Hold top for a full 2 seconds — feel traps fully contract.", "Lower slowly to a full stretch."], tip: "The 2-second hold at the top is what separates a Mentzer shrug from a wasted rep." },
  "Face Pull":                          { muscles: "Posterior Deltoid, Infraspinatus, Middle & Lower Traps", steps: ["Set cable at face height. Use rope attachment.", "Pull toward forehead — elbows flare high and wide.", "At peak, externally rotate — hands beside ears, thumbs back.", "Return slowly over 4 seconds — full arm extension."], tip: "External rotation at the peak hits rear delts AND rotator cuff. Don't skip it." },
};

const plan = [
  { day:"Day 1", label:"Chest & Biceps",           rest:false, color:"#C0392B", exercises:[
      {name:"Pec Deck Flye",          reps:"10–12 to failure", note:"Pre-exhaust chest before pressing",        type:"isolation"},
      {name:"Incline Barbell Press",  reps:"6–10 to failure",  note:"Hit immediately after flyes — no rest",   type:"compound"},
      {name:"Barbell Curl",           reps:"8–12 to failure",  note:"No swinging — full supination at top",    type:"isolation"},
      {name:"Incline Dumbbell Curl",  reps:"8–12 to failure",  note:"Arms behind torso for full stretch",      type:"isolation"},
  ]},
  { day:"Day 2", label:"Rest & Recovery",           rest:true,  color:"#2C3E50", exercises:[] },
  { day:"Day 3", label:"Back & Triceps",            rest:false, color:"#2980B9", exercises:[
      {name:"Pullover Machine",       reps:"10–12 to failure", note:"Pre-exhaust lats — elbows drive, not hands", type:"isolation"},
      {name:"Barbell Row",            reps:"6–10 to failure",  note:"Pull to lower chest, full stretch at bottom",type:"compound"},
      {name:"Close-Grip Bench Press", reps:"6–10 to failure",  note:"Elbows tucked — pure tricep focus",          type:"compound"},
      {name:"Cable Pushdown",         reps:"10–15 to failure", note:"Full lockout at bottom, slow return",         type:"isolation"},
  ]},
  { day:"Day 4", label:"Rest & Recovery",           rest:true,  color:"#2C3E50", exercises:[] },
  { day:"Day 5", label:"Legs & Shoulders",          rest:false, color:"#27AE60", exercises:[
      {name:"Leg Extension",          reps:"10–15 to failure", note:"Pre-exhaust quads — pause 1 sec at top",  type:"isolation"},
      {name:"Barbell Squat",          reps:"8–12 to failure",  note:"4 sec descent, drive through heels",      type:"compound"},
      {name:"Leg Curl",               reps:"8–12 to failure",  note:"Full range, slow 4-sec negative",         type:"isolation"},
      {name:"Lateral Raise Machine",  reps:"12–15 to failure", note:"Pre-exhaust delts before pressing",       type:"isolation"},
      {name:"Overhead Barbell Press", reps:"6–10 to failure",  note:"Strict — no leg drive, no lean back",     type:"compound"},
  ]},
  { day:"Day 6", label:"Rest & Recovery",           rest:true,  color:"#2C3E50", exercises:[] },
  { day:"Day 7", label:"Core & Rear Delts / Traps", rest:false, color:"#E67E22", exercises:[
      {name:"Cable Crunch",                       reps:"12–20 to failure", note:"Round the spine — don't just hinge at hip",  type:"isolation"},
      {name:"Weighted Decline Sit-Up",            reps:"10–15 to failure", note:"Full ROM — all the way up and back",          type:"compound"},
      {name:"Reverse Pec Deck (Rear Delt Flye)",  reps:"12–15 to failure", note:"Pre-exhaust rear delts",                      type:"isolation"},
      {name:"Barbell Shrug",                      reps:"10–15 to failure", note:"Hold at top 2 sec — full elevation",          type:"compound"},
      {name:"Face Pull",                          reps:"12–15 to failure", note:"Pull to forehead, external rotate at peak",   type:"compound"},
  ]},
  { day:"Day 8", label:"Rest & Repeat",             rest:true,  color:"#2C3E50", exercises:[] },
];

const rules = [
  {icon:"🔥", title:"1 Working Set",       desc:"One all-out set to complete failure. No warm-up sets count."},
  {icon:"🐢", title:"Slow Tempo",           desc:"4 seconds up, 4 seconds down. Eliminate all momentum."},
  {icon:"😴", title:"Rest is Sacred",       desc:"Growth happens in recovery. Never train if not fully recovered."},
  {icon:"📈", title:"Progressive Overload", desc:"Every session: beat last time's weight or reps. If you can't — rest more."},
  {icon:"💀", title:"True Failure",         desc:"The set ends when you literally cannot complete another rep."},
  {icon:"⚡", title:"Pre-Exhaustion",       desc:"Isolation before compound — target muscle fatigued before the big lift."},
];

// ── Image with fallback chain (pure <img>, no fetch — bypasses sandbox CORS) ───
function ExerciseImage({ name, color }) {
  const paths = imagePaths[name] || [];
  const [idx, setIdx]   = useState(0);
  const [dead, setDead] = useState(false);

  if (dead || paths.length === 0) return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,color:"#3a3a3a"}}>
      <span style={{fontSize:"1.8rem"}}>💪</span>
      <span style={{fontSize:11,letterSpacing:1,color:"#4a4a4a"}}>No image (try outside Claude)</span>
    </div>
  );

  return (
    <img
      key={idx}
      src={`${CDN}${paths[idx]}/0.jpg`}
      alt={name}
      style={{width:"100%",height:"100%",objectFit:"contain",background:"#fff"}}
      onError={() => { idx + 1 < paths.length ? setIdx(idx + 1) : setDead(true); }}
    />
  );
}

function Modal({ ex, color, onClose }) {
  const g = guides[ex.name];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111",border:`1px solid ${color}44`,borderTop:`3px solid ${color}`,borderRadius:10,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",fontFamily:"'Georgia','Times New Roman',serif"}}>
        <div style={{padding:"20px 24px 14px",borderBottom:"1px solid #1e1e1e",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color,textTransform:"uppercase",marginBottom:4}}>{ex.type} · Exercise Guide</div>
            <div style={{fontSize:"1.2rem",fontWeight:800,color:"#f0ece4"}}>{ex.name}</div>
            <div style={{fontSize:11,color:"#5a5a5a",marginTop:3}}>{g?.muscles}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:"50%",width:32,height:32,color:"#6a6a6a",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{margin:"16px 24px",background:"#fff",border:`1px solid ${color}22`,borderRadius:8,overflow:"hidden",height:220}}>
          <ExerciseImage name={ex.name} color={color} />
        </div>
        {g && <>
          <div style={{padding:"0 24px 8px"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#4a4a4a",textTransform:"uppercase",marginBottom:12}}>Step-by-Step</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {g.steps.map((step,i) => (
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{flexShrink:0,width:22,height:22,background:`${color}22`,border:`1px solid ${color}55`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color}}>{i+1}</div>
                  <div style={{fontSize:"0.83rem",color:"#c0b8a8",lineHeight:1.65,paddingTop:2}}>{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{margin:"16px 24px 20px",padding:"14px 16px",background:`${color}10`,border:`1px solid ${color}30`,borderRadius:6}}>
            <div style={{fontSize:9,letterSpacing:3,color,textTransform:"uppercase",marginBottom:6}}>⚡ Mentzer Tip</div>
            <div style={{fontSize:"0.82rem",color:"#9a8a7a",lineHeight:1.65}}>{g.tip}</div>
          </div>
        </>}
      </div>
    </div>
  );
}

export default function App() {
  const [day,   setDay]   = useState(0);
  const [modal, setModal] = useState(null);
  const sel = plan[day];

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f0ece4",fontFamily:"'Georgia','Times New Roman',serif",overflowX:"hidden"}}>
      {modal && <Modal ex={modal} color={sel.color} onClose={()=>setModal(null)} />}

      <div style={{background:"linear-gradient(135deg,#0a0a0a,#1a0a0a)",borderBottom:"1px solid #2a1a1a",padding:"40px 32px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(192,57,43,.15),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:11,letterSpacing:6,color:"#C0392B",textTransform:"uppercase",marginBottom:10}}>Heavy Duty Training</div>
        <h1 style={{fontSize:"clamp(2rem,6vw,3.5rem)",fontWeight:900,margin:"0 0 6px",lineHeight:1}}>MIKE MENTZER</h1>
        <h2 style={{fontSize:"clamp(.9rem,3vw,1.3rem)",fontWeight:300,color:"#8a7a6a",margin:"0 0 12px",letterSpacing:2}}>4-DAY INTERMEDIATE SPLIT</h2>
        <div style={{fontSize:10,color:"#3a3a3a",letterSpacing:2}}>TAP ANY EXERCISE FOR GUIDE + PHOTO</div>
      </div>

      <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #1a1a1a",background:"#0e0e0e",scrollbarWidth:"none"}}>
        {plan.map((d,i)=>(
          <button key={i} onClick={()=>setDay(i)} style={{flex:"0 0 auto",padding:"13px 15px",background:"none",border:"none",borderBottom:day===i?`2px solid ${d.color}`:"2px solid transparent",color:day===i?"#f0ece4":"#4a4a4a",cursor:"pointer",fontSize:10,letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"inherit",transition:"all .2s",whiteSpace:"nowrap"}}>
            <div style={{fontWeight:700,marginBottom:2}}>{d.day}</div>
            <div style={{fontSize:9,color:day===i?d.color:"#3a3a3a"}}>{d.rest?"REST":d.label.split(" & ")[0].toUpperCase()}</div>
          </button>
        ))}
      </div>

      <div style={{maxWidth:760,margin:"0 auto",padding:"28px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
          <div style={{width:4,height:44,background:sel.color,borderRadius:2}}/>
          <div>
            <div style={{fontSize:10,letterSpacing:4,color:sel.color,textTransform:"uppercase"}}>{sel.day}</div>
            <div style={{fontSize:"1.5rem",fontWeight:800,lineHeight:1.1}}>{sel.label}</div>
          </div>
        </div>

        {sel.rest ? (
          <div style={{border:"1px solid #1a1a1a",borderRadius:8,padding:44,textAlign:"center",background:"#0e0e0e"}}>
            <div style={{fontSize:"2.5rem",marginBottom:14}}>😴</div>
            <div style={{fontSize:"1.1rem",fontWeight:700,marginBottom:8}}>Complete Rest</div>
            <div style={{color:"#5a5a5a",fontSize:".88rem",lineHeight:1.7,maxWidth:340,margin:"0 auto"}}>Growth happens during recovery. Sleep 8+ hours. Eat in a surplus. Do not rush back.</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {sel.exercises.map((ex,i)=>(
              <div key={i} onClick={()=>setModal(ex)}
                style={{background:"#0e0e0e",border:"1px solid #1e1e1e",borderLeft:`3px solid ${ex.type==="compound"?sel.color:"#3a3a3a"}`,borderRadius:6,padding:"18px 20px",cursor:"pointer",transition:"background .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#141414"}
                onMouseLeave={e=>e.currentTarget.style.background="#0e0e0e"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:ex.type==="compound"?sel.color:"#5a5a5a",marginBottom:5}}>{ex.type}</div>
                    <div style={{fontSize:"1.05rem",fontWeight:700}}>{ex.name}</div>
                    <div style={{fontSize:".8rem",color:"#6a6a6a",marginTop:5,fontStyle:"italic"}}>{ex.note}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                    <div style={{background:"rgba(255,255,255,.04)",border:"1px solid #2a2a2a",borderRadius:4,padding:"6px 12px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#5a5a5a",letterSpacing:1,textTransform:"uppercase"}}>Reps</div>
                      <div style={{fontSize:".85rem",fontWeight:700,marginTop:1}}>{ex.reps}</div>
                    </div>
                    <div style={{fontSize:9,color:sel.color,letterSpacing:1,textTransform:"uppercase"}}>guide →</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{marginTop:6,padding:"14px 18px",background:"rgba(192,57,43,.06)",border:"1px solid rgba(192,57,43,.2)",borderRadius:6,fontSize:".8rem",color:"#8a6a5a",lineHeight:1.6}}>
              <span style={{color:"#C0392B",fontWeight:700}}>TEMPO RULE: </span>4 sec concentric · 4 sec eccentric · No momentum · 3–5 min rest between exercises
            </div>
          </div>
        )}

        <div style={{marginTop:40}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#4a4a4a",textTransform:"uppercase",marginBottom:14}}>8-Day Cycle</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {plan.map((d,i)=>(
              <div key={i} onClick={()=>setDay(i)} style={{flex:"1 1 60px",padding:"10px 6px",background:day===i?`${d.color}20`:"#0e0e0e",border:`1px solid ${day===i?d.color:"#1a1a1a"}`,borderRadius:6,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:8,color:"#4a4a4a",marginBottom:3}}>{d.day}</div>
                <div style={{fontSize:8,fontWeight:700,color:d.rest?"#3a4a5a":d.color,textTransform:"uppercase"}}>{d.rest?"REST":d.label.split(" & ")[0]}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,fontSize:11,color:"#3a3a3a",fontStyle:"italic"}}>After Day 8, restart from Day 1. Rotating cycle — not a fixed weekly schedule.</div>
        </div>

        <div style={{marginTop:40}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#4a4a4a",textTransform:"uppercase",marginBottom:16}}>Heavy Duty Laws</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {rules.map((r,i)=>(
              <div key={i} style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:6,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{fontSize:"1.2rem",flexShrink:0}}>{r.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:".83rem",marginBottom:3}}>{r.title}</div>
                  <div style={{fontSize:".76rem",color:"#5a5a5a",lineHeight:1.55}}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:40,paddingTop:28,borderTop:"1px solid #1a1a1a",textAlign:"center"}}>
          <div style={{fontSize:".95rem",color:"#4a4a4a",fontStyle:"italic",lineHeight:1.8,maxWidth:460,margin:"0 auto"}}>"The ideal Mentzer workout is one set per exercise, taken to positive failure, then forced reps, then the negative — all in under 30 minutes."</div>
          <div style={{fontSize:10,letterSpacing:3,color:"#2a2a2a",marginTop:10,textTransform:"uppercase"}}>— Mike Mentzer</div>
        </div>
      </div>
    </div>
  );
}
