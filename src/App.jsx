import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Search, Zap, CheckCircle2, XCircle, AlertCircle, 
  Loader2, Play, RotateCcw, Info, ArrowRight, Lock, ShieldCheck,
  Cpu, Server, Database, Globe, Terminal, HelpCircle
} from 'lucide-react';
import { demoTraces } from './data/demoTraces';
import './App.css';

// Helper function to get an icon representing the step based on its index/name
const getStepIcon = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('auth')) return <ShieldCheck className="w-4 h-4" />;
  if (lowercaseName.includes('rate') || lowercaseName.includes('limit')) return <Lock className="w-4 h-4" />;
  if (lowercaseName.includes('controller')) return <Cpu className="w-4 h-4" />;
  if (lowercaseName.includes('service')) return <Server className="w-4 h-4" />;
  if (lowercaseName.includes('db') || lowercaseName.includes('mongo') || lowercaseName.includes('postgres') || lowercaseName.includes('clickhouse')) return <Database className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
};

// Animated request network particle background (similar to Particles background from reactbits.dev)
function RequestNetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 45; // Subdued and lightweight

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2 + 1,
      });
    }

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      ctx.fillStyle = 'rgba(0, 245, 212, 0.18)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    />
  );
}

export default function App() {
  const [traceIdInput, setTraceIdInput] = useState('TS-4821');
  const [selectedTrace, setSelectedTrace] = useState(demoTraces[0]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1); // -1 means idle or not started
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepStates, setStepStates] = useState(
    demoTraces[0].steps.map(step => ({
      ...step,
      currentStatus: 'idle' // tracks dynamic runtime status: idle, running, success, failure, pending, blocked
    }))
  );
  
  const timerRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto scroll terminal to the bottom as new lines print
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [stepStates, activeStepIndex]);

  // Initialize step states when selected trace changes
  useEffect(() => {
    resetTraceState(selectedTrace);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedTrace]);

  // Main animation engine
  useEffect(() => {
    if (!isPlaying) return;

    if (activeStepIndex === -1) {
      // Start the very first step
      setActiveStepIndex(0);
      setStepStates(prev => {
        const next = [...prev];
        next[0] = { ...next[0], currentStatus: next[0].status === 'failure' && next[0].duration === 45 ? 'running' : 'running' };
        // We set first step running
        return next;
      });
      return;
    }

    const currentStep = selectedTrace.steps[activeStepIndex];
    
    // Simulate processing delay for each step
    const delay = 1200; // 1.2s per step for a smooth, watchable rhythm

    timerRef.current = setTimeout(() => {
      setStepStates(prev => {
        const next = [...prev];
        const targetStatus = currentStep.status; // success, failure, pending, blocked

        next[activeStepIndex] = {
          ...next[activeStepIndex],
          currentStatus: targetStatus
        };

        // If the step is successful and there is a next step, transition to next step
        if (targetStatus === 'success') {
          if (activeStepIndex < selectedTrace.steps.length - 1) {
            // Move to next step
            const nextIndex = activeStepIndex + 1;
            next[nextIndex] = {
              ...next[nextIndex],
              currentStatus: 'running'
            };
            setActiveStepIndex(nextIndex);
          } else {
            // Reached the end (all succeeded)
            setIsPlaying(false);
          }
        } 
        // If failed or pending, the chain stops and subsequent steps are blocked
        else if (targetStatus === 'failure' || targetStatus === 'pending') {
          for (let i = activeStepIndex + 1; i < selectedTrace.steps.length; i++) {
            next[i] = {
              ...next[i],
              currentStatus: 'blocked'
            };
          }
          setIsPlaying(false);
        }

        return next;
      });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, activeStepIndex, selectedTrace]);

  const resetTraceState = (trace) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setActiveStepIndex(-1);
    setStepStates(
      trace.steps.map(step => ({
        ...step,
        currentStatus: 'idle'
      }))
    );
  };

  const handleStartTrace = () => {
    // Find trace by ID
    const match = demoTraces.find(t => t.id.trim().toUpperCase() === traceIdInput.trim().toUpperCase());
    if (match) {
      setSelectedTrace(match);
      resetTraceState(match);
      // Give a tiny timeout before starting to let state reset cleanly
      setTimeout(() => {
        setIsPlaying(true);
      }, 50);
    } else {
      alert(`Trace ID "${traceIdInput}" not found in demo data. Please try TS-4821, TS-7319, or select a recent trace.`);
    }
  };

  const handleDemoGenerate = () => {
    // Pick a random trace from list
    const currentId = selectedTrace.id;
    const alternatives = demoTraces.filter(t => t.id !== currentId);
    // fallback to any if only 1, otherwise pick another to feel interactive
    const list = alternatives.length > 0 ? alternatives : demoTraces;
    const randomTrace = list[Math.floor(Math.random() * list.length)];
    
    setTraceIdInput(randomTrace.id);
    setSelectedTrace(randomTrace);
  };

  const handleSelectTrace = (trace) => {
    setTraceIdInput(trace.id);
    setSelectedTrace(trace);
    // Auto run on click from table
    setTimeout(() => {
      setIsPlaying(true);
    }, 50);
  };

  // Calculate stats for Summary Card
  const completedSteps = stepStates.filter(s => s.currentStatus === 'success');
  const isFailed = stepStates.some(s => s.currentStatus === 'failure');
  const isPending = stepStates.some(s => s.currentStatus === 'pending');
  const activeStep = activeStepIndex >= 0 ? stepStates[activeStepIndex] : null;

  // Compute total duration of completed steps
  const totalDuration = stepStates.reduce((acc, curr) => {
    if (curr.currentStatus === 'success' || curr.currentStatus === 'failure') {
      return acc + curr.duration;
    }
    return acc;
  }, 0);

  // Generate interactive explanation of what is going on
  const getTraceSummaryText = () => {
    if (activeStepIndex === -1 && !isPlaying) {
      return "Trace ready. Click 'Trace →' to initiate request flow diagnostics.";
    }
    if (isPlaying) {
      if (activeStep) {
        return `Step "${activeStep.name}" is currently active. Simulating processing latency (${activeStep.duration || 1000}ms)...`;
      }
      return "Trace execution running...";
    }
    
    if (isFailed) {
      const failedStep = stepStates.find(s => s.currentStatus === 'failure');
      return `Trace execution aborted at step: ${failedStep?.name || 'Unknown'}. The database/gateway reported errors, preventing further pipeline operations. Suggestions are detailed in the diagnostic logs below.`;
    }
    
    if (isPending) {
      const pendingStep = stepStates.find(s => s.currentStatus === 'pending');
      return `Trace execution suspended. Step: "${pendingStep?.name}" is taking too long to respond. The system is hovering in a pending state due to upstream blockages.`;
    }

    return `Trace completed successfully in ${totalDuration}ms. All 6 pipeline checkpoints returned HTTP 200/201 verification. Integrity verified.`;
  };

  return (
    <div className="app-container">
      <RequestNetworkBackground />
      
      {/* 1. Header Section */}
      <header className="app-header-row">
        <div className="logo-container">
          <Activity className="logo-icon" />
          <span>TraceStack</span>
        </div>
        <div className="dev-avatar-wrapper">
          <img src="/developer_glow.png" className="dev-avatar" alt="Developer Avatar" />
        </div>
      </header>

      {/* Tagline Container */}
      <div className="tagline-container">
        <p className="app-slogan">
          Understand every request. Find backend bottlenecks and connection anomalies before your users do.
        </p>
      </div>

      {/* 2. Search & Controls Capsule */}
      <section className="search-section">
        <div className="search-capsule">
          <div className="search-icon-left">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            className="search-input"
            value={traceIdInput}
            onChange={(e) => setTraceIdInput(e.target.value)}
            placeholder="Enter trace ID (e.g. TS-4821)"
            onKeyDown={(e) => { if (e.key === 'Enter') handleStartTrace(); }}
          />
          <button className="trace-button" onClick={handleStartTrace}>
            {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Trace →</span>
          </button>
        </div>
        
        <div className="demo-suggestions-wrapper">
          <span className="demo-btn-label">Or try demo traces:</span>
          {demoTraces.slice(0, 3).map(t => (
            <button 
              key={t.id} 
              className="demo-suggestion-chip"
              onClick={() => {
                setTraceIdInput(t.id);
                setSelectedTrace(t);
              }}
            >
              {t.id} ({t.endpoint})
            </button>
          ))}
          <button className="demo-random-btn" onClick={handleDemoGenerate}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Generate Demo ID</span>
          </button>
        </div>
      </section>

      {/* 3. Horizontal Step Visualizer */}
      <section className="visualizer-wrapper">
        <div className="timeline-row">
          {/* Connecting line */}
          <div className="timeline-track">
            {/* The fill percentage depends on completed step index */}
            <div 
              className="timeline-track-fill"
              style={{
                width: activeStepIndex === -1 
                  ? '0%' 
                  : `${(Math.max(0, stepStates.findIndex(s => s.currentStatus === 'running' || s.currentStatus === 'failure' || s.currentStatus === 'pending' || s.currentStatus === 'blocked') - 0.5) / 5) * 100}%`
              }}
            />
          </div>

          {stepStates.map((step, idx) => {
            let nodeClass = step.currentStatus; // idle, running, success, failure, pending, blocked
            
            return (
              <div 
                key={idx} 
                className={`timeline-step-node ${nodeClass}`}
                onClick={() => {
                  // Allow inspecting steps manually
                  setActiveStepIndex(idx);
                }}
              >
                {/* Duration displayed above step */}
                {(step.currentStatus === 'success' || step.currentStatus === 'failure') && (
                  <span className="step-node-time">
                    {step.currentStatus === 'success' ? '✓' : '✕'} {step.duration}ms
                  </span>
                )}
                {step.currentStatus === 'running' && (
                  <span className="step-node-time active">running</span>
                )}
                {step.currentStatus === 'pending' && (
                  <span className="step-node-time active">pending</span>
                )}

                <div className="step-circle">
                  {step.currentStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {step.currentStatus === 'failure' && <XCircle className="w-4 h-4" />}
                  {step.currentStatus === 'pending' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {step.currentStatus === 'idle' && <span>{idx + 1}</span>}
                  {step.currentStatus === 'running' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>}
                  {step.currentStatus === 'blocked' && <HelpCircle className="w-4 h-4 opacity-40" />}
                </div>

                <div className="step-node-name">{step.name}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom current step text */}
        <div className="visualizer-status-bar">
          <div className={`status-bar-indicator ${isPlaying ? 'active' : ''}`} />
          <span className="status-bar-text">
            {activeStepIndex === -1 
              ? "System Idle. Ready to initiate trace sequence."
              : isPlaying 
                ? `Executing step: ${stepStates[activeStepIndex]?.name}... Processing request payload.`
                : isFailed 
                  ? `Trace stopped at step: ${stepStates.find(s => s.currentStatus === 'failure')?.name}. Execution aborted.`
                  : isPending
                    ? `Trace pending: ${stepStates.find(s => s.currentStatus === 'pending')?.name} database cursor response.`
                    : "Trace sequence diagnostic complete."
            }
          </span>
        </div>
      </section>

      {/* 4. Left Grid and Right Summary Column */}
      <section className="dashboard-grid">
        
        {/* Left Side: 3x2 Step Grid */}
        <div className="premium-card">
          <div className="premium-card-header-tag">Pipeline Trace Detail</div>
          <h3>Stage Node Breakdown</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Comprehensive diagnostic information for each middleware validation and processor checkpoint.
          </p>

          <div className="grid-container">
            {stepStates.map((step, idx) => (
              <div 
                key={idx} 
                className={`grid-cell-card ${step.currentStatus}`}
              >
                <div className="grid-cell-header">
                  <span className="grid-cell-title">{step.name}</span>
                  <span className={`grid-cell-badge ${step.currentStatus}`}>
                    {step.currentStatus}
                  </span>
                </div>
                
                <div className="grid-cell-duration">
                  {step.currentStatus === 'success' && `Latency: ${step.duration}ms`}
                  {step.currentStatus === 'failure' && `Aborted: ${step.duration}ms`}
                  {step.currentStatus === 'running' && 'Processing...'}
                  {step.currentStatus === 'pending' && 'Awaiting response...'}
                  {step.currentStatus === 'idle' && 'Idle'}
                  {step.currentStatus === 'blocked' && 'Blocked'}
                </div>

                <div className="grid-cell-log-wrapper">
                  <p className="grid-cell-log">
                    {step.currentStatus === 'idle' || step.currentStatus === 'blocked'
                      ? "Awaiting trace execution to capture stack frames."
                      : step.log
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Developer Summary Card */}
        <div className="summary-container">
          <div className={`premium-card ${isFailed ? 'active-glow' : ''}`} style={{ height: '100%' }}>
            <div className="premium-card-header-tag" style={{ background: isFailed ? 'rgba(255, 82, 82, 0.2)' : 'var(--card-light-bg)', color: isFailed ? 'var(--failure)' : 'var(--card-light-text)' }}>
              Developer Summary
            </div>
            
            <div className="summary-metric-row">
              <div>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Runtime</h4>
                <div className="summary-metric-val">
                  {isFailed || isPending ? 'N/A (Stopped)' : `${totalDuration} ms`}
                </div>
              </div>
              <div>
                <span className={`summary-status-tag ${isFailed ? 'failure' : isPending ? 'pending' : activeStepIndex === -1 ? 'idle' : 'success'}`}>
                  {isFailed ? 'FAILED' : isPending ? 'PENDING' : activeStepIndex === -1 ? 'IDLE' : 'COMPLETED'}
                </span>
              </div>
            </div>

            <div className="summary-insights-box">
              <div className="summary-insights-title">
                <Info className="w-4 h-4 text-teal-400" />
                <span>Diagnostic Context</span>
              </div>
              <p className="summary-insights-text">
                {getTraceSummaryText()}
              </p>
            </div>

            <h4 style={{ fontSize: '13px', margin: '16px 0 8px', color: 'var(--text-secondary)' }}>Diagnostic Logs</h4>
            <div className="summary-terminal" ref={terminalRef}>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span> tracestack init --id={selectedTrace.id}
              </div>
              <div className="terminal-line">
                Initializing frame trace for request [{selectedTrace.method}] {selectedTrace.endpoint}
              </div>
              {stepStates.map((step, idx) => {
                if (step.currentStatus === 'idle' || step.currentStatus === 'blocked') return null;
                
                let prefix = "[INFO]";
                if (step.currentStatus === 'failure') prefix = "[ERROR]";
                if (step.currentStatus === 'pending') prefix = "[WARN]";
                
                return (
                  <div key={idx} className="terminal-line" style={{ color: step.currentStatus === 'failure' ? 'var(--failure)' : step.currentStatus === 'pending' ? 'var(--warning)' : 'inherit' }}>
                    {prefix} {step.name}: {step.log}
                  </div>
                );
              })}
              {!isPlaying && !isFailed && !isPending && activeStepIndex !== -1 && (
                <div className="terminal-line" style={{ color: 'var(--accent)' }}>
                  [SUCCESS] Trace diagnostic finished with 0 errors.
                </div>
              )}
              {isFailed && (
                <div className="terminal-line" style={{ color: 'var(--failure)' }}>
                  [FATAL] Execution aborted. Review gateway configuration and key expiration timelines.
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* 5. Recent Traces Bar */}
      <section className="premium-card recent-traces-card">
        <div className="premium-card-header-tag">Historical Records</div>
        <h3>Recent System Traces</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Click on any record below to run its request trace simulation.
        </p>

        <table className="recent-traces-table">
          <thead>
            <tr>
              <th>Trace ID</th>
              <th>Method & Endpoint</th>
              <th>Diagnostic Status</th>
              <th>Stages</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {demoTraces.map(t => {
              let statusLabel = "Success";
              let statusClass = "success";
              if (t.status === "failure") { statusLabel = "Failed"; statusClass = "failure"; }
              if (t.status === "pending") { statusLabel = "Pending"; statusClass = "pending"; }
              if (t.status === "warning") { statusLabel = "Slow DB"; statusClass = "warning"; }

              return (
                <tr key={t.id}>
                  <td>
                    <span className="recent-trace-id" onClick={() => handleSelectTrace(t)}>
                      {t.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', marginRight: '8px', color: t.method === 'POST' ? '#ffd166' : '#4cc9f0' }}>
                      {t.method}
                    </span>
                    <span className="recent-trace-endpoint">{t.endpoint}</span>
                  </td>
                  <td>
                    <span className="recent-trace-status">
                      <span className={`status-dot ${statusClass}`} />
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {t.steps[0].name} → ... → {t.steps[t.steps.length - 1].name}
                  </td>
                  <td>
                    <button 
                      className="demo-suggestion-chip" 
                      style={{ padding: '4px 12px', border: '1px solid var(--border-light)' }}
                      onClick={() => handleSelectTrace(t)}
                    >
                      Run Simulation
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Footer footer-note */}
      <footer style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        TraceStack Inc. &copy; 2026. Made with calm CSS & developer-focused aesthetics.
      </footer>
    </div>
  );
}
