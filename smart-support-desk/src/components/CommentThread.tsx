import { useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import { apiFetch } from '../services/api';
import { useToastContext } from '../context/ToastContext';

interface Comment {
  _id?: string;
  id?: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
}

interface CurrentUser {
  id?: string;
  _id?: string;
  name?: string;
  role?: string;
}

interface CommentThreadProps {
  ticketId: string;
  currentUser: CurrentUser | null;
  ticketTitle?: string;
  ticketDescription?: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentThread({ ticketId, currentUser, ticketTitle, ticketDescription }: CommentThreadProps) {
  const { showToast } = useToastContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id || currentUser?._id;

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    if (!ticketId) return;
    let isMounted = true;

    const load = async () => {
      try {
        const res = await apiFetch(`/tickets/${ticketId}/comments`);
        if (!res || !res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setComments(Array.isArray(data) ? data : []);
        setTimeout(scrollToBottom, 0);
      } catch (e) {
        // keep silent
      }
    };

    load();
    return () => { isMounted = false; };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments.length]);

  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [comments]);

  const suggestReply = async () => {
    setSuggesting(true);
    try {
      const res = await apiFetch('/ai/suggest-reply', {
        method: 'POST',
        body: JSON.stringify({
          ticketTitle: ticketTitle || 'Support Ticket',
          ticketDescription: ticketDescription || '',
          comments: sortedComments
        })
      });
      if (!res || !res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessage(data.suggestion);
      showToast('AI suggestion added!', 'success');
    } catch (e) {
      showToast('Could not get AI suggestion', 'error');
    } finally {
      setSuggesting(false);
    }
  };

  const onSend = async () => {
    const text = message.trim();
    if (!text) return;

    const optimistic: Comment = {
      id: `tmp-${Date.now()}`,
      ticketId,
      userId: currentUserId || '',
      userName: currentUser?.name || 'User',
      userRole: currentUser?.role || 'employee',
      message: text,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, optimistic]);
    setMessage('');
    showToast('Message sent', 'success');

    try {
      const res = await apiFetch(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          userId: currentUserId,
          userName: currentUser?.name,
          userRole: currentUser?.role,
        }),
      });

      if (!res || !res.ok) return;
      const saved: Comment = await res.json();
      setComments(prev => {
        const next = [...prev];
        const idx = next.findIndex(c => (c.id || c._id) === optimistic.id);
        if (idx !== -1) next[idx] = saved;
        return next;
      });
    } catch (e) {
      // keep optimistic message
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#4B6B63',
        fontWeight: 600,
        marginBottom: 12
      }}>
        Conversation
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 6 }}>
        {sortedComments.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            color: '#8FA89F', fontSize: '13px',
          }}>
            No messages yet. Start the conversation.
          </div>
        ) : (
          sortedComments.map((comment, idx) => {
            const isMine = !!currentUserId &&
              comment.userId?.toString() === currentUserId?.toString();
            const key = comment._id || comment.id || `${comment.createdAt}-${idx}`;

            if (isMine) {
              return (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      background: '#0E7C6B',
                      color: 'white',
                      borderRadius: '12px 12px 2px 12px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      maxWidth: '280px',
                      lineHeight: 1.5
                    }}>
                      {comment.message}
                    </div>
                    <div style={{
                      fontSize: '11px', color: '#8FA89F',
                      textAlign: 'right', marginTop: '4px'
                    }}>
                      {timeAgo(comment.createdAt)}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: '#E6F4F1',
                  color: '#0E7C6B',
                  fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  {(comment.userName || 'U')[0]}
                </div>
                <div>
                  <div style={{
                    fontSize: '11px', color: '#4B6B63',
                    fontWeight: 500, marginBottom: '3px'
                  }}>
                    {comment.userName}
                    <span style={{
                      fontSize: '10px',
                      background: '#E6F4F1',
                      color: '#0E7C6B',
                      padding: '1px 6px',
                      borderRadius: '20px',
                      marginLeft: '6px',
                      fontWeight: 500
                    }}>
                      {comment.userRole}
                    </span>
                  </div>
                  <div style={{
                    background: '#F6F9F8',
                    border: '1px solid #DDE8E5',
                    borderRadius: '2px 12px 12px 12px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    maxWidth: '280px',
                    lineHeight: 1.5,
                    color: '#0F2922'
                  }}>
                    {comment.message}
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#8FA89F', marginTop: '4px'
                  }}>
                    {timeAgo(comment.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {currentUser?.role !== 'employee' && (
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={suggestReply}
            disabled={suggesting}
            style={{
              background: '#F0FAF7',
              border: '1px solid #0E7C6B',
              color: '#0E7C6B',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: suggesting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: suggesting ? 0.7 : 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            {suggesting ? '⏳ Thinking...' : '✨ Suggest Reply'}
          </button>
        </div>
      )}

      <div style={{
        display: 'flex', gap: '8px',
        borderTop: '1px solid #DDE8E5',
        paddingTop: '12px', marginTop: '12px'
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          rows={3}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: '#F6F9F8',
            border: '1px solid #DDE8E5',
            borderRadius: '6px',
            padding: '9px 12px',
            fontSize: '13px',
            color: '#0F2922',
            outline: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        />
        <button
          type="button"
          onClick={onSend}
          style={{
            background: '#0E7C6B',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            height: '37px'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}