import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Zap, BookOpen, Volume2, Copy, Check, Brain, Target, Flame } from 'lucide-react';

export default function JapaneseLearningChatbot() {
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'あ、こんにちは！今日も日本語で話しかけてね。なんでも気軽に話しかけてよ～😊',
      korean: '어, 안녕! 오늘도 일본어로 말 걸어줘. 뭐든 편하게 얘기해~',
      analysis: {
        grammar: ['～てね (부탁/권유의 가벼운 표현)', '気軽に (부담 없이, 편하게)'],
        vocabulary: ['話しかける (말을 걸다)', '気軽 (기가루 — 부담 없이, 편안히)'],
        tips: []
      },
      timestamp: new Date(),
      showKorean: false
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalChats: 1,
    dailyStreak: 1,
    xp: 0,
    immersionScore: 75
  });

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: '아침 인사 말하기', desc: '일본어로 자연스럽게 인사해보세요', completed: false, xp: 50 },
    { id: 2, title: '오늘 있었던 일 얘기하기', desc: '오늘 뭐 했는지 일본어로 말해보세요', completed: false, xp: 75 },
    { id: 3, title: '감정 표현해보기', desc: '지금 기분이나 느낌을 일본어로 표현해봐요', completed: false, xp: 100 }
  ]);

  const [immersionMode, setImmersionMode] = useState(true);
  const [showAllKorean, setShowAllKorean] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 대화 히스토리를 자연스러운 형태로 구성
  const buildConversationHistory = () => {
    return messages.slice(-8).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  };

  const generateNaturalPrompt = (userMessage) => {
    const history = messages.slice(-6).map(m =>
      `${m.role === 'user' ? '학습자' : 'AI 친구'}: ${m.content}`
    ).join('\n');

    return `당신은 한국어를 모국어로 하는 일본어 학습자의 일본인 친구입니다.

【핵심 역할】
- 진짜 일본인 친구처럼 자연스럽게 대화
- 상대방의 말투를 그대로 따라감:
  → 상대가 반말/캐주얼하게 쓰면 → だよね, ね～, じゃん, マジ?, まぁ 같은 구어체 사용
  → 상대가 ～ます/～です 체로 정중하게 쓰면 → 정중하게 대답
  → 상대가 섞어 씀 → 편안하게 중간 톤으로
- 억지로 가르치려 하지 말고, 대화가 먼저. 문법 설명은 자연스럽게 뒤에 붙임
- 필요하면 슬랭, 줄임말, 감탄사 자유롭게 (えー！, あー、そうなんだ, マジかー, なんか, ちょっと 등)
- 상대방이 틀린 일본어를 써도 자연스럽게 고쳐주거나 흘려넘기며 대화 이어가기
- 질문을 통해 대화 이어가기 (진짜 친구처럼)

【응답 형식 — 반드시 지킬 것】
다음 형식으로만 응답 (다른 형식 사용 금지):

RESPONSE:
(자연스러운 일본어 대화 — [일본어]: 같은 태그 없이 바로 씀)

KOREAN:
(한국어로 간단히 뜻 전달 — 직역 말고 자연스러운 한국어로)

GRAMMAR:
(사용된 문법 패턴 1-2개. 예: ～じゃない (부정/동의 구하기), ～てるの (진행형 구어체) )

VOCAB:
(새 단어나 표현 1-2개. 예: マジで (진짜로, 슬랭), なんか (뭔가, 구어체) )

【이전 대화 맥락】
${history}

【지금 학습자 메시지】
"${userMessage}"

자연스럽게 대화 이어가세요!`;
  };

  const parseResponse = (text) => {
    const responseMatch = text.match(/RESPONSE:\s*([\s\S]*?)(?=KOREAN:|$)/);
    const koreanMatch = text.match(/KOREAN:\s*([\s\S]*?)(?=GRAMMAR:|$)/);
    const grammarMatch = text.match(/GRAMMAR:\s*([\s\S]*?)(?=VOCAB:|$)/);
    const vocabMatch = text.match(/VOCAB:\s*([\s\S]*?)$/);

    const japaneseText = responseMatch ? responseMatch[1].trim() : text;
    const koreanText = koreanMatch ? koreanMatch[1].trim() : '';

    const grammar = grammarMatch
      ? grammarMatch[1].trim().split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
      : [];
    const vocabulary = vocabMatch
      ? vocabMatch[1].trim().split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
      : [];

    return {
      japanese: japaneseText,
      korean: koreanText,
      analysis: { grammar, vocabulary, tips: [] }
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = buildConversationHistory();

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `당신은 한국어 사용자의 일본인 친구입니다. 진짜 일본인처럼 자연스럽게 대화하세요.
상대의 말투(반말/존댓말/캐주얼)를 그대로 따라가고, 슬랭도 자유롭게 사용하세요.
억지로 가르치려 하지 말고, 먼저 진짜 대화를 하세요.
반드시 RESPONSE: / KOREAN: / GRAMMAR: / VOCAB: 형식으로만 응답하세요.`,
          messages: [
            ...history,
            {
              role: 'user',
              content: generateNaturalPrompt(input)
            }
          ]
        })
      });

      const data = await response.json();
      const assistantRaw = data.content[0].text;
      const parsed = parseResponse(assistantRaw);

      const newMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: parsed.japanese,
        korean: parsed.korean,
        analysis: parsed.analysis,
        timestamp: new Date(),
        showKorean: false
      };

      setMessages(prev => [...prev, newMessage]);
      setStats(prev => ({
        ...prev,
        totalChats: prev.totalChats + 1,
        xp: prev.xp + 15,
        immersionScore: Math.min(100, prev.immersionScore + 1)
      }));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'あ、ちょっと繋がらなかった～。もう一回送ってみて！',
        korean: '어, 잠깐 연결이 안 됐어~. 다시 한 번 보내봐!',
        analysis: { grammar: [], vocabulary: [], tips: [] },
        timestamp: new Date(),
        showKorean: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakJapanese = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleKorean = (id) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, showKorean: !msg.showKorean } : msg
      )
    );
  };

  const resetChat = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: 'あ、こんにちは！今日も日本語で話しかけてね。なんでも気軽に話しかけてよ～😊',
      korean: '어, 안녕! 오늘도 일본어로 말 걸어줘. 뭐든 편하게 얘기해~',
      analysis: {
        grammar: ['～てね (부탁/권유의 가벼운 표현)', '気軽に (부담 없이, 편하게)'],
        vocabulary: ['話しかける (말을 걸다)', '気軽 (기가루 — 부담 없이, 편안히)'],
        tips: []
      },
      timestamp: new Date(),
      showKorean: false
    }]);
    setStats({ totalChats: 1, dailyStreak: 1, xp: 0, immersionScore: 75 });
  };

  // ─── STYLES ───────────────────────────────────────────────
  const gradientBg = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  const accentColor = '#e94560';
  const accentSoft = 'rgba(233, 69, 96, 0.15)';
  const glassPanel = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(12px)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: gradientBg,
      fontFamily: '"Noto Sans JP", "Noto Sans KR", sans-serif',
      padding: '12px',
      color: '#eee'
    }}>

      {/* ── HEADER ── */}
      <header style={{
        ...glassPanel,
        padding: '18px 24px',
        borderRadius: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            日本語 友達モード 🇯🇵
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.6 }}>
            친구처럼 대화하며 자연스러운 일본어 흡수
          </p>
        </div>

        {/* Mode toggles */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setImmersionMode(!immersionMode)}
            style={{
              padding: '7px 14px',
              background: immersionMode ? accentColor : 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              transition: 'all 0.25s'
            }}
          >
            {immersionMode ? '🎯 이머션 ON' : '📖 이머션 OFF'}
          </button>

          <button
            onClick={() => setShowAllKorean(!showAllKorean)}
            style={{
              padding: '7px 14px',
              background: showAllKorean ? '#f0a500' : 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              transition: 'all 0.25s'
            }}
          >
            {showAllKorean ? '🇰🇷 번역 ON' : '🇰🇷 번역 OFF'}
          </button>

          <button
            onClick={resetChat}
            style={{
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px' }} />
            초기화
          </button>
        </div>
      </header>

      {/* ── TAB NAV ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'chat', label: '💬 대화' },
          { id: 'missions', label: '⚡ 미션' },
          { id: 'immersion', label: '🧠 이머션' },
          { id: 'stats', label: '📊 통계' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '9px 18px',
              background: tab === t.id ? accentColor : 'rgba(255,255,255,0.07)',
              color: 'white',
              border: tab === t.id ? 'none' : '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: tab === t.id ? '700' : '500',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '12px'
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          ...glassPanel,
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '72vh'
        }}>

          {/* ════ CHAT TAB ════ */}
          {tab === 'chat' && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '82%',
                      padding: '13px 16px',
                      borderRadius: msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      background: msg.role === 'user'
                        ? `linear-gradient(135deg, ${accentColor} 0%, #c62a47 100%)`
                        : 'rgba(255,255,255,0.09)',
                      color: '#f0f0f0',
                      fontSize: '15px',
                      lineHeight: '1.65',
                      wordBreak: 'break-word',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.12)'
                    }}>
                      {/* Main Japanese text */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                      {/* Korean translation */}
                      {msg.role === 'assistant' && msg.korean && (
                        <>
                          {(showAllKorean || msg.showKorean) && (
                            <div style={{
                              fontSize: '13px',
                              color: '#aaa',
                              background: 'rgba(0,0,0,0.2)',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              marginTop: '10px',
                              borderLeft: `3px solid ${accentColor}`,
                              fontStyle: 'italic'
                            }}>
                              📝 {msg.korean}
                            </div>
                          )}
                          {!immersionMode && !showAllKorean && (
                            <button
                              onClick={() => toggleKorean(msg.id)}
                              style={{
                                fontSize: '12px',
                                background: accentSoft,
                                color: '#ff7096',
                                border: `1px solid ${accentColor}40`,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '8px'
                              }}
                            >
                              {msg.showKorean ? '번역 숨기기 ↑' : '번역 보기 →'}
                            </button>
                          )}
                        </>
                      )}

                      {/* Grammar / Vocab analysis */}
                      {msg.role === 'assistant' && msg.analysis && (
                        (msg.analysis.grammar?.length > 0 || msg.analysis.vocabulary?.length > 0) && (
                          <div style={{
                            marginTop: '12px',
                            paddingTop: '10px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '12px'
                          }}>
                            {msg.analysis.grammar?.length > 0 && (
                              <div style={{ marginBottom: '6px' }}>
                                <span style={{ color: '#7eb8f7', fontWeight: '700' }}>📚 문법</span>
                                {msg.analysis.grammar.map((g, i) => (
                                  <div key={i} style={{ marginLeft: '10px', color: '#bbb', marginTop: '3px' }}>
                                    · {g}
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.analysis.vocabulary?.length > 0 && (
                              <div>
                                <span style={{ color: '#b07ef7', fontWeight: '700' }}>💡 어휘</span>
                                {msg.analysis.vocabulary.map((v, i) => (
                                  <div key={i} style={{ marginLeft: '10px', color: '#bbb', marginTop: '3px' }}>
                                    · {v}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Controls row */}
                      {msg.role === 'assistant' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            onClick={() => speakJapanese(msg.content)}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#ccc',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Volume2 size={12} /> 발음
                          </button>
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#ccc',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            복사
                          </button>
                        </div>
                      )}

                      <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '6px' }}>
                        {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {loading && (
                  <div style={{ display: 'flex', gap: '5px', padding: '12px 16px', width: 'fit-content' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: accentColor,
                        animation: 'pulse 1.2s infinite',
                        animationDelay: `${i * 0.2}s`
                      }} />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '14px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="일본어로 자유롭게 말해봐요 (예: 今日、疲れたな～)"
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#eee',
                      outline: 'none',
                    }}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    style={{
                      padding: '12px 20px',
                      background: loading || !input.trim() ? 'rgba(255,255,255,0.1)' : accentColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={15} /> 전송
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  💡 반말도 OK! 존댓말도 OK! 그냥 일본어로 편하게 말해봐요
                </div>
              </div>
            </>
          )}

          {/* ════ MISSIONS TAB ════ */}
          {tab === 'missions' && (
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800' }}>
                ⚡ 오늘의 미션
              </h2>
              {dailyMissions.map(mission => (
                <div
                  key={mission.id}
                  onClick={() => {
                    setDailyMissions(prev =>
                      prev.map(m => m.id === mission.id ? { ...m, completed: !m.completed } : m)
                    );
                    if (!mission.completed) {
                      setStats(prev => ({ ...prev, xp: prev.xp + mission.xp }));
                    }
                  }}
                  style={{
                    padding: '16px',
                    background: mission.completed ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${mission.completed ? '#4caf50' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: mission.completed ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '22px', height: '22px',
                      borderRadius: '50%',
                      background: mission.completed ? '#4caf50' : 'rgba(255,255,255,0.1)',
                      border: `2px solid ${mission.completed ? '#4caf50' : 'rgba(255,255,255,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', flexShrink: 0
                    }}>
                      {mission.completed ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '700', fontSize: '15px',
                        textDecoration: mission.completed ? 'line-through' : 'none',
                        color: mission.completed ? '#888' : '#eee',
                        marginBottom: '4px'
                      }}>
                        {mission.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#777' }}>{mission.desc}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0a500' }}>
                      +{mission.xp} XP
                    </div>
                  </div>
                </div>
              ))}
              <div style={{
                padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: '700',
                background: dailyMissions.every(m => m.completed)
                  ? 'linear-gradient(135deg, #4caf50, #66bb6a)'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginTop: '8px'
              }}>
                {dailyMissions.filter(m => m.completed).length}/{dailyMissions.length} 완료
                {dailyMissions.every(m => m.completed) && (
                  <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.9 }}>
                    🎉 오늘 모든 미션 완료! 보너스 +50 XP!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ IMMERSION TAB ════ */}
          {tab === 'immersion' && (
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800' }}>
                🧠 이머션 학습법
              </h2>

              {[
                {
                  color: '#7eb8f7', bg: 'rgba(126,184,247,0.1)',
                  title: '이머션 학습이란?',
                  content: '한국어 번역에 의존하지 않고 일본어 자체로 생각하는 학습법이에요. 처음엔 조금 어렵지만 훨씬 빠르게 배울 수 있어요.'
                },
                {
                  color: '#b07ef7', bg: 'rgba(176,126,247,0.1)',
                  title: '🎯 이머션 모드 ON',
                  content: '한국어 번역이 자동으로 숨겨져요. 일본어 자체만으로 상황을 이해하도록 훈련해요.'
                },
                {
                  color: '#f0a500', bg: 'rgba(240,165,0,0.1)',
                  title: '📖 번역 보기 모드',
                  content: '이해가 안 될 때만 번역 버튼을 눌러 확인해요. 항상 일본어를 먼저 읽는 게 포인트!'
                },
                {
                  color: '#4caf50', bg: 'rgba(76,175,80,0.1)',
                  title: '💡 이머션 팁',
                  content: '문맥으로 단어 뜻 유추하기 → 모르는 단어 넘어가기 → 같은 표현 반복해서 자연스럽게 익히기. 한 달이면 놀라운 변화가!'
                }
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '16px', background: item.bg,
                  borderLeft: `4px solid ${item.color}`,
                  borderRadius: '10px', marginBottom: '14px'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: item.color, fontSize: '15px' }}>{item.title}</h3>
                  <p style={{ margin: 0, color: '#bbb', fontSize: '14px', lineHeight: '1.7' }}>{item.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* ════ STATS TAB ════ */}
          {tab === 'stats' && (
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800' }}>
                📊 학습 통계
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: '총 경험치 (XP)', value: stats.xp, gradient: `linear-gradient(135deg, ${accentColor}, #c62a47)` },
                  { label: '연속 일수', value: `${stats.dailyStreak} 🔥`, gradient: 'linear-gradient(135deg, #ff9800, #ff5722)' },
                  { label: '대화 수', value: stats.totalChats, gradient: 'linear-gradient(135deg, #4caf50, #2196f3)' },
                  { label: '이머션 점수', value: `${stats.immersionScore}%`, gradient: 'linear-gradient(135deg, #f0a500, #ff9800)' }
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '20px', background: s.gradient,
                    borderRadius: '12px', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '8px', fontWeight: '600' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '800' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700' }}>
                  📈 다음 레벨까지
                </h3>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${accentColor}, #f0a500)`,
                    width: `${(stats.xp % 500) / 5}%`,
                    transition: 'width 0.4s ease',
                    borderRadius: '5px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>
                  {stats.xp % 500} / 500 XP
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(126,184,247,0.08)', borderLeft: `4px solid #7eb8f7`, borderRadius: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#7eb8f7', fontSize: '14px', fontWeight: '700' }}>
                  💡 학습 방향
                </h3>
                <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.8' }}>
                  <p style={{ margin: '0 0 6px 0' }}>🎯 <strong style={{ color: '#ddd' }}>목표:</strong> 자연스러운 일상 대화</p>
                  <p style={{ margin: '0 0 6px 0' }}>⚡ <strong style={{ color: '#ddd' }}>방법:</strong> 매일 20분 친구처럼 대화</p>
                  <p style={{ margin: 0 }}>📚 <strong style={{ color: '#ddd' }}>포인트:</strong> 문법보다 감각으로 익히기</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Tone Guide */}
          <div style={{ ...glassPanel, padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontWeight: '700' }}>
              🎭 말투 감지
            </div>
            <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>😊</span>
                <span><strong style={{ color: '#eee' }}>반말/캐주얼</strong><br/>
                  <span style={{ fontSize: '12px', color: '#888' }}>だよね, じゃん, ね～</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🎩</span>
                <span><strong style={{ color: '#eee' }}>존댓말/공식</strong><br/>
                  <span style={{ fontSize: '12px', color: '#888' }}>～ます, ～です, ～でしょうか</span>
                </span>
              </div>
            </div>
          </div>

          {/* Useful phrases */}
          <div style={{ ...glassPanel, padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontWeight: '700' }}>
              💬 자주 쓰는 표현
            </div>
            {[
              { jp: 'マジ？', kr: '진짜?' },
              { jp: 'なんか…', kr: '뭔가…' },
              { jp: 'そうなんだ', kr: '그렇구나' },
              { jp: 'えー！', kr: '에에~!' },
              { jp: 'ちょっと待って', kr: '잠깐만' },
              { jp: 'わかる！', kr: '알아! (공감)' }
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#f0e6ff' }}>{p.jp}</span>
                <span style={{ fontSize: '12px', color: '#777' }}>{p.kr}</span>
              </div>
            ))}
          </div>

          {/* Immersion tips */}
          <div style={{
            background: `linear-gradient(135deg, ${accentColor}22, #7eb8f722)`,
            border: `1px solid ${accentColor}33`,
            padding: '14px',
            borderRadius: '14px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: accentColor, marginBottom: '10px' }}>
              🎯 이머션 가이드
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong style={{ color: '#ddd' }}>✓ 번역 없이 이해:</strong> 문맥으로 파악</p>
              <p style={{ margin: '0 0 6px 0' }}><strong style={{ color: '#ddd' }}>✓ 모르면 넘어가기:</strong> 흐름 유지</p>
              <p style={{ margin: 0 }}><strong style={{ color: '#ddd' }}>✓ 반복이 답:</strong> 자꾸 쓰면 몸에 배요</p>
            </div>
          </div>

          {/* Today's goal */}
          <div style={{
            background: 'linear-gradient(135deg, #f0a500, #ff9800)',
            padding: '14px', borderRadius: '14px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>🔥 오늘의 목표</div>
            <div style={{ fontSize: '12px', lineHeight: '1.8', opacity: 0.95 }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>20분</strong> 대화하기</p>
              <p style={{ margin: '0 0 4px 0' }}>미션 1개 이상 완료</p>
              <p style={{ margin: 0 }}>새 표현 2개 기억하기</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(233,69,96,0.5); }
      `}</style>
    </div>
  );
}