import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Stack,
    Avatar,
    Fade,
    Chip
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import axios from 'axios';
import type { ChatMessage, ChatResponse } from '../types';
import config from '../config';

interface ChatInterfaceProps {
    documentIds?: string[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentIds }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post<ChatResponse>(
                `${config.api.baseUrl}/api/v1/chat`,
                {
                    query: userMessage.content,
                    history: messages, // Send history for context (backend support pending)
                    document_ids: documentIds
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const botMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.answer,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat failed:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.5)' }}>
                <SparkleIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                    AI Chat Assistant
                </Typography>
                <Chip size="small" label="Beta" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {messages.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6, gap: 2 }}>
                        <BotIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" align="center">
                            Ask me anything about your documents.<br />I can summarize, explain, and find specific details.
                        </Typography>
                    </Box>
                )}

                {messages.map((msg, index) => (
                    <Fade in={true} key={index}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            <Avatar
                                sx={{
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                                    width: 32,
                                    height: 32
                                }}
                            >
                                {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                            </Avatar>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    maxWidth: '80%',
                                    borderRadius: 2,
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.50',
                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                    borderTopRightRadius: msg.role === 'user' ? 0 : 2,
                                    borderTopLeftRadius: msg.role === 'assistant' ? 0 : 2,
                                }}
                            >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.content}
                                </Typography>
                            </Paper>
                        </Box>
                    </Fade>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            <BotIcon fontSize="small" />
                        </Avatar>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, borderTopLeftRadius: 0 }}>
                            <Stack direction="row" spacing={1}>
                                <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                                <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                            </Stack>
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.5)' }}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        fullWidth
                        placeholder="Type your question..."
                        variant="outlined"
                        size="small"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.paper'
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default ChatInterface;
