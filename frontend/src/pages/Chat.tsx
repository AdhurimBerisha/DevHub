import { useState } from "react";
import { ConversationItem } from "@/components/ConversationItem";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MoreVertical, Phone, Video } from "lucide-react";

const conversations = [
  {
    id: "1",
    name: "React Developers",
    lastMessage: "Did you check the new hooks API?",
    timestamp: "2m ago",
    unread: 3,
  },
  {
    id: "2",
    name: "GraphQL Hub",
    lastMessage: "The Apollo Client setup is complete",
    timestamp: "1h ago",
  },
  {
    id: "3",
    name: "TypeScript Masters",
    lastMessage: "Thanks for the type definitions!",
    timestamp: "3h ago",
    unread: 1,
  },
  {
    id: "4",
    name: "Web Performance",
    lastMessage: "Those optimization tips were helpful",
    timestamp: "Yesterday",
  },
  {
    id: "5",
    name: "Node.js Community",
    lastMessage: "Let's discuss the new features",
    timestamp: "2 days ago",
  },
];

const mockMessages = {
  "1": [
    {
      id: "1",
      content: "Hey everyone! Have you tried the new React 19 features?",
      sender: "Sarah Chen",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      content:
        "Yes! The new use hook is amazing. Makes data fetching so much cleaner.",
      sender: "You",
      timestamp: "10:32 AM",
      isOwn: true,
    },
    {
      id: "3",
      content:
        "I agree! The async transitions are also very interesting. Anyone used them in production?",
      sender: "Michael Brown",
      timestamp: "10:35 AM",
      isOwn: false,
    },
    {
      id: "4",
      content:
        "Not yet in production, but we're testing them out. The performance improvements are noticeable.",
      sender: "You",
      timestamp: "10:38 AM",
      isOwn: true,
    },
    {
      id: "5",
      content: "Did you check the new hooks API?",
      sender: "Sarah Chen",
      timestamp: "10:42 AM",
      isOwn: false,
    },
  ],
  "2": [
    {
      id: "1",
      content: "The Apollo Client setup is complete",
      sender: "GraphQL Hub",
      timestamp: "9:15 AM",
      isOwn: false,
    },
  ],
};

export default function Chat() {
  const [activeConversation, setActiveConversation] = useState(
    conversations[0].id
  );
  const [message, setMessage] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const currentMessages =
    mockMessages[activeConversation as keyof typeof mockMessages] || [];
  const currentConversation = conversations.find(
    (c) => c.id === activeConversation
  );

  const handleSend = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-background">
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
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation === conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  setShowConversations(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
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
                {currentConversation?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-semibold text-foreground">
                  {currentConversation?.name}
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Active now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6">
            {currentMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-3 md:p-4">
            <div className="flex gap-2 md:gap-3">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-secondary border-0 text-sm"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Info Sidebar */}
        <div
          className={`${
            showInfo ? "absolute right-0 top-0 bottom-0 z-50" : "hidden"
          } lg:block w-80 border-l border-border p-6 bg-background overflow-y-auto`}
        >
          <div className="text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4">
              {currentConversation?.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {currentConversation?.name}
            </h3>
            <p className="text-sm text-muted-foreground">Community Chat</p>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                About
              </h4>
              <p className="text-sm text-muted-foreground">
                A community for React developers to share knowledge, ask
                questions, and discuss best practices.
              </p>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Members
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                    SC
                  </div>
                  <span className="text-sm text-foreground">Sarah Chen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                    MB
                  </div>
                  <span className="text-sm text-foreground">Michael Brown</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    AB
                  </div>
                  <span className="text-sm text-foreground">You</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
