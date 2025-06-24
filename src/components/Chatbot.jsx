import React, { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import axios from "axios";

export default function Chatbot({ isOpen, toggleChatbot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => {
    // Generate a unique session ID when the component mounts
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
      setInput("");
      setIsLoading(true);

      try {
        // Get user token from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Sending request:", {
          message: userMessage,
          sessionId: sessionId,
        });

        const response = await axios.post(
          "/api/AiChat/chat",
          {
            message: userMessage,
            sessionId: sessionId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response:", response.data);

        // Handle the response object that contains reply and history
        const botReply = response.data.reply || response.data;
        setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setMessages((prev) => [
          ...prev,
          {
            text:
              error.message === "No authentication token found"
                ? "Please login to use the chatbot."
                : "Sorry, I couldn't process your request. Please try again.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(); // Call handleSend on form submission
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-white font-semibold">Chat Support</h3>
            </div>
            <button
              onClick={toggleChatbot}
              className="text-white/80 hover:text-white transition-colors focus:outline-none"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      : "bg-[#2A2A2A] text-gray-200"
                  } shadow-lg`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="p-3 rounded-2xl bg-[#2A2A2A] text-gray-300">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-[#1E1E1E] border-t border-gray-700/50"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#2A2A2A] text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FiSend size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity z-50 group"
        title="Open Chatbot"
      >
        <FiMessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </>
  );
}
