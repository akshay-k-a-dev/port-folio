import { useEffect, useRef } from "react";
import "../styles/hardware-dock.css";

export default function ComingSoon() {
  const pwrBtnRef = useRef<HTMLDivElement>(null);
  const mainDialRef = useRef<HTMLDivElement>(null);
  const dialValueRef = useRef<HTMLDivElement>(null);
  const lcdMainRef = useRef<HTMLDivElement>(null);
  const lcdSubRef = useRef<HTMLDivElement>(null);
  const ledStatusRef = useRef<HTMLDivElement>(null);
  const inputBayRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const engageCapRef = useRef<HTMLDivElement>(null);
  const errorMsgRef = useRef<HTMLDivElement>(null);
  const ledRefsArray = useRef<HTMLDivElement[]>([]);
  const stateRef = useRef<"idle" | "booting" | "input" | "locked">("idle");
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof AudioContext !== "undefined") {
      ctxRef.current = new AudioContext();
    }
  }, []);

  const playClick = (type: "click" | "engage" | "beep" = "click") => {
    if (!ctxRef.current) return;
    ctxRef.current.resume();
    const o = ctxRef.current.createOscillator();
    const g = ctxRef.current.createGain();
    o.connect(g);
    g.connect(ctxRef.current.destination);

    if (type === "click") {
      o.frequency.setValueAtTime(800, ctxRef.current.currentTime);
      o.frequency.exponentialRampToValueAtTime(
        200,
        ctxRef.current.currentTime + 0.05,
      );
      g.gain.setValueAtTime(0.25, ctxRef.current.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctxRef.current.currentTime + 0.06,
      );
    } else if (type === "engage") {
      o.type = "square";
      o.frequency.setValueAtTime(120, ctxRef.current.currentTime);
      o.frequency.setValueAtTime(80, ctxRef.current.currentTime + 0.05);
      g.gain.setValueAtTime(0.3, ctxRef.current.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctxRef.current.currentTime + 0.15,
      );
    } else if (type === "beep") {
      o.type = "sine";
      o.frequency.setValueAtTime(1200, ctxRef.current.currentTime);
      g.gain.setValueAtTime(0.15, ctxRef.current.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctxRef.current.currentTime + 0.08,
      );
    }
    o.start(ctxRef.current.currentTime);
    o.stop(ctxRef.current.currentTime + 0.2);
  };

  const setLCDMain = (text: string, cursor = false) => {
    if (lcdMainRef.current) {
      lcdMainRef.current.innerHTML =
        text + (cursor ? '<span class="cursor-blink active"></span>' : "");
    }
  };

  const setAllLEDs = (cls?: string) => {
    ledRefsArray.current.forEach((l) => {
      l.className = "led";
      if (cls) l.classList.add(cls);
    });
  };

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const sequenceBoot = () => {
    const messages = [
      "INIT SYS........",
      "LOAD KERNEL [OK]",
      "CHK SENSORS [OK]",
      "CALIBRATING.....",
      "BOOT COMPLETE ✓",
    ];
    const subMsgs = [
      "ROM v2.1 LOADING",
      "SUBSYSTEMS READY",
      "ALL NODES ONLINE",
      "DIAL: 0 → 100   ",
      "OPEN INPUT MODULE",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLCDMain(messages[i]);
        if (lcdSubRef.current) lcdSubRef.current.textContent = subMsgs[i];
        if (dialValueRef.current)
          dialValueRef.current.textContent =
            String(Math.min(i * 25, 100)).padStart(3, "0") + " / 100";
        playClick("beep");

        ledRefsArray.current.forEach((l, idx) => {
          l.className = "led";
          if (idx <= i) l.classList.add("orange");
        });
        i++;
      } else {
        clearInterval(interval);
        ledRefsArray.current.forEach((l) => {
          l.className = "led orange";
        });
        if (dialValueRef.current)
          dialValueRef.current.textContent = "075 / 100";
        setTimeout(() => openInput(), 600);
      }
    }, 500);
  };

  const openInput = () => {
    stateRef.current = "input";
    setLCDMain("AWAITING INPUT..", true);
    if (lcdSubRef.current)
      lcdSubRef.current.textContent = "ENTER NODE ID BELOW";
    if (ledStatusRef.current) ledStatusRef.current.textContent = "SYS: ACTIVE";
    if (inputBayRef.current) inputBayRef.current.classList.add("open");
    setTimeout(() => emailInputRef.current?.focus(), 700);
  };

  const triggerLocked = () => {
    stateRef.current = "locked";
    if (inputBayRef.current) inputBayRef.current.classList.remove("open");
    setLCDMain("SEQ. LOGGED ////", false);
    if (lcdSubRef.current)
      lcdSubRef.current.textContent = "STANDBY // LINK ACTIVE";
    if (ledStatusRef.current) ledStatusRef.current.textContent = "SYS: LOCKED";
    if (dialValueRef.current) dialValueRef.current.textContent = "100 / 100";

    ledRefsArray.current.forEach((l) => {
      l.className = "led pulse-green";
    });

    if (mainDialRef.current) {
      mainDialRef.current.classList.remove("spinning");
      void mainDialRef.current.offsetWidth;
      mainDialRef.current.style.setProperty("--dial-from", "330deg");
      mainDialRef.current.classList.add("locking");
    }

    if (pwrBtnRef.current) {
      pwrBtnRef.current.style.opacity = "0.4";
      pwrBtnRef.current.style.cursor = "default";
      pwrBtnRef.current.style.pointerEvents = "none";
    }
  };

  useEffect(() => {
    const pwrBtn = pwrBtnRef.current;
    const mainDial = mainDialRef.current;
    const engageCap = engageCapRef.current;
    const emailInput = emailInputRef.current;
    const engageBtn = engageCap?.parentElement;

    if (!pwrBtn || !mainDial || !engageCap || !emailInput || !engageBtn) return;

    const handlePwrDown = () => {
      pwrBtn.classList.add("pressed");
      playClick("click");
    };

    const handlePwrUp = () => {
      pwrBtn.classList.remove("pressed");
      if (stateRef.current !== "idle") return;
      stateRef.current = "booting";

      setLCDMain("BOOTING SYSTEM..");
      if (lcdSubRef.current)
        lcdSubRef.current.textContent = "PLEASE WAIT......";
      if (ledStatusRef.current)
        ledStatusRef.current.textContent = "SYS: BOOTING";
      setAllLEDs("boot-blink");

      mainDial.classList.add("spinning");

      setTimeout(sequenceBoot, 400);

      pwrBtn.style.opacity = "0.5";
      pwrBtn.style.pointerEvents = "none";
      setTimeout(() => {
        pwrBtn.style.opacity = "1";
        pwrBtn.style.pointerEvents = "auto";
      }, 3000);
    };

    const handleEngageDown = () => {
      engageCap.classList.add("pressed");
    };

    const handleEngageUp = () => {
      engageCap.classList.remove("pressed");
      if (stateRef.current !== "input") return;
      const val = emailInput.value.trim();
      if (!isValidEmail(val)) {
        if (errorMsgRef.current) errorMsgRef.current.classList.add("visible");
        ledRefsArray.current[0].className = "led";
        setTimeout(() => ledRefsArray.current[0].classList.add("orange"), 50);
        setLCDMain("ERR: INVALID NODE", false);
        if (lcdSubRef.current)
          lcdSubRef.current.textContent = "FORMAT: user@host.tld";
        emailInput.focus();
        playClick("engage");
        setTimeout(() => {
          if (errorMsgRef.current)
            errorMsgRef.current.classList.remove("visible");
          setLCDMain("AWAITING INPUT..", true);
          if (lcdSubRef.current)
            lcdSubRef.current.textContent = "RE-ENTER NODE ID";
        }, 2500);
        return;
      }
      playClick("engage");
      engageCap.classList.add("pressed");
      setTimeout(() => engageCap.classList.remove("pressed"), 150);
      setLCDMain("VERIFYING NODE..");
      if (lcdSubRef.current)
        lcdSubRef.current.textContent = "HANDSHAKE INIT...";

      setTimeout(() => {
        setLCDMain("NODE VERIFIED  ✓");
        if (lcdSubRef.current)
          lcdSubRef.current.textContent = "LOGGING SEQUENCE";
        setTimeout(triggerLocked, 700);
      }, 1200);
    };

    const handleDialHover = () => {
      if (stateRef.current === "locked") {
        mainDial.classList.remove("twitching");
        void mainDial.offsetWidth;
        mainDial.classList.add("twitching");
      }
    };

    const handleEmailKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") engageBtn.dispatchEvent(new Event("mouseup"));
    };

    pwrBtn.addEventListener("mousedown", handlePwrDown);
    pwrBtn.addEventListener("mouseup", handlePwrUp);
    engageBtn.addEventListener("mousedown", handleEngageDown);
    engageBtn.addEventListener("mouseup", handleEngageUp);
    mainDial.addEventListener("mouseenter", handleDialHover);
    emailInput.addEventListener("keydown", handleEmailKeydown);

    return () => {
      pwrBtn.removeEventListener("mousedown", handlePwrDown);
      pwrBtn.removeEventListener("mouseup", handlePwrUp);
      engageBtn.removeEventListener("mousedown", handleEngageDown);
      engageBtn.removeEventListener("mouseup", handleEngageUp);
      mainDial.removeEventListener("mouseenter", handleDialHover);
      emailInput.removeEventListener("keydown", handleEmailKeydown);
    };
  }, []);

  return (
    <div className="dock" id="dock">
      {/* HEADER */}
      <div className="dock-header">
        <div className="brand-block">
          <div className="engraved-title">Under Construction</div>
          <div className="engraved-sub">Hardware Prototype Dock · Rev. 1.0</div>
          <div className="led-strip" id="ledStrip">
            <div
              className="led"
              ref={(el) => {
                if (el) ledRefsArray.current[0] = el;
              }}
            ></div>
            <div
              className="led"
              ref={(el) => {
                if (el) ledRefsArray.current[1] = el;
              }}
            ></div>
            <div
              className="led"
              ref={(el) => {
                if (el) ledRefsArray.current[2] = el;
              }}
            ></div>
            <div
              className="led"
              ref={(el) => {
                if (el) ledRefsArray.current[3] = el;
              }}
            ></div>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.15em",
                color: "var(--color-text)",
                marginLeft: "4px",
                fontFamily: "var(--font-mono)",
                opacity: 0.6,
              }}
              ref={ledStatusRef}
            >
              SYS: OFFLINE
            </span>
          </div>
        </div>
        <div className="model-plate">
          <span className="model-id">HW-DOCK</span>
          <span className="model-id" style={{ marginTop: "2px" }}>
            MDL-Ø04
          </span>
          <span className="model-id" style={{ marginTop: "4px", opacity: 0.5 }}>
            CAL. 2025
          </span>
        </div>
      </div>

      {/* CENTER: LCD + DIAL */}
      <div className="dock-center">
        <div className="lcd-bay">
          <div className="lcd-label">System Readout</div>
          <div className="lcd-readout" ref={lcdMainRef}>
            —— IDLE ——<span className="cursor-blink active"></span>
          </div>
          <div
            className="lcd-readout"
            ref={lcdSubRef}
            style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}
          >
            AWAITING POWER CYCLE
          </div>
        </div>

        <div className="dial-wrapper">
          <div className="dial-label">Calibration</div>
          <div className="dial" ref={mainDialRef}>
            <div className="dial-ridges"></div>
            <div className="dial-inner">
              <div className="dial-pin"></div>
            </div>
          </div>
          <div className="dial-value" ref={dialValueRef}>
            000 / 100
          </div>
        </div>
      </div>

      {/* INPUT BAY */}
      <div className="input-bay-wrapper" ref={inputBayRef}>
        <div className="input-bay">
          <div className="email-input-wrap">
            <div className="input-sub-label">Subscriber Node ID (Email)</div>
            <input
              type="email"
              className="email-input"
              ref={emailInputRef}
              placeholder="AWAITING INPUT..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="input-error-msg" ref={errorMsgRef}>
              ERR: INVALID FORMAT — RE-ENTER NODE ID
            </div>
          </div>
          <div className="engage-btn" id="engageBtn">
            <div className="engage-cap" ref={engageCapRef}>
              <div className="engage-text">ENGAGE</div>
              <div className="engage-sub">// COMMIT</div>
            </div>
            <div
              style={{
                fontSize: "8px",
                color: "var(--color-text)",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-mono)",
                opacity: 0.6,
              }}
            >
              SW-02
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="dock-footer">
        <div className="vent-grille">
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
          <div className="vent-slot"></div>
        </div>

        <div className="serial-plate">
          SN: 2025-HW-00042 · PROTOTYPE UNIT · NOT FOR RESALE
        </div>

        <div className="power-controls">
          <div className="pwr-btn" ref={pwrBtnRef} title="Power On">
            <div className="pwr-icon"></div>
            <div className="pwr-label">PWR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
