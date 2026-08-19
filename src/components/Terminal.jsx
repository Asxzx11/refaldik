import React, { useState, useRef, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import './Terminal.css';

export default function Terminal({ toggleTheme }) {
  const { personal, skills, projects, experience } = portfolioData;

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    {
      type: 'system',
      text: 'Selamat datang di Interactive Dev Terminal v2.4! Ketik "help" atau klik tombol perintah cepat di bawah.',
    },
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (rawCmd) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    // Add to history
    setCommandHistory((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);

    const newHistory = [...history, { type: 'input', text: rawCmd }];

    switch (cmd) {
      case 'help':
        newHistory.push({
          type: 'output',
          text: `Perintah yang tersedia:\n• help       : Menampilkan daftar perintah\n• about      : Ringkasan profil & biodata\n• skills     : Daftar teknologi & keahlian\n• projects   : Proyek unggulan yang telah dibuat\n• experience : Ringkasan pengalaman kerja\n• contact    : Info email, WA, dan sosial media\n• hire       : Status ketersediaan untuk proyek baru\n• theme      : Mengganti tema (Dark / Light)\n• quote      : Menampilkan kutipan developer hari ini\n• date       : Waktu lokal sistem saat ini\n• clear      : Membersihkan riwayat layar terminal`,
        });
        break;

      case 'about':
        newHistory.push({
          type: 'output',
          text: `[PROFIL DEVELOPER]\nNama     : ${personal.name} (${personal.nickName})\nPeran    : ${personal.role}\nLokasi   : ${personal.location}\nTagline  : "${personal.tagline}"\nStatus   : ${personal.status}`,
        });
        break;

      case 'skills': {
        const topSkills = skills.items.map((s) => `${s.name} (${s.level}%)`).join(', ');
        newHistory.push({
          type: 'output',
          text: `[KEAHLIAN UTAMA]\n${topSkills}`,
        });
        break;
      }

      case 'projects': {
        const projectList = projects
          .map((p, i) => `${i + 1}. ${p.title} [${p.category}]\n   Tech: ${p.tags.join(', ')}`)
          .join('\n\n');
        newHistory.push({
          type: 'output',
          text: `[PROYEK UNGGULAN]\n${projectList}`,
        });
        break;
      }

      case 'experience': {
        const expList = experience
          .map((e) => `• ${e.role} @ ${e.company} (${e.period})\n  Lokasi: ${e.location}`)
          .join('\n\n');
        newHistory.push({
          type: 'output',
          text: `[PENGALAMAN KERJA]\n${expList}`,
        });
        break;
      }

      case 'contact':
        newHistory.push({
          type: 'output',
          text: `[INFO KONTAK]\nEmail    : ${personal.email}\nWhatsApp : ${personal.whatsapp}\nLokasi   : ${personal.location}\nGitHub   : https://github.com\nLinkedIn : https://linkedin.com`,
        });
        break;

      case 'hire':
        newHistory.push({
          type: 'output',
          text: `[STATUS KETERSEDIAAN]\nStatus: ${personal.status}\nSaya siap membantu mewujudkan aplikasi web impian Anda dengan standar kualitas tertinggi. Hubungi saya di: ${personal.email}`,
        });
        break;

      case 'theme':
        toggleTheme();
        newHistory.push({
          type: 'output',
          text: `Tema berhasil diubah! 🌓`,
        });
        break;

      case 'quote':
        newHistory.push({
          type: 'output',
          text: `"Simplicity is prerequisite for reliability." – Edsger W. Dijkstra`,
        });
        break;

      case 'date':
        newHistory.push({
          type: 'output',
          text: `Waktu sistem: ${new Date().toLocaleString('id-ID')}`,
        });
        break;

      case 'sudo':
        newHistory.push({
          type: 'output',
          text: `Access Denied: You are already a super guest! But you can still hire me :)`,
        });
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        newHistory.push({
          type: 'error',
          text: `Command not found: "${rawCmd}". Ketik "help" untuk melihat daftar perintah yang tersedia.`,
        });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx =
          historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setInputVal(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  const executeQuickCommand = (cmd) => {
    handleCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <section id="terminal" className="section terminal-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>💻</span>
            <span>Developer Sandbox</span>
          </div>
          <h2 className="section-title">
            Interactive <span className="gradient-text">Dev Terminal</span>
          </h2>
          <p className="section-subtitle">
            Ingin eksplorasi dengan cara geeky? Ketik perintah CLI di bawah untuk mengetahui profil, skill, dan proyek saya secara langsung.
          </p>
        </div>

        {/* Terminal Container */}
        <div className="terminal-wrapper glass-card">
          {/* Terminal Window Bar */}
          <div className="terminal-topbar">
            <div className="terminal-controls">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="terminal-window-title">guest@alex-portfolio:~ (bash)</div>
            <div className="terminal-actions-right">
              <button
                type="button"
                className="terminal-clear-btn"
                onClick={() => setHistory([])}
                title="Bersihkan Terminal"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Terminal Screen */}
          <div
            className="terminal-body"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((item, idx) => (
              <div key={idx} className={`terminal-line line-${item.type}`}>
                {item.type === 'input' ? (
                  <div className="prompt-row">
                    <span className="terminal-user">guest@alex-portfolio</span>
                    <span className="terminal-path">:~$</span>
                    <span className="terminal-cmd-text">{item.text}</span>
                  </div>
                ) : (
                  <pre className="terminal-output-text">{item.text}</pre>
                )}
              </div>
            ))}

            {/* Current Active Input Prompt */}
            <div className="prompt-row active-input-row">
              <span className="terminal-user">guest@alex-portfolio</span>
              <span className="terminal-path">:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoComplete="off"
                spellCheck="false"
                aria-label="Terminal input prompt"
              />
            </div>
            <div ref={terminalEndRef} />
          </div>

          {/* Quick Command Buttons Toolbar */}
          <div className="terminal-quick-bar">
            <span className="quick-label">Perintah Cepat:</span>
            <div className="quick-buttons">
              {['help', 'about', 'skills', 'projects', 'experience', 'contact', 'hire', 'theme', 'clear'].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    className="quick-cmd-btn"
                    onClick={() => executeQuickCommand(c)}
                  >
                    ${c}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
