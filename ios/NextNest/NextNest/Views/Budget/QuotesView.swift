import SwiftUI

/// Moving quotes — request AI calls to moving companies.
struct QuotesView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var quotes: [MovingQuote] = []
    @State private var isLoading = true
    @State private var showAddSheet = false

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if quotes.isEmpty {
                emptyState
            } else {
                quotesList
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showAddSheet = true } label: {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            RequestQuoteSheet { await loadQuotes() }
        }
        .task { await loadQuotes() }
    }

    private var quotesList: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                ForEach(quotes) { quote in
                    QuoteCard(quote: quote)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable { await loadQuotes() }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "phone.arrow.up.right")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No quotes yet")
                .font(.headline)
            Text("Add a moving company and our AI will call them for a quote.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Get a Quote") { showAddSheet = true }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadQuotes() async {
        do {
            quotes = try await APIClient.shared.fetchQuotes()
            isLoading = false
        } catch { isLoading = false }
    }
}

struct QuoteCard: View {
    let quote: MovingQuote

    var statusColor: Color {
        switch quote.status {
        case .completed: return .green
        case .failed: return .red
        case .calling, .connected: return .orange
        case .pending: return .secondary
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                Text(quote.companyName)
                    .font(.headline)
                Spacer()
                Label(quote.status.displayName, systemImage: quote.status.iconName)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(statusColor)
            }
            Text(quote.phoneNumber)
                .font(.caption)
                .foregroundStyle(.secondary)
            if let range = quote.formattedQuote {
                HStack {
                    Text("Quote:")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(range)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.accent)
                }
            }
            if let transcript = quote.transcript, !transcript.isEmpty {
                DisclosureGroup("Call Transcript") {
                    Text(transcript)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .font(.caption)
            }
        }
        .cardStyle()
    }
}

struct RequestQuoteSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager
    let onSave: () async -> Void

    @State private var companyName = ""
    @State private var phoneNumber = ""
    @State private var isRequesting = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Moving Company") {
                    TextField("Company name", text: $companyName)
                    TextField("Phone number", text: $phoneNumber)
                        .keyboardType(.phonePad)
                        .textContentType(.telephoneNumber)
                }
                if let error {
                    Section { Text(error).foregroundStyle(.red).font(.caption) }
                }
                Section {
                    Text("Our AI assistant will call this company on your behalf to get a moving quote.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Request Quote")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Call") { Task { await requestCall() } }
                        .disabled(companyName.isEmpty || phoneNumber.isEmpty || isRequesting)
                }
            }
        }
    }

    private func requestCall() async {
        isRequesting = true
        error = nil
        do {
            _ = try await APIClient.shared.requestOutboundCall(companyName: companyName, phoneNumber: phoneNumber)
            haptics.success()
            await onSave()
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isRequesting = false
        }
    }
}
