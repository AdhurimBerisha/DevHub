import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { ConversationItem } from "@/components/ConversationItem";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MoreVertical, UserPlus, X } from "lucide-react";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { format } from "date-fns";
import { GET_USERS_QUERY } from "@/graphql/auth";
import {
  GET_CONVERSATIONS_QUERY,
  GET_CONVERSATION_QUERY,
  MARK_MESSAGES_AS_READ_MUTATION,
} from "@/graphql/chat";
import { useMutation, useApolloClient } from "@apollo/client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  conversationId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: string;
  isFriend?: boolean;
  friendshipId?: string | null;
}

export default function Chat() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const client = useApolloClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [message, setMessage] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { userId: string; username: string }>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_QUERY, {
    skip: !showUserList,
  });

  interface ConversationParticipant {
    id: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }

  interface GraphQLMessage {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      email: string;
    };
  }

  interface GraphQLConversation {
    id: string;
    name?: string;
    lastMessage?: GraphQLMessage;
    updatedAt: string;
    unreadCount: number;
    participants: ConversationParticipant[];
  }

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ_MUTATION);

  const { data: conversationsData, loading: conversationsLoading } = useQuery(
    GET_CONVERSATIONS_QUERY,
    {
      skip: !token,
      onCompleted: (data: { conversations?: GraphQLConversation[] }) => {
        if (data?.conversations) {
          const formattedConversations: Conversation[] = data.conversations.map(
            (conv: GraphQLConversation) => {
              const otherParticipant = conv.participants.find(
                (p: ConversationParticipant) => p.user.id !== user?.id
              );
              const otherUser =
                otherParticipant?.user || conv.participants[0]?.user;

              return {
                id: conv.id,
                name: otherUser?.username || conv.name || "Unknown",
                lastMessage: conv.lastMessage?.content || "",
                timestamp: conv.lastMessage
                  ? format(new Date(conv.lastMessage.createdAt), "h:mm a")
                  : format(new Date(conv.updatedAt), "h:mm a"),
                unread: conv.unreadCount > 0 ? conv.unreadCount : undefined,
              };
            }
          );
          setConversations(formattedConversations);
        }
      },
    }
  );

  const filteredUsers = useMemo(() => {
    const allUsers: UserListItem[] = usersData?.users || [];
    if (!userSearchQuery) return allUsers;
    return allUsers.filter((u) =>
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [usersData?.users, userSearchQuery]);

  const currentMessages = useMemo(
    () => (activeConversation ? messages[activeConversation] || [] : []),
    [activeConversation, messages]
  );
  const currentConversation = conversations.find(
    (c) => c.id === activeConversation
  );

  useEffect(() => {
    if (!token) return;

    socketService.connect(token);

    const handleNewMessage = (newMessage: Message) => {
      setMessages((prev) => {
        const conversationMessages = prev[newMessage.conversationId] || [];
        if (conversationMessages.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return {
          ...prev,
          [newMessage.conversationId]: [...conversationMessages, newMessage],
        };
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === newMessage.conversationId
            ? {
                ...conv,
                lastMessage: newMessage.content,
                timestamp: format(new Date(newMessage.createdAt), "h:mm a"),
                unread:
                  activeConversation !== newMessage.conversationId &&
                  newMessage.senderId !== user?.id
                    ? (conv.unread || 0) + 1
                    : conv.unread,
              }
            : conv
        )
      );
    };

    const handleTyping = (data: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (activeConversation) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return {
              ...prev,
              [activeConversation]: {
                userId: data.userId,
                username: data.username,
              },
            };
          } else {
            const updated = { ...prev };
            delete updated[activeConversation];
            return updated;
          }
        });
      }
    };

    const handleError = (error: string) => {
      console.error("Socket error:", error);
    };

    socketService.onMessage(handleNewMessage);
    socketService.onTyping(handleTyping);
    socketService.onError(handleError);

    return () => {
      socketService.offMessage(handleNewMessage);
      socketService.offTyping(handleTyping);
      socketService.offError(handleError);
    };
  }, [token, activeConversation, user?.id]);

  useEffect(() => {
    if (userId && socketService.isConnected() && user?.id) {
      const handleConversationReady = (data: {
        conversationId: string;
        otherUser: { id: string; username: string; email: string };
      }) => {
        const { conversationId, otherUser } = data;

        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conversationId);
          if (exists) {
            return prev;
          }
          return [
            ...prev,
            {
              id: conversationId,
              name: otherUser.username,
              lastMessage: "",
              timestamp: format(new Date(), "h:mm a"),
            },
          ];
        });

        setActiveConversation(conversationId);

        socketService.joinConversation(conversationId);

        navigate("/chat", { replace: true });
      };

      socketService.onConversationReady(handleConversationReady);
      socketService.getOrCreateConversation(userId);

      return () => {
        socketService.offConversationReady(handleConversationReady);
      };
    }
  }, [userId, token, user?.id, navigate]);

  const { data: conversationData } = useQuery(GET_CONVERSATION_QUERY, {
    variables: { id: activeConversation || "" },
    skip: !activeConversation || !token,
    onCompleted: (data: {
      conversation?: {
        id: string;
        messages: Array<{
          id: string;
          content: string;
          sender: { id: string; username: string; email: string };
          createdAt: string;
        }>;
      };
    }) => {
      if (data?.conversation?.messages) {
        const formattedMessages: Message[] = data.conversation.messages.map(
          (msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender.id,
            sender: msg.sender,
            conversationId: data.conversation!.id,
            createdAt: msg.createdAt,
          })
        );
        setMessages((prev) => ({
          ...prev,
          [data.conversation!.id]: formattedMessages,
        }));

        if (activeConversation) {
          markMessagesAsRead({
            variables: { conversationId: activeConversation },
          }).then(() => {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === activeConversation
                  ? { ...conv, unread: undefined }
                  : conv
              )
            );
            client.refetchQueries({ include: [GET_CONVERSATIONS_QUERY] });
          });
        }
      }
    },
  });

  useEffect(() => {
    if (activeConversation && socketService.isConnected()) {
      socketService.joinConversation(activeConversation);
    }

    return () => {
      if (activeConversation) {
        socketService.leaveConversation(activeConversation);
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleTyping = () => {
    if (activeConversation && socketService.isConnected()) {
      socketService.emitTyping(activeConversation, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (activeConversation) {
          socketService.emitTyping(activeConversation, false);
        }
      }, 1000);
    }
  };

  const handleSend = () => {
    if (message.trim() && activeConversation && socketService.isConnected()) {
      socketService.sendMessage({
        conversationId: activeConversation,
        content: message.trim(),
      });
      setMessage("");
      if (activeConversation) {
        socketService.emitTyping(activeConversation, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const formatMessage = (msg: Message) => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender.username,
    timestamp: format(new Date(msg.createdAt), "h:mm a"),
    isOwn: msg.senderId === user?.id,
  });

  const handleStartConversation = (targetUserId: string) => {
    if (!token) {
      console.error("No token available");
      return;
    }

    if (!socketService.isConnected()) {
      socketService.connect(token);
      const checkConnection = setInterval(() => {
        if (socketService.isConnected()) {
          clearInterval(checkConnection);
          handleStartConversation(targetUserId);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkConnection);
        if (!socketService.isConnected()) {
          console.error("Socket connection failed after timeout");
        }
      }, 5000);
      return;
    }

    const handleConversationReady = (data: {
      conversationId: string;
      otherUser: { id: string; username: string; email: string };
    }) => {
      if (data.otherUser.id !== targetUserId) {
        return;
      }

      const { conversationId, otherUser } = data;

      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversationId);
        if (exists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: conversationId,
            name: otherUser.username,
            lastMessage: "",
            timestamp: format(new Date(), "h:mm a"),
          },
        ];
      });

      setActiveConversation(conversationId);
      socketService.joinConversation(conversationId);
      setShowUserList(false);
      setUserSearchQuery("");

      markMessagesAsRead({
        variables: { conversationId },
      }).then(() => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: undefined } : conv
          )
        );
        client.refetchQueries({ include: [GET_CONVERSATIONS_QUERY] });
      });

      setTimeout(() => {
        socketService.offConversationReady(handleConversationReady);
        socketService.offError(handleError);
      }, 1000);
    };

    const handleError = (error: string) => {
      console.error("Error creating conversation:", error);
      setTimeout(() => {
        socketService.offConversationReady(handleConversationReady);
        socketService.offError(handleError);
      }, 1000);
    };

    socketService.onConversationReady(handleConversationReady);
    socketService.onError(handleError);

    socketService.getOrCreateConversation(targetUserId);
  };

  return (
    <div className="flex h-[93vh] bg-background">
      {/* Main Chat Area */}
      <div className="ml-0  flex-1 flex relative">
        {/* Conversations List */}
        <div
          className={`${
            showConversations ? "absolute inset-0 z-50" : "hidden"
          } md:relative md:flex w-full md:w-80 border-r border-border flex-col bg-background`}
        >
          <div className="h-16 border-b border-border px-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowConversations(false)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-secondary border-0"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowUserList(!showUserList);
                setUserSearchQuery("");
              }}
              title="Start new conversation"
            >
              {showUserList ? (
                <X className="h-5 w-5" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {showUserList ? (
              <>
                {/* User Search */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10 bg-secondary border-0"
                    />
                  </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {usersLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-sm text-muted-foreground">
                        Loading users...
                      </p>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers
                      .filter((u) => u.id !== user?.id)
                      .map((userItem) => (
                        <button
                          key={userItem.id}
                          onClick={() => handleStartConversation(userItem.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                            {userItem.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {userItem.username}
                            </h3>
                            {userItem.isFriend && (
                              <p className="text-xs text-muted-foreground">
                                Friend
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-sm text-muted-foreground">
                        No users found
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Existing Conversations */}
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={activeConversation === conversation.id}
                      onClick={() => {
                        setActiveConversation(conversation.id);
                        setShowConversations(false);

                        markMessagesAsRead({
                          variables: { conversationId: conversation.id },
                        }).then(() => {
                          setConversations((prev) =>
                            prev.map((conv) =>
                              conv.id === conversation.id
                                ? { ...conv, unread: undefined }
                                : conv
                            )
                          );
                          client.refetchQueries({
                            include: [GET_CONVERSATIONS_QUERY],
                          });
                        });
                      }}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                    <p className="text-center">
                      No conversations yet. Click the + button to start a new
                      chat!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border px-3 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowConversations(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
                    {currentConversation?.name.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h2 className="text-xs md:text-sm font-semibold text-foreground">
                      {currentConversation?.name || "Select a conversation"}
                    </h2>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {currentConversation ? "Active now" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                {currentMessages.length > 0 ? (
                  <>
                    {currentMessages.map((msg) => (
                      <ChatMessage key={msg.id} message={formatMessage(msg)} />
                    ))}
                    {typingUsers[activeConversation || ""] && (
                      <div className="flex gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                          {typingUsers[activeConversation || ""]?.username
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                          {typingUsers[activeConversation || ""]?.username} is
                          typing...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-3 md:p-4">
                <div className="flex gap-2 md:gap-3">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 bg-secondary border-0 text-sm"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
