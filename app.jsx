/* app.jsx — Tweaks panel for the portfolio. */

const LEAD_DEFAULT = "Product designer shipping end-to-end \u2014 including in code with AI.";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "black",
  "feed": "filled",
  "cw": "same",
  "links": "inline",
  "font": "system",
  "fontSize": 14,
  "bg": "white",
  "bio": ""
}/*EDITMODE-END*/;

const ACCENT_HEX = { red: "#d2452c", black: "#3a3d44", blue: "#2f63cf" };
const HEX_TO_ACCENT = Object.fromEntries(Object.entries(ACCENT_HEX).map(([k, v]) => [v, k]));

const BG_HEX = { cool: "#e9ecf2", white: "#ffffff", slate: "#dce0ea" };
const HEX_TO_BG = Object.fromEntries(Object.entries(BG_HEX).map(([k, v]) => [v, k]));

function App() {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(window.__pfStore)) || {}; }
    catch (e) { return {}; }
  })();
  const [t, setTweak] = useTweaks({ ...TWEAK_DEFAULTS, ...stored });

  React.useEffect(() => {
    if (window.applyTweaks) window.applyTweaks(t);
    // bio: update lead paragraph live
    var lead = document.querySelector && document.querySelector('.intro .lead');
    if (lead) lead.textContent = t.bio && t.bio.trim() ? t.bio : LEAD_DEFAULT;
    try { localStorage.setItem(window.__pfStore, JSON.stringify(t)); } catch (e) {}
  }, [t]);

  const set = (k) => (v) => setTweak(k, v);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Content" />
      <TweakText
        label="Intro"
        value={t.bio}
        placeholder={LEAD_DEFAULT}
        onChange={set("bio")}
      />

      <TweakSection label="Type" />
      <TweakRadio
        label="Typeface"
        value={t.font}
        options={[
          { value: "hanken",    label: "Hanken" },
          { value: "schibsted", label: "Schibsted" },
          { value: "system",    label: "System" },
        ]}
        onChange={set("font")}
      />
      <TweakSlider
        label="Text size"
        value={t.fontSize} min={14} max={18} step={0.5}
        onChange={set("fontSize")}
      />

      <TweakSection label="Color" />
      <TweakColor
        label="Accent"
        value={ACCENT_HEX[t.accent]}
        options={[ACCENT_HEX.red, ACCENT_HEX.black, ACCENT_HEX.blue]}
        onChange={(hex) => setTweak("accent", HEX_TO_ACCENT[hex] || "red")}
      />
      <TweakColor
        label="Background"
        value={BG_HEX[t.bg]}
        options={[BG_HEX.cool, BG_HEX.white, BG_HEX.slate]}
        onChange={(hex) => setTweak("bg", HEX_TO_BG[hex] || "cool")}
      />

      <TweakSection label="Feed" />
      <TweakSelect
        label="Layout"
        value={t.feed}
        options={[
          { value: "filled",   label: "Stacked \u2014 filled cards" },
          { value: "outlined", label: "Stacked \u2014 outlined" },
          { value: "list",     label: "List \u2014 no images" },
        ]}
        onChange={set("feed")}
      />
      <TweakRadio
        label="Image width"
        value={t.cw}
        options={[
          { value: "same",  label: "Same" },
          { value: "wide",  label: "Wide" },
          { value: "wider", label: "Wider" },
        ]}
        onChange={set("cw")}
      />

      <TweakSection label="Links" />
      <TweakRadio
        label="CV \u00b7 LinkedIn"
        value={t.links}
        options={[
          { value: "inline", label: "Intro" },
          { value: "footer", label: "Footer" },
          { value: "both",   label: "Both" },
        ]}
        onChange={set("links")}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
