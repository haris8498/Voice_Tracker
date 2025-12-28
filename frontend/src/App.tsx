// 🌟 Anti-Gravity Frontend - Feel the Magic
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

// 🎵 Simple sound effects (using Web Audio API beeps instead of external files)
const playSound = (type: 'success' | 'error' | 'click') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'success') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else if (type === 'error') {
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    } else {
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.log('Sound not available');
  }
};

// 🌈 Vibe Colors
const vibeColors: Record<string, string> = {
  chill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  productive: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  creative: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  energetic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  relaxed: 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
  focused: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
};

const HinglishVoiceWizard: React.FC = () => {
  const [currentVibe, setCurrentVibe] = useState('chill');
  const [status, setStatus] = useState('🎤 Ready for magic commands!');
  const [history, setHistory] = useState<Array<{ command: string, success: boolean }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const { transcript, resetTranscript, browserSupportsSpeechRecognition, listening } = useSpeechRecognition();

  // Check microphone permission on load
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(permissionStatus.state as any);
        
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state as any);
        };
      } catch (error) {
        console.log('Permission API not supported, will check on first use');
      }
    };
    checkMicPermission();
  }, []);

  const executeCommand = async (command: string) => {
    if (!command || command.trim().length < 3) {
      setStatus('Please say a valid command! 🎤');
      return;
    }

    setIsListening(false);
    SpeechRecognition.stopListening();
    playSound('click');

    setStatus(`Processing: "${command}"... ✨`);

    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, vibe: currentVibe })
      });

      const data = await response.json();

      setHistory(prev => [...prev.slice(-4), { command, success: data.success }]);

      if (data.success) {
        setStatus(data.message);
        playSound('success');

        // Vibe rotation on success
        const vibes = Object.keys(vibeColors);
        const nextVibe = vibes[(vibes.indexOf(currentVibe) + 1) % vibes.length];
        setCurrentVibe(nextVibe);
      } else {
        setStatus(data.message);
        playSound('error');
      }

      setTimeout(() => {
        resetTranscript();
        setStatus('🎤 Ready for next command!');
      }, 2000);
    } catch (error) {
      setStatus('❌ Network error! Check if backend is running on port 5000 🚀');
      playSound('error');
      console.error('Backend connection error:', error);
    }
  };

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsListening(true);
      playSound('click');
      resetTranscript();
      
      SpeechRecognition.startListening({
        language: 'en-IN',
        continuous: true
      });
      
      setStatus('🎤 Listening... Speak your command!');
    } catch (error) {
      console.error('Microphone access error:', error);
      setStatus('❌ Microphone access denied! Please allow microphone permission.');
      playSound('error');
      setMicPermission('denied');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    
    if (transcript && transcript.trim().length > 2) {
      executeCommand(transcript);
    } else {
      setStatus('No command detected. Try again! 🎤');
    }
  };

  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
    playSound('click');
  };

  const quickCommands = [
    'whatsapp kholo',
    'edge kholo',
    'youtube kholo',
    'notepad kholo',
    'spotify kholo'
  ];

  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{
        background: vibeColors[currentVibe],
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>⚠️ Browser Support Needed</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Your browser doesn't support speech recognition.</p>
          <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Please use:</p>
          <ul style={{ textAlign: 'left', fontSize: '1rem', lineHeight: '1.8' }}>
            <li>Google Chrome (Recommended)</li>
            <li>Microsoft Edge</li>
            <li>Safari (MacOS/iOS)</li>
          </ul>
          <p style={{ fontSize: '0.9rem', marginTop: '20px', opacity: 0.8 }}>
            Note: Make sure you're using HTTPS or localhost
          </p>
        </div>
      </div>
    );
  }

  if (micPermission === 'denied') {
    return (
      <div style={{
        background: vibeColors[currentVibe],
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎤 Microphone Access Required</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
            Voice commands need microphone access to work.
          </p>
          <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
            Please enable microphone permission in your browser settings and reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              background: 'rgba(255,255,255,0.3)',
              border: '2px solid white',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.1rem',
              cursor: 'pointer',
              backdropFilter: 'blur(5px)'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{
      background: vibeColors[currentVibe],
      minHeight: '100vh',
      transition: 'background 1s ease',
      padding: '20px'
    }}>
      {/* Floating Elements */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={toggleTutorial}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '50px',
            color: 'white',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)'
          }}
        >
          {showTutorial ? '❌' : '📚'} Tutorial
        </button>

        <div style={{
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '50px',
          color: 'white',
          backdropFilter: 'blur(5px)'
        }}>
          Vibe: {currentVibe} ✨
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '80px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            color: 'white',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🪄 Hinglish Voice Wizard
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '30px'
          }}>
            Bol kar apps kholo • Feel the anti-gravity coding vibes ✨
          </p>
        </div>

        {/* Tutorial Panel */}
        {showTutorial && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h2 style={{ color: 'white', marginBottom: '15px' }}>🎯 How to Use</h2>
            <ul style={{ color: 'rgba(255,255,255,0.9)', paddingLeft: '20px', marginBottom: '20px' }}>
              <li>Press and hold the mic button below</li>
              <li>Speak naturally in Hinglish</li>
              <li>Release to execute command</li>
              <li>Try clicking quick commands for instant magic</li>
              <li>Change your vibe with successful commands</li>
            </ul>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                color: 'white'
              }}>
                🎤 Say: "whatsapp kholo"
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                color: 'white'
              }}>
                🌐 Try: "edge open karo"
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                color: 'white'
              }}>
                🎵 Or: "spotify chalao"
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          backdropFilter: 'blur(5px)',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{
            color: 'white',
            fontSize: '1.3rem',
            margin: 0,
            textAlign: 'center'
          }}>
            {status}
          </p>
        </div>

        {/* Transcript Display */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          backdropFilter: 'blur(5px)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>
            🎙️ You said:
          </p>
          <p style={{
            color: 'white',
            fontSize: '1.5rem',
            minHeight: '40px',
            fontStyle: transcript ? 'normal' : 'italic',
            wordBreak: 'break-word'
          }}>
            {listening && !transcript ? "🎤 Listening..." : (transcript || "Waiting for your Hinglish command...")}
          </p>
        </div>

        {/* Mic Button */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: isListening
                ? 'radial-gradient(circle, #ff416c, #ff4b2b)'
                : 'radial-gradient(circle, #36d1dc, #5b86e5)',
              border: 'none',
              color: 'white',
              fontSize: '3rem',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              transform: isListening ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {isListening ? '🎤' : '🎙️'}
          </button>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '15px' }}>
            {isListening ? 'Listening... Release to execute' : 'Hold to speak'}
          </p>
        </div>

        {/* Quick Commands */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
            ⚡ Quick Commands
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => executeCommand(cmd)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50px',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '15px',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>📜 Recent Commands</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {history.slice().reverse().map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 16px',
                    background: item.success
                      ? 'rgba(72, 187, 120, 0.3)'
                      : 'rgba(245, 101, 101, 0.3)',
                    borderRadius: '50px',
                    color: 'white',
                    border: item.success
                      ? '1px solid rgba(72, 187, 120, 0.5)'
                      : '1px solid rgba(245, 101, 101, 0.5)'
                  }}
                >
                  {item.command.substring(0, 20)}...
                  <span style={{ marginLeft: '8px' }}>
                    {item.success ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '50px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem'
        }}>
          <p>Built with anti-gravity vibes ✨ | Just speak and apps will open! 🚀</p>
          <p style={{ marginTop: '10px' }}>
            Backend running on <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:5000</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HinglishVoiceWizard;
