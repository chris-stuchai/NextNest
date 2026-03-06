import SwiftUI

/// AI Move Advisor — streaming chat interface.
struct AIChatView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var messages: [ChatMessage] = []
    @State private var input = ""
    @State private var isStreaming = false
    @State private var scrollAnchor = UUID()
    @FocusState private var isInputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            messageList
            Divider()
            inputBar
        }
        .navigationTitle("AI Move Advisor")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if messages.isEmpty {
                messages.append(ChatMessage(
                    role: "assistant",
                    content: "Hi! I'm your AI Move Advisor. Ask me anything about your relocation — timing, budgeting, neighborhoods, logistics, or anything else. I'm here to help!"
                ))
            }
        }
        .onTapGesture { isInputFocused = false }
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: Theme.Spacing.sm) {
                    ForEach(messages) { message in
                        ChatBubble(message: message)
                    }
                    Color.clear.frame(height: 1).id(scrollAnchor)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.md)
            }
            .onChange(of: scrollAnchor) { _ in
                withAnimation(.easeOut(duration: 0.15)) {
                    proxy.scrollTo(scrollAnchor, anchor: .bottom)
                }
            }
        }
    }

    private var inputBar: some View {
        HStack(spacing: Theme.Spacing.sm) {
            TextField("Ask about your move...", text: $input, axis: .vertical)
                .lineLimit(1...4)
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, 10)
                .background(Theme.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .focused($isInputFocused)
                .submitLabel(.send)
                .onSubmit { send() }

            Button(action: send) {
                Image(systemName: isStreaming ? "stop.circle.fill" : "arrow.up.circle.fill")
                    .font(.system(size: 28))
                    .foregroundStyle(canSend ? Theme.accent : .secondary)
            }
            .disabled(!canSend)
        }
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.vertical, Theme.Spacing.sm)
        .background(.ultraThinMaterial)
    }

    private var canSend: Bool {
        !input.trimmingCharacters(in: .whitespaces).isEmpty || isStreaming
    }

    private func send() {
        haptics.impact()
        Task { await sendMessage() }
    }

    private func sendMessage() async {
        let text = input.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        input = ""

        let userMsg = ChatMessage(role: "user", content: text)
        messages.append(userMsg)
        scrollAnchor = UUID()

        let assistantMsg = ChatMessage(role: "assistant", content: "")
        messages.append(assistantMsg)
        let assistantId = assistantMsg.id
        scrollAnchor = UUID()

        isStreaming = true

        let chatHistory = messages.filter { !$0.content.isEmpty }
        let stream = await APIClient.shared.sendChatMessage(messages: chatHistory)

        do {
            for try await chunk in stream {
                if let idx = messages.firstIndex(where: { $0.id == assistantId }) {
                    let current = messages[idx].content
                    messages[idx] = ChatMessage(id: assistantId, role: "assistant", content: current + chunk)
                    scrollAnchor = UUID()
                }
            }
        } catch {
            if let idx = messages.firstIndex(where: { $0.id == assistantId }) {
                if messages[idx].content.isEmpty {
                    messages[idx] = ChatMessage(id: assistantId, role: "assistant", content: "Sorry, I had trouble responding. Please try again.")
                }
            }
        }
        isStreaming = false
    }
}

struct ChatBubble: View {
    let message: ChatMessage
    var isUser: Bool { message.role == "user" }

    var body: some View {
        HStack(alignment: .top) {
            if isUser { Spacer(minLength: 48) }

            if !isUser {
                ZStack {
                    Circle()
                        .fill(Theme.accentLight)
                        .frame(width: 28, height: 28)
                    Image(systemName: "sparkles")
                        .font(.caption2)
                        .foregroundStyle(Theme.accent)
                }
            }

            Text(message.content.isEmpty ? "..." : message.content)
                .font(.subheadline)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(isUser ? Theme.accent : Theme.secondaryBackground)
                .foregroundStyle(isUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .textSelection(.enabled)

            if !isUser { Spacer(minLength: 48) }
        }
    }
}
