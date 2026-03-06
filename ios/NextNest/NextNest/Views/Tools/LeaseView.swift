import SwiftUI

/// Lease analysis — paste lease text, view AI-extracted data.
struct LeaseView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var documents: [LeaseDocument] = []
    @State private var isLoading = true
    @State private var showUploadSheet = false

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if documents.isEmpty {
                emptyState
            } else {
                documentList
            }
        }
        .navigationTitle("Lease Analysis")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showUploadSheet = true } label: {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showUploadSheet) {
            LeaseUploadSheet { await loadDocs() }
        }
        .task { await loadDocs() }
    }

    private var documentList: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                ForEach(documents) { doc in
                    LeaseDocCard(document: doc)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable { await loadDocs() }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No lease documents")
                .font(.headline)
            Text("Paste your lease text and AI will extract key dates, costs, and move-out requirements.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Analyze Lease") { showUploadSheet = true }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadDocs() async {
        do {
            documents = try await APIClient.shared.fetchLeaseDocuments()
            isLoading = false
        } catch { isLoading = false }
    }
}

struct LeaseDocCard: View {
    let document: LeaseDocument

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                Image(systemName: "doc.text.fill")
                    .foregroundStyle(Theme.accent)
                Text(document.fileName)
                    .font(.headline)
                Spacer()
            }

            if let data = document.extractedData {
                if let summary = data.summary {
                    Text(summary)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.bottom, Theme.Spacing.xs)
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.sm) {
                    if let rent = data.monthlyRent {
                        ExtractedField(label: "Monthly Rent", value: "$\(Int(rent))")
                    }
                    if let deposit = data.securityDeposit {
                        ExtractedField(label: "Security Deposit", value: "$\(Int(deposit))")
                    }
                    if let endDate = data.leaseEndDate {
                        ExtractedField(label: "Lease Ends", value: endDate)
                    }
                    if let notice = data.noticeRequired {
                        ExtractedField(label: "Notice Required", value: notice)
                    }
                }

                if let checklist = data.moveOutChecklist, !checklist.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                        Text("Move-Out Checklist")
                            .font(.caption.weight(.semibold))
                        ForEach(checklist, id: \.self) { item in
                            Label(item, systemImage: "checkmark.circle")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.top, Theme.Spacing.xs)
                }

                if let penalties = data.penalties, !penalties.isEmpty {
                    VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                        Text("Penalties")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.red)
                        ForEach(penalties, id: \.self) { item in
                            Text("• \(item)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .cardStyle()
    }
}

struct ExtractedField: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.tertiary)
            Text(value)
                .font(.caption.weight(.semibold))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.sm)
        .background(Theme.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.smallCornerRadius, style: .continuous))
    }
}

struct LeaseUploadSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager
    let onSave: () async -> Void

    @State private var leaseText = ""
    @State private var fileName = "My Lease"
    @State private var isUploading = false

    var body: some View {
        NavigationStack {
            Form {
                Section("File Name") {
                    TextField("Name", text: $fileName)
                }
                Section("Lease Text") {
                    TextEditor(text: $leaseText)
                        .frame(minHeight: 200)
                }
                Section {
                    Text("Paste the full text of your lease. AI will extract key dates, costs, and move-out requirements.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Analyze Lease")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Analyze") { Task { await upload() } }
                        .disabled(leaseText.count < 50 || isUploading)
                }
            }
        }
    }

    private func upload() async {
        isUploading = true
        let req = LeaseUploadRequest(
            text: leaseText, fileName: fileName,
            fileType: "text/plain", fileSize: leaseText.utf8.count
        )
        do {
            _ = try await APIClient.shared.uploadLease(req)
            haptics.success()
            await onSave()
            dismiss()
        } catch { isUploading = false }
    }
}
