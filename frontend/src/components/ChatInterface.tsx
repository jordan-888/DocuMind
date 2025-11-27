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
    Chip,
    Button,
    Collapse,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    AutoAwesome as SparkleIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Description as DocumentIcon
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
    const [expandedCitations, setExpandedCitations] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleCitations = (index: number) => {
        setExpandedCitations(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleClearConversation = () => {
        setMessages([]);
        setExpandedCitations(new Set());
    };

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
                    history: messages,
                    document_ids: documentIds
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const botMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.answer,
                created_at: new Date().toISOString(),
                citations: response.data.citations,
                processing_time: response.data.processing_time
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

    const suggestedQuestions = [
        "What are the main topics in my documents?",
        "Summarize the key findings",
        "What are the important dates mentioned?"
    ];

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
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, rgba(99,102,241,0.05), rgba(6,182,212,0.05))'
            }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <SparkleIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                        AI Chat Assistant
                    </Typography>
                    <Chip size="small" label="Beta" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Stack>
                {messages.length > 0 && (
                    <Tooltip title="Clear conversation">
                        <IconButton size="small" onClick={handleClearConversation} sx={{ color: 'text.secondary' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {messages.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 3 }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BotIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Box>
                        <Stack spacing={1} alignItems="center">
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Start a conversation
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                                Ask me anything about your documents. I can summarize, explain, and find specific details.
                            </Typography>
                        </Stack>
                        <Stack spacing={1} width="100%" maxWidth={400}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Try asking:
                            </Typography>
                            {suggestedQuestions.map((question, idx) => (
                                <Button
                                    key={idx}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setInput(question)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        py: 1
                                    }}
                                >
                                    {question}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                )}

                {messages.map((msg, index) => (
                    <Fade in={true} key={index}>
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                <Avatar
                                    sx={{
                                        bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                                        width: 36,
                                        height: 36
                                    }}
                                >
                                    {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                                </Avatar>

                                <Stack spacing={1} flex={1}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            maxWidth: '85%',
                                            borderRadius: 2.5,
                                            bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                                            color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                            border: msg.role === 'assistant' ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                            {msg.content}
                                        </Typography>
                                        {msg.processing_time && (
                                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                                                Processed in {msg.processing_time.toFixed(2)}s
                                            </Typography>
                                        )}
                                    </Paper>

                                    {/* Citations */}
                                    {msg.citations && msg.citations.length > 0 && (
                                        <Box sx={{ maxWidth: '85%' }}>
                                            <Button
                                                size="small"
                                                onClick={() => toggleCitations(index)}
                                                endIcon={<ExpandMoreIcon sx={{
                                                    transform: expandedCitations.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s'
                                                }} />}
                                                sx={{
                                                    textTransform: 'none',
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {msg.citations.length} source{msg.citations.length > 1 ? 's' : ''}
                                            </Button>
                                            <Collapse in={expandedCitations.has(index)}>
                                                <Stack spacing={1} mt={1}>
                                                    {msg.citations.map((citation, citIdx) => (
                                                        <Paper
                                                            key={citIdx}
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1.5,
                                                                borderRadius: 2,
                                                                bgcolor: 'rgba(99,102,241,0.02)'
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                <DocumentIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.3 }} />
                                                                <Box flex={1}>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                                        Similarity: {(citation.similarity_score * 100).toFixed(1)}%
                                                                        {citation.page_number && ` • Page ${citation.page_number}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                                        {citation.text}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Collapse>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    </Fade>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                            <BotIcon fontSize="small" />
                        </Avatar>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: 'background.paper',
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 0.3 },
                                            '50%': { opacity: 1 }
                                        }
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out 0.2s infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 0.3 },
                                            '50%': { opacity: 1 }
                                        }
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        animation: 'pulse 1.4s ease-in-out 0.4s infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 0.3 },
                                            '50%': { opacity: 1 }
                                        }
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                background: 'rgba(255,255,255,0.8)'
            }}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        fullWidth
                        placeholder="Type your question..."
                        variant="outlined"
                        size="small"
                        multiline
                        maxRows={3}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main'
                                    }
                                }
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
                            width: 40,
                            height: 40,
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.05)'
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled'
                            },
                            transition: 'all 0.2s'
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
